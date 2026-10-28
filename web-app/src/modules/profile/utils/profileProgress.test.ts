import { describe, it, expect } from 'vitest'
import {
  calculateProfileProgress,
  isFieldValuePresent,
  formatCustomerType,
  formatGender,
  formatFullAddress,
  getCustomerId,
  getCustomerDisplayName,
} from './profileProgress'
import type { AuthUser } from '@core/auth'

describe('profileProgress utilities', () => {
  it('isFieldValuePresent correctly identifies valid vs invalid values', () => {
    expect(isFieldValuePresent(null)).toBe(false)
    expect(isFieldValuePresent(undefined)).toBe(false)
    expect(isFieldValuePresent('')).toBe(false)
    expect(isFieldValuePresent('   ')).toBe(false)

    // Valid values including 0 and false
    expect(isFieldValuePresent(0)).toBe(true)
    expect(isFieldValuePresent(false)).toBe(true)
    expect(isFieldValuePresent('Hello')).toBe(true)
  })

  it('calculates 50% initial progress for newly registered user with verified mobile', () => {
    const newUser: AuthUser = {
      id: 'usr_new',
      fullName: '',
      email: '',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }

    const progress = calculateProfileProgress(newUser)
    expect(progress.percentage).toBe(50)
    expect(progress.isFullyComplete).toBe(false)
    expect(progress.missingFields).toContain('personal')
    expect(progress.missingFields).toContain('kyc')
    expect(progress.missingFields).toContain('address')
  })

  it('calculates 100% progress when all requirements are satisfied and isProfileComplete is true', () => {
    const completeUser: AuthUser = {
      id: 'usr_comp',
      fullName: 'John Doe',
      email: 'john@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      gender: 'male',
      dob: '1990-01-01',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      addressLine1: 'Flat 101, Highrise Apt',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      isProfileComplete: true,
    }

    const progress = calculateProfileProgress(completeUser)
    expect(progress.percentage).toBe(100)
    expect(progress.isFullyComplete).toBe(true)
    expect(progress.missingFields.length).toBe(0)
  })

  it('never shows 100% if mandatory fields remain incomplete', () => {
    const incompleteUser: AuthUser = {
      id: 'usr_partial',
      fullName: 'John Doe',
      email: 'john@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }

    const progress = calculateProfileProgress(incompleteUser)
    expect(progress.percentage).toBeLessThan(100)
    expect(progress.isFullyComplete).toBe(false)
  })

  it('formats customer type properly', () => {
    expect(formatCustomerType('individual')).toBe('Individual')
    expect(formatCustomerType('business')).toBe('Business')
    expect(formatCustomerType('pvtltd')).toBe('Private Limited')
    expect(formatCustomerType('public_limited')).toBe('Public Limited')
    expect(formatCustomerType('huf')).toBe('HUF')
    expect(formatCustomerType('aop_boi')).toBe('AOP / BOI')
    expect(formatCustomerType('ngo_trust')).toBe('NGO / Trust')
    expect(formatCustomerType(null)).toBe(null)
    expect(formatCustomerType('')).toBe(null)
  })

  it('formats gender properly', () => {
    expect(formatGender('male')).toBe('Male')
    expect(formatGender('female')).toBe('Female')
    expect(formatGender(null)).toBe(null)
    expect(formatGender('   ')).toBe(null)
  })

  it('formats full address properly', () => {
    const userWithAddress: AuthUser = {
      id: 'usr_1',
      fullName: '',
      email: '',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
      addressLine1: 'Road No 12',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    }
    expect(formatFullAddress(userWithAddress)).toBe('Road No 12, Hyderabad, Telangana, 500034')
    expect(formatFullAddress(null)).toBe(null)
  })

  it('getCustomerId resolves temporary TX-<last6> for incomplete profile and permanent ID for complete profile', () => {
    const incompleteUser: AuthUser = {
      id: 'usr_81234',
      fullName: '',
      email: '',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }
    // For mobile '9121781234', last 6 digits are '781234'
    expect(getCustomerId(incompleteUser)).toBe('TX-781234')

    const completeUser: AuthUser = {
      id: 'usr_650681',
      fullName: 'John Doe',
      email: 'john@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: true,
    }
    expect(getCustomerId(completeUser)).toBe('TX-650681')
  })

  it('getCustomerDisplayName shows Guest User before completion and full name after completion', () => {
    const incompleteUser: AuthUser = {
      id: 'usr_81234',
      fullName: 'Valued Client',
      email: '9121781234@taxedge.in',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }
    expect(getCustomerDisplayName(incompleteUser)).toBe('Guest User')

    const completeUser: AuthUser = {
      id: 'usr_81234',
      fullName: 'Ravi Kumar',
      email: 'ravi@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: true,
    }
    expect(getCustomerDisplayName(completeUser)).toBe('Ravi Kumar')
  })
})
