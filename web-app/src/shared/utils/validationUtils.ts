import {
  formatAadhaar,
  formatPan,
  formatMobile,
  formatIfsc,
  panFromGstin,
  isValidGstin,
} from './formatUtils'
import { EMAIL_LIMITS, REGEX } from '../constants/common.constants'
import {
  INDIVIDUAL_PAN_HOLDER_CODE,
  PAN_HOLDER_TYPES,
  getAadhaarError,
  getPanHolderCode,
  isKnownPanHolderType,
} from './identityValidation'

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
  isValidGstin,
}

export const isValidPan = (value: string): boolean => validatePan(value) === null
export const isValidPincode = (value: string): boolean => /^[1-9][0-9]{5}$/.test(value.trim())

/**
 * Validates Email addresses (RFC 5322 compatible standard check)
 */
export const isValidEmail = (email: string): boolean => {
  const trimmed = (email || '').trim()
  const localPart = trimmed.split('@')[0] ?? ''
  return (
    trimmed.length <= EMAIL_LIMITS.maxLength &&
    localPart.length <= EMAIL_LIMITS.maxLocalLength &&
    REGEX.email.test(trimmed)
  )
}

export const validateEmail = (email: string, label = 'Email address'): string | null => {
  const trimmed = (email || '').trim()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!isValidEmail(trimmed)) {
    return 'Enter a valid email address'
  }
  return null
}

/**
 * Validates Indian Mobile Number:
 * Exactly 10 digits and must start with 6, 7, 8, or 9
 */
export const isValidMobile = (value: string): boolean => {
  let digits = (value || '').replace(/\D/g, '').trim()
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  }
  return /^[6-9]\d{9}$/.test(digits)
}

export const validateMobileNumber = (mobile: string, label = 'Mobile number'): string | null => {
  let digits = (mobile || '').replace(/\D/g, '').trim()
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  }
  if (!digits) {
    return `${label} is required`
  }
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number'
  }
  // Extra safety checks for obvious dummy/repeated numbers
  if (/^(\d)\1{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number'
  }
  return null
}

/**
 * Validates 11-character Indian IFSC code
 * Format: 4 uppercase letters + '0' + 6 alphanumeric characters
 */
export const isValidIfsc = (ifsc: string): boolean => {
  const trimmed = ifsc.trim().toUpperCase()
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmed)
}

export const validateIfsc = (ifsc: string, label = 'IFSC code'): string | null => {
  const trimmed = (ifsc || '').trim().toUpperCase()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!isValidIfsc(trimmed)) {
    return 'Enter a valid IFSC code'
  }
  return null
}

/**
 * Validates Bank Account Numbers: 9 to 18 numeric digits
 */
export const isValidBankAccNumber = (acc: string): boolean => {
  const digits = (acc || '').replace(/\D/g, '').trim()
  return digits.length >= 9 && digits.length <= 18
}

export const validateBankAccNumber = (acc: string, label = 'Bank account number'): string | null => {
  const digits = (acc || '').replace(/\D/g, '').trim()
  if (!digits) {
    return `${label} is required`
  }
  if (digits.length < 9 || digits.length > 18) {
    return 'Enter a valid bank account number (9 to 18 digits)'
  }
  return null
}

/**
 * Validates Account Number and Confirm Account Number match
 */
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

/** Lengths GST accepts for HSN (goods) / SAC (services) codes */
export const HSN_SAC_LENGTHS = [4, 6, 8] as const

/**
 * Validates HSN / SAC code: digits only, exactly 4, 6 or 8 digits
 */
export const isValidHsnSac = (code: string): boolean => {
  const trimmed = (code || '').trim()
  return /^\d+$/.test(trimmed) && (HSN_SAC_LENGTHS as readonly number[]).includes(trimmed.length)
}

/**
 * Validates PAN Number (5 letters, 4 numbers, 1 letter)
 */
export const validatePan = (pan: string, label = 'PAN'): string | null => {
  const trimmed = (pan || '').trim().toUpperCase()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!REGEX.pan.test(trimmed)) {
    return 'Enter a valid PAN'
  }
  if (!isKnownPanHolderType(trimmed)) {
    return `Enter a valid PAN (4th character must be one of ${Object.keys(PAN_HOLDER_TYPES).join(', ')})`
  }
  return null
}

/**
 * Validates a PAN issued to an individual person: 4th character must be "P".
 */
export const validateIndividualPan = (pan: string, label = 'PAN'): string | null => {
  const baseError = validatePan(pan, label)
  if (baseError) return baseError
  if (getPanHolderCode(pan) !== INDIVIDUAL_PAN_HOLDER_CODE) {
    return `Enter an individual PAN (4th character must be "${INDIVIDUAL_PAN_HOLDER_CODE}")`
  }
  return null
}

/**
 * Validates 15-character Indian GSTIN
 * Format: 2 digits state code + 10 PAN chars + 1 entity code + 'Z' + 1 checksum char
 */
