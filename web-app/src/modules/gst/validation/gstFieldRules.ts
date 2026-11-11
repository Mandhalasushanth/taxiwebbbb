import {
  isValidBankAccNumber,
  validateGstin,
  validateAccountHolderName,
  validateAddress,
  validateBankName,
  validateBranch,
  validateBusinessLegalName,
  validateCity,
  validateCommencementDate,
  validateConfirmAccountNumber,
  validateDesignation,
  validateDistrict,
  validateDobSignatory,
  validateEmail,
  validateHsnSac,
  validateIfsc,
  validateMobileNumber,
  validateName,
  validatePan,
  validatePincode,
  validateTradeName,
} from '@shared/utils'

/**
 * Field rules for every GST form. Each rule returns an error message, or
 * undefined when the value is valid. Generic checks reuse centralized @shared/utils.
 */

type Rule = (value: string | undefined) => string | undefined

const trimmed = (v?: string): string => (v || '').trim()
const fromShared = (msg: string | null): string | undefined => msg || undefined

export const GST_PATTERNS = {
  PERSON_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  CITY_DISTRICT: /^[A-Za-z][A-Za-z .'-]*$/,
  PLACE_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  BRANCH: /^[A-Za-z0-9][A-Za-z0-9\s.,\/-]*$/,
  BANK_NAME: /^[A-Za-z][A-Za-z .&'-]*$/,
  DESIGNATION: /^[A-Za-z][A-Za-z /'-]*$/,
  BUSINESS_NAME: /^[A-Za-z0-9][A-Za-z0-9 .&'()/,-]*$/,
  ADDRESS: /^[A-Za-z0-9\s,./#()&'-]+$/,
  /** GST Notice / Reference: 15–20 characters */
  REFERENCE: /^[A-Z0-9/-]{6,20}$/,
  /** GST Application Reference Number: 15 alphanumeric characters */
  ARN: /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{6}[0-9A-Z]$/,
  /** GST Portal RFN: 15 alphanumeric characters (e.g. ZA270124000123Z) */
  RFN: /^[A-Z]{2}[0-9]{6}[A-Z0-9]{7}$/,
  /** CBIC Document Identification Number: 20 alphanumeric characters, optional prefix */
  DIN: /^(CBIC-|DIN-)?\d{4}[0-9A-Z]{16}$/,
} as const

export const gstFieldRules = {
  required: (label: string): Rule => (v) => (trimmed(v) ? undefined : `${label} is required`),

  gstin: (v?: string, expectedPan?: string): string | undefined => {
    const value = trimmed(v).toUpperCase()
    if (!value) return 'GSTIN is required'
    if (value.length !== 15) return 'GSTIN must be exactly 15 characters'
    const error = validateGstin(value, expectedPan ? { expectedPan } : undefined)
    if (error) return error
    return undefined
  },

  pan: (v?: string): string | undefined => fromShared(validatePan(trimmed(v))),
  ifsc: (v?: string): string | undefined => fromShared(validateIfsc(trimmed(v))),
  pinCode: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'PIN code is required'
    if (!/^\d+$/.test(value)) return 'PIN code must contain digits only'
    return fromShared(validatePincode(value))
  },
  email: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'Email is required'
    const err = fromShared(validateEmail(value))
    if (err) return err
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ? undefined
      : 'Enter a valid email address'
  },
  mobile: (v?: string): string | undefined => {
    const value = trimmed(v).replace(/^\+91\s*/, '')
    if (!value) return 'Mobile number is required'
    if (!/^\d+$/.test(value)) return 'Mobile number must contain digits only'
    return fromShared(validateMobileNumber(value))
  },
  signatoryDob: (v?: string): string | undefined => fromShared(validateDobSignatory(trimmed(v))),

  accountNumber: (v?: string): string | undefined => {
    const value = trimmed(v)
    if (!value) return 'Bank account number is required'
    if (!/^\d+$/.test(value)) return 'Bank account number must contain digits only'
    return isValidBankAccNumber(value) ? undefined : 'Enter a valid bank account number (9 to 18 digits)'
  },

  confirmAccountNumber: (account?: string, confirm?: string): string | undefined =>
    fromShared(validateConfirmAccountNumber(account, confirm)),

  hsnSac: (v?: string): string | undefined => fromShared(validateHsnSac(v)),

  personName: (label: string): Rule => (v) => {
    const err = fromShared(validateName(v, label))
    if (err && err.includes('only contain letters')) {
      return `${label} must contain only letters`
    }
    return err
  },

  cityDistrict: (label: string): Rule => (v) => {
    const isDistrict = label.toLowerCase().includes('district')
    return isDistrict ? fromShared(validateDistrict(v, label)) : fromShared(validateCity(v, { label, minLength: 2, maxLength: 50 }))
  },

  city: (label = 'City'): Rule => (v) => fromShared(validateCity(v, { label, minLength: 2, maxLength: 50 })),

  district: (label = 'District'): Rule => (v) => fromShared(validateDistrict(v, label)),

  legalName: (label = 'Legal Name of Business'): Rule => (v) => fromShared(validateBusinessLegalName(v, label)),

  tradeName: (label = 'Trade Name'): Rule => (v) => fromShared(validateTradeName(v, label)),

  businessName: (label: string): Rule => (v) => {
    const isTrade = /trade|brand/i.test(label)
    return isTrade ? fromShared(validateTradeName(v, label)) : fromShared(validateBusinessLegalName(v, label))
  },

  placeName: (label: string): Rule => (v) => {
    const value = trimmed(v)
    if (!value) return `${label} is required`
    if (label.toLowerCase().includes('branch')) {
      return fromShared(validateBranch(v, label))
    }
    return fromShared(validateCity(v, { label, minLength: 2, maxLength: 50 }))
  },

  branch: (v?: string): string | undefined => fromShared(validateBranch(v)),

  bankName: (v?: string): string | undefined => fromShared(validateBankName(v)),

  accountHolderName: (label = 'Account holder name'): Rule => (v) => fromShared(validateAccountHolderName(v, label)),

  designation: (v?: string): string | undefined => fromShared(validateDesignation(v)),

  commencementDate: (v?: string): string | undefined => fromShared(validateCommencementDate(v)),

  address: (label: string): Rule => (v) => fromShared(validateAddress(v, { label, minLength: 10, maxLength: 250 })),

  /**
   * GST Notice Number / RFN / DIN:
   * 15-character GST Portal Reference Number (RFN, e.g. ZA270124000123Z) or 20-digit CBIC DIN
   */
  noticeNumber: (v?: string): string | undefined => {
    const value = trimmed(v).toUpperCase()
    if (!value) return 'Notice number is required'
    if (value.length < 15) {
      return 'Notice number must be at least 15 characters (e.g. ZA270124000123Z)'
    }
    if (value.length > 20) {
      return 'Notice number cannot exceed 20 characters'
    }
    if (!/^[A-Z0-9/-]+$/.test(value)) {
      return 'Notice number can only contain uppercase letters, numbers, and hyphens'
    }
    // Must contain both letters and numbers
    if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Enter a valid alphanumeric notice number (e.g. ZA270124000123Z or CBIC DIN)'
    }
    // Disallow repetitive dummy character sequences like AAAAA or 11111
    if (/(.)\1{4,}/.test(value)) {
      return 'Notice number contains invalid repetitive characters'
    }
    return undefined
  },

  /**
   * GST Application Reference Number (ARN) or GSTR-2B ARN:
   * 15-character alphanumeric format (e.g. AA270124000123Z)
   */
  arn: (label = 'ARN'): Rule => (v) => {
    const value = trimmed(v).toUpperCase()
    if (!value) return `${label} is required`
    if (value.length !== 15) {
      return `${label} must be exactly 15 characters (e.g. AA270124000123Z)`
    }
    if (!/^[A-Z0-9]+$/.test(value)) {
      return `${label} can only contain letters and numbers`
    }
    if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
      return `Enter a valid alphanumeric ${label} (e.g. AA270124000123Z)`
    }
    return undefined
  },

  /** Notice number / ARN / reference */
  reference: (label: string): Rule => (v) => {
    const value = trimmed(v).toUpperCase()
    if (!value) return `${label} is required`
    if (value.length < 6) return `${label} must be at least 6 characters`
    if (value.length > 20) return `${label} cannot exceed 20 characters`
    if (!/^[A-Z0-9/-]+$/.test(value)) {
      return `${label} can only contain uppercase letters, numbers, and hyphens`
    }
    if (/(.)\1{4,}/.test(value)) {
      return `${label} contains invalid repetitive characters`
    }
    return undefined
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

/** Banner text when "Continue" is pressed on an incomplete step */
export const GST_STEP_ERROR = 'Please fill in all required fields.'

/** Keeps only the fields that have an error message */
export const collectGstErrors = (checks: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(Object.entries(checks).filter(([, message]) => Boolean(message))) as Record<string, string>

/** Field kinds recognised from a label/placeholder */
export type GstFieldKind =
  | 'gstin' | 'pan' | 'ifsc' | 'email' | 'mobile' | 'pinCode' | 'accountNumber'
  | 'branch' | 'bankName' | 'city' | 'district' | 'designation'
  | 'personName' | 'businessName' | 'address' | 'noticeNumber' | 'arn' | 'reference' | 'text'

const KIND_MATCHERS: [GstFieldKind, RegExp][] = [
  ['noticeNumber', /notice\s*(no|number)?/i],
  ['arn', /\barn\b/i],
  ['gstin', /\bgstin\b/i],
  ['ifsc', /\bifsc\b/i],
  ['email', /e-?mail/i],
  ['mobile', /mobile|phone/i],
  ['pinCode', /\bpin\s*code\b|\bpincode\b/i],
  ['accountNumber', /account\s*(no|number)/i],
  ['branch', /\bbranch(\s*name)?\b/i],
  ['bankName', /\bbank(\s*name)?\b/i],
  ['city', /\bcity\b/i],
  ['district', /\bdistrict\b/i],
  ['designation', /\bdesignation\b/i],
  ['businessName', /business name|trade name|legal name/i],
  ['personName', /signatory name|full name|holder name/i],
  ['address', /address/i],
  ['reference', /reference/i],
  ['pan', /^\s*(new\s+)?pan\b|pan number/i],
]

const kindsIn = (text: string): GstFieldKind[] => KIND_MATCHERS.filter(([, re]) => re.test(text)).map(([kind]) => kind)

const isCombined = (text: string): boolean => /,| and /i.test(text)

/** Detects the field kind from its label first, then its placeholder */
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
    branch: (v) => gstFieldRules.branch(v),
    bankName: (v) => gstFieldRules.bankName(v),
    city: gstFieldRules.city(name),
    district: gstFieldRules.district(name),
    designation: gstFieldRules.designation,
    personName: gstFieldRules.personName(name),
    businessName: gstFieldRules.businessName(name),
    address: gstFieldRules.address(name),
    noticeNumber: gstFieldRules.noticeNumber,
    arn: gstFieldRules.arn(name),
    reference: gstFieldRules.reference(name),
    text: gstFieldRules.text(name, 2, 500),
  }
  return byKind[detectGstFieldKind(label, placeholder)]
}
