import { describe, it, expect } from 'vitest'
import {
  validateBusinessLegalName,
  isValidBusinessLegalName,
  validateTradeName,
  isValidTradeName,
  validateBusinessPan,
  validateCommencementDate,
  validateDistrict,
  validateHsnSac,
  isValidHsnSac,
  getHsnSacClassification,
  validateAccountHolderName,
  validateConfirmAccountNumber,
  validateDesignation,
  validateBranch,
  validateName,
  validateIndividualPan,
  validateDob,
  validateMobile,
  validateEmail,
  validateIfscCode,
  validateBankAccountNumber,
  CONSTITUTION_PAN_TYPES,
  VALIDATION_MESSAGES
} from '../../src/shared/validations'
import {
  validateGstBusinessForm,
  validateGstBusinessField
} from '../../src/modules/gst/validation/gstStepBusiness.validator'
import { gstInput } from '../../src/modules/gst/utils/gstInputFormatters'
import type { GstBusinessFormData } from '../../src/modules/gst/types/gstBusiness.types'

describe('GST Validations - Centralized & Field-by-Field', () => {
  describe('1. Business Identity - Legal Name of Business (as per PAN)', () => {
    it('accepts valid business legal names with standard suffixes and business punctuation', () => {
      const validNames = [
        'Reliance Industries Limited',
        'Tata Consultancy Services Private Limited',
        'ABC Enterprises & Co.',
        'Info Tech LLP',
        'A-Z Solutions (India) Pvt. Ltd.',
        'Om Trading Co.',
        'L&T Construction Ltd'
      ]
      for (const name of validNames) {
        expect(isValidBusinessLegalName(name)).toBe(true)
        expect(validateBusinessLegalName(name)).toBeNull()
      }
    })

    it('rejects invalid business legal names', () => {
      expect(validateBusinessLegalName('')).toBe('Legal Name of Business is required')
      expect(validateBusinessLegalName('A')).toBe('Legal Name of Business must be at least 2 characters')
      expect(validateBusinessLegalName('123456789')).toBe('Legal Name of Business must contain letters')
      expect(validateBusinessLegalName('Tata..Consultancy')).toBe('Legal Name of Business should not contain consecutive punctuation')
      expect(validateBusinessLegalName('Tata  Consultancy')).toBe('Legal Name of Business should not contain consecutive spaces')
      expect(validateBusinessLegalName('Tata @#$ Motors')).toBe('Legal Name of Business contains invalid special characters')
    })
  })

  describe('2. Business Identity - Trade Name', () => {
    it('accepts valid trade names including numbers, symbols, and business punctuation', () => {
      const validNames = [
        'Reliance Fresh',
        '24/7 Supermarket',
        'ABC & Sons',
        'Quick-Fix Services',
        'Cafe 99'
      ]
      for (const name of validNames) {
        expect(isValidTradeName(name)).toBe(true)
        expect(validateTradeName(name)).toBeNull()
      }
    })

    it('rejects empty or invalid trade names', () => {
      expect(validateTradeName('')).toBe('Trade Name is required')
      expect(validateTradeName('A')).toBe('Trade Name must be at least 2 characters')
      expect(validateTradeName('$$$%%%')).toBe('Trade Name must contain letters or numbers')
      expect(validateTradeName('Quick..Fix')).toBe('Trade Name should not contain consecutive punctuation')
      expect(validateTradeName('   ')).toBe('Trade Name is required')
    })
  })

  describe('3. Constitution of Business & Business PAN Category Cross-Validation', () => {
    it('validates constitution mapping rules correctly', () => {
      expect(CONSTITUTION_PAN_TYPES['Proprietorship']).toEqual(['P'])
      expect(CONSTITUTION_PAN_TYPES['Private Limited Company']).toEqual(['C'])
      expect(CONSTITUTION_PAN_TYPES['Public Limited Company']).toEqual(['C'])
      expect(CONSTITUTION_PAN_TYPES['Partnership Firm']).toEqual(['F'])
      expect(CONSTITUTION_PAN_TYPES['Limited Liability Partnership (LLP)']).toEqual(['F'])
      expect(CONSTITUTION_PAN_TYPES['Society / Trust / Club']).toEqual(['A', 'T', 'B'])
      expect(CONSTITUTION_PAN_TYPES['Hindu Undivided Family (HUF)']).toEqual(['H'])
    })

    it('accepts matching Constitution and PAN 4th character', () => {
      // Company PAN (4th char = 'C')
      expect(validateBusinessPan('ABCCE1234F', 'Private Limited Company')).toBeNull()
      expect(validateBusinessPan('ABCCE1234F', 'Public Limited Company')).toBeNull()
      // Firm / LLP PAN (4th char = 'F')
      expect(validateBusinessPan('ABCFE1234F', 'Limited Liability Partnership (LLP)')).toBeNull()
      expect(validateBusinessPan('ABCFE1234F', 'Partnership Firm')).toBeNull()
      // Proprietorship PAN (Individual, 4th char = 'P')
      expect(validateBusinessPan('ABCPE1234F', 'Proprietorship')).toBeNull()
      // Trust PAN (4th char = 'T')
      expect(validateBusinessPan('ABCTE1234F', 'Society / Trust / Club')).toBeNull()
      // HUF PAN (4th char = 'H')
      expect(validateBusinessPan('ABCHE1234F', 'Hindu Undivided Family (HUF)')).toBeNull()
    })

    it('rejects mismatched Constitution and PAN category with clear explanatory message', () => {
      // Trying to register a Company with a Proprietor PAN (P)
      const errorCompany = validateBusinessPan('ABCPE1234F', 'Private Limited Company')
      expect(errorCompany).toContain('4th character must be "C"')

      // Trying to register a Partnership with a Company PAN (C)
      const errorFirm = validateBusinessPan('ABCCE1234F', 'Partnership Firm')
      expect(errorFirm).toContain('4th character must be "F"')

      // Trying to register a Proprietorship with a Company PAN (C)
      const errorProp = validateBusinessPan('ABCCE1234F', 'Proprietorship')
      expect(errorProp).toContain('4th character must be "P"')
    })

    it('rejects malformed PAN formats', () => {
      expect(validateBusinessPan('12345ABCDE', 'Proprietorship')).toBe(VALIDATION_MESSAGES.pan)
      expect(validateBusinessPan('ABCDE1234', 'Proprietorship')).toBe(VALIDATION_MESSAGES.pan)
      expect(validateBusinessPan('ABCDE12345', 'Proprietorship')).toBe(VALIDATION_MESSAGES.pan)
    })
  })

  describe('4. Commencement Date Validation', () => {
    it('accepts valid past and today dates', () => {
      expect(validateCommencementDate('15-08-2020')).toBeNull()
      expect(validateCommencementDate('01-01-2015')).toBeNull()
    })

    it('rejects future dates', () => {
      const nextYear = new Date().getFullYear() + 1
      const futureDate = `01-01-${nextYear}`
      expect(validateCommencementDate(futureDate)).toBe('Commencement date cannot be more than 30 days in the future')
    })

    it('rejects dates older than 100 years', () => {
      expect(validateCommencementDate('01-01-1900')).toBe('Commencement date cannot be more than 100 years in the past')
    })

    it('rejects invalid or incomplete date formats', () => {
      expect(validateCommencementDate('')).toBe('Date of commencement is required')
      expect(validateCommencementDate('32-01-2022')).toBe('Please select a valid date')
      expect(validateCommencementDate('invalid-date')).toBe('Please select a valid date')
    })
  })

  describe('5. Primary HSN / SAC Code Validation', () => {
    it('accepts valid 4, 6, or 8 digit HSN codes and 6-digit SAC codes', () => {
      expect(isValidHsnSac('1234')).toBe(true)
      expect(isValidHsnSac('123456')).toBe(true)
      expect(isValidHsnSac('12345678')).toBe(true)
      expect(isValidHsnSac('998311')).toBe(true)
      expect(validateHsnSac('998311')).toBeNull()
    })

    it('rejects invalid HSN/SAC lengths, non-numeric codes, and non-6-digit SAC codes', () => {
      expect(isValidHsnSac('123')).toBe(false)
      expect(isValidHsnSac('12345')).toBe(false)
      expect(isValidHsnSac('1234567')).toBe(false)
      expect(isValidHsnSac('123456789')).toBe(false)
      expect(isValidHsnSac('9983AB')).toBe(false)
      expect(validateHsnSac('123')).toBe('HSN / SAC code must be 4, 6 or 8 digits')
      expect(validateHsnSac('9983AB')).toBe('HSN / SAC code must contain digits only')
      expect(validateHsnSac('0012')).toBe('HSN / SAC code must start with a valid chapter (01-98 for HSN, 99 for SAC)')
      expect(validateHsnSac('9983')).toBe('SAC code must be 6 digits')
      expect(validateHsnSac('99831122')).toBe('SAC code must be 6 digits')
    })

    it('correctly classifies HSN (Goods) and SAC (Services) with badge formatting', () => {
      expect(getHsnSacClassification('1234')).toEqual({
        isValid: true,
        type: 'HSN',
        category: 'Goods',
        digits: 4,
        badgeText: '✓ HSN (Goods) — 4 digits',
      })
      expect(getHsnSacClassification('123455')).toEqual({
        isValid: true,
        type: 'HSN',
        category: 'Goods',
        digits: 6,
        badgeText: '✓ HSN (Goods) — 6 digits',
      })
      expect(getHsnSacClassification('12345555')).toEqual({
        isValid: true,
        type: 'HSN',
        category: 'Goods',
        digits: 8,
        badgeText: '✓ HSN (Goods) — 8 digits',
      })
      expect(getHsnSacClassification('998311')).toEqual({
        isValid: true,
        type: 'SAC',
        category: 'Services',
        digits: 6,
        badgeText: '✓ SAC (Services) — 6 digits',
      })
      expect(getHsnSacClassification('9983')).toBeNull()
      expect(getHsnSacClassification('0012')).toBeNull()
      expect(getHsnSacClassification('123')).toBeNull()
    })
  })

  describe('6. Bank Details Validation & Confirm Account Number', () => {
    it('validates account holder name', () => {
      expect(validateAccountHolderName('Tata Motors Limited')).toBeNull()
      expect(validateAccountHolderName('')).toBe('Account holder name is required')
      expect(validateAccountHolderName('A')).toBe('Account holder name must be at least 2 characters')
      expect(validateAccountHolderName('123456')).toBe('Account holder name must contain letters')
    })

    it('validates bank account number (9 to 18 digits)', () => {
      expect(validateBankAccountNumber('123456789')).toBeNull()
      expect(validateBankAccountNumber('123456789012345678')).toBeNull()
      expect(validateBankAccountNumber('12345')).toBe(VALIDATION_MESSAGES.accountNumber)
      expect(validateBankAccountNumber('1234567890123456789')).toBe(VALIDATION_MESSAGES.accountNumber)
      expect(validateBankAccountNumber('12345ABCDE')).toBe(VALIDATION_MESSAGES.accountNumber)
    })

    it('enforces exact match for Confirm Account Number', () => {
      expect(validateConfirmAccountNumber('1234567890', '1234567890')).toBeNull()
      expect(validateConfirmAccountNumber('1234567890', '9876543210')).toBe('Account numbers do not match.')
      expect(validateConfirmAccountNumber('1234567890', '')).toBe('Confirm account number is required')
      expect(validateConfirmAccountNumber('1234567890', '12345')).toBe('Enter a valid bank account number (9 to 18 digits)')
    })

    it('validates IFSC code format (11 characters, 5th character 0)', () => {
      expect(validateIfscCode('HDFC0001234')).toBeNull()
      expect(validateIfscCode('SBIN0000001')).toBeNull()
      expect(validateIfscCode('HDFC1001234')).toBe(VALIDATION_MESSAGES.ifsc)
      expect(validateIfscCode('HDFC')).toBe(VALIDATION_MESSAGES.ifsc)
    })

    it('validates branch name (no consecutive special characters, no consecutive spaces, valid symbols only)', () => {
      expect(validateBranch('Commercial Branch - MG Road')).toBeNull()
      expect(validateBranch('Sector 18 Branch')).toBeNull()
      expect(validateBranch('Plot 4/B, Indiranagar')).toBeNull()
      expect(validateBranch('')).toBe('Branch is required')
      expect(validateBranch('A')).toBe('Branch must be at least 2 characters')
      expect(validateBranch('123456')).toBe('Branch must contain letters')
      expect(validateBranch(' Main Branch')).toBe('Branch cannot start with a space')
      expect(validateBranch('/Main Branch')).toBe('Branch cannot start with a special character')
      expect(validateBranch('Main   Branch')).toBe('Only one space is allowed between words')
      expect(validateBranch('Branch//..')).toBe('Branch cannot contain consecutive special characters')
      expect(validateBranch('234567#&(&#&()DFGH//.,..')).toBe('Branch cannot contain consecutive special characters')
      expect(validateBranch('Branch#1')).toBe('Branch contains invalid special characters')
      expect(validateBranch('Branch&Co')).toBe('Branch contains invalid special characters')
    })

    it('formats branch input on change (strips arbitrary special chars, collapses consecutive punctuation and spaces)', () => {
      expect(gstInput.branch('234567#&(&#&()DFGH//.,..')).toBe('234567DFGH/')
      expect(gstInput.branch('Main    Branch')).toBe('Main Branch')
      expect(gstInput.branch('//Plot 4/B')).toBe('Plot 4/B')
    })
  })

  describe('7. Authorised Signatory Validation', () => {
    it('validates signatory personal name using universal name validator', () => {
      expect(validateName('Rahul Kumar', { label: 'Signatory Name' })).toBeNull()
      expect(validateName('P. Kumar', { label: 'Signatory Name' })).toBeNull()
      expect(validateName('Rahul123', { label: 'Signatory Name' })).toBe('Signatory Name should only contain letters')
      expect(validateName('.Rahul', { label: 'Signatory Name' })).toBe('Signatory Name cannot start with a space or dot')
    })

    it('enforces Individual PAN for Signatory (4th char must be P)', () => {
      // Individual PAN (4th char = 'P')
      expect(validateIndividualPan('ABCPE1234F', 'Signatory PAN')).toBeNull()
      // Non-individual PAN used as signatory PAN (4th char = 'C')
      const errorCompanyPan = validateIndividualPan('ABCCE1234F', 'Signatory PAN')
      expect(errorCompanyPan).toContain('4th character "P"')
    })

    it('enforces Date of Birth >= 18 years for signatory', () => {
      expect(validateDob('15-08-1990', { label: 'Date of Birth', minAge: 18 })).toBeNull()
      // Underage person
      const today = new Date()
      const underAgeYear = today.getFullYear() - 15
      const underAgeDob = `01-01-${underAgeYear}`
      expect(validateDob(underAgeDob, { label: 'Date of Birth', minAge: 18 })).toBe('Must be at least 18 years old')
    })

    it('validates Indian mobile number (10 digits starting with 6, 7, 8, or 9)', () => {
      expect(validateMobile('9876543210')).toBeNull()
      expect(validateMobile('8876543210')).toBeNull()
      expect(validateMobile('5876543210')).toBe(VALIDATION_MESSAGES.mobile)
      expect(validateMobile('98765')).toBe(VALIDATION_MESSAGES.mobile)
      expect(validateMobile('98765432101')).toBe(VALIDATION_MESSAGES.mobile)
    })

    it('validates business / personal email format', () => {
      expect(validateEmail('user@company.in')).toBeNull()
      expect(validateEmail('accounts@reliance.com')).toBeNull()
      expect(validateEmail('invalid-email')).toBe(VALIDATION_MESSAGES.email)
      expect(validateEmail('user@')).toBe(VALIDATION_MESSAGES.email)
    })
  })

  describe('8. GST Step Business Form Level & OnBlur Field Validation', () => {
    const validFormData: GstBusinessFormData = {
      legalName: 'Reliance Industries Limited',
      tradeName: 'Reliance Fresh',
      constitution: 'Private Limited Company',
      businessPan: 'ABCCE1234F',
      businessType: 'Retail Business',
      natureOfBusiness: 'Retail',
      commencementDate: '01-01-2020',
      registrationReason: 'Crossing Threshold Limit',
      compositionScheme: 'No',
      placeOfBusiness: 'Office',
      businessAddress: 'Plot 101, Industrial Area Phase 2',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pinCode: '400001',
      hsnSacCode: '998311',
      accountHolderName: 'Reliance Industries Limited',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branch: 'Fort Mumbai',
      accountType: 'Current',
      signatoryName: 'Rahul Kumar',
      signatoryPan: 'ABCPE1234F',
      dob: '01-01-1990',
      designation: 'Managing Director',
      signatoryMobile: '9876543210',
      signatoryEmail: 'director@reliance.com',
      aadhaarConsent: true
    }

    it('returns empty error map for fully valid form data', () => {
      const errors = validateGstBusinessForm(validFormData)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns field errors when mandatory fields are missing or invalid', () => {
      const invalidData: GstBusinessFormData = {
        ...validFormData,
        legalName: '123456',
        businessPan: 'ABCPE1234F', // Mismatch with Private Limited Company (P instead of C)
        confirmAccountNumber: '999999999999',
        hsnSacCode: '123',
        signatoryPan: 'ABCCE1234F', // Signatory must be individual PAN 'P' (this is C)
        aadhaarConsent: false
      }
      const errors = validateGstBusinessForm(invalidData)
      expect(Object.keys(errors).length).toBeGreaterThan(0)
      expect(errors.legalName).toBe('Legal Name of Business (as per PAN) must contain letters')
      expect(errors.businessPan).toContain('4th character must be "C"')
      expect(errors.confirmAccountNumber).toBe('Account numbers do not match.')
      expect(errors.hsnSacCode).toBe('HSN / SAC code must be 4, 6 or 8 digits')
      expect(errors.signatoryPan).toContain('4th character "P"')
      expect(errors.aadhaarConsent).toBe('Aadhaar authentication consent is mandatory to proceed')
    })

    it('supports granular single-field validation on blur (validateGstBusinessField)', () => {
      // Test Legal Name on blur
      expect(validateGstBusinessField('legalName', { ...validFormData, legalName: '' })).toBe('Legal Name of Business (as per PAN) is required')
      expect(validateGstBusinessField('legalName', { ...validFormData, legalName: 'Reliance Retail Limited' })).toBeUndefined()

      // Test Confirm Account Number on blur
      expect(validateGstBusinessField('confirmAccountNumber', validFormData)).toBeUndefined()
      expect(validateGstBusinessField('confirmAccountNumber', { ...validFormData, confirmAccountNumber: '000000000000' })).toBe('Account numbers do not match.')

      // Test Signatory PAN on blur
      expect(validateGstBusinessField('signatoryPan', validFormData)).toBeUndefined()
      expect(validateGstBusinessField('signatoryPan', { ...validFormData, signatoryPan: 'ABCCE1234F' })).toContain('4th character "P"')

      // Test HSN code on blur
      expect(validateGstBusinessField('hsnSacCode', { ...validFormData, hsnSacCode: '998311' })).toBeUndefined()
      expect(validateGstBusinessField('hsnSacCode', { ...validFormData, hsnSacCode: '1234' })).toBeUndefined()
      expect(validateGstBusinessField('hsnSacCode', { ...validFormData, hsnSacCode: '9983' })).toBe('SAC code must be 6 digits')
      expect(validateGstBusinessField('hsnSacCode', { ...validFormData, hsnSacCode: '99' })).toBe('HSN / SAC code must be 4, 6 or 8 digits')
    })
  })
})
