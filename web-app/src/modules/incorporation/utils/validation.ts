import {
  isValidMobile as sharedIsValidMobile,
  isValidPan as sharedIsValidPan,
  isValidPincode as sharedIsValidPincode,
  isValidEmail as sharedIsValidEmail,
  isValidAadhaar as sharedIsValidAadhaar,
  formatMobile,
} from '@shared/utils/validationUtils'

/**
 * Incorporation Form Validation Utilities
 */

// Mobile Number: exactly 10 digits, starts with 6, 7, 8, or 9
export const isValidMobile = (val: string): boolean => sharedIsValidMobile(val)

// Clean input to digits only, optionally limiting length
export const filterDigits = (val: string, maxLen?: number): string => {
  const digits = val.replace(/\D/g, '')
  return maxLen ? digits.slice(0, maxLen) : digits
}

// Mobile input: strips +91 / leading 0 and limits to 10 digits
export const filterMobile = (val: string): string => formatMobile(val)

// Aadhaar: exactly 12 digits, numeric only
export const isValidAadhaar = (val: string): boolean => sharedIsValidAadhaar(val)

// PAN Number: 5 uppercase letters, 4 digits, 1 uppercase letter
export const isValidPan = (val: string): boolean => sharedIsValidPan(val)

// Auto-format PAN input to uppercase and max 10 chars
export const filterPan = (val: string): string =>
  val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)

// PIN Code: exactly 6 digits numeric only (cannot start with 0)
export const isValidPincode = (val: string): boolean => sharedIsValidPincode(val)

// Email: standard email format
export const isValidEmail = (val: string): boolean => sharedIsValidEmail(val)


// Person / Business Name: letters, spaces, dots, hyphens only
export const isValidName = (val: string): boolean =>
  /^[A-Za-z][A-Za-z\s.'-]{1,99}$/.test(val.trim())

// DIN (Director Identification Number): 8 digits numeric only (optional or 8 digits)
export const isValidDin = (val: string): boolean =>
  !val.trim() || /^\d{8}$/.test(val.replace(/\D/g, '').trim())

// NIC 5-digit code: exactly 5 digits numeric only
export const isValidNicCode = (val: string): boolean => /^\d{5}$/.test(val.replace(/\D/g, '').trim())

// Positive numeric check
export const isPositiveNumber = (val: string | number): boolean => {
  const n = typeof val === 'number' ? val : Number(String(val).replace(/,/g, '').trim())
  return !isNaN(n) && n > 0
}

// Percentage: numeric 0 to 100
export const isValidPercentage = (val: string | number): boolean => {
  const n = typeof val === 'number' ? val : Number(String(val).replace(/%/g, '').trim())
  return !isNaN(n) && n >= 0 && n <= 100
}
