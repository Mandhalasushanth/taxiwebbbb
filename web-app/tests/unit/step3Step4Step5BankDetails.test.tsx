// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import {
  IncorrectBankStep3,
  IncorrectBankStep4,
  IncorrectBankStep5,
} from '../../src/modules/itr/components/RevisedItr/CorrectionDetails/IncorrectBankDetails'
import {
  OtherCorrectionStep3,
  OtherCorrectionStep4,
  OtherCorrectionStep5,
} from '../../src/modules/itr/components/RevisedItr/CorrectionDetails/Other'

afterEach(() => {
  cleanup()
})

describe('Incorrect Bank Details Flow Components', () => {
  describe('Step 3: Update Income Details for incorrect_bank', () => {
    it('renders Bank Details Correction category and both bank input cards', () => {
      const onBankChange = vi.fn()
      const onKeyDown = vi.fn()

      render(
        <IncorrectBankStep3
          bankCorrections={{ accountNumber: '123456789012', ifsc: 'HDFC0001234' }}
          onBankChange={onBankChange}
          onKeyDown={onKeyDown}
        />
      )

      expect(screen.getByText('Update only what changed')).toBeDefined()
      expect(screen.getByText('Bank Details Correction')).toBeDefined()
      expect(screen.getByLabelText(/Bank account for refund/i)).toBeDefined()
      expect(screen.getByLabelText(/IFSC/i)).toBeDefined()

      const bankInput = screen.getByPlaceholderText('Enter bank account number') as HTMLInputElement
      expect(bankInput.value).toBe('123456789012')

      const ifscInput = screen.getByPlaceholderText('Enter 11-digit IFSC') as HTMLInputElement
      expect(ifscInput.value).toBe('HDFC0001234')

      fireEvent.change(bankInput, { target: { value: '987654321098' } })
      expect(onBankChange).toHaveBeenCalledWith('accountNumber', '987654321098')
    })

    it('renders error messages when bank validation errors are passed', () => {
      render(
        <IncorrectBankStep3
          bankCorrections={{ accountNumber: '', ifsc: '' }}
          bankAccountError="Bank account number is required."
          ifscError="IFSC is required."
          onBankChange={vi.fn()}
          onKeyDown={vi.fn()}
        />
      )

      expect(screen.getByText('Bank account number is required.')).toBeDefined()
      expect(screen.getByText('IFSC is required.')).toBeDefined()
    })
  })

  describe('Step 4: Upload Documents for incorrect_bank', () => {
    it('sets PAN Card, Aadhaar Card, and Bank Statements as Required Documents', () => {
      render(
        <IncorrectBankStep4
          selectedAy="AY 2025-26"
          uploadedDocuments={{}}
          onUpload={vi.fn()}
          onRemove={vi.fn()}
        />
      )

      expect(screen.getByText('Upload Documents')).toBeDefined()
      expect(screen.getByText('0 of 6 documents uploaded')).toBeDefined()

      // Required section
      expect(screen.getByText('Required Documents')).toBeDefined()
      expect(screen.getByText('PAN Card')).toBeDefined()
      expect(screen.getByText('Aadhaar Card')).toBeDefined()
      expect(screen.getByText('Bank Statements')).toBeDefined()

      // Additional section
      expect(screen.getByText('Additional Documents')).toBeDefined()
      expect(screen.getByText(/Form 16 \/ Form 16A/i)).toBeDefined()
      expect(screen.getByText('AIS and TIS Statement')).toBeDefined()
      expect(screen.getByText('Investment Proofs')).toBeDefined()
    })
  })

  describe('Step 5: Review Revised ITR for incorrect_bank', () => {
    it('displays Revised Bank and Revised IFSC in Changes card', () => {
      const mockReturn = {
        status: 'Verified from IT Portal',
        assessmentYear: 'AY 2025-26',
        itrForm: 'ITR-1',
        grossTotalIncome: '₹8,12,400',
        salaryOriginal: 812400,
        otherOriginal: 0,
        taxableOriginal: 492400,
        personalInfo: {
          fullName: 'Sagarika Jena',
          pan: 'XXXXX4743E',
          dob: '02-02-2000',
          mobile: '7008138785',
          email: 'jenasagarika5211@gmail.com',
          address: 'Ameerpet, Hyderabad, Telangana - 500018',
        },
      }

      render(
        <IncorrectBankStep5
          ackNumber="585855255252886"
          selectedAy="AY 2025-26"
          returnDetails={mockReturn}
          bankCorrections={{ accountNumber: 'hdfucjvkvjkvkvuvkkvumvjjccjjcjc', ifsc: 'HCFJJVVKJVT' }}
          uploadedDocuments={{}}
          onEditStep={vi.fn()}
        />
      )

      expect(screen.getByText('Revision Reason')).toBeDefined()
      expect(screen.getByText('Incorrect Bank Details')).toBeDefined()
      expect(screen.getByText('Revised Bank')).toBeDefined()
      expect(screen.getByText('hdfucjvkvjkvkvuvkkvumvjjccjjcjc')).toBeDefined()
      expect(screen.getByText('Revised IFSC')).toBeDefined()
      expect(screen.getByText('HCFJJVVKJVT')).toBeDefined()

      // Original return details
      expect(screen.getByText('585855255252886')).toBeDefined()
      expect(screen.getByText('Sagarika Jena')).toBeDefined()
    })
  })

  describe('Other Correction Flow (All sections displayed)', () => {
    it('renders reason banner and all 3 categories in Step 3', () => {
      render(
        <OtherCorrectionStep3
          otherReasonText="Bhc jvv jhw"
          incomeCorrections={{ salaryIncome: '24425', otherIncome: '', taxableIncome: '86868' }}
          deductionCorrections={{ section80c: '', section80d: '', homeLoanInterest: '', taxableIncome: '' }}
          bankCorrections={{ accountNumber: '', ifsc: '' }}
          originalAmounts={{ salaryOriginal: 812400, otherOriginal: 0, taxableOriginal: 492400 }}
          onChange={vi.fn()}
          onDeductionChange={vi.fn()}
          onBankChange={vi.fn()}
          onKeyDown={vi.fn()}
        />
      )

      // Reason pill
      expect(screen.getByText('Reason:')).toBeDefined()
      expect(screen.getByText(/Bhc jvv jhw/)).toBeDefined()

      // 3 category titles
      expect(screen.getByText('Income Correction')).toBeDefined()
      expect(screen.getByText('Deduction Correction')).toBeDefined()
      expect(screen.getByText('Bank Details Correction')).toBeDefined()

      // Fields
      expect(screen.getByText(/Salary \/ Business income/i)).toBeDefined()
      expect(screen.getByText(/Other income/i)).toBeDefined()
      expect(screen.getByText(/80C deduction/i)).toBeDefined()
      expect(screen.getByText(/80D deduction/i)).toBeDefined()
      expect(screen.getByText(/Home loan interest/i)).toBeDefined()
      expect(screen.getByText(/Bank account for refund/i)).toBeDefined()
      expect(screen.getByText(/IFSC/i)).toBeDefined()
      expect(screen.getByText(/Taxable income/i)).toBeDefined()
    })

    it('sets PAN and Aadhaar as Required, and 4 other docs as Additional in Step 4', () => {
      render(
        <OtherCorrectionStep4
          selectedAy="AY 2025-26"
          uploadedDocuments={{}}
          onUpload={vi.fn()}
          onRemove={vi.fn()}
        />
      )

      expect(screen.getByText('Required Documents')).toBeDefined()
      expect(screen.getByText('PAN Card')).toBeDefined()
      expect(screen.getByText('Aadhaar Card')).toBeDefined()

      expect(screen.getByText('Additional Documents')).toBeDefined()
      expect(screen.getByText(/Form 16 \/ Form 16A/i)).toBeDefined()
      expect(screen.getByText('AIS and TIS Statement')).toBeDefined()
      expect(screen.getByText('Bank Statements')).toBeDefined()
      expect(screen.getByText('Investment Proofs')).toBeDefined()
    })

    it('displays Other Correction and entered revised figures in Step 5', () => {
      const mockReturn = {
        status: 'Verified from IT Portal',
        assessmentYear: 'AY 2025-26',
        itrForm: 'ITR-1',
        grossTotalIncome: '₹8,12,400',
        salaryOriginal: 812400,
        otherOriginal: 0,
        taxableOriginal: 492400,
        personalInfo: {
          fullName: 'Sagarika Jena',
          pan: 'XXXXX4743E',
          dob: '02-02-2000',
          mobile: '7008138785',
          email: 'jenasagarika5211@gmail.com',
          address: 'Ameerpet, Hyderabad, Telangana - 500018',
        },
      }

      render(
        <OtherCorrectionStep5
          ackNumber="252582825522525"
          selectedAy="AY 2025-26"
          returnDetails={mockReturn}
          otherReasonText="Bhc jvv jhw"
          incomeCorrections={{ salaryIncome: '24425', otherIncome: '', taxableIncome: '86868' }}
          uploadedDocuments={{}}
          onEditStep={vi.fn()}
        />
      )

      expect(screen.getByText('Revision Reason')).toBeDefined()
      expect(screen.getByText('Other Correction')).toBeDefined()
      expect(screen.getByText('Revised Salary / Business')).toBeDefined()
      expect(screen.getAllByText('₹24,425').length).toBeGreaterThan(0)
      expect(screen.getByText('Revised Taxable Income')).toBeDefined()
      expect(screen.getAllByText('₹86,868').length).toBeGreaterThan(0)
    })
  })
})
