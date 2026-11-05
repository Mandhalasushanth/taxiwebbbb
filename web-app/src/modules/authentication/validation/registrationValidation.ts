import {
  getAgeRangeError,
  isValidEmail,
  validateIndividualPan,
  validateMobileNumber,
  validateName,
  validatePan,
} from '@shared/utils'

export interface RegistrationFormState {
  /** Selected customer type; decides individual vs business-entity fields */
  customerType: string
  fullName: string
  email: string
  gender: string
  dob: string
  fatherSpouseName: string
  pan: string
  aadhaar: string
  isAadhaarVerified?: boolean
  mobile: string
  addressLine1: string
  areaLocality: string
  city: string
  district: string
  pincode: string
  state: string
  password: string
  confirmPassword: string
  // Business-entity profile (Private Limited, LLP, Partnership…)
  entityName: string
  registrationNumber: string
  incorporationDate: string
  agreeTerms: boolean
}

export type RegistrationFormErrors = Partial<
  Record<keyof RegistrationFormState | 'form', string>
>

export const INITIAL_REGISTRATION_VALUES: RegistrationFormState = {
  customerType: 'individual',
  fullName: '',
  email: '',
  gender: '',
  dob: '',
  fatherSpouseName: '',
  pan: '',
  aadhaar: '',
  isAadhaarVerified: false,
  mobile: '',
  addressLine1: '',
  areaLocality: '',
  city: '',
  district: '',
  pincode: '',
  state: '',
  password: '',
  confirmPassword: '',
  entityName: '',
  registrationNumber: '',
  incorporationDate: '',
  agreeTerms: false,
}

export const formatDOB = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

export const isValidDateString = (dob: string): boolean => {
  const match = dob.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return false

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)

  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  if (year < 1900 || year > new Date().getFullYear()) return false

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false
  }

  // Not in the future
  return date.getTime() <= Date.now()
}

