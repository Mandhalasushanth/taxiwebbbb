import { validatePincodeMatchesState } from '@shared/utils'
import type { PersonalLoanFormData } from '@modules/loans/types/personalLoan.types'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import {
  getRequiredPersonalLoanDocuments,
  JOB_TYPE_OPTIONS,
  SALARY_RECEIVE_OPTIONS,
  SELF_EMPLOYED_BUSINESS_TYPES,
  WORK_EXPERIENCE_OPTIONS,
} from '@modules/loans/components/PersonalLoan/personalLoan.constants'
import { loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'

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

/** Step 2: Employment & Income Verification */
export function validateStep2EmploymentIncome(data: PersonalLoanFormData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  // Requested loan amount: min ₹25,000, max ₹50,00,000
  const loanAmtNum = Number(String(data.requestedLoanAmount || '').replace(/\D/g, ''))
  if (!data.requestedLoanAmount || !loanAmtNum) {
    errors.requestedLoanAmount = 'Requested loan amount is required'
  } else if (loanAmtNum < 25000) {
    errors.requestedLoanAmount = 'Minimum loan amount is ₹25,000'
  } else if (loanAmtNum > 5000000) {
    errors.requestedLoanAmount = 'Maximum loan amount is ₹50,00,000'
  }

  // Employment type: must be salaried or self-employed
  if (!data.employmentType || !['salaried', 'self-employed'].includes(data.employmentType)) {
    errors.employmentType = 'Please select your employment type'
  }

  // Company / Employer / Business name: validated against junk and min length
  const isSalaried = data.employmentType === 'salaried'
  const employerLabel = isSalaried ? 'Company / Employer Name' : 'Business / Profession Name'
  const empNameError = validateFreeText(data.employerName || '', employerLabel, { min: 2, max: 100, minWords: 1 })
  if (empNameError) {
    errors.employerName = empNameError
  }

  // Job Type / Nature of Business (case-insensitive check)
  const allowedJobTypes: readonly string[] = isSalaried ? JOB_TYPE_OPTIONS : SELF_EMPLOYED_BUSINESS_TYPES
  const matchesJobType = allowedJobTypes.some(
    (opt) => opt.toLowerCase() === (data.jobType || '').trim().toLowerCase(),
  )
  if (!data.jobType) {
    errors.jobType = isSalaried ? 'Please select your job type' : 'Please select your nature of business'
  } else if (!matchesJobType) {
    errors.jobType = 'Please select a valid option from the list'
  }

  // Monthly net salary / income: min ₹10,000, max ₹1,00,00,000
  const salaryNum = Number(String(data.monthlySalary || '').replace(/\D/g, ''))
  const salaryLabel = isSalaried ? 'Monthly salary' : 'Monthly income'
  if (!data.monthlySalary || !salaryNum) {
    errors.monthlySalary = `${salaryLabel} is required`
  } else if (salaryNum < 10000) {
    errors.monthlySalary = `Minimum ${salaryLabel.toLowerCase()} must be at least ₹10,000`
  } else if (salaryNum > 10000000) {
    errors.monthlySalary = `Please enter a valid ${salaryLabel.toLowerCase()}`
  }

  // Work experience / Years in Business (case-insensitive check)
  const matchesExp = WORK_EXPERIENCE_OPTIONS.some(
    (opt) => opt.toLowerCase() === (data.workExperience || '').trim().toLowerCase(),
  )
  if (!data.workExperience) {
    errors.workExperience = isSalaried ? 'Please select your work experience' : 'Please select years in business'
  } else if (!matchesExp) {
    errors.workExperience = 'Please select a valid experience range'
  }

  // Salary receive mode (only for salaried applicants)
  if (isSalaried) {
    const matchesReceive = SALARY_RECEIVE_OPTIONS.some(
      (opt) => opt.toLowerCase() === (data.salaryReceivedMode || '').trim().toLowerCase(),
    )
    if (!data.salaryReceivedMode) {
      errors.salaryReceivedMode = 'Please select how you receive your salary'
    } else if (!matchesReceive) {
      errors.salaryReceivedMode = 'Please select a valid salary receipt mode'
    }
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Allowed document file extensions and MIME types */
const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
const ALLOWED_DOC_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

const isValidDocType = (name: string, mime?: string): boolean => {
  const hasValidExt = ALLOWED_DOC_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
  const hasValidMime = !mime || ALLOWED_DOC_MIME_TYPES.includes(mime.toLowerCase())
  return hasValidExt || hasValidMime
}

/** Step 3: Required Documents Verification (dynamic based on Step 2 Employment Type) */
export function validateStep3Documents(data: PersonalLoanFormData): LoanStepValidationResult {
  const requiredDocs = getRequiredPersonalLoanDocuments(data.employmentType)
  const uploaded = data.uploadedDocs || {}

  const errors = requiredDocs.reduce<Record<string, string>>((acc, doc) => {
    const entry = uploaded[doc.id]
    if (!entry) {
      return { ...acc, [doc.id]: `${doc.title} is required` }
    }
    const sizeBytes = entry.file?.size ?? (typeof entry.size === 'number' ? entry.size : 0)
    if (sizeBytes > 10 * 1024 * 1024) {
      return { ...acc, [doc.id]: `${doc.title} exceeds maximum allowed size of 10MB` }
    }
    if (entry.name && !isValidDocType(entry.name, entry.file?.type)) {
      return { ...acc, [doc.id]: `${doc.title} must be a PDF or image file (JPG, PNG)` }
    }
    return acc
  }, {})

  const pendingCount = Object.keys(errors).length
  const customMessage =
    pendingCount > 0 ? `Upload the ${pendingCount} pending required document${pendingCount > 1 ? 's' : ''} to continue.` : undefined

  return toStepResult(errors, customMessage)
}

const STEP_NAMES = ['KYC Verification', 'Employment & Income', 'Documents']

/** Step 4: Review & Submit (pre-flight checks of steps 1-3 + terms acceptance) */
export function validateStep4Review(data: PersonalLoanFormData): LoanStepValidationResult {
  const earlierValidators = [validateStep1KycVerification, validateStep2EmploymentIncome, validateStep3Documents]
  const failedIndex = earlierValidators.findIndex((validate) => !validate(data).isValid)
  if (failedIndex >= 0) {
    return toStepResult(
      { [`step${failedIndex + 1}`]: 'incomplete' },
      `Some details in ${STEP_NAMES[failedIndex]} need attention. Use Edit to update them before submitting.`,
    )
  }

  const errors: Record<string, string> = {}
  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please confirm the declaration before submitting your application.'
  }
  return toStepResult(errors, 'Please confirm the declaration before submitting.')
}

export const personalLoanValidation = {
  validateStep1: (data: PersonalLoanFormData): LoanStepValidationResult =>
    validateStep1KycVerification(data),

  validateStep2: (data: PersonalLoanFormData): LoanStepValidationResult =>
    validateStep2EmploymentIncome(data),

  validateStep3: (data: PersonalLoanFormData): LoanStepValidationResult =>
    validateStep3Documents(data),

  validateStep4: (data: PersonalLoanFormData): LoanStepValidationResult =>
    validateStep4Review(data),
}
