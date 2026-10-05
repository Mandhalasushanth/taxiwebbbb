/**
 * Indian identity-number rules shared by every form:
 * Aadhaar (UIDAI: 12 digits, first digit 2-9, Verhoeff check digit),
 * PAN holder types (4th character) and plausible age ranges.
 */

/* ---------------------------- Verhoeff ---------------------------- */
const VERHOEFF_MULTIPLICATION: readonly number[][] = [
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

const VERHOEFF_PERMUTATION: readonly number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

const VERHOEFF_INVERSE: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

const verhoeffChecksum = (digits: string): number =>
  digits
    .split('')
    .reverse()
    .reduce((check, digit, index) => VERHOEFF_MULTIPLICATION[check][VERHOEFF_PERMUTATION[index % 8][Number(digit)]], 0)

/** True when the last digit is a valid Verhoeff check digit for the rest. */
export const isValidVerhoeff = (digits: string): boolean => /^\d+$/.test(digits) && verhoeffChecksum(digits) === 0

/** Check digit to append to `digits` (used to build valid test numbers). */
export const verhoeffCheckDigit = (digits: string): number => VERHOEFF_INVERSE[verhoeffChecksum(`${digits}0`)]

/* ----------------------------- Aadhaar ---------------------------- */
export const AADHAAR_LENGTH = 12

/** UIDAI format: exactly 12 digits, never starting with 0 or 1. */
const AADHAAR_PATTERN = /^[2-9]\d{11}$/

export const getAadhaarError = (aadhaar: string, label = 'Aadhaar number'): string | null => {
  const digits = (aadhaar || '').replace(/\s/g, '')
  if (!digits) return `${label} is required`
  if (!/^\d+$/.test(digits) || digits.length !== AADHAAR_LENGTH) return `Enter a valid ${AADHAAR_LENGTH}-digit Aadhaar number`
  if (!AADHAAR_PATTERN.test(digits)) return 'Aadhaar number cannot start with 0 or 1'
  if (!isValidVerhoeff(digits)) return 'Enter a valid Aadhaar number (check digit does not match)'
  return null
}

/* ------------------------------- PAN ------------------------------ */
/** 4th PAN character = holder type, as issued by the Income Tax Department. */
export const PAN_HOLDER_TYPES = {
  P: 'Individual',
  C: 'Company',
  H: 'Hindu Undivided Family',
  F: 'Firm / LLP',
  A: 'Association of Persons',
  T: 'Trust',
  B: 'Body of Individuals',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government',
} as const

export type PanHolderCode = keyof typeof PAN_HOLDER_TYPES

export const INDIVIDUAL_PAN_HOLDER_CODE: PanHolderCode = 'P'
const PAN_HOLDER_INDEX = 3

export const getPanHolderCode = (pan: string): string => (pan || '').trim().toUpperCase().charAt(PAN_HOLDER_INDEX)

export const isKnownPanHolderType = (pan: string): boolean => getPanHolderCode(pan) in PAN_HOLDER_TYPES

/* ------------------------------- Age ------------------------------ */
export const AGE_LIMITS = { min: 18, max: 120 } as const

/** Completed years between `birthDate` and `today`. */
export const ageOn = (birthDate: Date, today: Date = new Date()): number => {
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  return today.getFullYear() - birthDate.getFullYear() - (hadBirthdayThisYear ? 0 : 1)
}

/** Error for an implausible date of birth (under the minimum or over the maximum age), else null. */
export const getAgeRangeError = (birthDate: Date, today: Date = new Date()): string | null => {
  const age = ageOn(birthDate, today)
  if (age < AGE_LIMITS.min) return `You must be at least ${AGE_LIMITS.min} years old`
  if (age > AGE_LIMITS.max) return `Enter a valid date of birth (age cannot be more than ${AGE_LIMITS.max} years)`
  return null
}