export const validateGstin = (gstin: string, label = 'GSTIN'): string | null => {
  const trimmed = (gstin || '').trim().toUpperCase()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(trimmed)) {
    return 'Enter a valid GSTIN'
  }
  return null
}

/**
 * Validates 6-digit Indian PIN Code
 */
export const validatePincode = (pincode: string, label = 'PIN code'): string | null => {
  const trimmed = (pincode || '').replace(/\D/g, '').trim()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
    return 'Enter a valid 6-digit PIN code'
  }
  return null
}

/**
 * Validates Person / Business Name
 * Must contain letters and spaces/dots/hyphens only
 */
export const validateName = (name: string, label = 'Name'): string | null => {
  const trimmed = (name || '').trim()
  if (!trimmed) {
    return `${label} is required`
  }
  if (!/^[A-Za-z][A-Za-z\s.'-]{1,99}$/.test(trimmed)) {
    return 'Enter a valid name (letters only)'
  }
  return null
}

/**
 * Validates Currency / Amount Fields
 */
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

/**
 * Validates Percentage Fields (0 - 100)
 */
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

/**
 * Validates Signatory Date of Birth:
 * - Must be a valid date
 * - Signatory must be at least 18 years old
 * - Cannot be in the future
 */
export const validateDobSignatory = (dob: string): string | null => {
  if (!dob) {
    return 'Date of birth is required'
  }
  const dateObj = new Date(dob)
  if (isNaN(dateObj.getTime())) {
    return 'Please select a valid date of birth'
  }
  const today = new Date()
  if (dateObj > today) {
    return 'Date of birth cannot be in the future'
  }

  // Calculate age
  let age = today.getFullYear() - dateObj.getFullYear()
  const monthDiff = today.getMonth() - dateObj.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    age--
  }

  if (age < 18) {
    return 'Authorised signatory must be at least 18 years of age'
  }
  if (age > 100) {
    return 'Please enter a valid date of birth'
  }

  return null
}

/** Plausible window for a business commencement date (GST allows a short future start for new businesses) */
export const COMMENCEMENT_DATE_LIMITS = { maxYearsInPast: 100, maxDaysInFuture: 30 } as const

/** Earliest / latest allowed commencement dates as YYYY-MM-DD (also used for the date input's min / max) */
export const getCommencementDateBounds = (today: Date = new Date()): { min: string; max: string } => {
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const min = new Date(today)
  min.setFullYear(min.getFullYear() - COMMENCEMENT_DATE_LIMITS.maxYearsInPast)
  const max = new Date(today)
  max.setDate(max.getDate() + COMMENCEMENT_DATE_LIMITS.maxDaysInFuture)
  return { min: toIso(min), max: toIso(max) }
}

/**
 * Validates Commencement Date (YYYY-MM-DD):
 * - Must be a real calendar date
 * - Not more than 100 years in the past (rejects placeholders like 01-01-1900)
 * - Not more than 30 days in the future
 */
export const validateCommencementDate = (date: string, today: Date = new Date()): string | null => {
  if (!date) {
    return 'Date of commencement is required'
  }
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const dateObj = new Date(date)
  const isRealDate =
    Boolean(match) &&
    !isNaN(dateObj.getTime()) &&
    dateObj.toISOString().slice(0, 10) === date
  if (!isRealDate) {
    return 'Please select a valid date'
  }
  const { min, max } = getCommencementDateBounds(today)
  if (date < min) {
    return `Commencement date cannot be more than ${COMMENCEMENT_DATE_LIMITS.maxYearsInPast} years in the past`
  }
  if (date > max) {
    return `Commencement date cannot be more than ${COMMENCEMENT_DATE_LIMITS.maxDaysInFuture} days in the future`
  }
  return null
}

/**
 * Validates genuine Indian 12-digit Aadhaar numbers (UIDAI rules):
 * exactly 12 digits, first digit 2-9, valid Verhoeff check digit,
 * plus rejection of obvious dummy numbers.
 */
export const validateAadhaar = (aadhaar: string, label = 'Aadhaar number'): string | null => {
  const digits = (aadhaar || '').replace(/[\s-]/g, '')

  const formatError = getAadhaarError(digits, label)
  if (formatError) {
    return formatError
  }
  if (/^(\d)\1{11}$/.test(digits)) {
    return 'Enter a valid 12-digit Aadhaar number'
  }
  const uniqueDigits = new Set(digits.split('')).size
  if (uniqueDigits < 4) {
    return 'Enter a valid 12-digit Aadhaar number'
  }
  return null
}

export const isValidAadhaar = (value: string): boolean => validateAadhaar(value) === null

export const isNonEmpty = (value: string | null | undefined): boolean => Boolean(value && value.trim().length > 0)

/**
 * Validates a required field with friendly error copy
 */
export const validateRequired = (
  value: string | number | null | undefined,
  fieldLabel = 'This field'
): string | null => {
  if (value === null || value === undefined) {
    return `${fieldLabel} is required`
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldLabel} is required`
  }
  return null
}

/**
 * Validates multiple required fields in an object, returning an errors map.
 */
export const validateRequiredFields = <T extends Record<string, any>>(
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
