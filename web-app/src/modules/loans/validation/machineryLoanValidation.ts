import { validatePincodeMatchesState } from '@shared/utils'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import { commonLoanValidation, loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'
import type { MachineryLoanData } from '@modules/loans/types/machineryLoan.types'

const REQUIRED_FIELDS_MESSAGE = 'Please complete all required fields marked with *.'

export const MACHINERY_DOCUMENT_CONFIGS = [
  { id: 'pan_card', name: 'PAN Card', isRequired: true, category: 'identity' },
  { id: 'aadhaar_card', name: 'Aadhaar / Accepted KYC', isRequired: true, category: 'identity' },
  { id: 'bank_statement', name: 'Bank Statement', isRequired: true, category: 'income' },
  { id: 'machinery_quotation', name: 'Machinery Quotation', isRequired: true, category: 'business' },
  { id: 'gst_certificate', name: 'GST Certificate / Returns', isRequired: false, category: 'business' },
  { id: 'business_reg_proof', name: 'Business Registration Proof', isRequired: false, category: 'business' },
  { id: 'udyam_certificate', name: 'Udyam Certificate', isRequired: false, category: 'business' },
]

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
export function validateStep1KycVerification(data: Partial<KycStepData>): LoanStepValidationResult {
  const current = data.currentAddress || { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' }
  const permanent = data.permanentAddress || { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' }
  const permanentErrors =
    data.permanentSameAsCurrent === 'no' ? validateAddress(permanent, 'permanentAddress') : {}

  const errors: Record<string, string> = {
    ...validateAddress(current, 'currentAddress'),
    ...(data.permanentSameAsCurrent ? {} : { permanentSameAsCurrent: 'Please confirm your permanent address.' }),
    ...permanentErrors,
    ...(data.kycConsent ? {} : { kycConsent: 'Please accept the consent to verify your KYC details.' }),
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 2: Loan Details */
export function validateStep2LoanDetails(data: MachineryLoanData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  const loanAmountNum = Number(String(data.loanAmount || '').replace(/[^\d]/g, ''))
  if (!loanAmountNum || isNaN(loanAmountNum)) {
    errors.loanAmount = 'Please enter your required loan amount (Min ₹1 Lakh)'
  } else if (loanAmountNum < 100000 || loanAmountNum > 200000000) {
    errors.loanAmount = 'Loan amount must be between ₹1 Lakh and ₹20 Crores'
  }

  if (!data.machineryType || !data.machineryType.trim()) {
    errors.machineryType = 'Please select machinery / equipment type'
  }

  if (!data.repaymentTenure || !data.repaymentTenure.trim()) {
    errors.repaymentTenure = 'Please select repayment tenure'
  }

  return toStepResult(errors)
}

/** Step 3: Business Details */
export function validateStep3BusinessDetails(data: MachineryLoanData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  if (!data.businessName || !data.businessName.trim()) {
    errors.businessName = 'Please enter your business / plant name'
  } else if (data.businessName.trim().length < 3) {
    errors.businessName = 'Business / plant name must be at least 3 characters'
  }

  if (!data.businessType || !data.businessType.trim()) {
    errors.businessType = 'Please select business type'
  }

  if (!data.businessVintage || !data.businessVintage.trim()) {
    errors.businessVintage = 'Please select business vintage'
  }

  const turnoverClean = (data.annualTurnover || '').replace(/[^\d]/g, '')
  if (!turnoverClean) {
    errors.annualTurnover = 'Please enter annual turnover in ₹'
  } else {
    const num = Number(turnoverClean)
    if (isNaN(num) || num <= 0) {
      errors.annualTurnover = 'Please enter a valid annual turnover'
    }
  }

  if (data.isGstRegistered) {
    const gstinTrimmed = (data.gstin || '').trim().toUpperCase()
    if (!gstinTrimmed) {
      errors.gstin = 'GSTIN is required for GST registered business'
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinTrimmed)) {
      errors.gstin = 'Please enter a valid 15-digit GSTIN (e.g. 24AABCP1234F1Z9)'
    }
  }

  return toStepResult(errors)
}

/** Step 4: Banking */
export function validateStep4Banking(data: MachineryLoanData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  const bankNameError = loanFieldRules.bankName(data.bankName)
  if (bankNameError) {
    errors.bankName = bankNameError
  }

  const accTrimmed = (data.accountNumber || '').trim()
  if (!accTrimmed) {
    errors.accountNumber = 'Current account number is required'
  } else if (!/^\d{9,18}$/.test(accTrimmed)) {
    errors.accountNumber = 'Current account number must contain only digits (9 to 18 digits)'
  }

  const ifscTrimmed = (data.ifscCode || '').trim().toUpperCase()
  if (!ifscTrimmed) {
    errors.ifscCode = 'Bank IFSC code is required'
  } else if (!commonLoanValidation.isValidIfsc(ifscTrimmed)) {
    errors.ifscCode = 'Please enter a valid 11-digit IFSC code (e.g. BKID0008832)'
  }

  return toStepResult(errors)
}

/** Step 5: Documents & Review */
export function validateStep5DocumentsAndReview(data: MachineryLoanData): LoanStepValidationResult {
  const uploadedDocs = data.uploadedDocs || {}
  const mandatoryDocs = MACHINERY_DOCUMENT_CONFIGS.slice(0, 4)

  const { errors, missingDocs } = mandatoryDocs.reduce<{
    errors: Record<string, string>
    missingDocs: string[]
  }>(
    (acc, doc) => {
      if (!uploadedDocs[doc.id]) {
        acc.errors[doc.id] = `${doc.name} is required`
        acc.missingDocs.push(doc.name)
      }
      return acc
    },
    { errors: {}, missingDocs: [] }
  )

  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please accept the Terms & Conditions before submitting'
  }

  const firstMissing = missingDocs[0]
  const errorMsg = firstMissing
    ? `Please upload mandatory documents (${missingDocs.join(', ')})`
    : errors.termsAccepted

  return toStepResult(errors, errorMsg)
}

export const machineryLoanValidation = {
  validateStep1: validateStep1KycVerification,
  validateStep2: validateStep2LoanDetails,
  validateStep3: validateStep3BusinessDetails,
  validateStep4: validateStep4Banking,
  validateStep5: validateStep5DocumentsAndReview,
}
