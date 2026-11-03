/**
 * Indian identity-number rules shared by every form:
 * Aadhaar (UIDAI: 12 digits, first digit 2-9, Verhoeff check digit),
 * PAN holder types (4th character) and plausible age ranges.
 */

import {
  isValidVerhoeff,
  computeVerhoeffCheckDigit,
} from '@shared/validations/aadhaarValidator'

export { isValidVerhoeff }
export const verhoeffCheckDigit = computeVerhoeffCheckDigit

/* ----------------------------- Aadhaar ---------------------------- */
export const AADHAAR_LENGTH = 12

/** UIDAI format: exactly 12 digits, never starting with 0 or 1. */
const AADHAAR_PATTERN = /^[2-9]\d{11}$/

export const getAadhaarError = (aadhaar: string, label = 'Aadhaar number'): string | null => {
  const digits = (aadhaar || '').replace(/\s/g, '')
  if (!digits) return `${label} is required`
  if (!/^\d+$/.test(digits) || digits.length !== AADHAAR_LENGTH) return `Enter a valid ${AADHAAR_LENGTH}-digit Aadhaar number`
  if (!AADHAAR_PATTERN.test(digits)) return 'Aadhaar number cannot start with 0 or 1'
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
