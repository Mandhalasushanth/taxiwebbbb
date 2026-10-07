import { describe, it, expect } from 'vitest'
import {
  validateAckNumber,
  validateAssessmentYear,
  validateRevisionReason,
  validateIncomeCorrections,
  validateDeductionCorrections,
  validateBankCorrections,
  validateRequiredDocuments,
  formatFileSize,
  calculateIncomeChange,
  calculateTaxLiability,
  sanitizeAckNumberInput,
  sanitizeNumericAmount,
  isNumericKeyAllowed,
} from '../../src/modules/itr/validation/revisedItrValidation'

describe('revisedItrValidation', () => {
  describe('validateAckNumber', () => {
    it('returns error when empty', () => {
      expect(validateAckNumber('')).toBe('Original ITR Acknowledgement Number is required.')
      expect(validateAckNumber('   ')).toBe('Original ITR Acknowledgement Number is required.')
    })

    it('returns error when length is not 15', () => {
      expect(validateAckNumber('12345')).toContain('must be exactly 15 digits')
      expect(validateAckNumber('12345678901234')).toContain('must be exactly 15 digits')
      expect(validateAckNumber('1234567890123456')).toContain('must be exactly 15 digits')
    })

    it('returns null for valid 15-digit numeric string', () => {
      expect(validateAckNumber('123456789012345')).toBeNull()
    })
  })

  describe('validateAssessmentYear', () => {
    it('returns error when unselected', () => {
      expect(validateAssessmentYear('')).toBe('Please select an Assessment Year.')
    })

    it('returns null when valid year selected', () => {
      expect(validateAssessmentYear('AY 2025-26')).toBeNull()
    })
  })

  describe('sanitizeAckNumberInput', () => {
    it('strips non-numeric characters and limits to 15 chars', () => {
      expect(sanitizeAckNumberInput('abc123xyz456')).toBe('123456')
      expect(sanitizeAckNumberInput('12345678901234567890')).toBe('123456789012345')
    })
  })

  describe('sanitizeNumericAmount', () => {
    it('strips non-digits', () => {
      expect(sanitizeNumericAmount('₹ 1,50,000')).toBe('150000')
      expect(sanitizeNumericAmount('abc999')).toBe('999')
    })
  })

  describe('formatFileSize', () => {
    it('uses the shared upload size format (whole KB, one-decimal MB)', () => {
      expect(formatFileSize(500)).toBe('1 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })
  })

  describe('isNumericKeyAllowed', () => {
    it('permits control keys', () => {
      expect(isNumericKeyAllowed('Backspace', false)).toBe(true)
      expect(isNumericKeyAllowed('Tab', false)).toBe(true)
      expect(isNumericKeyAllowed('ArrowLeft', false)).toBe(true)
    })

    it('permits shortcuts with ctrl or meta', () => {
      expect(isNumericKeyAllowed('v', true)).toBe(true)
      expect(isNumericKeyAllowed('c', true)).toBe(true)
    })

    it('permits digits and rejects alpha keys', () => {
      expect(isNumericKeyAllowed('5', false)).toBe(true)
      expect(isNumericKeyAllowed('a', false)).toBe(false)
      expect(isNumericKeyAllowed('!', false)).toBe(false)
    })
  })

  describe('validateRevisionReason', () => {
    it('returns error when no reason is selected', () => {
      const result = validateRevisionReason(null, '')
      expect(result.reasonError).toBe('Please select a reason for revising your ITR.')
    })

    it('passes for standard options (missed_income, wrong_deduction, incorrect_bank)', () => {
      expect(validateRevisionReason('missed_income', '')).toEqual({ reasonError: null, otherReasonError: null })
      expect(validateRevisionReason('wrong_deduction', '')).toEqual({ reasonError: null, otherReasonError: null })
      expect(validateRevisionReason('incorrect_bank', '')).toEqual({ reasonError: null, otherReasonError: null })
    })

    it('fails when other is selected but text is empty', () => {
      const result = validateRevisionReason('other', '')
      expect(result.otherReasonError).toBe('Please specify your reason for revision.')
      expect(result.reasonError).toBeNull()
    })

    it('passes when other is selected and valid text is provided', () => {
      const result = validateRevisionReason('other', 'Need to correct dividend income details')
      expect(result.reasonError).toBeNull()
      expect(result.otherReasonError).toBeNull()
    })
  })

  describe('validateIncomeCorrections', () => {
    it('requires salary and taxable income', () => {
      const result = validateIncomeCorrections({
        salaryIncome: '',
        otherIncome: '',
        taxableIncome: '',
      })
      expect(result.salaryIncomeError).toBe('Salary / Business income is required.')
      expect(result.taxableIncomeError).toBe('Taxable income is required.')
    })

    it('passes when required fields are filled', () => {
      const result = validateIncomeCorrections({
        salaryIncome: '850000',
        otherIncome: '25000',
        taxableIncome: '825000',
      })
      expect(result.salaryIncomeError).toBeNull()
      expect(result.taxableIncomeError).toBeNull()
    })
  })

  describe('calculateIncomeChange', () => {
    it('returns dash when revised is empty', () => {
      expect(calculateIncomeChange(500000, '')).toEqual({ changeText: '—', tone: 'neutral' })
      expect(calculateIncomeChange(0, '')).toEqual({ changeText: '—', tone: 'neutral' })
    })

    it('returns positive change when revised > original', () => {
      const result = calculateIncomeChange(500000, '600000')
      expect(result.changeText).toBe('+₹ 1,00,000')
      expect(result.tone).toBe('positive')
    })

    it('returns negative change when revised < original', () => {
      const result = calculateIncomeChange(500000, '400000')
      expect(result.changeText).toBe('-₹ 1,00,000')
      expect(result.tone).toBe('negative')
    })

    it('returns zero when revised equals original', () => {
      const result = calculateIncomeChange(500000, '500000')
      expect(result.changeText).toBe('₹ 0')
      expect(result.tone).toBe('neutral')
    })
  })

  describe('validateRequiredDocuments', () => {
    it('returns error when any required doc is missing', () => {
      const error = validateRequiredDocuments({})
      expect(error).toContain('Please upload all required documents')
      expect(error).toContain('PAN Card')
      expect(error).toContain('Aadhaar Card')
      expect(error).toContain('Form 16 / Form 16A')
      expect(error).toContain('AIS and TIS Statement')
    })

    it('passes when all 4 required docs are uploaded', () => {
      const mockDoc = (id: any) => ({
        id,
        fileName: `${id}.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: '12:00 PM',
      })

      const error = validateRequiredDocuments({
        pan: mockDoc('pan'),
        aadhaar: mockDoc('aadhaar'),
        form16: mockDoc('form16'),
        ais_tis: mockDoc('ais_tis'),
      })
      expect(error).toBeNull()
    })

    it('requires investment_proof for wrong_deduction reason', () => {
      const mockDoc = (id: any) => ({
        id,
        fileName: `${id}.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: '12:00 PM',
      })

      // Missing investment proof
      const error = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
          aadhaar: mockDoc('aadhaar'),
        },
        'wrong_deduction'
      )
      expect(error).toContain('Investment Proofs')

      // Has pan, aadhaar, investment proof
      const success = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
          aadhaar: mockDoc('aadhaar'),
          investment_proof: mockDoc('investment_proof'),
        },
        'wrong_deduction'
      )
      expect(success).toBeNull()
    })

    it('enforces PAN, Aadhaar, and Bank Statements for incorrect_bank reason', () => {
      const mockDoc = (id: any) => ({
        id,
        fileName: `${id}.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: '12:00 PM',
      })

      // Missing bank statement
      const error = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
          aadhaar: mockDoc('aadhaar'),
        },
        'incorrect_bank'
      )
      expect(error).toContain('Bank Statements')

      // Has all 3 required
      const success = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
          aadhaar: mockDoc('aadhaar'),
          bank_statement: mockDoc('bank_statement'),
        },
        'incorrect_bank'
      )
      expect(success).toBeNull()
    })

    it('enforces only PAN and Aadhaar for other reason', () => {
      const mockDoc = (id: any) => ({
        id,
        fileName: `${id}.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: '12:00 PM',
      })

      // Missing aadhaar
      const error = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
        },
        'other'
      )
      expect(error).toContain('Aadhaar Card')
      expect(error).not.toContain('Form 16')
      expect(error).not.toContain('Bank Statements')

      // Has pan and aadhaar
      const success = validateRequiredDocuments(
        {
          pan: mockDoc('pan'),
          aadhaar: mockDoc('aadhaar'),
        },
        'other'
      )
      expect(success).toBeNull()
    })
  })

  describe('validateBankCorrections', () => {
    it('returns errors when bank account or ifsc are empty', () => {
      const result = validateBankCorrections({
        accountNumber: '',
        ifsc: '',
      })
      expect(result.bankAccountError).toBe('Bank account number is required.')
      expect(result.ifscError).toBe('IFSC is required.')
    })

    it('validates 11-digit alphanumeric IFSC format', () => {
      const result = validateBankCorrections({
        accountNumber: '123456789012',
        ifsc: 'HDFC01',
      })
      expect(result.bankAccountError).toBeNull()
      expect(result.ifscError).toBe('Please enter a valid 11-character IFSC code.')
    })

    it('passes when valid account number and IFSC are provided', () => {
      const result = validateBankCorrections({
        accountNumber: '12345678901234',
        ifsc: 'HDFC0001234',
      })
      expect(result.bankAccountError).toBeNull()
      expect(result.ifscError).toBeNull()
    })
  })

  describe('validateDeductionCorrections', () => {
    it('returns error when taxableIncome is empty', () => {
      const result = validateDeductionCorrections({
        section80c: '150000',
        section80d: '',
        homeLoanInterest: '',
        taxableIncome: '',
      })
      expect(result.taxableIncomeError).toBe('Taxable income is required.')
    })

    it('returns null when taxableIncome is provided', () => {
      const result = validateDeductionCorrections({
        section80c: '150000',
        section80d: '25000',
        homeLoanInterest: '200000',
        taxableIncome: '68686835',
      })
      expect(result.taxableIncomeError).toBeNull()
    })
  })

  describe('calculateTaxLiability', () => {
    it('returns 0 for income <= 2.5L or zero', () => {
      expect(calculateTaxLiability(0)).toBe(0)
      expect(calculateTaxLiability(-1000)).toBe(0)
      expect(calculateTaxLiability(250000)).toBe(0)
    })

    it('calculates 5% tax + 4% cess for 2.5L to 5L bracket', () => {
      // 500,000: 250,000 * 0.05 = 12,500 + 4% cess = 13,000
      expect(calculateTaxLiability(500000)).toBe(13000)
    })

    it('calculates progressive tax for higher income brackets', () => {
      // 10L: 12500 + 100000 = 112500 * 1.04 = 117000
      expect(calculateTaxLiability(1000000)).toBe(117000)
    })

    it('dynamically computes tax liability for large income with surcharge', () => {
      // User entered ₹3.21 Cr in taxable income
      const tax = calculateTaxLiability(32121223)
      expect(tax).toBeGreaterThan(10000000) // Millions in tax, not 18k
    })
  })
})

