// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import { describe, it, expect, beforeEach } from 'vitest'
import { isValidEmail } from '../../src/shared/utils'
import { authStorage } from '../../src/core/auth'
import { isProfileFreePath } from '../../src/app/router/profileGate'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import { registrationDraftStore } from '../../src/modules/authentication/services/registrationDraftStore'
import {
  INITIAL_REGISTRATION_VALUES,
  checkIsFormValid,
  validateField,
  type RegistrationFormState,
} from '../../src/modules/authentication/validation/registrationValidation'

const VERIFIED_MOBILE = '9823145672'

const baseForm: RegistrationFormState = {
  ...INITIAL_REGISTRATION_VALUES,
  fullName: 'Rohan Sharma',
  email: 'rohan.sharma@example.com',
  mobile: VERIFIED_MOBILE,
  addressLine1: 'Flat 402, Sunshine Heights',
  city: 'Pune',
  district: 'Pune',
  pincode: '411001',
  state: 'Maharashtra',
  password: '581940',
  confirmPassword: '581940',
  agreeTerms: true,
}

describe('BUG-CP-001: profile gate on direct URLs', () => {
  it('blocks service pages for incomplete profiles', () => {
    expect(isProfileFreePath('/gst/registration')).toBe(false)
    expect(isProfileFreePath('/loans/home-loan')).toBe(false)
    expect(isProfileFreePath('/itr/file-itr')).toBe(false)
  })

  it('allows dashboard, service landing pages and account pages', () => {
    expect(isProfileFreePath('/dashboard')).toBe(true)
    expect(isProfileFreePath('/gst')).toBe(true)
    expect(isProfileFreePath('/gst/')).toBe(true)
    expect(isProfileFreePath('/profile/kyc')).toBe(true)
  })
})

describe('BUG-CP-002: entity-specific profile form', () => {
  const companyForm: RegistrationFormState = {
    ...baseForm,
    customerType: 'private_limited',
    entityName: 'Tanvox Technologies Pvt Ltd',
    registrationNumber: 'U72900TG2021PTC123456',
    incorporationDate: '12-04-2021',
    pan: 'AAACT1234A',
  }

  it('accepts a company profile without gender, DOB, father name or Aadhaar', () => {
    expect(checkIsFormValid(companyForm)).toBe(true)
    expect(validateField('gender', companyForm)).toBeUndefined()
    expect(validateField('aadhaar', companyForm)).toBeUndefined()
  })

  it('requires company fields and validates CIN / company PAN', () => {
    expect(validateField('entityName', { ...companyForm, entityName: '' })).toBe('Company Name is required')
    expect(validateField('registrationNumber', { ...companyForm, registrationNumber: 'U123' })).toBeTruthy()
    expect(validateField('pan', { ...companyForm, pan: 'ABCPE1234F' })).toContain('4th character')
    expect(validateField('incorporationDate', { ...companyForm, incorporationDate: '' })).toBeTruthy()
  })

  it('still requires personal fields for individuals', () => {
    expect(validateField('gender', baseForm)).toBe('Please select your gender')
    expect(validateField('entityName', baseForm)).toBeUndefined()
  })
})

describe('BUG-CP-003: registration draft persists across steps', () => {
  it('restores entered data but never stores passcodes', () => {
    registrationDraftStore.save(VERIFIED_MOBILE, { ...baseForm, customerType: 'llp', entityName: 'Acme LLP' })
    const draft = registrationDraftStore.load(VERIFIED_MOBILE)
    expect(draft?.entityName).toBe('Acme LLP')
    expect(draft?.customerType).toBe('llp')
    expect(draft).not.toHaveProperty('password')
    expect(draft).not.toHaveProperty('confirmPassword')
    registrationDraftStore.clear(VERIFIED_MOBILE)
    expect(registrationDraftStore.load(VERIFIED_MOBILE)).toBeNull()
  })
})

describe('BUG-CP-004: verified mobile cannot be changed', () => {
  beforeEach(() => {
    authStorage.setUser({ id: 'usr_1', fullName: '', email: '', mobile: VERIFIED_MOBILE, role: 'CUSTOMER', isProfileComplete: false })
  })

  const payloadFor = (mobile: string) => ({
    mobile,
    passcode: '581940',
    user: { id: 'usr_1', fullName: 'Rohan', email: 'rohan@example.com', mobile, role: 'CUSTOMER' as const, isProfileComplete: true },
  })

  it('rejects a profile saved for a different mobile number', async () => {
    await expect(authFlowService.saveRegistrationStep1(payloadFor('9123498765'))).rejects.toThrow(/verified by OTP/)
    expect(authStorage.getRegisteredUser('9123498765')).toBeNull()
  })

  it('accepts the verified mobile number', async () => {
    await expect(authFlowService.saveRegistrationStep1(payloadFor(VERIFIED_MOBILE))).resolves.toBeUndefined()
  })
})

describe('BUG-CP-005: strict email validation', () => {
  it.each(['a..b@example.com', '.ravi@example.com', 'ravi.@example.com', 'ravi@.example.com', 'ravi@example..com', 'ravi@-example.com', 'ravi@example'])(
    'rejects %s',
    (email) => {
      expect(isValidEmail(email)).toBe(false)
      expect(validateField('email', { ...baseForm, email })).toBeTruthy()
    },
  )

  it.each(['ravi@example.com', 'ravi.kumar+tax@mail.example.co.in', 'r_k-1@sub-domain.in'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true)
  })
})
