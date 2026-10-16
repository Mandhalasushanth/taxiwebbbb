import { validatePincodeMatchesState } from '@shared/utils'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import { loanFieldRules, toStepResult, LOAN_PATTERNS } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'
import type { MsmeLoanData } from '@modules/loans/types/msmeLoan.types'

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

/** Step 2: MSME & Business Details */
export function validateStep2MsmeDetails(data: Partial<MsmeLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  // 1. Business Details Card
  const businessName = (data.businessName || '').trim()
  const nameError =
    loanFieldRules.text(businessName, 'Business / Trade Name', 2, 100) ||
    (looksLikeJunk(businessName) ? 'Please enter a valid business name' : undefined)
  if (nameError) {
    errors.businessName = nameError
  }

  if (!data.businessConstitution?.trim()) {
    errors.businessConstitution = 'Please select business constitution'
  }

  // 2. Business Activity Card
  if (!data.businessActivity?.trim()) {
    errors.businessActivity = 'Please select primary business activity'
  }

  const estDateError = loanFieldRules.pastDate(data.establishmentDate, 'Business establishment date')
  if (estDateError) {
    errors.establishmentDate = estDateError
  }

  // 3. Business Operating Address Card
  const operatingAddress = data.operatingAddress || {
    houseBuilding: '',
    streetLocality: '',
    city: '',
    pincode: '',
    state: '',
  }
  const addressErrors = validateAddress(operatingAddress, 'operatingAddress')
  Object.assign(errors, addressErrors)

  // 4. MSME Registration Card
  if (!data.udyamStatus?.trim()) {
    errors.udyamStatus = 'Please select registration status'
  } else if (data.udyamStatus === 'Registered') {
    const udyamNum = (data.udyamNumber || '').trim().toUpperCase()
    if (!udyamNum) {
      errors.udyamNumber = 'Udyam registration number is required'
    } else if (!LOAN_PATTERNS.UDYAM.test(udyamNum)) {
      errors.udyamNumber = 'Enter a valid Udyam number (e.g. UDYAM-XX-00-0000000)'
    }
  }

  if (!data.gstStatus?.trim()) {
    errors.gstStatus = 'Please select GST status'
  } else if (data.gstStatus === 'Registered') {
    const gstinVal = (data.gstin || '').trim().toUpperCase()
    if (!gstinVal) {
      errors.gstin = 'GSTIN is required'
    } else if (!LOAN_PATTERNS.GSTIN.test(gstinVal)) {
      errors.gstin = 'Enter a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)'
    }
  }

  // 5. Business Information Card
  const turnoverError = loanFieldRules.amount(data.annualTurnover, 'Annual turnover', 100000, 500000000)
  if (turnoverError) {
    errors.annualTurnover = turnoverError
  }

  const requestedAmount = data.requestedLoanAmount || data.loanAmount
  const amountError = loanFieldRules.amount(requestedAmount, 'Requested loan amount', 50000, 100000000)
  if (amountError) {
    errors.requestedLoanAmount = amountError
  }

  if (!data.loanPurpose?.trim()) {
    errors.loanPurpose = 'Please select loan purpose'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 3: Documents */
export function validateStep3Documents(data: Partial<MsmeLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}
  const uploaded = data.uploadedDocs || {}

  const hasUdyamCert = Boolean(
    uploaded.udyam_certificate ||
    uploaded.udyamCertificate ||
    uploaded.udyam_reg_certificate
  )

  if (!hasUdyamCert) {
    errors.udyam_certificate = 'Please upload your Udyam Registration Certificate.'
    errors._step = 'Please upload all required documents to proceed.'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 4: Review & Declaration */
export function validateStep4ReviewAndDeclaration(data: Partial<MsmeLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}
  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please accept the declaration to submit your application.'
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

export const msmeLoanValidation = {
  validateStep1(data: Partial<MsmeLoanData>): LoanStepValidationResult {
    return validateStep1KycVerification(data as Partial<KycStepData>)
  },
  validateStep2(data: Partial<MsmeLoanData>): LoanStepValidationResult {
    return validateStep2MsmeDetails(data)
  },
  validateStep3(data: Partial<MsmeLoanData>): LoanStepValidationResult {
    return validateStep3Documents(data)
  },
  validateStep4(data: Partial<MsmeLoanData>): LoanStepValidationResult {
    return validateStep4ReviewAndDeclaration(data)
  },
}
