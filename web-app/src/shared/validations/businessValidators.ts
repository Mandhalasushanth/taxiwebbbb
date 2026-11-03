/**
 * Centralized Business & Entity Validators
 * Single Source of Truth for Business Names, Trade Names, Constitutions, HSN/SAC, Bank & Signatory rules.
 */

import { parseDate } from './dateValidator'
import { validatePan } from './panValidator'
import type { BaseValidationOptions } from './commonValidators'

/* -------------------------------------------------------------------------- */
/* Business Legal Name (as per PAN)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Validates Legal Name of Business:
 * - Allowed: Unicode letters, numbers, and legitimate business punctuation (& , . - ' / ( ))
 * - Supports company suffixes: Private Limited, Pvt Ltd, Limited, LLP, Inc, etc.
 * - Rejects unsupported special characters (@, #, $, %, etc.)
 * - Rejects names containing only numbers or only special characters (must contain letters)
 * - Rejects excessive consecutive punctuation (.., ,, --, //)
 * - Rejects consecutive spaces
 * - Length: 2 to 150 characters
 */
export const validateBusinessLegalName = (
  value: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'Legal Name of Business'
  const required = opts.required !== false
  const raw = String(value ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  const min = opts.minLength ?? 2
  const max = opts.maxLength ?? 150

  if (raw.length < min) {
    return `${label} must be at least ${min} characters`
  }
  if (raw.length > max) {
    return `${label} cannot exceed ${max} characters`
  }

  // Must contain letters (cannot be only numbers or special characters)
  if (!/\p{L}/u.test(raw)) {
    return `${label} must contain letters`
  }

  // Reject unsupported special characters (allowed: Unicode letters, digits, spaces, and & , . - ' / ( ) )
  if (!/^[\p{L}\p{N}\s&,.\-'/()]+$/u.test(raw)) {
    return `${label} contains invalid special characters`
  }

  // Reject excessive consecutive punctuation
  if (/([,.\-'/&])\s*\1/.test(raw)) {
    return `${label} should not contain consecutive punctuation`
  }

  // Reject consecutive spaces
  if (/\s{2,}/.test(raw)) {
    return `${label} should not contain consecutive spaces`
  }

  return null
}

export const isValidBusinessLegalName = (value: string): boolean =>
  validateBusinessLegalName(value, { required: true }) === null

/* -------------------------------------------------------------------------- */
/* Trade Name                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validates Trade / Brand Name:
 * - Allowed: Unicode letters, numbers, single spaces, and punctuation (& , . - ' / ( ))
 * - Rejects unsupported special characters
 * - Rejects consecutive invalid punctuation
 * - Rejects values containing only special characters
 * - Length: 2 to 150 characters
 */
export const validateTradeName = (
  value: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'Trade Name'
  const required = opts.required !== false
  const raw = String(value ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  const min = opts.minLength ?? 2
  const max = opts.maxLength ?? 150

  if (raw.length < min) {
    return `${label} must be at least ${min} characters`
  }
  if (raw.length > max) {
    return `${label} cannot exceed ${max} characters`
  }

  // Reject values containing only special characters
  if (!/[\p{L}\p{N}]/u.test(raw)) {
    return `${label} must contain letters or numbers`
  }

  // Reject unsupported special characters
  if (!/^[\p{L}\p{N}\s&,.\-'/()]+$/u.test(raw)) {
    return `${label} contains invalid special characters`
  }

  // Reject excessive consecutive punctuation
  if (/([,.\-'/&])\s*\1/.test(raw)) {
    return `${label} should not contain consecutive punctuation`
  }

  // Reject consecutive spaces
  if (/\s{2,}/.test(raw)) {
    return `${label} should not contain consecutive spaces`
  }

  return null
}

export const isValidTradeName = (value: string): boolean =>
  validateTradeName(value, { required: true }) === null

/* -------------------------------------------------------------------------- */
/* Constitution of Business & PAN Category Matching                           */
/* -------------------------------------------------------------------------- */

export const CONSTITUTION_PAN_TYPES: Record<string, readonly string[]> = {
  Proprietorship: ['P'],
  'Partnership Firm': ['F'],
  Partnership: ['F'],
  'Limited Liability Partnership (LLP)': ['F'],
  'Private Limited Company': ['C'],
  'Public Limited Company': ['C'],
  HUF: ['H'],
  'Hindu Undivided Family (HUF)': ['H'],
  'Society / Trust / Club': ['A', 'T', 'B'],
  'Society / Club / Trust / AOP': ['A', 'T', 'B'],
  'AOP / BOI': ['A', 'B'],
  'AOP/BOI': ['A', 'B'],
  'Government Department': ['G'],
  'Foreign Company': ['C'],
  'Foreign company': ['C'],
  'One Person Company (OPC)': ['C'],
  'One person Company(OPC)': ['C'],
  'One person Company (OPC)': ['C'],
}

/**
 * Validates Business PAN against Constitution of Business:
 * - Checks PAN format using centralized PAN validator
 * - Matches 4th character against required PAN category for the selected constitution
 */
export const validateBusinessPan = (
  pan: string | undefined | null,
  constitution: string | undefined | null
): string | null => {
  const baseError = validatePan(pan || '', { label: 'Business PAN' })
  if (baseError) return baseError

  const constTrimmed = (constitution || '').trim()
  if (!constTrimmed) return null

  const allowed = CONSTITUTION_PAN_TYPES[constTrimmed]
  if (!allowed) return null

  const cleaned = String(pan ?? '').trim().toUpperCase()
  const holderCode = cleaned.charAt(3)

  if (!allowed.includes(holderCode)) {
    const formattedAllowed = allowed.map((c) => `"${c}"`).join(' or ')
    return `For a ${constTrimmed}, the PAN's 4th character must be ${formattedAllowed}`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Date of Commencement of Business                                           */
/* -------------------------------------------------------------------------- */

export const COMMENCEMENT_DATE_LIMITS = { maxYearsInPast: 100, maxDaysInFuture: 30 } as const

/**
 * Validates Date of Commencement of Business:
 * - Must be a valid calendar date
 * - Rejects dates more than 30 days in the future
 * - Rejects impossible dates or dates older than 100 years
 */
export const validateCommencementDate = (
  date: string | undefined | null,
  today: Date = new Date()
): string | null => {
  const raw = String(date ?? '').trim()
  if (!raw) {
    return 'Date of commencement is required'
  }

  const parsed = parseDate(raw)
  if (!parsed) {
    return 'Please select a valid date'
  }

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + COMMENCEMENT_DATE_LIMITS.maxDaysInFuture)
  const maxIso = maxDate.toISOString().slice(0, 10)
  const dateIso = parsed.toISOString().slice(0, 10)

  if (dateIso > maxIso) {
    return `Commencement date cannot be more than ${COMMENCEMENT_DATE_LIMITS.maxDaysInFuture} days in the future`
  }

  const minDate = new Date(today)
  minDate.setFullYear(minDate.getFullYear() - COMMENCEMENT_DATE_LIMITS.maxYearsInPast)
  const minIso = minDate.toISOString().slice(0, 10)

  if (dateIso < minIso) {
    return `Commencement date cannot be more than ${COMMENCEMENT_DATE_LIMITS.maxYearsInPast} years in the past`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* District                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Validates District Name:
 * - Unicode alphabets, single spaces, and hyphens
 * - Rejects numbers and unsupported special characters
 * - Length: 2 to 50 characters
 */
export const validateDistrict = (
  district: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'District'
  const required = opts.required !== false
  const raw = String(district ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  const min = opts.minLength ?? 2
  const max = opts.maxLength ?? 50

  if (raw.length < min) {
    return `${label} must be at least ${min} characters`
  }
  if (raw.length > max) {
    return `${label} cannot exceed ${max} characters`
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`
  }

  if (!/^[\p{L}\s-]+$/u.test(raw)) {
    return `${label} must contain only letters`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* HSN / SAC Code                                                             */
/* -------------------------------------------------------------------------- */

export const HSN_SAC_LENGTHS = [4, 6, 8] as const

/**
 * Validates HSN or SAC code:
 * - Digits only
 * - Exactly 4, 6, or 8 digits
 */
export const validateHsnSac = (
  code: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'HSN / SAC code'
  const required = opts.required !== false
  const raw = String(code ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  if (!/^\d+$/.test(raw)) {
    return `${label} must contain digits only`
  }

  if (!(HSN_SAC_LENGTHS as readonly number[]).includes(raw.length)) {
    return `${label} must be 4, 6 or 8 digits`
  }

  return null
}

export const isValidHsnSac = (code: string): boolean =>
  validateHsnSac(code, { required: true }) === null

/* -------------------------------------------------------------------------- */
/* Account Holder Name (Business or Individual)                               */
/* -------------------------------------------------------------------------- */

/**
 * Validates Account Holder Name:
 * - Allows alphabets, numbers where legitimately present in entity names, single spaces, & , . - '
 * - Length: 2 to 100 characters
 */
export const validateAccountHolderName = (
  name: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'Account holder name'
  const required = opts.required !== false
  const raw = String(name ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  if (raw.length < 2) {
    return `${label} must be at least 2 characters`
  }
  if (raw.length > 100) {
    return `${label} cannot exceed 100 characters`
  }

  if (!/\p{L}/u.test(raw)) {
    return `${label} must contain letters`
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`
  }

  if (!/^[\p{L}\s.'-]+$/u.test(raw)) {
    return `${label} must contain only letters`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Confirm Account Number                                                     */
/* -------------------------------------------------------------------------- */

export const validateConfirmAccountNumber = (
  accountNumber?: string | null,
  confirmAccountNumber?: string | null
): string | null => {
  const acc = (accountNumber || '').trim()
  const conf = (confirmAccountNumber || '').trim()

  if (!conf) {
    return 'Confirm account number is required'
  }
  if (!/^\d+$/.test(conf)) {
    return 'Confirm account number must contain digits only'
  }
  if (conf.length < 9 || conf.length > 18) {
    return 'Enter a valid bank account number (9 to 18 digits)'
  }
  if (acc !== conf) {
    return 'Account numbers do not match.'
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Designation                                                                */
/* -------------------------------------------------------------------------- */

export const validateDesignation = (
  designation: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'Designation'
  const required = opts.required !== false
  const raw = String(designation ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  if (raw.length < 2) {
    return `${label} must be at least 2 characters`
  }
  if (raw.length > 60) {
    return `${label} cannot exceed 60 characters`
  }

  if (!/^[\p{L}\s/.'-]+$/u.test(raw)) {
    return `${label} must contain only letters`
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Branch                                                                     */
/* -------------------------------------------------------------------------- */

export const validateBranch = (
  branch: string | undefined | null,
  options?: BaseValidationOptions | string
): string | null => {
  const opts: BaseValidationOptions = typeof options === 'string' ? { label: options } : options || {}
  const label = opts.label || 'Branch'
  const required = opts.required !== false
  const raw = String(branch ?? '').trim()

  if (!raw) {
    return required ? `${label} is required` : null
  }

  if (raw.length < 2) {
    return `${label} must be at least 2 characters`
  }
  if (raw.length > 60) {
    return `${label} cannot exceed 60 characters`
  }

  if (!/^[\p{L}\p{N}\s.&'()/#,-]+$/u.test(raw)) {
    return `${label} contains invalid characters`
  }

  return null
}
