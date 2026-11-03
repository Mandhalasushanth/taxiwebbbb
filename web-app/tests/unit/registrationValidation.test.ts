import { describe, it, expect } from 'vitest'
import {
  validateField,
  checkIsFormValid,
  INITIAL_REGISTRATION_VALUES,
  type RegistrationFormState,
} from '../../src/modules/authentication/validation/registrationValidation'

describe('registrationValidation', () => {
  const sampleValidForm: RegistrationFormState = {
    ...INITIAL_REGISTRATION_VALUES,
    fullName: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    gender: 'Male',
    dob: '15-08-1995',
    pan: 'ABCPE1234F',
    aadhaar: '234567890124',
    mobile: '9823145672',
    addressLine1: 'Flat 402, Sunshine Heights',
    addressLine2: 'Near City Mall',
    areaLocality: 'Shivajinagar',
    city: 'Pune',
    district: 'Pune',
    pincode: '411001',
    state: 'Maharashtra',
    password: '581940',
    confirmPassword: '581940',
    agreeTerms: true,
  }

  describe('Full Name and Name Field Validations', () => {
    it('accepts valid full names while typing and with intermediate spaces', () => {
      // User typing "gefehfd " with a space to type next word
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'gefehfd ' }, { isLive: true })).toBeUndefined()
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'Rahul Kumar' })).toBeUndefined()
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'P. Kumar' })).toBeUndefined()
    })

    it('rejects numbers and unsupported characters immediately during live typing', () => {
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'Rahul123' }, { isLive: true })).toBe(
        'Full Name should only contain letters'
      )
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'Rahul@Kumar' }, { isLive: true })).toBe(
        'Full Name should only contain letters'
      )
    })

    it('rejects consecutive spaces and leading spaces immediately', () => {
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'Rahul  Kumar' }, { isLive: true })).toBe(
        'Full Name should not contain consecutive spaces'
      )
      expect(validateField('fullName', { ...sampleValidForm, fullName: ' Rahul' }, { isLive: true })).toBe(
        'Full Name cannot start with a space or dot'
      )
    })

    it('requires Full Name on blur/submit and enforces min length', () => {
      expect(validateField('fullName', { ...sampleValidForm, fullName: '' }, { isLive: false })).toBe(
        'Full Name is required'
      )
      expect(validateField('fullName', { ...sampleValidForm, fullName: 'A' }, { isLive: false })).toBe(
        'Full Name must be at least 2 characters'
      )
    })
  })

  describe('Address field validations', () => {
    it('validates areaLocality requirement', () => {
      expect(validateField('areaLocality', { ...sampleValidForm, areaLocality: 'a' })).toBe(
        'Please enter a valid area / locality'
      )
      expect(validateField('areaLocality', sampleValidForm)).toBeUndefined()
    })

    it('validates pincode 6-digit numeric rule', () => {
      expect(validateField('pincode', { ...sampleValidForm, pincode: '' })).toBe(
        'PIN Code is required'
      )
      expect(validateField('pincode', { ...sampleValidForm, pincode: '4110' })).toBe(
        'PIN Code must be exactly 6 digits'
      )
      expect(validateField('pincode', { ...sampleValidForm, pincode: '011001' })).toBe(
        'Enter a valid 6-digit Indian PIN code'
      )
      expect(validateField('pincode', sampleValidForm)).toBeUndefined()
    })

    it('validates city and district formats', () => {
      expect(validateField('city', { ...sampleValidForm, city: '' })).toBe('City is required')
      expect(validateField('district', { ...sampleValidForm, district: '' })).toBe(
        'District is required'
      )
      expect(validateField('city', sampleValidForm)).toBeUndefined()
      expect(validateField('district', sampleValidForm)).toBeUndefined()
    })

    it('validates state selection', () => {
      expect(validateField('state', { ...sampleValidForm, state: '' })).toBe(
        'Please select your State / UT'
      )
      expect(validateField('state', sampleValidForm)).toBeUndefined()
    })
  })

  describe('Passcode validations', () => {
    it('requires exactly 6 digits', () => {
      const shortForm = { ...sampleValidForm, password: '5819', confirmPassword: '5819' }
      expect(validateField('password', shortForm)).toBe('Passcode must be exactly 6 digits')
      expect(checkIsFormValid(shortForm)).toBe(false)
      expect(validateField('password', sampleValidForm)).toBeUndefined()
    })
  })

  describe('checkIsFormValid', () => {
    it('evaluates valid form accurately', () => {
      expect(checkIsFormValid(sampleValidForm)).toBe(true)
    })

    it('flags form invalid if district or pincode is missing', () => {
      expect(checkIsFormValid({ ...sampleValidForm, district: '' })).toBe(false)
      expect(checkIsFormValid({ ...sampleValidForm, pincode: '' })).toBe(false)
    })
  })
})
