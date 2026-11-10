import {
  validateAadhaar,
} from '@shared/utils/validationUtils'
import type { TdsBusinessDetails } from '@modules/itr/types/tdsRefund.types'

/**
 * Sanitizes Legal Name of Business input:
 * - Only allows required characters: letters, digits, single spaces, and dot (.)
 * - Strips all disallowed special characters (@, #, $, %, ^, &, *, etc.)
 * - Strips leading non-alphanumeric characters (spaces or dots)
 * - Prevents continuous/consecutive dots (.. or ... -> .)
 * - Collapses consecutive spaces to a single space
 * - Enforces max length 150
 */
export const sanitizeBusinessLegalName = (value: string): string => {
  return value
    .replace(/[^A-Za-z0-9\s.]/g, '') // Only required characters: letters, numbers, spaces, and dot
    .replace(/^[^A-Za-z0-9]+/g, '') // Must not start with space or dot
    .replace(/\.{2,}/g, '.') // No repeating continuous dots (.. or ... -> .)
    .replace(/\s*\.\s*\./g, '.') // No spaced dots (. . -> .)
    .replace(/\s{2,}/g, ' ') // Only single space between words
    .slice(0, 150)
}

export const validateBusinessLegalName = (name: string): string | null => {
  const trimmed = (name || '').trim()
  if (!trimmed) return 'Legal name of business is required'
  if (/\d/.test(trimmed)) return 'Legal name cannot contain numbers'
  if (trimmed.length < 3) return 'Enter the legal name exactly as on the PAN (min 3 characters)'
  if (!/^[A-Za-z\s.]+$/.test(trimmed)) return 'Only letters, spaces, and dot are allowed'
  if (/\.{2,}/.test(trimmed)) return 'Legal name of business should not contain consecutive dots'
  if (/\s{2,}/.test(name || '')) return 'Legal name of business should not contain consecutive spaces'
  return null
}

export const validateBusinessPan = (pan: string): string | null => {
  const raw = (pan || '').trim().toUpperCase()
  if (!raw) return 'Business PAN is required'
  if (raw.length < 10) return 'Business PAN must be 10 characters'
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(raw)) {
    return 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F)'
  }
  const category = raw.charAt(3)
  const validCategories = ['A', 'B', 'C', 'F', 'G', 'H', 'J', 'L', 'P', 'T']
  if (!validCategories.includes(category)) {
    return 'The 4th character of PAN must represent a valid entity type (A, B, C, F, G, H, J, L, P, or T).'
  }
  return null
}

export const validateBusinessAadhaar = (aadhaar: string): string | null => {
  const raw = (aadhaar || '').trim()
  if (!raw) return 'Aadhaar number is required'
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 12) return 'Enter a valid 12-digit Aadhaar number'
  const err = validateAadhaar(raw)
  if (err) return err
  return null
}

export const validateBusinessMobile = (mobile: string): string | null => {
  const raw = (mobile || '').trim()
  if (!raw) return 'Mobile number is required'
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 10) return 'Please enter a valid 10-digit mobile number.'
  if (!/^[6-9]/.test(digits)) return 'Mobile number must start with 6, 7, 8, or 9.'
  return null
}

export const validateBusinessField = (
  field: keyof TdsBusinessDetails,
  details: TdsBusinessDetails
): string | null => {
  switch (field) {
    case 'legalName':
      return validateBusinessLegalName(details.legalName)
    case 'pan':
      return validateBusinessPan(details.pan)
    case 'aadhaar':
      return validateBusinessAadhaar(details.aadhaar)
    case 'mobile':
      return validateBusinessMobile(details.mobile)
    default:
      return null
  }
}

/** Field errors for the Business Details card, keyed by the field they belong to. */
export const getBusinessDetailsErrors = (details: TdsBusinessDetails): Record<string, string> => {
  const checks: Array<[keyof TdsBusinessDetails, string | null]> = [
    ['legalName', validateBusinessLegalName(details.legalName)],
    ['pan', validateBusinessPan(details.pan)],
    ['aadhaar', validateBusinessAadhaar(details.aadhaar)],
    ['mobile', validateBusinessMobile(details.mobile)],
  ]
  return Object.fromEntries(
    checks.filter((check): check is [keyof TdsBusinessDetails, string] => Boolean(check[1]))
  )
}

export const isBusinessDetailsValid = (details: TdsBusinessDetails): boolean =>
  Object.keys(getBusinessDetailsErrors(details)).length === 0

/* ------------------------------------------------------------------ *
 * Bank Details Validators
 * ------------------------------------------------------------------ */

export const validateIfscCode = (ifsc: string): string | null => {
  const raw = (ifsc || '').trim().toUpperCase()
  if (!raw) return 'IFSC code is required'
  if (raw.length !== 11) return 'IFSC code must be exactly 11 characters'
  if (raw.charAt(4) !== '0') {
    return '5th character of IFSC must be 0 (e.g. SBIN0001234)'
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(raw)) {
    return 'Please enter a valid 11-character IFSC code (e.g. SBIN0001234)'
  }
  return null
}

export const validateAccountNumber = (acc: string): string | null => {
  const raw = (acc || '').trim()
  if (!raw) return 'Bank account number is required'
  if (!/^\d+$/.test(raw)) return 'Bank account number must contain digits only'
  if (raw.length < 9 || raw.length > 18) return 'Enter a valid bank account number (9 to 18 digits)'
  return null
}

export const validateConfirmAccountNumber = (confirmAcc: string, acc: string): string | null => {
  const rawConfirm = (confirmAcc || '').trim()
  const rawAcc = (acc || '').trim()
  if (!rawConfirm) return 'Confirm bank account number is required'
  if (!/^\d+$/.test(rawConfirm)) return 'Bank account number must contain digits only'
  if (rawConfirm !== rawAcc) return 'Account numbers do not match'
  return null
}

export const validateAccountHolder = (name: string): string | null => {
  const raw = (name || '').trim()
  if (!raw) return 'Account holder name is required'
  if (raw.length < 2) return 'Account holder name must be at least 2 characters'
  if (!/^[A-Za-z\s.'-]+$/.test(raw)) return 'Account holder name can only contain letters, spaces, and dots'
  return null
}
