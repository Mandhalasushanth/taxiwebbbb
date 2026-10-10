import {
  validateAadhaar,
  validateMobileNumber,
  validatePan,
} from '@shared/utils/validationUtils'
import type { TdsBusinessDetails } from '@modules/itr/types/tdsRefund.types'

/** Letters, digits and the punctuation used in registered business names (e.g. "A & B Traders Pvt. Ltd."). */
const BUSINESS_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s&.,'()/-]{2,149}$/

export const validateBusinessLegalName = (name: string): string | null => {
  const trimmed = (name || '').trim()
  if (!trimmed) return 'Legal name of business is required'
  if (!BUSINESS_NAME_PATTERN.test(trimmed)) return 'Enter the legal name exactly as on the PAN (min 3 characters)'
  return null
}

/** Field errors for the Business Details card, keyed by the field they belong to. */
export const getBusinessDetailsErrors = (details: TdsBusinessDetails): Record<string, string> => {
  const checks: Array<[keyof TdsBusinessDetails, string | null]> = [
    ['legalName', validateBusinessLegalName(details.legalName)],
    ['pan', details.pan.trim() ? validatePan(details.pan, 'Business PAN') : 'Business PAN is required'],
    ['aadhaar', details.aadhaar.trim() ? validateAadhaar(details.aadhaar) : 'Aadhaar number is required'],
    ['mobile', validateMobileNumber(details.mobile)],
  ]
  return Object.fromEntries(
    checks.filter((check): check is [keyof TdsBusinessDetails, string] => Boolean(check[1])),
  )
}

export const isBusinessDetailsValid = (details: TdsBusinessDetails): boolean =>
  Object.keys(getBusinessDetailsErrors(details)).length === 0
