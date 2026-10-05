import {
  getAgeRangeError,
  isValidEmail,
  validateAadhaar,
  validateIndividualPan,
  validateMobileNumber,
} from '@shared/utils'

import { getProfileKind } from '../constants/profileFormConfig'
import {
  validateEntityName,
  validateEntityPan,
  validateRegistrationNumber,
} from './entityProfileValidation'

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

/** Fields that only exist on one of the two profile forms */
const INDIVIDUAL_ONLY_FIELDS: Array<keyof RegistrationFormState> = ['gender', 'dob', 'fatherSpouseName', 'aadhaar']
const ENTITY_ONLY_FIELDS: Array<keyof RegistrationFormState> = ['entityName', 'registrationNumber', 'incorporationDate']

const isFieldHidden = (name: keyof RegistrationFormState, values: RegistrationFormState): boolean =>
  getProfileKind(values.customerType) === 'entity'
    ? INDIVIDUAL_ONLY_FIELDS.includes(name)
    : ENTITY_ONLY_FIELDS.includes(name)

export const validateField = (
  name: keyof RegistrationFormState,
  values: RegistrationFormState
): string | undefined => {
  if (isFieldHidden(name, values)) return undefined
  const val = values[name]

  switch (name) {
    case 'fullName': {
      const rawVal = String(val ?? '')
      const trimmed = rawVal.trim().replace(/\s+/g, ' ')
      
      if (!trimmed) return 'Full Name is required'
      if (rawVal !== trimmed) return 'Full Name should not contain unnecessary spaces'
      
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
        return 'Full Name should only contain letters'
      }
      if (trimmed.length < 2) return 'Full Name must be at least 2 characters'
      return undefined
    }

    case 'email': {
      const trimmed = String(val ?? '').trim()
      if (!trimmed) return 'Email is required'
      if (!isValidEmail(trimmed)) {
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
      const trimmed = String(val ?? '').trim()
      if (trimmed) {
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
          return 'Name should only contain letters'
        }
        if (trimmed.length < 2) {
          return 'Please enter a valid name'
        }
      }
      return undefined
    }

    case 'pan': {
      if (getProfileKind(values.customerType) === 'entity') {
        return validateEntityPan(String(val ?? ''), values.customerType)
      }
      return validateIndividualPan(String(val ?? '')) || undefined
    }

    case 'entityName':
      return validateEntityName(String(val ?? ''), values.customerType)

    case 'registrationNumber':
      return validateRegistrationNumber(String(val ?? ''), values.customerType)

    case 'incorporationDate': {
      const str = String(val ?? '').trim()
      if (!str) return 'Incorporation Date is required'
      if (!isValidDateString(str)) return 'Enter a valid past date in DD-MM-YYYY format'
      return undefined
    }

    case 'aadhaar': {
      return validateAadhaar(String(val ?? '')) || undefined
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
      const trimmed = String(val ?? '').trim()
      if (!trimmed) return 'Address Line 1 is required'
      if (trimmed.length < 3) return 'Please enter a valid address'
      return undefined
    }

    case 'areaLocality': {
      const trimmed = String(val ?? '').trim()
      if (trimmed && trimmed.length < 2) {
        return 'Please enter a valid area / locality'
      }
      return undefined
    }

    case 'city': {
      const trimmed = String(val ?? '').trim()
      if (!trimmed) return 'City is required'
      if (!/^[a-zA-Z\s.'-]{2,}$/.test(trimmed)) {
        return 'Please enter a valid city'
      }
      return undefined
    }

    case 'district': {
      const trimmed = String(val ?? '').trim()
      if (!trimmed) return 'District is required'
      if (!/^[a-zA-Z\s.'-]{2,}$/.test(trimmed)) {
        return 'Please enter a valid district'
      }
      return undefined
    }

    case 'state': {
      const str = String(val ?? '').trim()
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
  'entityName',
  'registrationNumber',
  'incorporationDate',
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
    (field) => validateField(field, values) === undefined
  )

  const optionalValid =
    (!values.fatherSpouseName || validateField('fatherSpouseName', values) === undefined) &&
    (!values.areaLocality || validateField('areaLocality', values) === undefined)

  return mandatoryValid && optionalValid
}
