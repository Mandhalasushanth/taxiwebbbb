import { REGEX } from '../constants/common.constants'

export const isValidGstin = (value: string): boolean =>
  REGEX.gstin.test(value.trim().toUpperCase())

/**
 * Conditionally joins CSS class names
 */
export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Returns initials for a given user name (e.g. "John Doe" -> "JD")
 */
export const initialsOf = (name: string): string => {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Formats bytes to human-readable size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Formats Aadhaar into standard 4-4-4 spacing (e.g. 1234 5678 9012)
 */
export const formatAadhaar = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const AADHAAR_VISIBLE_DIGITS = 4
const MASK_GROUP = 'XXXX'

/**
 * Masks an Aadhaar number for display, showing only the last 4 digits (UIDAI guideline):
 * "234567890124" -> "XXXX XXXX 0124". Returns the fallback when there is nothing to show.
 */
export const maskAadhaar = (val?: string | null, fallback = '—'): string => {
  const digits = (val ?? '').replace(/\D/g, '')
  if (digits.length < AADHAAR_VISIBLE_DIGITS) return fallback
  return `${MASK_GROUP} ${MASK_GROUP} ${digits.slice(-AADHAAR_VISIBLE_DIGITS)}`
}

/**
 * Formats PAN to uppercase alphanumeric max 10 chars
 */
export const formatPan = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}

const MOBILE_LENGTH = 10
const COUNTRY_CODE = '91'

/**
 * Formats Indian 10-digit mobile number, stripping pasted
 * country code (+91 / 0091) and trunk prefix (0) when present
 */
export const formatMobile = (val: string): string => {
  const digits = (val || '').replace(/\D/g, '').replace(/^0+/, '')
  const hasCountryCode = digits.length > MOBILE_LENGTH && digits.startsWith(COUNTRY_CODE)
  const local = hasCountryCode ? digits.slice(COUNTRY_CODE.length) : digits
  return local.slice(0, MOBILE_LENGTH)
}

/**
 * Formats IFSC code to uppercase 11 chars
 */
export const formatIfsc = (val: string): string => {
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
}

/** PAN embedded in a GSTIN, characters 3-12. */
export const panFromGstin = (gstin: string): string | null =>
  isValidGstin(gstin) ? gstin.slice(2, 12) : null
