
/** Result shape returned by every loan step validator */
export interface LoanStepValidationResult {
  isValid: boolean
  errors: Record<string, string>
  /** Message shown in the step error banner */
  error?: string
}

export type LoanStepValidator<T> = (data: T) => LoanStepValidationResult

/** Builds a step result from collected field errors; the banner shows `message` or the first field error */
export const toStepResult = (errors: Record<string, string>, message?: string): LoanStepValidationResult => {
  const isValid = Object.keys(errors).length === 0
  return { isValid, errors, error: isValid ? undefined : message || Object.values(errors)[0] }
}

export const commonLoanValidation = {
  isValidAmount: (val: number, min = 100000, max = 500000000): boolean => {
    return !isNaN(val) && val >= min && val <= max
  },

  isValidIfsc: (ifsc: string): boolean => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())
  },

  isValidAccountNumber: (acc: string): boolean => {
    return /^\d{9,18}$/.test(acc.trim())
  },

  isValidPan: (pan: string): boolean => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())
  },

  isValidAadhaar: (aadhaar: string): boolean => {
    const cleaned = aadhaar.replace(/\s+/g, '')
    return /^\d{12}$/.test(cleaned)
  },

  isValidGst: (gst: string): boolean => {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim().toUpperCase())
  },

  validatePhone: (phone: string): { isValid: boolean; message?: string } => {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned) return { isValid: false, message: 'Mobile number is required' }
    if (cleaned.length !== 10) return { isValid: false, message: 'Mobile number must be 10 digits' }
    return { isValid: true }
  },

  validatePan: (pan: string): { isValid: boolean; message?: string } => {
    const trimmed = pan.trim().toUpperCase()
    if (!trimmed) return { isValid: false, message: 'PAN number is required' }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmed)) {
      return { isValid: false, message: 'Enter a valid 10-character PAN' }
    }
    return { isValid: true }
  },

  validateAccountNumber: (acc: string): { isValid: boolean; message?: string } => {
    const cleaned = acc.replace(/\D/g, '')
    if (!cleaned) return { isValid: false, message: 'Account number is required' }
    if (cleaned.length < 9 || cleaned.length > 18) {
      return { isValid: false, message: 'Account number must be between 9 and 18 digits' }
    }
    return { isValid: true }
  },

  validateIfsc: (ifsc: string): { isValid: boolean; message?: string } => {
    const trimmed = ifsc.trim().toUpperCase()
    if (!trimmed) return { isValid: false, message: 'IFSC code is required' }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmed)) {
      return { isValid: false, message: 'Enter a valid 11-digit IFSC code' }
    }
    return { isValid: true }
  },
}

/**
 * Shared field rules for all loan flows. Each check returns an error message,
 * or undefined when the value is valid.
 */
export const LOAN_PATTERNS = {
  PERSON_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  BANK_NAME: /^[A-Za-z][A-Za-z .&'()-]*$/,
  PLACE_NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  MOBILE: /^[6-9]\d{9}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  UDYAM: /^UDYAM-[A-Z]{2}-(\d{2}-\d{7}|\d{6,8})$/,
  PINCODE: /^[1-9]\d{5}$/,
  ITR_ACK: /^\d{15}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  CIN: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
  LLPIN: /^[A-Z]{3}-[0-9]{4}$/,
  DOB: /^(\d{2})\/(\d{2})\/(\d{4})$/,
} as const

export const toAmount = (val: unknown): number => Number(String(val ?? '').replace(/[^\d]/g, '')) || 0

const parseDate = (val: string): Date | null => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val)
  const dmy = LOAN_PATTERNS.DOB.exec(val)
  const [y, m, d] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : dmy
      ? [Number(dmy[3]), Number(dmy[2]), Number(dmy[1])]
      : [0, 0, 0]
  const date = new Date(y, m - 1, d)
  return y && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null
}

