import { VALIDATION_RULES } from './validationRules'
import { VALIDATION_MESSAGES } from './validationMessages'

/**
 * Verhoeff Algorithm Tables
 * Used by UIDAI for Indian Aadhaar check digit verification
 */
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

/** Validates whether a numeric string satisfies the Verhoeff checksum */
export const isValidVerhoeff = (numStr: string): boolean => {
  let c = 0
  const reversed = numStr.split('').reverse().map(Number)
  for (let i = 0; i < reversed.length; i++) {
    const digit = reversed[i]
    if (isNaN(digit)) return false
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]]
  }
  return c === 0
}

/** Computes the Verhoeff check digit for an 11-digit base */
export const computeVerhoeffCheckDigit = (numStr: string): number => {
  let c = 0
  const reversed = numStr.split('').reverse().map(Number)
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][reversed[i]]]
  }
  return VERHOEFF_INV[c]
}

export interface ValidateAadhaarOptions {
  label?: string
  required?: boolean
}

export const isValidAadhaar = (aadhaar: string): boolean => {
  return validateAadhaar(aadhaar, { required: true }) === null
}

export const validateAadhaar = (
  aadhaar: string | undefined | null,
  options?: ValidateAadhaarOptions | string
): string | null => {
  const opts: ValidateAadhaarOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(aadhaar ?? '')
  const clean = raw.replace(/[\s-]/g, '')

  if (!clean) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject non-digits or spaces within stored values
  if (!/^\d+$/.test(clean) || clean.length !== VALIDATION_RULES.aadhaar.minLength) {
    return VALIDATION_MESSAGES.aadhaar
  }

  // Pattern check: 12 digits, first digit between 2 and 9
  if (!VALIDATION_RULES.aadhaar.pattern.test(clean)) {
    return clean.startsWith('0') || clean.startsWith('1')
      ? 'Aadhaar number cannot start with 0 or 1'
      : VALIDATION_MESSAGES.aadhaar
  }

  // Obvious dummy check: all identical digits or fewer than 4 unique digits
  if (/^(\d)\1{11}$/.test(clean) || new Set(clean.split('')).size < 4) {
    return VALIDATION_MESSAGES.aadhaar
  }

  // Verhoeff checksum algorithm check
  if (!isValidVerhoeff(clean)) {
    return 'Invalid Aadhaar check digit'
  }

  return null
}

