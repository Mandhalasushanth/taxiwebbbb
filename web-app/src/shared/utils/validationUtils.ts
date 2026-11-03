/**
 * TaxEdge Shared Validation Utilities
 * Thin adapter layer delegating to the centralized validation system in @shared/validations.
 * Maintains complete backwards compatibility for existing imports across the application.
 */

import {
  formatAadhaar,
  formatPan,
  formatMobile,
  formatIfsc,
  panFromGstin,
} from './formatUtils'
import {
  validateName as centralValidateName,
  isValidName as centralIsValidName,
  validateEmail as centralValidateEmail,
  isValidEmail as centralIsValidEmail,
  validateMobile as centralValidateMobile,
  isValidMobile as centralIsValidMobile,
  validateAddress as centralValidateAddress,
  isValidAddress as centralIsValidAddress,
  validateCity as centralValidateCity,
  isValidCity as centralIsValidCity,
  validatePincode as centralValidatePincode,
  isValidPincode as centralIsValidPincode,
  validateAccountNumber as centralValidateAccountNumber,
  isValidAccountNumber as centralIsValidAccountNumber,
  validateIfsc as centralValidateIfsc,
  isValidIfsc as centralIsValidIfsc,
  validatePan as centralValidatePan,
  validateIndividualPan as centralValidateIndividualPan,
  isValidPan as centralIsValidPan,
  getPanCategory,
  PAN_CATEGORIES,
  validateAadhaar as centralValidateAadhaar,
  isValidAadhaar as centralIsValidAadhaar,
  validateGstin as centralValidateGstin,
  isValidGstin as centralIsValidGstin,
  validateDob as centralValidateDob,
  validateRequired as centralValidateRequired,
  validateBusinessLegalName,
  isValidBusinessLegalName,
  validateTradeName,
  isValidTradeName,
  validateBusinessPan,
  CONSTITUTION_PAN_TYPES,
  validateDistrict,
  validateHsnSac,
  validateAccountHolderName,
  validateConfirmAccountNumber,
  validateDesignation,
  validateBranch,
  validateCommencementDate as centralValidateCommencementDate,
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from '../validations'

export {
  AADHAAR_LENGTH,
  AGE_LIMITS,
  PAN_HOLDER_TYPES,
  ageOn,
  getAgeRangeError,
  isValidVerhoeff,
  verhoeffCheckDigit,
} from './identityValidation'

export {
  formatAadhaar,
  formatPan,
  formatMobile,
  formatIfsc,
  panFromGstin,
  validateBusinessLegalName,
  isValidBusinessLegalName,
  validateTradeName,
  isValidTradeName,
  validateBusinessPan,
  CONSTITUTION_PAN_TYPES,
  validateDistrict,
  validateHsnSac,
  validateAccountHolderName,
  validateConfirmAccountNumber,
  validateDesignation,
  validateBranch,
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  getPanCategory,
  PAN_CATEGORIES,
}

/* -------------------------------- PAN ------------------------------------ */
export const isValidPan = (value: string, businessType?: string): boolean =>
  centralIsValidPan(value, businessType)

export const validatePan = (pan: string, label = 'PAN', businessType?: string): string | null =>
  centralValidatePan(pan, { label, businessType })

export const validateIndividualPan = (pan: string, label = 'PAN'): string | null =>
  centralValidateIndividualPan(pan, label)

/* ------------------------------ PINCODE ---------------------------------- */
export const isValidPincode = (value: string): boolean =>
  centralIsValidPincode(value)

export const validatePincode = (
  pincode: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean } = 'PIN code'
): string | null =>
  centralValidatePincode(pincode, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* ------------------------------- EMAIL ----------------------------------- */
export const isValidEmail = (email: string): boolean =>
  centralIsValidEmail(email)

export const validateEmail = (
  email: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean } = 'Email address'
): string | null =>
  centralValidateEmail(email, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* ------------------------------- MOBILE ---------------------------------- */
export const isValidMobile = (value: string): boolean =>
  centralIsValidMobile(value)

export const validateMobileNumber = (
  mobile: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean } = 'Mobile number'
): string | null =>
  centralValidateMobile(mobile, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* -------------------------------- IFSC ----------------------------------- */
export const isValidIfsc = (ifsc: string): boolean =>
  centralIsValidIfsc(ifsc)

export const validateIfsc = (ifsc: string, label = 'IFSC code'): string | null =>
  centralValidateIfsc(ifsc, { label })

/* ---------------------------- BANK ACCOUNT ------------------------------- */
export const isValidBankAccNumber = (acc: string): boolean =>
  centralIsValidAccountNumber(acc)

export const validateBankAccNumber = (acc: string, label = 'Bank account number'): string | null =>
  centralValidateAccountNumber(acc, { label })

export const validateAccountMatch = (
  accountNumber: string,
  confirmAccountNumber: string
): string | null => {
  const acc = (accountNumber || '').replace(/\D/g, '').trim()
  const conf = (confirmAccountNumber || '').replace(/\D/g, '').trim()

  if (!conf) {
    return 'Confirm account number is required'
  }
  if (acc !== conf) {
    return 'Account numbers do not match'
  }
  return null
}

/* -------------------------------- GSTIN ---------------------------------- */
export const isValidGstin = (value: string): boolean =>
  centralIsValidGstin(value)

export const validateGstin = (gstin: string, label = 'GSTIN', expectedStateCode?: string): string | null =>
  centralValidateGstin(gstin, { label, expectedStateCode })

/* -------------------------------- NAME ----------------------------------- */
export const isValidName = (name: string): boolean =>
  centralIsValidName(name)

export const validateName = (
  name: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean; minLength?: number; maxLength?: number } = 'Name'
): string | null =>
  centralValidateName(name, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* ------------------------------ AADHAAR ---------------------------------- */
export const isValidAadhaar = (value: string): boolean =>
  centralIsValidAadhaar(value)

export const validateAadhaar = (
  aadhaar: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean } = 'Aadhaar number'
): string | null =>
  centralValidateAadhaar(aadhaar, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* ------------------------------ ADDRESS ---------------------------------- */
export const isValidAddress = (address: string): boolean =>
  centralIsValidAddress(address)

export const validateAddress = (
  address: string,
  optionsOrLabel: string | { label?: string; minLength?: number; maxLength?: number } = 'Address'
): string | null =>
  centralValidateAddress(address, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* -------------------------------- CITY ----------------------------------- */
export const isValidCity = (city: string): boolean =>
  centralIsValidCity(city)

export const validateCity = (
  city: string,
  optionsOrLabel: string | { label?: string; required?: boolean; isLive?: boolean; minLength?: number; maxLength?: number } = 'City'
): string | null =>
  centralValidateCity(city, typeof optionsOrLabel === 'string' ? { label: optionsOrLabel } : optionsOrLabel)

/* --------------------------- DATE / SIGNATORY ---------------------------- */
export const validateDobSignatory = (dob: string): string | null => {
  return centralValidateDob(dob, {
    label: 'Date of birth',
    minAge: 18,
    maxAge: 100,
    allowFuture: false,
  }) || null
}

export const COMMENCEMENT_DATE_LIMITS = { maxYearsInPast: 100, maxDaysInFuture: 30 } as const

export const getCommencementDateBounds = (today: Date = new Date()): { min: string; max: string } => {
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const min = new Date(today)
  min.setFullYear(min.getFullYear() - COMMENCEMENT_DATE_LIMITS.maxYearsInPast)
  const max = new Date(today)
  max.setDate(max.getDate() + COMMENCEMENT_DATE_LIMITS.maxDaysInFuture)
  return { min: toIso(min), max: toIso(max) }
}

export const validateCommencementDate = (date: string, today: Date = new Date()): string | null => centralValidateCommencementDate(date, today)

/* ------------------------------- HSN / SAC ------------------------------- */
export const HSN_SAC_LENGTHS = [4, 6, 8] as const

export const isValidHsnSac = (code: string): boolean => {
  const trimmed = (code || '').trim()
  return /^\d+$/.test(trimmed) && (HSN_SAC_LENGTHS as readonly number[]).includes(trimmed.length)
}

/* -------------------------------- AMOUNT --------------------------------- */
export const validateAmount = (
  val: string | number | undefined | null,
  label = 'Amount',
  min = 1,
  max?: number
): string | null => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${label} is required`
  }
  const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, '').replace(/₹/g, '').trim())
  if (isNaN(num) || num < 0) {
    return 'Enter a valid amount'
  }
  if (min !== undefined && num < min) {
    return `Minimum ${label.toLowerCase()} is ₹${min.toLocaleString('en-IN')}`
  }
  if (max !== undefined && num > max) {
    return `Maximum ${label.toLowerCase()} is ₹${max.toLocaleString('en-IN')}`
  }
  return null
}

export const validatePercentage = (
  val: string | number | undefined | null,
  label = 'Percentage'
): string | null => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${label} is required`
  }
  const num = typeof val === 'number' ? val : Number(String(val).replace(/%/g, '').trim())
  if (isNaN(num) || num < 0 || num > 100) {
    return 'Enter a valid percentage between 0 and 100'
  }
  return null
}

export const isNonEmpty = (value: string | null | undefined): boolean => Boolean(value && value.trim().length > 0)

export const validateRequired = (
  value: unknown,
  fieldLabel = 'This field'
): string | null => centralValidateRequired(value, fieldLabel)

export const validateRequiredFields = <T extends Record<string, unknown>>(
  values: T,
  fieldLabels: Partial<Record<keyof T, string>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const entries = Object.entries(fieldLabels) as [keyof T, string][]
  const errors = entries.reduce<Partial<Record<keyof T, string>>>((acc, [key, label]) => {
    const val = values[key]
    const err = validateRequired(val, label)
    if (err) {
      acc[key] = err
    }
    return acc
  }, {})

  const isValid = Object.keys(errors).length === 0
  return { isValid, errors }
}