const startOfToday = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export const loanFieldRules = {
  personName: (val: string | undefined, label: string): string | undefined => {
    const v = (val || '').trim()
    if (!v) return `${label} is required`
    if (!LOAN_PATTERNS.PERSON_NAME.test(v)) return `${label} must contain only letters and spaces`
    if (v.length < 3) return `${label} must be at least 3 characters`
    if (v.length > 100) return `${label} cannot exceed 100 characters`
    return undefined
  },

  bankName: (val: string | undefined): string | undefined => {
    const v = (val || '').trim()
    if (!v) return 'Bank name is required'
    if (!LOAN_PATTERNS.BANK_NAME.test(v)) return 'Bank name must contain only letters'
    if (v.length < 3) return 'Please enter the full bank name'
    if (v.length > 100) return 'Bank name cannot exceed 100 characters'
    return undefined
  },

  placeName: (val: string | undefined, label: string): string | undefined => {
    const v = (val || '').trim()
    if (!v) return `${label} is required`
    if (!LOAN_PATTERNS.PLACE_NAME.test(v)) return `${label} must contain only letters`
    if (v.length < 2) return `Please enter a valid ${label.toLowerCase()}`
    return undefined
  },

  text: (val: string | undefined, label: string, min = 3, max = 250): string | undefined => {
    const v = (val || '').trim()
    if (!v) return `${label} is required`
    if (v.length < min) return `${label} must be at least ${min} characters`
    if (v.length > max) return `${label} cannot exceed ${max} characters`
    return undefined
  },

  mobile: (val: string | undefined, label = 'Mobile number'): string | undefined => {
    const v = (val || '').replace(/\D/g, '')
    if (!v) return `${label} is required`
    if (v.length !== 10) return `${label} must be exactly 10 digits`
    if (!LOAN_PATTERNS.MOBILE.test(v)) return `${label} must start with 6, 7, 8 or 9`
    return undefined
  },

  pan: (val: string | undefined, label = 'PAN'): string | undefined => {
    const v = (val || '').trim().toUpperCase()
    if (!v) return `${label} is required`
    if (!LOAN_PATTERNS.PAN.test(v)) return `Enter a valid 10-character ${label}`
    return undefined
  },

  pincode: (val: string | undefined): string | undefined => {
    const v = (val || '').trim()
    if (!v) return 'PIN code is required'
    if (!LOAN_PATTERNS.PINCODE.test(v)) return 'Enter a valid 6-digit PIN code (cannot start with 0)'
    return undefined
  },

  /** Optional Udyam number: only checked when filled in */
  optionalUdyam: (val: string | undefined): string | undefined => {
    const v = (val || '').trim().toUpperCase()
    return v && !LOAN_PATTERNS.UDYAM.test(v) ? 'Enter a valid Udyam number' : undefined
  },

  /** Optional GSTIN: only checked when filled in */
  optionalGstin: (val: string | undefined): string | undefined => {
    const v = (val || '').trim().toUpperCase()
    return v && !LOAN_PATTERNS.GSTIN.test(v) ? 'Enter a valid 15-character GSTIN' : undefined
  },

  /** Optional ITR acknowledgement number: only checked when filled in */
  optionalItrAck: (val: string | undefined): string | undefined => {
    const v = (val || '').trim()
    return v && !LOAN_PATTERNS.ITR_ACK.test(v) ? 'ITR acknowledgement number must be exactly 15 digits' : undefined
  },

  /** Date of birth in DD/MM/YYYY (or YYYY-MM-DD) with an age range check */
  dob: (val: string | undefined, minAge = 21, maxAge = 65): string | undefined => {
    const v = (val || '').trim()
    if (!v) return 'Date of birth is required'
    const date = parseDate(v)
    if (!date) return 'Enter a valid date of birth (DD/MM/YYYY)'
    const today = startOfToday()
    if (date > today) return 'Date of birth cannot be in the future'
    const hadBirthday =
      today.getMonth() > date.getMonth() ||
      (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate())
    const age = today.getFullYear() - date.getFullYear() - (hadBirthday ? 0 : 1)
    if (age < minAge || age > maxAge) return `Applicant age must be between ${minAge} and ${maxAge} years`
    return undefined
  },

  /** Date that must not be after today (e.g. incorporation date) */
  pastDate: (val: string | undefined, label: string): string | undefined => {
    const v = (val || '').trim()
    if (!v) return `${label} is required`
    const date = parseDate(v)
    if (!date) return `Enter a valid ${label.toLowerCase()}`
    if (date > startOfToday()) return `${label} cannot be in the future`
    return undefined
  },

  /** Returns an error when `later` falls before `earlier` (both optional; skipped if either is missing/invalid) */
  dateOrder: (earlier: string | undefined, later: string | undefined, message: string): string | undefined => {
    const a = parseDate((earlier || '').trim())
    const b = parseDate((later || '').trim())
    return a && b && b < a ? message : undefined
  },

  /** Required amount with min/max bounds */
  amount: (val: unknown, label: string, min: number, max: number): string | undefined => {
    const n = toAmount(val)
    const fmt = (x: number) => `₹${x.toLocaleString('en-IN')}`
    if (!n) return `${label} is required`
    if (n < min) return `Minimum ${label.toLowerCase()} is ${fmt(min)}`
    if (n > max) return `Maximum ${label.toLowerCase()} is ${fmt(max)}`
    return undefined
  },
}
