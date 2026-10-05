import {
  HSN_SAC_LENGTHS,
  isValidBankAccNumber,
  isValidGstin,
  isValidHsnSac,
  validateDobSignatory,
  validateEmail,
  validateIfsc,
  validateMobileNumber,
  validatePan,
  validatePincode,
} from '@shared/utils'

/**
 * Field rules for every GST form. Each rule returns an error message, or
 * undefined when the value is valid. Generic checks reuse @shared/utils.
 */

type Rule = (value: string | undefined) => string | undefined

const trimmed = (v?: string): string => (v || '').trim()
const fromShared = (msg: string | null): string | undefined => msg || undefined

export const GST_PATTERNS = {
  PERSON_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  PLACE_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  BANK_NAME: /^[A-Za-z][A-Za-z .&'()-]*$/,
  DESIGNATION: /^[A-Za-z][A-Za-z .&/'-]*$/,
  /** GSTN ARN / reference: letters, digits and / - */
  REFERENCE: /^[A-Z0-9/-]{6,35}$/,
} as const

/** GSTIN state codes run 01–38 (plus 97 Other Territory, 99 Centre Jurisdiction) */
const isValidStateCode = (code: number): boolean => (code >= 1 && code <= 38) || code === 97 || code === 99

export const gstFieldRules = {
  required: (label: string): Rule => (v) => (trimmed(v) ? undefined : `${label} is required`),

  gstin: (v?: string): string | undefined => {
    const value = trimmed(v).toUpperCase()
    if (!value) return 'GSTIN is required'
    if (value.length !== 15) return 'GSTIN must be exactly 15 characters'
    if (!isValidGstin(value)) return 'Enter a valid GSTIN'
    if (!isValidStateCode(Number(value.slice(0, 2)))) return 'GSTIN has an invalid state code'
    return undefined
  },

  pan: (v?: string): string | undefined => fromShared(validatePan(trimmed(v))),
  ifsc: (v?: string): string | undefined => fromShared(validateIfsc(trimmed(v))),
  pinCode: (v?: string): string | undefined => fromShared(validatePincode(trimmed(v))),
  email: (v?: string): string | undefined => fromShared(validateEmail(trimmed(v))),
  mobile: (v?: string): string | undefined => fromShared(validateMobileNumber(trimmed(v).replace(/^\+91\s*/, ''))),
  signatoryDob: (v?: string): string | undefined => fromShared(validateDobSignatory(trimmed(v))),

  accountNumber: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'Bank account number is required'
    return isValidBankAccNumber(value) ? undefined : 'Enter a valid bank account number (9 to 18 digits)'
  },

  confirmAccountNumber: (account?: string, confirm?: string): string | undefined => {
    if (!trimmed(confirm)) return 'Confirm account number is required'
    return trimmed(account) === trimmed(confirm) ? undefined : 'Account numbers do not match'
  },

  hsnSac: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'HSN / SAC code is required'
    if (!/^\d+$/.test(value)) return 'HSN / SAC code must contain digits only'
    return isValidHsnSac(value) ? undefined : `HSN / SAC code must be ${HSN_SAC_LENGTHS.join(', ').replace(/, (\d+)$/, ' or $1')} digits`
  },

  personName: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    if (!GST_PATTERNS.PERSON_NAME.test(value)) return `${label} must contain only letters`
    if (value.length < 2) return `${label} must be at least 2 characters`
    return value.length > 100 ? `${label} cannot exceed 100 characters` : undefined
  },

  businessName: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    if (value.length < 2) return `${label} must be at least 2 characters`
    return value.length > 150 ? `${label} cannot exceed 150 characters` : undefined
  },

  placeName: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    return GST_PATTERNS.PLACE_NAME.test(value) ? undefined : `${label} must contain only letters`
  },

  bankName: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'Bank name is required'
    if (!GST_PATTERNS.BANK_NAME.test(value)) return 'Bank name must contain only letters'
    return value.length < 3 ? 'Please enter the full bank name' : undefined
  },

  designation: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'Designation is required'
    return GST_PATTERNS.DESIGNATION.test(value) ? undefined : 'Designation must contain only letters'
  },

  address: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    if (value.length < 10) return `Please enter the complete ${label.toLowerCase()} (at least 10 characters)`
    return value.length > 250 ? `${label} cannot exceed 250 characters` : undefined
  },

  /** Notice number / ARN / GSTR-2B reference */
  reference: (label: string): Rule => (v) => {
    const value = trimmed(v).toUpperCase()
    if (!value) return `${label} is required`
    return GST_PATTERNS.REFERENCE.test(value) ? undefined : `Enter a valid ${label.toLowerCase()} (6–35 letters/digits)`
  },

  text: (label: string, min = 3, max = 500): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    if (value.length < min) return `${label} must be at least ${min} characters`
    return value.length > max ? `${label} cannot exceed ${max} characters` : undefined
  },

  /** Date (YYYY-MM-DD) that must not be in the past */
  futureDate: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return `Enter a valid ${label.toLowerCase()}`
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today ? `${label} cannot be in the past` : undefined
  },

  /** Date (YYYY-MM-DD) that must not be in the future */
  pastDate: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return `Enter a valid ${label.toLowerCase()}`
    return date > new Date() ? `${label} cannot be in the future` : undefined
  },

  /** Wraps a rule so an empty value is allowed */
  optional: (rule: Rule): Rule => (v) => (trimmed(v) ? rule(v) : undefined),
}

