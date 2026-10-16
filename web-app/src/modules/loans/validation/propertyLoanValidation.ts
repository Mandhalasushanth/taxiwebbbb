import { validatePincodeMatchesState } from '@shared/utils'
import { loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'
import type { PropertyLoanData } from '@modules/loans/types/propertyLoan.types'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import {
  getPropertyLoanDocumentSections,
  PROPERTY_OWNERSHIP_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PURPOSE_OF_LOAN_OPTIONS,
} from '../components/PropertyLoan/propertyLoan.constants'

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

/** Step 2: Property & Loan Details */
export function validateStep2PropertyDetails(data: PropertyLoanData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  // 1. Requested Loan Amount
  const amountStr = data.requestedLoanAmount || data.requiredAmount || ''
  const amountNum = Number(String(amountStr).replace(/\D/g, ''))
  if (!amountStr || !amountNum) {
    errors.requestedLoanAmount = 'Requested loan amount is required'
  } else if (amountNum < 100000) {
    errors.requestedLoanAmount = 'Minimum loan amount is ₹1,00,000'
  } else if (amountNum > 100000000) {
    errors.requestedLoanAmount = 'Maximum loan amount is ₹10,00,00,000 (10 Crores)'
  }

  // 2. Purpose of Loan
  const isAllowedPurpose = PURPOSE_OF_LOAN_OPTIONS.some(
    (opt) => opt.value.toLowerCase() === (data.loanPurpose || '').trim().toLowerCase(),
  )
  if (!data.loanPurpose || !data.loanPurpose.trim()) {
    errors.loanPurpose = 'Please select purpose of loan'
  } else if (!isAllowedPurpose) {
    errors.loanPurpose = 'Please select a valid purpose of loan from the list'
  }

  // 3. Property Type
  const isAllowedType = PROPERTY_TYPE_OPTIONS.some(
    (opt) => opt.value.toLowerCase() === (data.propertyType || '').trim().toLowerCase(),
  )
  if (!data.propertyType || !data.propertyType.trim()) {
    errors.propertyType = 'Please select property type'
  } else if (!isAllowedType) {
    errors.propertyType = 'Please select a valid property type from the list'
  }

  // 4. City
  const cityVal = data.city || data.propertyCity || ''
  const cityError =
    loanFieldRules.placeName(cityVal, 'City') ||
    (looksLikeJunk(cityVal) ? 'Please enter a valid city' : undefined)
  if (cityError) {
    errors.city = cityError
  }

  // 5. State
  const stateVal = data.state || data.propertyState || ''
  if (!stateVal || !stateVal.trim()) {
    errors.state = 'Please select state / UT'
  }

  // 6. PIN Code
  const pinVal = data.pincode || data.propertyPincode || ''
  let pinError = loanFieldRules.pincode(pinVal)
  if (!pinError && /^(\d)\1{5}$/.test(pinVal)) {
    pinError = 'Please enter a valid 6-digit PIN code'
  }
  const mismatchError =
    !errors.state && !pinError ? validatePincodeMatchesState(pinVal, stateVal) || undefined : undefined
  if (pinError || mismatchError) {
    errors.pincode = (pinError || mismatchError)!
  }

  // 7. Property Ownership
  const isAllowedOwnership = PROPERTY_OWNERSHIP_OPTIONS.some(
    (opt) => opt.value.toLowerCase() === (data.propertyOwnership || '').trim().toLowerCase(),
  )
  if (!data.propertyOwnership || !data.propertyOwnership.trim()) {
    errors.propertyOwnership = 'Please select property ownership'
  } else if (!isAllowedOwnership) {
    errors.propertyOwnership = 'Please select a valid property ownership from the list'
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
export function validateStep3Documents(data: PropertyLoanData): LoanStepValidationResult {
  const uploadedDocs = data.uploadedDocs || {}
  const { requiredDocs, optionalDocs } = getPropertyLoanDocumentSections()

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

const STEP_NAMES = ['KYC Verification', 'Property & Loan Details', 'Property Documents']

/** Step 4: Review & Submit (pre-flight checks of steps 1-3 + terms acceptance) */
export function validateStep4Review(data: PropertyLoanData): LoanStepValidationResult {
  const step1 = validateStep1KycVerification(data)
  if (!step1.isValid) {
    return toStepResult(
      step1.errors,
      `Some details in ${STEP_NAMES[0]} need attention. Use Edit to update them before submitting.`,
    )
  }

  const step2 = validateStep2PropertyDetails(data)
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
  if (!data.termsAccepted && !data.declarationAgreed) {
    errors.termsAccepted = 'Please authorize TaxEdge and accept the declaration to submit your application.'
  }
  return toStepResult(errors, 'Please confirm the declaration before submitting.')
}

export const propertyLoanValidation = {
  validateStep1: (data: PropertyLoanData): LoanStepValidationResult => validateStep1KycVerification(data),
  validateStep2: (data: PropertyLoanData): LoanStepValidationResult => validateStep2PropertyDetails(data),
  validateStep3: (data: PropertyLoanData): LoanStepValidationResult => validateStep3Documents(data),
  validateStep4: (data: PropertyLoanData): LoanStepValidationResult => validateStep4Review(data),
  validateStep5: (data: PropertyLoanData): LoanStepValidationResult =>
    toStepResult(
      data.termsAccepted || data.declarationAgreed
        ? {}
        : { termsAccepted: 'Declaration acceptance is required' },
    ),
}
