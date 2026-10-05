import { describe, it, expect } from 'vitest'
import {
  formatTextOnly,
  formatDigitsOnly,
  formatUppercaseAlphanumeric,
  formatUdyamNumber,
  LOAN_FIELD_LIMITS,
} from '../../src/modules/loans/utils/loanInputFormatters'
import {
  validateStep1LoanAndApplicant,
  validateStep2BusinessDetails,
} from '../../src/modules/loans/validation/businessLoanValidation'
import { BusinessLoanFormData } from '../../src/modules/loans/types/businessLoan.types'

describe('Business Loan Formatting and Validation Rules', () => {
  it('enforces text-only constraints and rejects numbers', () => {
    expect(formatTextOnly('John Doe 123')).toBe('John Doe ')
    expect(formatTextOnly('Director 99')).toBe('Director ')
    expect(formatTextOnly('12345')).toBe('')
    expect(formatTextOnly("O'Connor-Smith")).toBe("O'Connor-Smith")
  })

  it('enforces digits-only constraints and rejects non-numeric characters', () => {
    expect(formatDigitsOnly('5000000abc')).toBe('5000000')
    expect(formatDigitsOnly('₹ 12,500.00')).toBe('1250000')
    expect(formatDigitsOnly('12345678901234567890', 18)).toBe('123456789012345678')
  })

  it('enforces uppercase conversion and character limits for PAN, GSTIN, and IFSC', () => {
    // PAN: 10 chars uppercase
    expect(formatUppercaseAlphanumeric('abcde1234f', LOAN_FIELD_LIMITS.PAN)).toBe('ABCDE1234F')
    expect(formatUppercaseAlphanumeric('abcde1234f999', LOAN_FIELD_LIMITS.PAN)).toBe('ABCDE1234F')

    // GSTIN: 15 chars uppercase
    expect(
      formatUppercaseAlphanumeric('27abcde1234f1z5extra', LOAN_FIELD_LIMITS.GSTIN)
    ).toBe('27ABCDE1234F1Z5')

    // IFSC: 11 chars uppercase
    expect(formatUppercaseAlphanumeric('hdfc0001234', LOAN_FIELD_LIMITS.IFSC)).toBe('HDFC0001234')
  })

  it('enforces Udyam Registration Number formatting and limits', () => {
    expect(formatUdyamNumber('udyam-mh-01-1234567')).toBe('UDYAM-MH-01-1234567')
    expect(formatUdyamNumber('udyam-mh-01-1234567extra')).toBe('UDYAM-MH-01-1234567')
  })

  it('blocks advancing past Step 1 when mandatory fields are missing', () => {
    const emptyForm: BusinessLoanFormData = {
      employmentProfile: '',
      requiredLoanAmount: '',
      preferredTenureMonths: '',
      purposeOfLoan: '',
      revenueOrTurnover: '',
      existingLoans: '',
      registeredBusinessName: '',
      businessConstitution: '',
      gstin: '',
      hasUdyam: 'no',
      businessVintage: '',
      annualTurnover: '',
      annualNetProfit: '',
      signatoryName: '',
      signatoryDesignation: '',
      primaryOperatingBankName: '',
      currentAccountNumber: '',
      bankIfscCode: '',
      uploadedDocs: {},
      declarationAccepted: false,
    }

    const step1Result = validateStep1LoanAndApplicant(emptyForm)
    expect(step1Result.isValid).toBe(false)
    expect(step1Result.errors.requiredLoanAmount).toBeDefined()
    expect(step1Result.errors.preferredTenureMonths).toBeDefined()
    expect(step1Result.errors.purposeOfLoan).toBeDefined()
    expect(step1Result.errors.revenueOrTurnover).toBeDefined()
  })

  it('blocks advancing past Step 2 when mandatory fields are missing', () => {
    const invalidStep2: BusinessLoanFormData = {
      employmentProfile: 'Self-Employed Professional',
      requiredLoanAmount: '5000000',
      preferredTenureMonths: '36',
      purposeOfLoan: 'Working Capital',
      revenueOrTurnover: '1200000',
      existingLoans: 'none',
      registeredBusinessName: '',
      businessConstitution: '',
      gstin: '',
      hasUdyam: 'no',
      businessVintage: '',
      annualTurnover: '',
      annualNetProfit: '',
      signatoryName: '',
      signatoryDesignation: '',
      primaryOperatingBankName: '',
      currentAccountNumber: '',
      bankIfscCode: '',
      uploadedDocs: {},
      declarationAccepted: false,
    }

    const step2Result = validateStep2BusinessDetails(invalidStep2)
    expect(step2Result.isValid).toBe(false)
    expect(step2Result.errors.registeredBusinessName).toBeDefined()
    expect(step2Result.errors.gstin).toBeDefined()
    expect(step2Result.errors.businessConstitution).toBeDefined()
    expect(step2Result.errors.businessVintage).toBeDefined()
    expect(step2Result.errors.annualTurnover).toBeDefined()
    expect(step2Result.errors.annualNetProfit).toBeDefined()
    expect(step2Result.errors.signatoryName).toBeDefined()
    expect(step2Result.errors.signatoryDesignation).toBeDefined()
  })

  it('validates signatory name and designation to reject numeric digits', () => {
    const dataWithNumbers: BusinessLoanFormData = {
      employmentProfile: 'Self-Employed Professional',
      requiredLoanAmount: '5000000',
      preferredTenureMonths: '36',
      purposeOfLoan: 'Working Capital',
      revenueOrTurnover: '1200000',
      existingLoans: 'none',
      registeredBusinessName: 'Apex Enterprises Pvt Ltd',
      businessConstitution: 'Private Limited',
      gstin: '27ABCDE1234F1Z5',
      hasUdyam: 'no',
      businessVintage: '3–5 Years',
      annualTurnover: '5000000',
      annualNetProfit: '500000',
      signatoryName: 'John123 Doe',
      signatoryDesignation: 'Director 99',
      primaryOperatingBankName: '',
      currentAccountNumber: '',
      bankIfscCode: '',
      uploadedDocs: {},
      declarationAccepted: false,
    }

    const step2Result = validateStep2BusinessDetails(dataWithNumbers)
    expect(step2Result.isValid).toBe(false)
    expect(step2Result.errors.signatoryName).toBe('Signatory name must contain only letters, no numbers allowed.')
    expect(step2Result.errors.signatoryDesignation).toBe('Designation must contain only letters, no numbers allowed.')
  })
})
