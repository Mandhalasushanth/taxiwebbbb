// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Documents } from '../../src/modules/loans/components/PersonalLoan/steps/Documents/Documents'
import { validateStep3Documents } from '../../src/modules/loans/validation/personalLoanValidation'
import {
  INITIAL_PERSONAL_LOAN_DATA,
  getRequiredPersonalLoanDocuments,
} from '../../src/modules/loans/components/PersonalLoan/personalLoan.constants'
import type { PersonalLoanFormData } from '../../src/modules/loans/types'

describe('Personal Loan – Step 3 Documents (Dynamic based on Step 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders required documents for Salaried applicant (PAN + 3 Months Salary Bank Statement)', () => {
    const salariedData: PersonalLoanFormData = {
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
    }

    render(<Documents data={salariedData} onChange={vi.fn()} errors={{}} />)

    // Required doc cards
    expect(screen.getByText(/REQUIRED DOCUMENTS/i)).toBeInTheDocument()
    expect(screen.getByText('Applicant PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Salary Bank Statement (Last 3 Months)')).toBeInTheDocument()
    expect(screen.queryByText('Business Bank Statement (Last 6 Months)')).not.toBeInTheDocument()
  })

  it('renders Required and Optional documents for Self Employed applicant', () => {
    const selfEmployedData: PersonalLoanFormData = {
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'self-employed',
    }

    render(<Documents data={selfEmployedData} onChange={vi.fn()} errors={{}} />)

    expect(screen.getByText(/REQUIRED DOCUMENTS/i)).toBeInTheDocument()
    expect(screen.getByText('Applicant PAN Card')).toBeInTheDocument()

    expect(screen.getByText(/OPTIONAL DOCUMENTS/i)).toBeInTheDocument()
    expect(screen.getByText('Bank Statement (Last 6 Months)')).toBeInTheDocument()
    expect(screen.getByText('ITR Acknowledgment / Computation (Optional)')).toBeInTheDocument()
    expect(screen.queryByText('Salary Bank Statement (Last 3 Months)')).not.toBeInTheDocument()
  })

  it('handles document file upload and calls onChange with file entry', async () => {
    const handleChange = vi.fn()
    const salariedData: PersonalLoanFormData = {
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
    }

    const { container } = render(<Documents data={salariedData} onChange={handleChange} errors={{}} />)

    const fileInput = container.querySelector('#file-input-pan_card') as HTMLInputElement
    expect(fileInput).not.toBeNull()

    const mockFile = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'pan_card.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          uploadedDocs: expect.objectContaining({
            pan_card: expect.objectContaining({
              id: 'pan_card',
              name: 'pan_card.pdf',
            }),
          }),
        }),
      )
    })
  })

  it('displays uploaded document state with Replace and Delete buttons and removes doc when clicked', () => {
    const handleChange = vi.fn()
    const dataWithDoc: PersonalLoanFormData = {
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
      uploadedDocs: {
        pan_card: {
          id: 'pan_card',
          name: 'my_pan.pdf',
          size: '1.2 MB',
          uploadedAt: '2026-10-15T10:00:00.000Z',
          file: new File([''], 'my_pan.pdf'),
        },
      },
    }

    render(<Documents data={dataWithDoc} onChange={handleChange} errors={{}} />)

    expect(screen.getByText(/my_pan.pdf/i)).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /View Document/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Replace/i })).toBeInTheDocument()

    const deleteBtn = screen.getByRole('button', { name: /Delete|Remove/i })
    fireEvent.click(deleteBtn)

    expect(handleChange).toHaveBeenCalledWith({ uploadedDocs: {} })
  })

  it('validates Step 3 documents dynamically based on employment type', () => {
    // 1. Missing docs for salaried
    const emptySalaried = validateStep3Documents({
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
      uploadedDocs: {},
    })
    expect(emptySalaried.isValid).toBe(false)
    expect(emptySalaried.errors.pan_card).toBeDefined()
    expect(emptySalaried.errors.salary_bank_statement).toBeDefined()

    // 2. Only PAN uploaded for salaried (still missing salary bank statement)
    const partialSalaried = validateStep3Documents({
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
      uploadedDocs: {
        pan_card: {
          id: 'pan_card',
          name: 'pan.pdf',
          size: 100,
          type: 'application/pdf',
          file: new File([''], 'pan.pdf'),
        },
      },
    })
    expect(partialSalaried.isValid).toBe(false)
    expect(partialSalaried.errors.salary_bank_statement).toBeDefined()
    expect(partialSalaried.errors.pan_card).toBeUndefined()

    // 3. Fully uploaded for salaried
    const completeSalaried = validateStep3Documents({
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'salaried',
      uploadedDocs: {
        pan_card: { id: 'pan_card', name: 'pan.pdf', size: 100, type: 'application/pdf', file: new File([''], 'pan.pdf') },
        salary_bank_statement: { id: 'salary_bank_statement', name: 'statement.pdf', size: 200, type: 'application/pdf', file: new File([''], 'statement.pdf') },
      },
    })
    expect(completeSalaried.isValid).toBe(true)
    expect(Object.keys(completeSalaried.errors).length).toBe(0)

    // 4. Missing docs for self-employed only requires PAN card
    const emptySelf = validateStep3Documents({
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'self-employed',
      uploadedDocs: {},
    })
    expect(emptySelf.isValid).toBe(false)
    expect(emptySelf.errors.pan_card).toBeDefined()
    expect(emptySelf.errors.business_bank_statement).toBeUndefined()
    expect(emptySelf.errors.salary_bank_statement).toBeUndefined()

    // 5. Complete for self-employed with just PAN card (bank statements and ITR are optional)
    const validSelf = validateStep3Documents({
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'self-employed',
      uploadedDocs: {
        pan_card: { id: 'pan_card', name: 'pan.pdf', size: 100, type: 'application/pdf', file: new File([''], 'pan.pdf') },
      },
    })
    expect(validSelf.isValid).toBe(true)
    expect(Object.keys(validSelf.errors).length).toBe(0)
  })
})
