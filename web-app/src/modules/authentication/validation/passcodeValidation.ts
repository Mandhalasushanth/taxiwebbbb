import { INITIAL_REGISTRATION_VALUES, PASSCODE_LENGTH, validateField } from './registrationValidation'

export { PASSCODE_LENGTH }

/**
 * Validates a new passcode with the same strength rules used during registration
 * (no repeated, sequential, patterned digits or parts of the mobile number).
 */
export const validateNewPasscode = (passcode: string, mobile: string): string | undefined => {
  if (passcode.length !== PASSCODE_LENGTH) {
    return `Enter all ${PASSCODE_LENGTH} digits of your new passcode`
  }
  return validateField('password', { ...INITIAL_REGISTRATION_VALUES, mobile, password: passcode })
}

export const validateConfirmPasscode = (passcode: string, confirmPasscode: string): string | undefined =>
  validateField('confirmPassword', {
    ...INITIAL_REGISTRATION_VALUES,
    password: passcode,
    confirmPassword: confirmPasscode,
  })
