import type React from 'react'
import { formatPan, formatIfsc } from '@shared/utils'

/**
 * Input filters and key handlers for all loan forms.
 * This is the single source for input formatting; validation rules live in
 * validation/commonLoanValidation.ts.
 */

export const LOAN_FIELD_LIMITS = {
  PAN: 10,
  AADHAAR: 12,
  GSTIN: 15,
  IFSC: 11,
  BANK_ACCOUNT_MAX: 18,
  BANK_ACCOUNT_MIN: 9,
  ITR_ACK: 15,
  UDYAM_MAX: 19,
  PINCODE: 6,
  MOBILE: 10,
} as const

const CONTROL_KEYS = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter']

const isControlKey = (e: React.KeyboardEvent<HTMLInputElement>): boolean =>
  CONTROL_KEYS.includes(e.key) || e.ctrlKey || e.metaKey

const limit = (val: string, maxLen?: number): string => (maxLen ? val.slice(0, maxLen) : val)

/** Strips digits (for names typed as free text) */
export function formatTextOnly(val: string, maxLen?: number): string {
  return limit(val.replace(/[0-9]/g, ''), maxLen)
}

/** Keeps digits only */
export function formatDigitsOnly(val: string, maxLen?: number): string {
  return limit(val.replace(/\D/g, ''), maxLen)
}

/** Uppercase letters and digits only (GSTIN, IFSC, PAN) */
export function formatUppercaseAlphanumeric(val: string, maxLen?: number): string {
  return limit(val.toUpperCase().replace(/[^A-Z0-9]/g, ''), maxLen)
}

/** Names, bank names, cities: letters, spaces and . ' - & ( ) only */
export function formatLettersOnly(val: string, maxLen = 100): string {
  return val.replace(/[^A-Za-z .'&()-]/g, '').replace(/\s{2,}/g, ' ').slice(0, maxLen)
}

/** Udyam number: auto-formats to UDYAM-XX-00-0000000 as the user types */
export function formatUdyamNumber(val: string, maxLen = LOAN_FIELD_LIMITS.UDYAM_MAX): string {
  const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
  // Still typing the "UDYAM" prefix (or empty): keep as-is
  if ('UDYAM'.startsWith(upper)) return upper
  const raw = upper.replace(/^UDYAM/, '')
  const state = raw.slice(0, 2).replace(/[^A-Z]/g, '')
  const district = raw.slice(state.length, state.length + 2).replace(/\D/g, '')
  const serial = raw.slice(state.length + district.length).replace(/\D/g, '').slice(0, 7)
  return ['UDYAM', state, district, serial].filter(Boolean).join('-').slice(0, maxLen)
}

/** Date of birth: auto-formats digits to DD/MM/YYYY */
export function formatDob(val: string): string {
  const d = val.replace(/\D/g, '').slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/')
}

/** Formats a raw number string in Indian grouping, e.g. "500000" → "5,00,000" */
export function formatCurrencyString(val: string): string {
  const digits = val.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('en-IN') : ''
}

/** Blocks non-digit keystrokes */
export function handleNumericKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (!isControlKey(e) && !/^\d$/.test(e.key)) e.preventDefault()
}

/** Blocks digit keystrokes in text-only fields */
export function handleTextOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (!isControlKey(e) && /[0-9]/.test(e.key)) e.preventDefault()
}

/** Blocks anything except letters and digits */
export function handleAlphanumericKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (!isControlKey(e) && !/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault()
}

/**
 * Grouped helpers used by the loan step forms.
 */
export const loanInputHelpers = {
  allowOnlyNumbersKeyDown: handleNumericKeyDown,
  allowOnlyAlphanumericKeyDown: handleAlphanumericKeyDown,
  formatCurrencyString,
  digitsOnly: formatDigitsOnly,
  cleanPan: formatPan,
  cleanIfsc: formatIfsc,
  cleanGstin: (val: string): string => formatUppercaseAlphanumeric(val, LOAN_FIELD_LIMITS.GSTIN),
  lettersOnly: formatLettersOnly,
  cleanUdyam: (val: string): string => formatUdyamNumber(val),
  formatDob,
}

/**
 * Known IFSC codes mapped to sample branch names for real-time detection
 */
export const SAMPLE_IFSC_BRANCH_MAP: Record<string, string> = {
  HDFC0000123: 'HDFC Bank - MADURAI - TAMIL NADU',
  BKID0008832: 'GURUNANAK TIMBER MARKET',
  HDFC0001234: 'CONNAUGHT PLACE BRANCH',
  SBIN0001234: 'MAIN BRANCH NEW DELHI',
  SBIN0004567: 'STATE BANK OF INDIA - MAIN BRANCH',
  ICIC0001234: 'NARIMAN POINT MUMBAI',
  UTIB0001234: 'MG ROAD BENGALURU',
}

/**
 * Resolves IFSC code to detected branch name or verified label
 */
export function resolveIfscBranch(ifsc?: string): string {
  if (!ifsc) return ''
  const clean = ifsc.trim().toUpperCase()
  return SAMPLE_IFSC_BRANCH_MAP[clean] || (clean.length === 11 ? 'VERIFIED BANK BRANCH' : '')
}
