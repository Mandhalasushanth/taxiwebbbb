import { validatePincodeMatchesState } from '@shared/utils'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import { loanFieldRules, toStepResult } from './commonLoanValidation'
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

/** Step 2: MSME & Business Details (placeholder for Step 2) */
export function validateStep2MsmeDetails(_data: Partial<MsmeLoanData>): LoanStepValidationResult {
  return toStepResult({})
}

/** Step 3: Documents (placeholder for Step 3) */
export function validateStep3Documents(_data: Partial<MsmeLoanData>): LoanStepValidationResult {
  return toStepResult({})
}

/** Step 4: Review & Declaration (placeholder for Step 4) */
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
