import { describe, it, expect } from 'vitest'
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  validateName,
  isValidName,
  validateEmail,
  isValidEmail,
  validateMobile,
  isValidMobile,
  validatePan,
  validateIndividualPan,
  isValidPan,
  getPanCategory,
  validateAadhaar,
  isValidAadhaar,
  isValidVerhoeff,
  validateGstin,
  isValidGstin,
  isValidGstinChecksum,
  isValidGstStateCode,
  validateGstinMatchesPan,
  validateDob,
  isValidDate,
  parseDate,
  calculateAge,
  validateAddress,
  isValidAddress,
  validateCity,
  isValidCity,
  validatePincode,
  isValidPincode,
  validateAccountNumber,
  isValidAccountNumber,
  validateIfsc,
  isValidIfsc,
} from '../../src/shared/validations'

describe('Centralized Common Validation System', () => {
  /* ------------------------------------------------------------------------ */
  /* A. Full Name, Father's Name and Spouse Name                              */
  /* ------------------------------------------------------------------------ */
  describe('Name Validation (Full Name, Father Name, Spouse Name)', () => {
    it('accepts valid names including spaces, dots, and Unicode', () => {
      expect(isValidName('Rahul Kumar')).toBe(true)
      expect(isValidName('Rahul.Kumar')).toBe(true)
      expect(isValidName('P. Kumar')).toBe(true)
      expect(isValidName('Sai Teja')).toBe(true)
      expect(isValidName('M. Venkata Rao')).toBe(true)
      expect(isValidName('Amitabh')).toBe(true)
    })

    it('rejects invalid names with numbers, emojis, and unsupported chars', () => {
      expect(isValidName('Rahul123')).toBe(false)
      expect(isValidName('Rahul@Kumar')).toBe(false)
      expect(isValidName('Rahul#Kumar')).toBe(false)
      expect(isValidName('Rahul 👍 Kumar')).toBe(false)
    })

    it('rejects consecutive spaces and consecutive dots', () => {
      expect(isValidName('Rahul..Kumar')).toBe(false)
      expect(isValidName('Rahul  Kumar')).toBe(false)
    })

    it('rejects leading and trailing spaces and dots', () => {
      expect(isValidName('.Rahul')).toBe(false)
      expect(isValidName('Rahul.')).toBe(false)
      expect(isValidName(' Rahul')).toBe(false)
      expect(isValidName('Rahul ')).toBe(false)
    })

    it('enforces min and max length bounds (2 to 100)', () => {
      expect(isValidName('A')).toBe(false)
      expect(isValidName('Ab')).toBe(true)
      expect(isValidName('A'.repeat(100))).toBe(true)
      expect(isValidName('A'.repeat(101))).toBe(false)
    })

    it('handles empty mandatory vs empty optional input', () => {
      expect(validateName('', { required: true })).toBe(VALIDATION_MESSAGES.required)
      expect(validateName('', { required: false })).toBeNull()
      expect(validateName(null, { required: false })).toBeNull()
    })
  })

  /* ------------------------------------------------------------------------ */
  /* B. Email Validation                                                      */
  /* ------------------------------------------------------------------------ */
  describe('Email Validation', () => {
    it('accepts valid email formats from public and business domains', () => {
      expect(isValidEmail('rahul@gmail.com')).toBe(true)
      expect(isValidEmail('rahul.kumar@yahoo.com')).toBe(true)
      expect(isValidEmail('rahul+tax@company.co.in')).toBe(true)
      expect(isValidEmail('admin@business.org')).toBe(true)
      expect(isValidEmail('support@fin.company.net')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(isValidEmail('rahul@gmail')).toBe(false)
      expect(isValidEmail('rahul@@gmail.com')).toBe(false)
      expect(isValidEmail('rahul..kumar@gmail.com')).toBe(false)
      expect(isValidEmail('rahul@gmail.c')).toBe(false)
      expect(isValidEmail('rahul @gmail.com')).toBe(false)
      expect(isValidEmail('.rahul@gmail.com')).toBe(false)
      expect(isValidEmail('rahul.@gmail.com')).toBe(false)
    })

    it('enforces total length (254) and username length (64)', () => {
      const longUsername = 'a'.repeat(65) + '@domain.com'
      expect(isValidEmail(longUsername)).toBe(false)
      const validUsername = 'a'.repeat(64) + '@domain.com'
      expect(isValidEmail(validUsername)).toBe(true)
    })

    it('handles empty mandatory vs optional input', () => {
      expect(validateEmail('', { required: true })).toBe(VALIDATION_MESSAGES.required)
      expect(validateEmail('', { required: false })).toBeNull()
    })
  })

  /* ------------------------------------------------------------------------ */
  /* C. Mobile Number                                                         */
  /* ------------------------------------------------------------------------ */
  describe('Mobile Validation', () => {
    it('accepts valid 10-digit Indian numbers starting with 6, 7, 8, or 9', () => {
      expect(isValidMobile('9876543210')).toBe(true)
      expect(isValidMobile('8123456789')).toBe(true)
      expect(isValidMobile('7000000001')).toBe(true)
      expect(isValidMobile('6300000000')).toBe(true)
      expect(isValidMobile('+91 9876543210')).toBe(true)
    })

    it('rejects numbers starting with 0-5, letters, and invalid lengths', () => {
      expect(isValidMobile('5876543210')).toBe(false)
      expect(isValidMobile('0987654321')).toBe(false)
      expect(isValidMobile('987654321')).toBe(false) // 9 digits
      expect(isValidMobile('98765432100')).toBe(false) // 11 digits
      expect(isValidMobile('98765abcde')).toBe(false)
      expect(isValidMobile('9999999999')).toBe(false) // all identical dummy
    })

    it('handles empty mandatory vs optional input', () => {
      expect(validateMobile('', { required: true })).toBe(VALIDATION_MESSAGES.required)
      expect(validateMobile('', { required: false })).toBeNull()
    })
  })

  /* ------------------------------------------------------------------------ */
  /* D. Date of Birth Validation                                              */
  /* ------------------------------------------------------------------------ */
  describe('Date of Birth Validation', () => {
    it('accepts valid calendar dates', () => {
      expect(isValidDate('15-08-1995')).toBe(true)
      expect(isValidDate('1995-08-15')).toBe(true)
      expect(isValidDate('29-02-2000')).toBe(true) // leap year
    })

    it('rejects impossible dates and leap-year errors', () => {
      expect(isValidDate('31-02-2000')).toBe(false)
      expect(isValidDate('29-02-2001')).toBe(false)
      expect(isValidDate('31-04-2020')).toBe(false)
      expect(validateDob('31/02/2000')).toBe(VALIDATION_MESSAGES.dob)
    })

    it('rejects future dates', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 2)
      expect(validateDob(tomorrow)).toBe(VALIDATION_MESSAGES.futureDob)
    })

    it('enforces minAge when configured', () => {
      const recent = new Date()
      recent.setFullYear(recent.getFullYear() - 10) // 10 years old
      expect(validateDob(recent, { minAge: 18 })).toContain('Must be at least 18')
    })
  })

  /* ------------------------------------------------------------------------ */
  /* E. PAN Number Validation & Business Type Matching                        */
  /* ------------------------------------------------------------------------ */
  describe('PAN Validation and Entity Matching', () => {
    it('accepts valid PAN formats and normalizes lowercase input', () => {
      expect(isValidPan('abcpe1234f')).toBe(true)
      expect(isValidPan('ABCPE1234F')).toBe(true)
      expect(isValidPan('AAACB1234C')).toBe(true) // Company
      expect(isValidPan('AAAFB1234F')).toBe(true) // Firm
    })

    it('rejects invalid PAN format and invalid category 4th characters', () => {
      expect(isValidPan('ABCDE1234F')).toBe(false) // 'D' is not a valid PAN category
      expect(isValidPan('ABCP12345F')).toBe(false)
      expect(isValidPan('ABCPE12345')).toBe(false)
      expect(isValidPan('ABCPE1234F ')).toBe(false) // space
    })

    it('identifies PAN category holder code', () => {
      expect(getPanCategory('ABCPE1234F')).toBe('P')
      expect(getPanCategory('AAACB1234C')).toBe('C')
      expect(getPanCategory('AAAFB1234F')).toBe('F')
      expect(getPanCategory('AAATB1234T')).toBe('T')
    })

    it('validates PAN category against selected business type', () => {
      // Company requires 'C'
      expect(validatePan('AAACB1234C', { businessType: 'private_limited' })).toBeNull()
      expect(validatePan('ABCPE1234F', { businessType: 'private_limited' })).toBe(
        VALIDATION_MESSAGES.panMismatch
      )

      // LLP requires 'F'
      expect(validatePan('AAAFB1234F', { businessType: 'llp' })).toBeNull()
      expect(validatePan('AAACB1234C', { businessType: 'llp' })).toBe(
        VALIDATION_MESSAGES.panMismatch
      )

      // Individual requires 'P'
      expect(validatePan('ABCPE1234F', { businessType: 'individual' })).toBeNull()
      expect(validateIndividualPan('ABCPE1234F')).toBeNull()
      expect(validateIndividualPan('AAACB1234C')).toBe(VALIDATION_MESSAGES.panIndividual)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* F. Aadhaar Number & Verhoeff Checksum                                    */
  /* ------------------------------------------------------------------------ */
  describe('Aadhaar Validation and Verhoeff Checksum', () => {
    // Valid Aadhaar numbers generated with correct Verhoeff check digit
    const validAadhaar = '234567890124'

    it('accepts 12-digit Aadhaar satisfying Verhoeff algorithm', () => {
      expect(isValidAadhaar(validAadhaar)).toBe(true)
      expect(isValidVerhoeff(validAadhaar)).toBe(true)
    })

    it('rejects numbers starting with 0 or 1', () => {
      expect(validateAadhaar('012345678901')).toBe('Aadhaar number cannot start with 0 or 1')
      expect(validateAadhaar('123456789012')).toBe('Aadhaar number cannot start with 0 or 1')
    })

    it('rejects numbers with invalid lengths or non-digits', () => {
      expect(isValidAadhaar('23456789012')).toBe(false) // 11 digits
      expect(isValidAadhaar('2345678901234')).toBe(false) // 13 digits
      expect(isValidAadhaar('23456789abcd')).toBe(false)
    })

    it('rejects invalid Verhoeff check digit', () => {
      // Tampering with the last digit
      expect(isValidAadhaar('234567890125')).toBe(false)
      expect(validateAadhaar('234567890125')).toBe('Invalid Aadhaar check digit')
    })

    it('rejects dummy repeated numbers', () => {
      expect(isValidAadhaar('222222222222')).toBe(false)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* G. GSTIN Validation & Checksum                                           */
  /* ------------------------------------------------------------------------ */
  describe('GSTIN Validation', () => {
    const validGstin = '29ABCPE1234F1Z7' // 29 (Karnataka) + valid PAN (ABCPE1234F) + 1 + Z + check digit 7

    it('accepts valid 15-character GSTIN structure', () => {
      expect(isValidGstin(validGstin)).toBe(true)
      expect(isValidGstin(validGstin.toLowerCase())).toBe(true) // auto uppercase
    })

    it('rejects empty GSTIN', () => {
      expect(validateGstin('')).toBe('Please enter GSTIN.')
      expect(validateGstin(null)).toBe('Please enter GSTIN.')
    })

    it('rejects invalid length or format', () => {
      expect(validateGstin('29ABCPE1234F1Z')).toBe('GSTIN must contain exactly 15 characters.') // 14 chars
      expect(validateGstin('29ABCPE1234F1Z77')).toBe('GSTIN must contain exactly 15 characters.') // 16 chars
      expect(isValidGstin('29ABCPE1234F1Z')).toBe(false)
      expect(isValidGstin('29ABCPE1234F1Z77')).toBe(false)
    })

    it('rejects special characters and spaces', () => {
      expect(isValidGstin('29ABCPE1234F1 Z')).toBe(false)
      expect(isValidGstin('29ABCPE1234F1#7')).toBe(false)
    })

    it('rejects invalid state code including 88 and 95', () => {
      expect(isValidGstStateCode('88')).toBe(false)
      expect(isValidGstStateCode('95')).toBe(false)
      expect(isValidGstStateCode('29')).toBe(true)
      expect(validateGstin('88AAAAA0000A1Z5')).toContain('invalid state code')
      expect(validateGstin('95ABCPE1234F1Z7')).toContain('invalid state code')
    })

    it('rejects invalid PAN structure within GSTIN', () => {
      expect(validateGstin('29123451234F1Z7')).toBe('Invalid PAN format within GSTIN.')
    })

    it('rejects invalid entity code (13th char)', () => {
      expect(validateGstin('29ABCPE1234F0Z7')).toBe('Invalid GSTIN entity code.')
    })

    it('rejects 14th character that is not Z', () => {
      expect(validateGstin('29ABCPE1234F1A7')).toBe('The 14th character of GSTIN must be Z.')
      expect(isValidGstin('29ABCPE1234F1A7')).toBe(false)
    })

    it('validates state code match when requested', () => {
      expect(validateGstin('29ABCPE1234F1Z7', { expectedStateCode: '29' })).toBeNull()
      expect(validateGstin('29ABCPE1234F1Z7', { expectedStateCode: '27' })).toContain('does not match')
    })

    it('validates PAN match against entered PAN', () => {
      expect(validateGstin('29ABCPE1234F1Z7', { expectedPan: 'ABCPE1234F' })).toBeNull()
      expect(validateGstin('29ABCPE1234F1Z7', { expectedPan: 'XYZPE1234F' })).toBe('GSTIN does not match the entered PAN number.')
      expect(validateGstinMatchesPan('29ABCPE1234F1Z7', 'ABCPE1234F')).toBeNull()
      expect(validateGstinMatchesPan('29ABCPE1234F1Z7', 'XYZPE1234F')).toBe('GSTIN does not match the entered PAN number.')
    })

    it('validates GSTIN checksum algorithm when strictChecksum enabled', () => {
      expect(isValidGstinChecksum('29ABCPE1234F1Z7')).toBe(true)
      expect(isValidGstinChecksum('29ABCPE1234F1Z9')).toBe(false)
      expect(validateGstin('29ABCPE1234F1Z9', { strictChecksum: true })).toBe('Invalid GSTIN checksum')
    })
  })

  /* ------------------------------------------------------------------------ */
  /* H. Address Validation                                                    */
  /* ------------------------------------------------------------------------ */
  describe('Address Validation', () => {
    it('accepts standard Indian address formats', () => {
      expect(isValidAddress('Flat 102, Green Avenue')).toBe(true)
      expect(isValidAddress('H.No 12/A, MG Road')).toBe(true)
      expect(isValidAddress('Plot No 25, Sector-5')).toBe(true)
      expect(isValidAddress('3rd Floor, Building No 12')).toBe(true)
      expect(isValidAddress("D'Souza Street, Hyderabad")).toBe(true)
    })

    it('rejects consecutive special characters, emojis and unsupported symbols', () => {
      expect(isValidAddress('@#$%^&*')).toBe(false)
      expect(isValidAddress('12@@MG Road')).toBe(false)
      expect(isValidAddress('12,, MG Road')).toBe(false)
      expect(isValidAddress('12.. Main Street')).toBe(false)
      expect(isValidAddress('**123 Road')).toBe(false)
      expect(isValidAddress('123 Road!!!')).toBe(false)
    })

    it('rejects leading and trailing special characters and spaces', () => {
      expect(isValidAddress(',Flat 102')).toBe(false)
      expect(isValidAddress('Flat 102,')).toBe(false)
      expect(isValidAddress(' Flat 102')).toBe(false)
      expect(isValidAddress('Flat 102 ')).toBe(false)
    })

    it('enforces min (3) and max (150) length', () => {
      expect(isValidAddress('Fl')).toBe(false)
      expect(isValidAddress('Fla')).toBe(true)
      expect(isValidAddress('A'.repeat(151))).toBe(false)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* I. City Validation                                                       */
  /* ------------------------------------------------------------------------ */
  describe('City Validation', () => {
    it('accepts valid city names with single spaces, dots, hyphens', () => {
      expect(isValidCity('Hyderabad')).toBe(true)
      expect(isValidCity('New Delhi')).toBe(true)
      expect(isValidCity('Bengaluru')).toBe(true)
      expect(isValidCity('Navi-Mumbai')).toBe(true)
      expect(isValidCity('St. Thomas')).toBe(true)
    })

    it('rejects city names with numbers, emojis, and unsupported chars', () => {
      expect(isValidCity('Hyderabad123')).toBe(false)
      expect(isValidCity('Hyd@rabad')).toBe(false)
      expect(isValidCity('Hyderabad..')).toBe(false)
      expect(isValidCity('New  Delhi')).toBe(false)
      expect(isValidCity(' Hyderabad')).toBe(false)
      expect(isValidCity('Hyderabad-')).toBe(false)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* J. PIN Code Validation                                                   */
  /* ------------------------------------------------------------------------ */
  describe('PIN Code Validation', () => {
    it('accepts exactly 6 digits starting with 1-9', () => {
      expect(isValidPincode('500001')).toBe(true)
      expect(isValidPincode('110001')).toBe(true)
      expect(isValidPincode('411001')).toBe(true)
    })

    it('rejects PIN codes starting with 0, containing spaces or non-digits', () => {
      expect(isValidPincode('011001')).toBe(false)
      expect(isValidPincode('50000')).toBe(false) // 5 digits
      expect(isValidPincode('5000001')).toBe(false) // 7 digits
      expect(isValidPincode('500 001')).toBe(false)
      expect(isValidPincode('50000A')).toBe(false)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* K. Bank Account Number                                                   */
  /* ------------------------------------------------------------------------ */
  describe('Bank Account Number Validation', () => {
    it('accepts 9 to 18 numeric digits', () => {
      expect(isValidAccountNumber('123456789')).toBe(true)
      expect(isValidAccountNumber('123456789012345678')).toBe(true)
    })

    it('rejects accounts with less than 9 or more than 18 digits or letters', () => {
      expect(isValidAccountNumber('12345678')).toBe(false) // 8 digits
      expect(isValidAccountNumber('1234567890123456789')).toBe(false) // 19 digits
      expect(isValidAccountNumber('12345678A')).toBe(false)
      expect(isValidAccountNumber('1234 56789')).toBe(false)
    })
  })

  /* ------------------------------------------------------------------------ */
  /* L. IFSC Code Validation                                                  */
  /* ------------------------------------------------------------------------ */
  describe('IFSC Validation', () => {
    it('accepts 11-character IFSC: 4 letters, 0, 6 alphanumeric', () => {
      expect(isValidIfsc('SBIN0001234')).toBe(true)
      expect(isValidIfsc('HDFC0000001')).toBe(true)
      expect(isValidIfsc('sbin0001234')).toBe(true) // case-insensitive
    })

    it('rejects invalid IFSC format', () => {
      expect(isValidIfsc('SBIN1001234')).toBe(false) // 5th character not 0
      expect(isValidIfsc('SBI00001234')).toBe(false) // only 3 letters at start
      expect(isValidIfsc('SBIN000123')).toBe(false) // 10 chars
      expect(isValidIfsc('SBIN00012345')).toBe(false) // 12 chars
      expect(isValidIfsc('SBIN 001234')).toBe(false)
    })
  })
})
