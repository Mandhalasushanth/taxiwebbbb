import type { AuthUser } from '@core/auth'

import { formatDOB, type RegistrationFormState } from '../validation/registrationValidation'

type FieldFormatter = (value: string, previous: string, values: RegistrationFormState) => string

const digitsOnly = (max: number) => (value: string) => value.replace(/\D/g, '').slice(0, max)
/** Auto-inserts dashes only while typing forward so deleting a dash still works */
const datePart: FieldFormatter = (value, previous) => (value.length > previous.length ? formatDOB(value) : value)

/**
 * Name input filter: only accepts Unicode letters, single spaces, and single dots.
 * Prevents invalid characters (hyphens, numbers, symbols, emojis, consecutive dots/spaces, leading spaces/dots)
 * from ever being taken by the field.
 */
export const formatNameInput: FieldFormatter = (value: string) => {
  return value
    .replace(/[^\p{L}\s.]/gu, '')
    .replace(/^[ .]+/u, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100)
}

/**
 * Universal text formatter for address and general text fields:
 * - Prevents leading spaces
 * - Collapses consecutive spaces to a single space
 */
export const formatSingleSpaceText = (value: string, max = 150): string => {
  return value
    .replace(/^\s+/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, max)
}

export const formatCityInput: FieldFormatter = (value: string) => {
  return value
    .replace(/[^a-zA-Z\s.'-]/g, '')
    .replace(/^[ \-.'\s]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/([\-.'\s])\1+/g, '$1')
    .replace(/[\-.']\s*[\-.']+/g, (m) => m[0])
    .slice(0, 50)
}

export const formatAddressInput: FieldFormatter = (value: string) => {
  return value
    .replace(/[^\p{L}0-9\s#,\-/.']/gu, '')
    .replace(/^[ ,\-/.']+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/([#,\-/.'])\1+/g, '$1')
    .replace(/[#,\-/.']\s*[#,\-/.']+/g, (m) => m[0])
    .slice(0, 150)
}

export const formatEmailInput: FieldFormatter = (value: string) => {
  return value.replace(/\s/g, '').slice(0, 100)
}

const FIELD_FORMATTERS: Partial<Record<keyof RegistrationFormState, FieldFormatter>> = {
  fullName: formatNameInput,
  fatherSpouseName: formatNameInput,
  email: formatEmailInput,
  addressLine1: formatAddressInput,
  areaLocality: formatAddressInput,
  city: formatCityInput,
  district: formatCityInput,
  state: formatCityInput,
  entityName: formatAddressInput,
  registrationNumber: (value) => formatSingleSpaceText(value, 50),
  pan: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
  aadhaar: digitsOnly(12),
  pincode: digitsOnly(6),
  password: digitsOnly(6),
  confirmPassword: digitsOnly(6),
  dob: datePart,
}

/** Input filter applied as the user types, so each field only accepts what its placeholder asks for. */
export const formatRegistrationField = (
  key: keyof RegistrationFormState,
  value: string,
  values: RegistrationFormState,
): string => {
  const formatter = FIELD_FORMATTERS[key]
  return formatter ? formatter(value, String(values[key] ?? ''), values) : value
}

const buildAddress = (values: RegistrationFormState): string =>
  [
    values.addressLine1.trim(),
    values.areaLocality.trim(),
    values.city.trim(),
    values.district.trim(),
    values.state.trim() + (values.pincode ? ` - ${values.pincode.trim()}` : ''),
  ]
    .filter(Boolean)
    .join(', ')

/** Maps the submitted form to the stored user, keeping only the fields of the chosen profile type. */
export const buildRegisteredUser = (
  values: RegistrationFormState,
  verifiedMobile: string,
  existingUser: AuthUser | null,
): AuthUser => ({
  id: existingUser?.id || `usr_${verifiedMobile || Date.now().toString(36)}`,
  fullName: values.fullName.trim(),
  email: values.email.trim(),
  mobile: verifiedMobile,
  role: 'CUSTOMER',
  permissions: [],
  isProfileComplete: true,
  customerType: values.customerType,
  pan: values.pan.trim(),
  addressLine1: values.addressLine1.trim(),
  addressLine2: (values.areaLocality || '').trim(),
  areaLocality: values.areaLocality.trim(),
  city: values.city.trim(),
  district: values.district.trim(),
  pincode: values.pincode.trim(),
  state: values.state.trim(),
  address: buildAddress(values),
  gender: values.gender,
  dob: values.dob,
  fatherSpouseName: values.fatherSpouseName.trim(),
  aadhaar: values.aadhaar.trim(),
})