/**
 * Runs { field: rule } over a data object and returns { field: message } for failures.
 */
export const runGstRules = <T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, Rule>>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(rules)
      .map(([field, rule]) => [field, (rule as Rule)(data[field] as string | undefined)])
      .filter(([, message]) => Boolean(message))
  ) as Record<string, string>

/** Banner text when "Continue" is pressed on an incomplete step (same as the loans flows) */
export const GST_STEP_ERROR = 'Please fill in all required fields.'

/** Keeps only the fields that have an error message */
export const collectGstErrors = (checks: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(Object.entries(checks).filter(([, message]) => Boolean(message))) as Record<string, string>

/** Field kinds recognised from a label/placeholder (rule 7: validate by what the field asks for) */
export type GstFieldKind =
  | 'gstin' | 'pan' | 'ifsc' | 'email' | 'mobile' | 'pinCode' | 'accountNumber'
  | 'personName' | 'businessName' | 'address' | 'reference' | 'text'

const KIND_MATCHERS: [GstFieldKind, RegExp][] = [
  ['gstin', /\bgstin\b/i],
  ['ifsc', /\bifsc\b/i],
  ['email', /e-?mail/i],
  ['mobile', /mobile|phone/i],
  ['pinCode', /\bpin\s*code\b|\bpincode\b/i],
  ['accountNumber', /account\s*(no|number)/i],
  ['businessName', /business name|trade name|legal name/i],
  ['personName', /signatory name|full name|holder name/i],
  ['address', /address/i],
  ['reference', /\barn\b|reference|notice number/i],
  ['pan', /^\s*(new\s+)?pan\b|pan number/i],
]

const kindsIn = (text: string): GstFieldKind[] => KIND_MATCHERS.filter(([, re]) => re.test(text)).map(([kind]) => kind)

/** A field that asks for several things at once (e.g. "name, PAN and designation") is free text */
const isCombined = (text: string): boolean => /,|and/i.test(text)

/** Detects the field kind from its label first, then its placeholder; mixed requests are plain text */
export const detectGstFieldKind = (label = '', placeholder = ''): GstFieldKind => {
  const fromLabel = kindsIn(label)
  if (fromLabel.length > 1) return 'text'
  if (fromLabel.length === 1) return fromLabel[0]
  if (isCombined(placeholder)) return 'text'
  const fromPlaceholder = kindsIn(placeholder).filter((kind) => kind !== 'pan')
  return fromPlaceholder.length === 1 ? fromPlaceholder[0] : 'text'
}

/** Rule for a field identified only by its label/placeholder */
export const gstRuleForField = (label = '', placeholder = ''): Rule => {
  const name = label || 'This field'
  const byKind: Record<GstFieldKind, Rule> = {
    gstin: gstFieldRules.gstin,
    pan: gstFieldRules.pan,
    ifsc: gstFieldRules.ifsc,
    email: gstFieldRules.email,
    mobile: gstFieldRules.mobile,
    pinCode: gstFieldRules.pinCode,
    accountNumber: gstFieldRules.accountNumber,
    personName: gstFieldRules.personName(name),
    businessName: gstFieldRules.businessName(name),
    address: gstFieldRules.address(name),
    reference: gstFieldRules.reference(name),
    text: gstFieldRules.text(name, 2, 500),
  }
  return byKind[detectGstFieldKind(label, placeholder)]
}
