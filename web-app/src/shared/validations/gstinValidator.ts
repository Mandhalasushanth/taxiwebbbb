import { VALIDATION_RULES } from './validationRules'
import { VALIDATION_MESSAGES } from './validationMessages'
import { PAN_CATEGORIES, type PanCategoryCode, validatePan } from './panValidator'

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
  isLive?: boolean
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
  return validateGstin(gstin, { required: true, strictChecksum: options?.strictChecksum, isLive: false }) === null
}

export const validateGstin = (
  gstin: string | undefined | null,
  options?: ValidateGstinOptions | string
): string | null => {
  const opts: ValidateGstinOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const isLive = Boolean(opts.isLive)
  const raw = String(gstin ?? '')
  const trimmedVal = raw.trim()

  // 1. Empty Check
  if (!trimmedVal) {
    if (isLive) return null
    return required ? (opts.label ? `${opts.label} is required` : 'Please enter GSTIN.') : null
  }

  // 2. Reject internal spaces or special characters
  if (/\s/.test(trimmedVal) || /[^A-Za-z0-9]/.test(trimmedVal)) {
    return VALIDATION_MESSAGES.gstin
  }

  const upper = trimmedVal.toUpperCase()

  // 3. Level 1: Immediate State Code Validation (Priority 1)
  // As soon as the user enters the first two digits, validate the State Code.
  // If the State Code is invalid, immediately display "Invalid state code".
  // Do not wait for the remaining 13 characters.
  if (upper.length >= 2) {
    const stateCode = upper.slice(0, 2)
    if (!/^\d{2}$/.test(stateCode) || !isValidGstStateCode(stateCode)) {
      return 'Invalid state code'
    }

    if (opts.expectedStateCode) {
      const expected = opts.expectedStateCode.padStart(2, '0')
      if (stateCode !== expected) {
        return `GSTIN state code (${stateCode}) does not match expected state (${expected})`
      }
    }
  } else if (upper.length === 1) {
    // Only 1 character entered so far
    if (isLive) return null
    return 'GSTIN must contain exactly 15 characters.'
  }

  // 4. Level 2: Remaining GSTIN Validation
  // If upper.length > 15, immediately reject length
  if (upper.length > VALIDATION_RULES.gstin.minLength) {
    return 'GSTIN must contain exactly 15 characters.'
  }

  // Priority 3: Valid State Code but invalid PAN sequence (when enough characters are available)
  // 5a. First 3 characters of PAN (GSTIN characters 3-5, index 2-4) must be letters
  if (upper.length >= 3) {
    const panPrefix = upper.slice(2, Math.min(upper.length, 5))
    if (!/^[A-Z]+$/.test(panPrefix)) {
      return 'Invalid PAN format within GSTIN.'
    }
  }

  // 5b. 4th character of PAN (GSTIN character 6, index 5) must be a valid entity type (A, B, C, F, G, H, J, L, P, or T)
  if (upper.length >= 6) {
    const pan4thChar = upper.charAt(5) as PanCategoryCode
    if (!PAN_CATEGORIES[pan4thChar]) {
      return VALIDATION_MESSAGES.panCategory
    }
  }

  // 5c. 5th character of PAN (GSTIN character 7, index 6) must be a letter
  if (upper.length >= 7) {
    const pan5thChar = upper.charAt(6)
    if (!/^[A-Z]$/.test(pan5thChar)) {
      return 'Invalid PAN format within GSTIN.'
    }
  }

  // 5d. Characters 6-9 of PAN (GSTIN characters 8-11, index 7-10) must be digits
  if (upper.length >= 8) {
    const panDigits = upper.slice(7, Math.min(upper.length, 11))
    if (!/^\d+$/.test(panDigits)) {
      return 'Invalid PAN format within GSTIN.'
    }
  }

  // 5e. When all 10 PAN characters are available (length >= 12):
  if (upper.length >= 12) {
    const embeddedPan = upper.slice(2, 12)
    const panErr = validatePan(embeddedPan)
    if (panErr) {
      return panErr === VALIDATION_MESSAGES.panCategory ? panErr : 'Invalid PAN format within GSTIN.'
    }
    if (opts.expectedPan) {
      const normExpectedPan = opts.expectedPan.trim().toUpperCase()
      if (normExpectedPan && embeddedPan !== normExpectedPan) {
        return 'GSTIN does not match the entered PAN number.'
      }
    }
  }

  // Check 13th character (Entity code) when typed
  if (upper.length >= 13) {
    if (!/^[1-9A-Z]$/.test(upper.charAt(12))) {
      return 'Invalid GSTIN entity code.'
    }
  }

  // Check 14th character (Must be Z) when typed
  if (upper.length >= 14) {
    if (upper.charAt(13) !== 'Z') {
      return 'The 14th character of GSTIN must be Z.'
    }
  }

  // Priority 2: Valid State Code but incomplete GSTIN: Do not show a premature complete-GSTIN error.
  if (upper.length < VALIDATION_RULES.gstin.minLength) {
    if (isLive) return null
    return 'GSTIN must contain exactly 15 characters.'
  }

  // Complete 15 characters entered:
  // Final checksum check if strictChecksum requested
  if (opts.strictChecksum && !isValidGstinChecksum(upper)) {
    return 'Invalid GSTIN checksum'
  }

  return null
}

