import { VALIDATION_RULES } from './validationRules'
import { VALIDATION_MESSAGES } from './validationMessages'
import { isValidPan } from './panValidator'

export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
}

export const isValidGstStateCode = (code: string | number): boolean => {
  const padded = String(code).padStart(2, '0')
  return padded in GST_STATE_CODES
}

const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Calculates official GSTIN check digit (Luhn mod 36 algorithm)
 */
export const computeGstinChecksum = (gstin14: string): string => {
  const upper = gstin14.toUpperCase().slice(0, 14)
  if (upper.length !== 14) return ''

  let sum = 0
  for (let i = 0; i < 14; i++) {
    const codePoint = GSTIN_CHARSET.indexOf(upper[i])
    if (codePoint === -1) return ''
    const factor = (i % 2 === 0) ? 1 : 2
    const product = codePoint * factor
    sum += Math.floor(product / 36) + (product % 36)
  }
  const remainder = sum % 36
  const checkCode = (36 - remainder) % 36
  return GSTIN_CHARSET[checkCode]
}

export const isValidGstinChecksum = (gstin: string): boolean => {
  const upper = (gstin || '').trim().toUpperCase()
  if (upper.length !== 15) return false
  const calculated = computeGstinChecksum(upper.slice(0, 14))
  return upper.charAt(14) === calculated
}

export const extractPanFromGstin = (gstin: string): string | null => {
  const upper = (gstin || '').trim().toUpperCase()
  return upper.length === 15 ? upper.slice(2, 12) : null
}

export const extractStateCodeFromGstin = (gstin: string): string | null => {
  const upper = (gstin || '').trim().toUpperCase()
  return upper.length >= 2 ? upper.slice(0, 2) : null
}

export interface ValidateGstinOptions {
  label?: string
  required?: boolean
  expectedStateCode?: string
  strictChecksum?: boolean
}

export const isValidGstin = (gstin: string, options?: { strictChecksum?: boolean }): boolean => {
  return validateGstin(gstin, { required: true, strictChecksum: options?.strictChecksum }) === null
}

export const validateGstin = (
  gstin: string | undefined | null,
  options?: ValidateGstinOptions | string
): string | null => {
  const opts: ValidateGstinOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(gstin ?? '')

  if (!raw.trim()) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject internal spaces
  if (/\s/.test(raw)) {
    return VALIDATION_MESSAGES.gstin
  }

  const upper = raw.trim().toUpperCase()

  if (upper.length !== VALIDATION_RULES.gstin.minLength) {
    return VALIDATION_MESSAGES.gstin
  }

  // Match 15-char structure: 2 digits, 5 letters, 4 digits, 1 letter, 1 char, Z, 1 char
  if (!VALIDATION_RULES.gstin.pattern.test(upper)) {
    return VALIDATION_MESSAGES.gstin
  }

  // Validate state code
  const stateCode = upper.slice(0, 2)
  if (!isValidGstStateCode(stateCode)) {
    return 'GSTIN has an invalid state code'
  }

  // Validate embedded PAN
  const embeddedPan = upper.slice(2, 12)
  if (!isValidPan(embeddedPan)) {
    return 'GSTIN contains an invalid PAN'
  }

  // Optional: check expected state code
  if (opts.expectedStateCode) {
    const expected = opts.expectedStateCode.padStart(2, '0')
    if (stateCode !== expected) {
      return `GSTIN state code (${stateCode}) does not match expected state (${expected})`
    }
  }

  // Optional strict checksum validation
  if (opts.strictChecksum && !isValidGstinChecksum(upper)) {
    return 'Invalid GSTIN checksum'
  }

  return null
}

