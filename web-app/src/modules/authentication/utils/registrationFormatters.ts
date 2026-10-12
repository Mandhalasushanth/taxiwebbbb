import type { AuthUser } from '@core/auth'

import { formatDOB, type RegistrationFormState } from '../validation/registrationValidation'

type FieldFormatter = (value: string, previous: string, values: RegistrationFormState) => string

const lettersOnly = (value: string) => value.replace(/[^a-zA-Z\s.'-]/g, '')
const digitsOnly = (max: number) => (value: string) => value.replace(/\D/g, '').slice(0, max)
/** Auto-inserts dashes only while typing forward so deleting a dash still works */
const datePart: FieldFormatter = (value, previous) => (value.length > previous.length ? formatDOB(value) : value)

const FIELD_FORMATTERS: Partial<Record<keyof RegistrationFormState, FieldFormatter>> = {
  fullName: lettersOnly,
  fatherSpouseName: lettersOnly,
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
  addressLine2: '',
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
