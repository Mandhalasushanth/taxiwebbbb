import { validatePincodeMatchesState } from '@shared/utils'
import { loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'
import type { HomeLoanData } from '@modules/loans/types/homeLoan.types'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import {
  getHomeLoanDocumentSections,
  LOAN_PURPOSE_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
} from '../components/HomeLoan/homeLoan.constants'

export { HOME_LOAN_REQUIRED_DOCUMENTS } from '../components/HomeLoan/homeLoan.constants'

const REQUIRED_FIELDS_MESSAGE = 'Please complete all required fields marked with *.'

/**
 * Keyboard-mash detection for free text: the same character 5+ times in a row,
 * or a long word with no vowels (e.g. "Gdhdhbcncncn", "Cgkjccggg").
 */
export const looksLikeJunk = (value: string): boolean => {
  const v = value.trim()
  if (/(.)\1{4,}/i.test(v)) return true
  return (v.match(/[A-Za-z]+/g) ?? []).some((word) => word.length >= 6 && !/[aeiouy]/i.test(word))
}

export const wordCount = (value: string): number =>
  value.trim().split(/[\s,]+/).filter(Boolean).length

/** Free-text rule: length bounds, must contain letters, minimum word count and no keyboard mash */
export const validateFreeText = (
  value: string,
  label: string,
  { min, max, minWords }: { min: number; max: number; minWords: number },
): string | undefined => {
  const base = loanFieldRules.text(value, label, min, max)
  if (base) return base
  if (!/[A-Za-z]/.test(value)) return `${label} must contain letters`
  if (wordCount(value) < minWords) return `Please enter a complete ${label.toLowerCase()}`
  return looksLikeJunk(value) ? `Please enter a valid ${label.toLowerCase()}` : undefined
}

/** Error keys are "<prefix>.<field>", e.g. "currentAddress.pincode" */
export const addressErrorKey = (prefix: string, field: keyof LoanAddress): string => `${prefix}.${field}`

export const validateAddress = (address: LoanAddress, prefix: string): Record<string, string> => {
  const key = (field: keyof LoanAddress) => addressErrorKey(prefix, field)
  const stateError = address.state ? undefined : 'Please select a state / UT'

  let pincodeError = loanFieldRules.pincode(address.pincode)
  if (!pincodeError && /^(\d)\1{5}$/.test(address.pincode)) {
    pincodeError = 'Please enter a valid 6-digit PIN code'
  }

  const mismatchError =
    !stateError && !pincodeError ? validatePincodeMatchesState(address.pincode, address.state) || undefined : undefined

  const checks: Record<string, string | undefined> = {
    [key('houseBuilding')]:
      loanFieldRules.text(address.houseBuilding, 'House / Flat / Building', 2, 120) ||
      (looksLikeJunk(address.houseBuilding) ? 'Please enter a valid house / flat / building' : undefined),
    [key('streetLocality')]: validateFreeText(address.streetLocality, 'Street / Locality', { min: 3, max: 150, minWords: 1 }),
    [key('city')]:
      loanFieldRules.placeName(address.city, 'City / District') ||
      (looksLikeJunk(address.city) ? 'Please enter a valid city / district' : undefined),
    [key('pincode')]: pincodeError || mismatchError,
    [key('state')]: stateError,
  }

  return Object.fromEntries(
    Object.entries(checks).filter(([, message]) => Boolean(message)),
  ) as Record<string, string>
}

/** Step 1: KYC Verification (addresses + consent; identity is read-only) */
export function validateStep1KycVerification(data: KycStepData): LoanStepValidationResult {
  const permanentErrors =
    data.permanentSameAsCurrent === 'no' ? validateAddress(data.permanentAddress, 'permanentAddress') : {}

  const errors: Record<string, string> = {
    ...validateAddress(data.currentAddress, 'currentAddress'),
    ...(data.permanentSameAsCurrent ? {} : { permanentSameAsCurrent: 'Please confirm your permanent address.' }),
    ...permanentErrors,
    ...(data.kycConsent ? {} : { kycConsent: 'Please accept the consent to verify your KYC details.' }),
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 2: Home Loan Requirement */
export function validateStep2Requirements(data: HomeLoanData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  const amountNum = Number(String(data.requestedLoanAmount || '').replace(/\D/g, ''))
  if (!data.requestedLoanAmount || !amountNum) {
    errors.requestedLoanAmount = 'Requested loan amount is required'
  } else if (amountNum < 100000) {
    errors.requestedLoanAmount = 'Minimum loan amount is ₹1,00,000'
  } else if (amountNum > 100000000) {
    errors.requestedLoanAmount = 'Maximum loan amount is ₹10,00,00,000 (10 Crores)'
  }

  const isAllowedPurpose = LOAN_PURPOSE_OPTIONS.some(
    (opt) => opt.value.toLowerCase() === (data.loanPurpose || '').trim().toLowerCase(),
  )
  if (!data.loanPurpose || !data.loanPurpose.trim()) {
    errors.loanPurpose = 'Please select what you need the loan for'
  } else if (!isAllowedPurpose) {
    errors.loanPurpose = 'Please select a valid loan purpose from the list'
  }

  const isAllowedStatus = PROPERTY_STATUS_OPTIONS.some(
    (opt) => opt.value.toLowerCase() === (data.propertyStatus || '').trim().toLowerCase(),
  )
  if (!data.propertyStatus || !data.propertyStatus.trim()) {
    errors.propertyStatus = 'Please select property status'
  } else if (!isAllowedStatus) {
    errors.propertyStatus = 'Please select a valid property status from the list'
  }

  const valueNum = Number(String(data.approximatePropertyValue || '').replace(/\D/g, ''))
  if (!data.approximatePropertyValue || !valueNum) {
    errors.approximatePropertyValue = 'Approximate property value is required'
  } else if (valueNum < 100000) {
    errors.approximatePropertyValue = 'Minimum property value must be at least ₹1,00,000'
  } else if (valueNum > 1000000000) {
    errors.approximatePropertyValue = 'Maximum property value cannot exceed ₹100 Crores'
  } else if (amountNum > 0 && valueNum < amountNum) {
    errors.approximatePropertyValue = 'Property value cannot be less than the requested loan amount'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Allowed document file extensions and MIME types */
const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
const ALLOWED_DOC_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

const isValidDocType = (name: string, mime?: string): boolean => {
  const hasValidExt = ALLOWED_DOC_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
  if (!hasValidExt) return false
  if (mime) {
    return ALLOWED_DOC_MIME_TYPES.includes(mime.toLowerCase())
  }
  return true
}

/** Step 3: Property Documents */
export function validateStep3Documents(data: HomeLoanData): LoanStepValidationResult {
  const uploadedDocs = data.uploadedDocs || {}
  const { requiredDocs, optionalDocs } = getHomeLoanDocumentSections()

  const requiredErrors = requiredDocs.reduce<Record<string, string>>((acc, doc) => {
    const entry = uploadedDocs[doc.id]
    if (!entry) {
      return { ...acc, [doc.id]: `${doc.title} is required` }
    }
    const sizeBytes = entry.file?.size ?? (typeof entry.size === 'number' ? entry.size : 0)
    if (sizeBytes > 10 * 1024 * 1024) {
      return { ...acc, [doc.id]: `${doc.title} exceeds maximum allowed size of 10MB` }
    }
    const mimeType = entry.file?.type || (entry as unknown as { type?: string }).type
    if (entry.name && !isValidDocType(entry.name, mimeType)) {
      return { ...acc, [doc.id]: `${doc.title} must be a PDF or image file (JPG, PNG)` }
    }
    return acc
  }, {})

  const optionalErrors = optionalDocs.reduce<Record<string, string>>((acc, doc) => {
    const entry = uploadedDocs[doc.id]
    if (!entry) return acc
    const sizeBytes = entry.file?.size ?? (typeof entry.size === 'number' ? entry.size : 0)
    if (sizeBytes > 10 * 1024 * 1024) {
      return { ...acc, [doc.id]: `${doc.title} exceeds maximum allowed size of 10MB` }
    }
    const mimeType = entry.file?.type || (entry as unknown as { type?: string }).type
    if (entry.name && !isValidDocType(entry.name, mimeType)) {
      return { ...acc, [doc.id]: `${doc.title} must be a PDF or image file (JPG, PNG)` }
    }
    return acc
  }, {})

  const errors = { ...requiredErrors, ...optionalErrors }
  const missingCount = requiredDocs.filter((doc) => !uploadedDocs[doc.id]).length
  const summary =
    missingCount > 0
      ? `Upload the ${missingCount} pending required document${missingCount > 1 ? 's' : ''} to continue.`
      : Object.keys(errors).length > 0
        ? 'Please check the uploaded documents for errors.'
        : undefined

  return toStepResult(errors, summary)
}

const STEP_NAMES = ['KYC Verification', 'Home Loan Requirement', 'Property Documents']

/** Step 4: Review & Submit (pre-flight checks of steps 1-3 + terms acceptance) */
export function validateStep4Review(data: HomeLoanData): LoanStepValidationResult {
  const step1 = validateStep1KycVerification(data)
  if (!step1.isValid) {
    return toStepResult(
      step1.errors,
      `Some details in ${STEP_NAMES[0]} need attention. Use Edit to update them before submitting.`,
    )
  }

  const step2 = validateStep2Requirements(data)
  if (!step2.isValid) {
    return toStepResult(
      step2.errors,
      `Some details in ${STEP_NAMES[1]} need attention. Use Edit to update them before submitting.`,
    )
  }

  const step3 = validateStep3Documents(data)
  if (!step3.isValid) {
    return toStepResult(
      step3.errors,
      `Some details in ${STEP_NAMES[2]} need attention. Use Edit to update them before submitting.`,
    )
  }

  const errors: Record<string, string> = {}
  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please authorize TaxEdge and accept the declaration to submit your application.'
  }
  return toStepResult(errors, 'Please confirm the declaration before submitting.')
}

export const homeLoanValidation = {
  validateStep1: (data: HomeLoanData): LoanStepValidationResult => validateStep1KycVerification(data),
  validateStep2: (data: HomeLoanData): LoanStepValidationResult => validateStep2Requirements(data),
  validateStep3: (data: HomeLoanData): LoanStepValidationResult => validateStep3Documents(data),
  validateStep4: (data: HomeLoanData): LoanStepValidationResult => validateStep4Review(data),
  validateStep5: (data: HomeLoanData): LoanStepValidationResult =>
    toStepResult(data.termsAccepted ? {} : { termsAccepted: 'Declaration acceptance is required' }),
}
