import { VALIDATION_RULES } from './validationRules'
import { VALIDATION_MESSAGES } from './validationMessages'
import { validatePincodeMatchesState } from '../utils/pincodeState'

export interface BaseValidationOptions {
  label?: string
  required?: boolean
  isLive?: boolean
  minLength?: number
  maxLength?: number
}

export const validateRequired = (
  value: unknown,
  label = 'This field'
): string | null => {
  if (value === null || value === undefined) {
    return `${label} is required`
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${label} is required`
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* A. Full Name, Father's Name and Spouse Name                                */
/* -------------------------------------------------------------------------- */
export interface ValidateNameOptions extends BaseValidationOptions {
  minLength?: number
  maxLength?: number
}

export const isValidName = (name: string): boolean => {
  return validateName(name, { required: true }) === null
}

/**
 * Universal name validator for Full Name, Father's Name, Spouse Name, and Legal Names.
 * Enforces Unicode alphabets, single spaces, single dots for initials/formatting,
 * and rejects numbers, emojis, consecutive dots/spaces, leading/trailing dots/spaces.
 */
export const validateName = (
  name: string | undefined | null,
  options?: ValidateNameOptions | string
): string | null => {
  const opts: ValidateNameOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const isLive = Boolean(opts.isLive)
  const raw = String(name ?? '')
  const label = opts.label

  if (!raw.trim()) {
    if (isLive) return null
    return required ? (label ? `${label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject leading space or dot immediately
  if (raw.startsWith(' ') || raw.startsWith('.')) {
    return label ? `${label} cannot start with a space or dot` : VALIDATION_MESSAGES.name
  }

  // Reject consecutive spaces or dots immediately
  if (/\s{2,}/.test(raw)) {
    return label ? `${label} should not contain consecutive spaces` : VALIDATION_MESSAGES.name
  }
  if (/\.{2,}/.test(raw)) {
    return label ? `${label} should not contain consecutive dots` : VALIDATION_MESSAGES.name
  }
  if (/([.'-])\1+/.test(raw) || /[.'-]\s*[.'-]+/.test(raw)) {
    return label ? `${label} must be a valid name (no consecutive special characters)` : VALIDATION_MESSAGES.name
  }

  // Reject numbers
  if (/[0-9]/.test(raw)) {
    return label ? `${label} should only contain letters` : VALIDATION_MESSAGES.name
  }

  // Reject unsupported special characters or symbols (allow Unicode letters, spaces, dots, hyphens, and apostrophes)
  if (/[^\p{L}\s.'-]/u.test(raw)) {
    return label ? `${label} should only contain letters` : VALIDATION_MESSAGES.name
  }

  const max = opts.maxLength ?? VALIDATION_RULES.name.maxLength
  if (raw.length > max) {
    return label ? `${label} cannot exceed ${max} characters` : VALIDATION_MESSAGES.name
  }

  // When actively typing (isLive = true), allow single trailing space or dot as user is typing next word/initial
  if (isLive) {
    return null
  }

  // Reject trailing spaces
  if (raw.endsWith(' ')) {
    return label ? `${label} should not end with a space or dot` : VALIDATION_MESSAGES.name
  }

  // Trailing dot check:
  // In Indian names, trailing dots are valid ONLY on initials with preceding space, e.g. "Ravi K." or "A. B."
  if (raw.endsWith('.')) {
    const letterCount = (raw.match(/\p{L}/gu) || []).length
    if (letterCount < 2) {
      return label ? `${label} must have at least 2 letters` : VALIDATION_MESSAGES.name
    }
    if (!/\s\p{L}\.$/u.test(raw)) {
      return label ? `${label} should not end with a space or dot` : VALIDATION_MESSAGES.name
    }
  }

  const min = opts.minLength ?? VALIDATION_RULES.name.minLength
  const letterCount = (raw.match(/\p{L}/gu) || []).length
  if (letterCount < min || raw.length < min) {
    return label ? `${label} must be at least ${min} characters` : VALIDATION_MESSAGES.name
  }

  if (!VALIDATION_RULES.name.pattern.test(raw)) {
    return VALIDATION_MESSAGES.name
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* B. Email Validation                                                        */
/* -------------------------------------------------------------------------- */
export const isValidEmail = (email: string): boolean => {
  return validateEmail(email, { required: true }) === null
}

export const validateEmail = (
  email: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(email ?? '')

  if (!raw.trim()) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject internal spaces
  if (/\s/.test(raw)) {
    return VALIDATION_MESSAGES.email
  }

  const trimmed = raw.trim()

  if (trimmed.length > VALIDATION_RULES.email.maxLength) {
    return VALIDATION_MESSAGES.email
  }

  const atParts = trimmed.split('@')
  if (atParts.length !== 2) {
    return VALIDATION_MESSAGES.email
  }

  const [username, domain] = atParts

  if (
    !username ||
    username.length > VALIDATION_RULES.email.usernameMaxLength ||
    username.startsWith('.') ||
    username.endsWith('.') ||
    username.includes('..')
  ) {
    return VALIDATION_MESSAGES.email
  }

  if (!domain || domain.startsWith('.') || domain.endsWith('.')) {
    return VALIDATION_MESSAGES.email
  }

  const domainLabels = domain.split('.')
  if (domainLabels.length < 2) {
    return VALIDATION_MESSAGES.email
  }

  for (const label of domainLabels) {
    if (!label || label.startsWith('-') || label.endsWith('-')) {
      return VALIDATION_MESSAGES.email
    }
  }

  // TLD check: must be at least 2 alpha characters
  const tld = domainLabels[domainLabels.length - 1]
  if (!tld || tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) {
    return VALIDATION_MESSAGES.email
  }

  if (!VALIDATION_RULES.email.pattern.test(trimmed)) {
    return VALIDATION_MESSAGES.email
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* C. Mobile Number                                                           */
/* -------------------------------------------------------------------------- */
export const isValidMobile = (mobile: string): boolean => {
  return validateMobile(mobile, { required: true }) === null
}

export const validateMobile = (
  mobile: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(mobile ?? '').trim()

  if (!raw) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Handle optional country code (+91 or 91)
  let cleaned = raw
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3).trim()
  } else if (cleaned.startsWith('91') && cleaned.replace(/\D/g, '').length === 12) {
    cleaned = cleaned.slice(2).trim()
  }

  // Remove spaces or hyphens that might be used for formatting (e.g. "91234 98765")
  const digitsOnly = cleaned.replace(/[\s-]/g, '')

  if (/\D/.test(digitsOnly)) {
    return VALIDATION_MESSAGES.mobile
  }

  if (digitsOnly.length !== VALIDATION_RULES.mobile.minLength || !VALIDATION_RULES.mobile.pattern.test(digitsOnly)) {
    return VALIDATION_MESSAGES.mobile
  }

  // Reject all identical digits dummy numbers e.g. 9999999999
  if (/^(\d)\1{9}$/.test(digitsOnly)) {
    return VALIDATION_MESSAGES.mobile
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* H. Address Line 1 and Address Line 2                                       */
/* -------------------------------------------------------------------------- */
export interface ValidateAddressOptions extends BaseValidationOptions {
  minLength?: number
  maxLength?: number
}

export const isValidAddress = (address: string): boolean => {
  return validateAddress(address, { required: true }) === null
}

export const validateAddress = (
  address: string | undefined | null,
  options?: ValidateAddressOptions | string
): string | null => {
  const opts: ValidateAddressOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(address ?? '')

  if (!raw.trim()) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject leading/trailing spaces
  if (raw.startsWith(' ') || raw.endsWith(' ')) {
    return VALIDATION_MESSAGES.address
  }

  // Reject consecutive spaces
  if (/\s{2,}/.test(raw)) {
    return VALIDATION_MESSAGES.address
  }

  // Reject consecutive duplicate punctuation e.g. ,, or .. or @@ or // or ** or !!
  if (/([,./#'!@$%^&*-])\1+/.test(raw) || /[,./#'-]{2,}/.test(raw) || /[,./#'-]\s*[,./#'-]+/.test(raw)) {
    return opts.label ? `${opts.label} contains invalid special characters` : VALIDATION_MESSAGES.address
  }

  // Reject leading or trailing special characters
  if (/^[,./#'!@$%^&*-]/.test(raw) || /[,./#'!@$%^&*-]$/.test(raw)) {
    return opts.label ? `${opts.label} contains invalid special characters` : VALIDATION_MESSAGES.address
  }

  const min = opts.minLength ?? VALIDATION_RULES.address.minLength
  const max = opts.maxLength ?? VALIDATION_RULES.address.maxLength

  if (raw.length < min || raw.length > max) {
    return opts.label ? `${opts.label} must be between ${min} and ${max} characters` : VALIDATION_MESSAGES.address
  }

  // Must not contain only special characters, must have letters or numbers
  if (!/[\p{L}\p{N}]/u.test(raw)) {
    return opts.label ? `${opts.label} contains invalid special characters` : VALIDATION_MESSAGES.address
  }

  // Allowed characters: letters, numbers, single spaces, comma, dot, hyphen, forward slash, hash, apostrophe
  if (!/^[\p{L}\p{N}\s,./#'-]+$/u.test(raw)) {
    return opts.label ? `${opts.label} contains invalid special characters` : VALIDATION_MESSAGES.address
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* I. City                                                                    */
/* -------------------------------------------------------------------------- */
export interface ValidateCityOptions extends BaseValidationOptions {
  minLength?: number
  maxLength?: number
}

export const isValidCity = (city: string): boolean => {
  return validateCity(city, { required: true }) === null
}

export const validateCity = (
  city: string | undefined | null,
  options?: ValidateCityOptions | string
): string | null => {
  const opts: ValidateCityOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(city ?? '')

  if (!raw.trim()) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject leading/trailing spaces, dots, hyphens
  if (raw.startsWith(' ') || raw.endsWith(' ') || raw.startsWith('.') || raw.endsWith('.') || raw.startsWith('-') || raw.endsWith('-')) {
    return VALIDATION_MESSAGES.city
  }

  // Reject consecutive spaces, dots, or hyphens
  if (/\s{2,}/.test(raw) || /\.{2,}/.test(raw) || /-{2,}/.test(raw) || /([\-.'])\1+/.test(raw) || /[\-.']\s*[\-.']+/.test(raw)) {
    return opts.label ? `${opts.label} cannot contain consecutive dots or hyphens` : VALIDATION_MESSAGES.city
  }

  // Reject numbers or emojis/unsupported symbols
  if (/\d/.test(raw)) {
    return opts.label ? `${opts.label} must contain only letters` : VALIDATION_MESSAGES.city
  }

  const min = opts.minLength ?? VALIDATION_RULES.city.minLength
  const max = opts.maxLength ?? VALIDATION_RULES.city.maxLength

  if (raw.length < min || raw.length > max) {
    return opts.label ? `${opts.label} must be between ${min} and ${max} characters` : VALIDATION_MESSAGES.city
  }

  if (!/^[\p{L}\s.-]+$/u.test(raw)) {
    return opts.label ? `${opts.label} must contain only letters` : VALIDATION_MESSAGES.city
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* J. PIN Code                                                                */
/* -------------------------------------------------------------------------- */
export interface ValidatePincodeOptions extends BaseValidationOptions {
  state?: string
  stateOrUt?: string
}

export const isValidPincode = (pincode: string, state?: string): boolean => {
  return validatePincode(pincode, { required: true, state }) === null
}

export const validatePincode = (
  pincode: string | undefined | null,
  options?: ValidatePincodeOptions | string,
  stateParam?: string
): string | null => {
  const opts: ValidatePincodeOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const state = (stateParam || opts.state || opts.stateOrUt || '').trim()
  const raw = String(pincode ?? '').trim()

  if (!raw) {
    return required ? (opts.label ? `${opts.label} is required` : 'PIN code is required') : null
  }

  // Reject spaces or non-digits (alphabets, symbols)
  if (/\s/.test(raw) || !/^\d+$/.test(raw)) {
    return 'PIN code must contain digits only'
  }

  // Exactly 6 digits
  if (raw.length !== 6) {
    return opts.label ? `${opts.label} must be exactly 6 digits` : 'PIN code must be exactly 6 digits'
  }

  // First digit between 1 and 9
  if (!/^[1-9]\d{5}$/.test(raw)) {
    return 'Enter a valid 6-digit Indian PIN code'
  }

  // Reject dummy repeating digits e.g. 111111, 222222
  if (/^(\d)\1{5}$/.test(raw)) {
    return 'Enter a valid 6-digit Indian PIN code'
  }

  // Validate against State/UT if state is selected/provided
  if (state) {
    const mismatch = validatePincodeMatchesState(raw, state)
    if (mismatch) return mismatch
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* K. Bank Account Number                                                     */
/* -------------------------------------------------------------------------- */
export const isValidAccountNumber = (acc: string): boolean => {
  return validateAccountNumber(acc, { required: true }) === null
}

export const validateAccountNumber = (
  acc: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(acc ?? '').trim()

  if (!raw) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  if (/\s/.test(raw) || !/^\d+$/.test(raw)) {
    return VALIDATION_MESSAGES.accountNumber
  }

  if (!VALIDATION_RULES.accountNumber.pattern.test(raw)) {
    return VALIDATION_MESSAGES.accountNumber
  }

  return null
}

export const validateBankAccountNumber = validateAccountNumber

/* -------------------------------------------------------------------------- */
/* L. IFSC Code                                                               */
/* -------------------------------------------------------------------------- */
export const isValidIfsc = (ifsc: string): boolean => {
  return validateIfsc(ifsc, { required: true }) === null
}

export const validateIfsc = (
  ifsc: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(ifsc ?? '').trim()

  if (!raw) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  if (/\s/.test(raw)) {
    return VALIDATION_MESSAGES.ifsc
  }

  const upper = raw.toUpperCase()

  if (!VALIDATION_RULES.ifsc.pattern.test(upper)) {
    return VALIDATION_MESSAGES.ifsc
  }

  return null
}

export const validateIfscCode = validateIfsc

/* -------------------------------------------------------------------------- */
/* Canonical Formatting Helpers                                               */
/* -------------------------------------------------------------------------- */
export const formatMobile = (val: string): string => {
  const digits = (val || '').replace(/\D/g, '').replace(/^0+/, '')
  const hasCountryCode = digits.length > 10 && digits.startsWith('91')
  const local = hasCountryCode ? digits.slice(2) : digits
  return local.slice(0, 10)
}

export const formatPan = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}

export const formatAadhaar = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export const formatIfsc = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
}
