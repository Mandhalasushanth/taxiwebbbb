import { VALIDATION_RULES } from './validationRules'
import { VALIDATION_MESSAGES } from './validationMessages'

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
  expectedPan?: string
  strictChecksum?: boolean
}

export const validateGstinMatchesPan = (gstin: string, pan: string): string | null => {
  const extractedPan = extractPanFromGstin(gstin)
  if (!extractedPan) return 'GSTIN must contain exactly 15 characters.'
  const normalizedPan = (pan || '').trim().toUpperCase()
  if (!normalizedPan) return null
  if (extractedPan !== normalizedPan) {
    return 'GSTIN does not match the entered PAN number.'
  }
  return null
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
    return required ? (opts.label ? `${opts.label} is required` : 'Please enter GSTIN.') : null
  }

  // Reject internal spaces or special characters
  const trimmedVal = raw.trim()
  if (/\s/.test(trimmedVal) || /[^A-Za-z0-9]/.test(trimmedVal)) {
    return VALIDATION_MESSAGES.gstin
  }

  const upper = trimmedVal.toUpperCase()

  if (upper.length !== VALIDATION_RULES.gstin.minLength) {
    return 'GSTIN must contain exactly 15 characters.'
  }

  // 1. First 2 characters must be a valid GST state/UT code
  const stateCode = upper.slice(0, 2)
  if (!/^\d{2}$/.test(stateCode) || !isValidGstStateCode(stateCode)) {
    return 'GSTIN has an invalid state code. Please enter a valid GST state code.'
  }

  // 2. Characters 3–12 must follow the PAN format: 5 letters, 4 digits, 1 letter
  const embeddedPan = upper.slice(2, 12)
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(embeddedPan)) {
    return 'Invalid PAN format within GSTIN.'
  }

  // 3. PAN matching if expectedPan is supplied
  if (opts.expectedPan) {
    const normExpectedPan = opts.expectedPan.trim().toUpperCase()
    if (normExpectedPan && embeddedPan !== normExpectedPan) {
      return 'GSTIN does not match the entered PAN number.'
    }
  }

  // 4. 13th character must be an alphanumeric entity code (1–9 or A–Z)
  if (!/^[1-9A-Z]$/.test(upper.charAt(12))) {
    return 'Invalid GSTIN entity code.'
  }

  // 5. 14th character must always be 'Z'
  if (upper.charAt(13) !== 'Z') {
    return 'The 14th character of GSTIN must be Z.'
  }

  // 6. Optional: check expected state code
  if (opts.expectedStateCode) {
    const expected = opts.expectedStateCode.padStart(2, '0')
    if (stateCode !== expected) {
      return `GSTIN state code (${stateCode}) does not match expected state (${expected})`
    }
  }

  // 7. Optional strict checksum validation
  if (opts.strictChecksum && !isValidGstinChecksum(upper)) {
    return 'Invalid GSTIN checksum'
  }

  return null
}

