import { describe, it, expect } from 'vitest'
import {
  calculateProfileProgress,
  isFieldValuePresent,
  formatCustomerType,
  formatGender,
  formatFullAddress,
  getCustomerId,
  getCustomerDisplayName,
} from '../../src/modules/profile/utils/profileProgress'
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
      isProfileComplete: true,
      gender: 'male',
      dob: '1990-01-01',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      addressLine1: 'Flat 101, Highrise Apt',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
    }

    const progress = calculateProfileProgress(completeUser)
    expect(progress.percentage).toBe(100)
    expect(progress.isFullyComplete).toBe(true)
    expect(progress.completedCount).toBe(5)
    expect(progress.missingFields.length).toBe(0)
  })

  it('caps progress at 90% when mandatory verification/isProfileComplete is not yet true', () => {
    const user: AuthUser = {
      id: 'usr_almost',
      fullName: 'John Doe',
      email: 'john@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false, // Flag is false
      gender: 'male',
      dob: '1990-01-01',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      addressLine1: 'Road No 12',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
    }

    const progress = calculateProfileProgress(user)
    expect(progress.percentage).toBe(90)
    expect(progress.isFullyComplete).toBe(false)
  })

  it('formatCustomerType capitalizes and formats known types', () => {
    expect(formatCustomerType('individual')).toBe('Individual')
    expect(formatCustomerType('pvtltd')).toBe('Private Limited')
    expect(formatCustomerType('llp')).toBe('LLP')
    expect(formatCustomerType('aop_boi')).toBe('AOP / BOI')
    expect(formatCustomerType(null)).toBeNull()
    expect(formatCustomerType('')).toBeNull()
  })

  it('formatGender formats gender values properly', () => {
    expect(formatGender('male')).toBe('Male')
    expect(formatGender('female')).toBe('Female')
    expect(formatGender('other')).toBe('Other')
    expect(formatGender(undefined)).toBeNull()
  })

  it('formatFullAddress formats user address into comma-separated text', () => {
    const user: AuthUser = {
      id: '1',
      fullName: 'Test',
      email: 'test@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: true,
      addressLine1: 'Flat 101',
      addressLine2: 'Sky Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
    }

    expect(formatFullAddress(user)).toBe('Flat 101, Sky Towers, Hyderabad, Telangana, 500081')
  })

  it('getCustomerId returns TX- prefix with id when profile is complete, and TX-<last 6 digits> when incomplete', () => {
    const incompleteUser: AuthUser = {
      id: 'usr_xyz',
      fullName: 'Valued Client',
      email: '',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }
    expect(getCustomerId(incompleteUser)).toBe('TX-781234')

    const completeUser: AuthUser = {
      id: 'usr_650681',
      fullName: 'Sagarika Jena',
      email: 'sagarika@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: true,
    }
    expect(getCustomerId(completeUser)).toBe('TX-650681')
  })

  it('getCustomerDisplayName returns fullName when complete and Guest User when incomplete', () => {
    const incompleteUser: AuthUser = {
      id: 'usr_xyz',
      fullName: 'Valued Client',
      email: '',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: false,
    }
    expect(getCustomerDisplayName(incompleteUser)).toBe('Guest User')

    const completeUser: AuthUser = {
      id: 'usr_650681',
      fullName: 'Sagarika Jena',
      email: 'sagarika@example.com',
      mobile: '9121781234',
      role: 'CUSTOMER',
      isProfileComplete: true,
    }
    expect(getCustomerDisplayName(completeUser)).toBe('Sagarika Jena')
  })
})