/** Parses a DD-MM-YYYY string that already passed isValidDateString. */
export const parseDateString = (value: string): Date => {
  const [day, month, year] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const PASSCODE_LENGTH = 6

export const isSequentialPasscode =(str: string): boolean => {
  if (str.length < 3) return false
  const chars = str.split('')
  const isFullAsc = chars.every((ch, i) => i === 0 || Number(ch) - Number(chars[i - 1]) === 1)
  const isFullDesc = chars.every((ch, i) => i === 0 || Number(ch) - Number(chars[i - 1]) === -1)
  if (isFullAsc || isFullDesc) return true

  if (str.length >= 4) {
    const indices = Array.from({ length: str.length - 3 }, (_, idx) => idx)
    return indices.some((start) => {
      const sub = str.slice(start, start + 4).split('')
      const subAsc = sub.every((c, j) => j === 0 || Number(c) - Number(sub[j - 1]) === 1)
      const subDesc = sub.every((c, j) => j === 0 || Number(c) - Number(sub[j - 1]) === -1)
      return subAsc || subDesc
    })
  }
  return false
}

export const isRepeatingPatternPasscode = (str: string): boolean => {
  if (/^(\d{2,3})\1+$/.test(str)) return true
  if (/^(\d)\1(\d)\2(\d)\3$/.test(str) || /^(\d)\1(\d)\2$/.test(str)) return true
  return false
}

/** Legacy entity fields that are no longer part of the unified individual registration form */
const UNUSED_ENTITY_FIELDS: Array<keyof RegistrationFormState> = ['entityName', 'registrationNumber', 'incorporationDate']

const isFieldHidden = (name: keyof RegistrationFormState): boolean =>
  UNUSED_ENTITY_FIELDS.includes(name)

export const validateField = (
  name: keyof RegistrationFormState,
  values: RegistrationFormState,
  options?: { isLive?: boolean }
): string | undefined => {
  if (isFieldHidden(name)) return undefined
  const val = values[name]

  switch (name) {
    case 'fullName': {
      const err = validateName(String(val ?? ''), {
        label: 'Full Name',
        required: true,
        isLive: options?.isLive,
      })
      return err || undefined
    }

    case 'email': {
      const rawVal = String(val ?? '')
      const trimmed = rawVal.trim()
      if (!trimmed) {
        if (options?.isLive) return undefined
        return 'Email is required'
      }
      if (rawVal !== trimmed || /\s/.test(rawVal)) return 'Email should not contain spaces'
      if (!options?.isLive && !isValidEmail(trimmed)) {
        return 'Please enter a valid email address (no leading, trailing or consecutive dots)'
      }
      return undefined
    }

    case 'gender': {
      const str = String(val ?? '').trim()
      if (!str) return 'Please select your gender'
      return undefined
    }

    case 'dob': {
      const str = String(val ?? '').trim()
      if (!str) return 'Date of Birth is required'
      if (!isValidDateString(str)) {
        return 'Enter a valid date in DD-MM-YYYY format'
      }
      return getAgeRangeError(parseDateString(str)) ?? undefined
    }

    case 'fatherSpouseName': {
      const rawVal = String(val ?? '')
      if (!rawVal.trim()) return undefined
      const err = validateName(rawVal, {
        label: "Father's / Spouse Name",
        required: false,
        isLive: options?.isLive,
      })
      return err || undefined
    }

    case 'pan': {
      const rawVal = String(val ?? '')
      if (/\s/.test(rawVal)) return 'PAN should not contain spaces'
      const panStr = rawVal.trim().toUpperCase()
      if (['partnership', 'llp', 'private_limited', 'company'].includes(values.customerType)) {
        return validatePan(panStr) || undefined
      }
      return validateIndividualPan(panStr) || undefined
    }

    case 'aadhaar': {
      const raw = String(val ?? '')
      const clean = raw.replace(/\D/g, '')
      if (!clean) {
        if (options?.isLive) return undefined
        return 'Aadhaar Number is required'
      }
      if (clean.length < 12) {
        return 'Invalid Aadhaar'
      }
      if (clean.startsWith('0') || clean.startsWith('1')) {
        return 'Aadhaar number cannot start with 0 or 1'
      }
      if (/^(\d)\1{11}$/.test(clean) || new Set(clean.split('')).size < 4) {
        return 'Invalid Aadhaar'
      }
      return undefined
    }

    case 'mobile': {
      const str = String(val ?? '').replace(/\D/g, '')
      return validateMobileNumber(str) || undefined
    }

    case 'pincode': {
      const str = String(val ?? '').replace(/\D/g, '')
      if (!str) return 'PIN Code is required'
      if (str.length !== 6) {
        return 'PIN Code must be exactly 6 digits'
      }
      if (!/^[1-9][0-9]{5}$/.test(str)) {
        return 'Enter a valid 6-digit Indian PIN code'
      }
      return undefined
    }

    case 'addressLine1': {
      const raw = String(val ?? '')
      if (raw.startsWith(' ')) return 'Address Line 1 cannot start with a space'
      if (/\s{2,}/.test(raw)) return 'Only one space is allowed between words'
      if (/^[,\-/.']/.test(raw)) return 'Address Line 1 cannot start with punctuation'
      if (/[^\p{L}0-9\s#,\-/.']/u.test(raw)) {
        return "Address can only contain letters, numbers, spaces, and (# , - / . ')"
      }
      if (/([#,\-/.'])\1+/.test(raw) || /[#,\-/.']\s*[#,\-/.']+/.test(raw)) {
        return 'Address cannot contain consecutive special characters'
      }
      const trimmed = raw.trim()
      if (!trimmed) {
        if (options?.isLive) return undefined
        return 'Address Line 1 is required'
      }
      if (trimmed.length < 3) return 'Please enter a valid address'
      return undefined
    }

    case 'areaLocality': {
      const raw = String(val ?? '')
      if (raw.startsWith(' ')) return 'Address Line 2 cannot start with a space'
      if (/\s{2,}/.test(raw)) return 'Only one space is allowed between words'
      if (/^[,\-/.']/.test(raw)) return 'Address Line 2 cannot start with punctuation'
      if (/[^\p{L}0-9\s#,\-/.']/u.test(raw)) {
        return "Address Line 2 can only contain letters, numbers, spaces, and (# , - / . ')"
      }
      if (/([#,\-/.'])\1+/.test(raw) || /[#,\-/.']\s*[#,\-/.']+/.test(raw)) {
        return 'Address Line 2 cannot contain consecutive special characters'
      }
      const trimmed = raw.trim()
      if (trimmed && trimmed.length < 2) {
        return 'Please enter a valid area / locality'
      }
      return undefined
    }

    case 'city': {
      const raw = String(val ?? '')
      if (raw.startsWith(' ')) return 'City cannot start with a space'
      if (/\s{2,}/.test(raw)) return 'Only one space is allowed between words'
      if (/^[ \-.'\s]+/.test(raw)) return 'City must start with a letter'
      if (/[0-9]/.test(raw)) return 'City should not contain numbers'
      if (/[^a-zA-Z\s.'-]/.test(raw)) return 'City should only contain letters, spaces, hyphens, and dots'
      if (/([\-.'])\1+/.test(raw) || /[\-.']\s*[\-.']+/.test(raw)) {
        return 'City cannot contain consecutive dots or hyphens'
      }
      const trimmed = raw.trim()
      if (!trimmed) {
        if (options?.isLive) return undefined
        return 'City is required'
      }
      if (!/^[a-zA-Z\s.'-]{2,}$/.test(trimmed)) {
        return 'Please enter a valid city'
      }
      return undefined
    }

    case 'district': {
      const raw = String(val ?? '')
      if (raw.startsWith(' ')) return 'District cannot start with a space'
      if (/\s{2,}/.test(raw)) return 'Only one space is allowed between words'
      if (/^[ \-.'\s]+/.test(raw)) return 'District must start with a letter'
      if (/[0-9]/.test(raw)) return 'District should not contain numbers'
      if (/[^a-zA-Z\s.'-]/.test(raw)) return 'District should only contain letters, spaces, hyphens, and dots'
      if (/([\-.'])\1+/.test(raw) || /[\-.']\s*[\-.']+/.test(raw)) {
        return 'District cannot contain consecutive dots or hyphens'
      }
      const trimmed = raw.trim()
      if (!trimmed) {
        if (options?.isLive) return undefined
        return 'District is required'
      }
      if (!/^[a-zA-Z\s.'-]{2,}$/.test(trimmed)) {
        return 'Please enter a valid district'
      }
      return undefined
    }

    case 'state': {
      const raw = String(val ?? '')
      if (raw.startsWith(' ')) return 'State cannot start with a space'
      if (/\s{2,}/.test(raw)) return 'Only one space is allowed between words'
      const str = raw.trim()
      if (!str) return 'Please select your State / UT'
      return undefined
    }

    case 'password': {
      const str = String(val ?? '').replace(/\D/g, '')
      if (!str) return 'Passcode is required'
      if (str.length !== PASSCODE_LENGTH) {
        return `Passcode must be exactly ${PASSCODE_LENGTH} digits`
      }

      // Rule 1: Mobile number consecutive 6-digit match rejection
      const cleanMobile = String(values.mobile ?? '').replace(/\D/g, '')
      const mobile10 = cleanMobile.slice(-10)
      if (cleanMobile.length >= 6 && (cleanMobile.includes(str) || (mobile10.length >= 6 && mobile10.includes(str)))) {
        return 'Passcode cannot be part of your mobile number.'
      }

      // Rule 2: Repeated digits rejection
      if (/^(\d)\1+$/.test(str) || /(\d)\1{2,}/.test(str)) {
        return 'Passcode cannot contain the same digit repeatedly.'
      }

      // Rule 3: Sequential numbers rejection
      if (isSequentialPasscode(str)) {
        return 'Passcode cannot be a sequential number.'
      }

      // Rule 4: Repeating patterns rejection
      if (isRepeatingPatternPasscode(str)) {
        return 'Choose a less predictable passcode.'
      }

      return undefined
    }

    case 'confirmPassword': {
      const str = String(val ?? '').replace(/\D/g, '')
      if (!str) return 'Confirm Passcode is required'
      if (str !== values.password) return 'Passcodes do not match'
      return undefined
    }

    case 'agreeTerms': {
      if (!values.agreeTerms) return 'You must agree to the Terms of Service to continue'
      return undefined
    }

    default:
      return undefined
  }
}

const MANDATORY_FIELDS: Array<keyof RegistrationFormState> = [
  'fullName',
  'email',
  'gender',
  'dob',
  'pan',
  'aadhaar',
  'mobile',
  'addressLine1',
  'city',
  'district',
  'pincode',
  'state',
  'password',
  'confirmPassword',
  'agreeTerms',
]

export const checkIsFormValid = (values: RegistrationFormState): boolean => {
  const mandatoryValid = MANDATORY_FIELDS.every(
    (field) => validateField(field, values, { isLive: false }) === undefined
  )

  const optionalValid =
    (!values.fatherSpouseName || validateField('fatherSpouseName', values, { isLive: false }) === undefined) &&
    (!values.areaLocality || validateField('areaLocality', values, { isLive: false }) === undefined)

  return mandatoryValid && optionalValid
}
