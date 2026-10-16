// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Documents } from '../../src/modules/loans/components/MachineryLoan/steps/Documents/Documents'
import { validateStep3Documents } from '../../src/modules/loans/validation/machineryLoanValidation'
import type { MachineryLoanData } from '../../src/modules/loans/types/machineryLoan.types'
import { INITIAL_MACHINERY_LOAN_DATA } from '../../src/modules/loans/components/MachineryLoan/machineryLoan.constants'

const BASE_DATA: MachineryLoanData = {
  ...INITIAL_MACHINERY_LOAN_DATA,
  requestedLoanAmount: '95,95,989',
  loanAmount: '95,95,989',
  machineryType: 'Packaging Machinery',
  machineryNameDescription: 'Bxbxncj',
  machineryCondition: 'New',
  machineryPurchaseType: 'Authorized Dealer',
  approximateMachineryCost: '98,98,989',
  dealerSupplierName: 'Bxbx',
}

describe('Machinery Loan – Step 3 Documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders required documents section and Machinery Quotation card matching Screenshot 4', () => {
    render(
      <MemoryRouter>
        <Documents data={BASE_DATA} onChange={vi.fn()} errors={{}} />
      </MemoryRouter>,
    )

    // Summary Progress Box is removed
    expect(screen.queryByText(/required documents uploaded/i)).not.toBeInTheDocument()

    // Section: REQUIRED DOCUMENTS
    expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
    expect(screen.getByText('Machinery Quotation / Proforma Invoice')).toBeInTheDocument()
    expect(
      screen.getByText('Quotation or proforma invoice for the new machinery being financed'),
    ).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()

    // Upload action button
    expect(
      screen.getByRole('button', { name: /upload machinery quotation/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('shows error badge when document is missing and step was submitted with errors', () => {
    render(
      <MemoryRouter>
        <Documents
          data={BASE_DATA}
          onChange={vi.fn()}
          errors={{ machinery_quotation: 'Machinery Quotation / Proforma Invoice is required' }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Required Document Missing')).toBeInTheDocument()
  })

  it('uploads document and triggers onChange with document entry', async () => {
    const handleChange = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <Documents data={BASE_DATA} onChange={handleChange} errors={{}} />
      </MemoryRouter>,
    )

    const fileInput = container.querySelector('#file-input-machinery_quotation') as HTMLInputElement
    expect(fileInput).not.toBeNull()

    const mockPdf = new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])],
      'machinery_quote.pdf',
      { type: 'application/pdf' },
    )

    fireEvent.change(fileInput, { target: { files: [mockPdf] } })

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          uploadedDocs: expect.objectContaining({
            machinery_quotation: expect.objectContaining({
              id: 'machinery_quotation',
              name: 'machinery_quote.pdf',
            }),
          }),
        }),
      )
    })
  })

  it('displays uploaded document state with 1 of 1 progress when file is attached', () => {
    const uploadedData: MachineryLoanData = {
      ...BASE_DATA,
      uploadedDocs: {
        machinery_quotation: {
          id: 'machinery_quotation',
          name: 'proforma_invoice_final.pdf',
          size: 204800,
          type: 'application/pdf',
        },
      },
    }

    render(
      <MemoryRouter>
        <Documents data={uploadedData} onChange={vi.fn()} errors={{}} />
      </MemoryRouter>,
    )

    expect(screen.queryByText(/required documents uploaded/i)).not.toBeInTheDocument()
    expect(screen.getByText(/proforma_invoice_final\.pdf/)).toBeInTheDocument()
  })

  it('removes uploaded document when delete is clicked', () => {
    const handleChange = vi.fn()
    const uploadedData: MachineryLoanData = {
      ...BASE_DATA,
      uploadedDocs: {
        machinery_quotation: {
          id: 'machinery_quotation',
          name: 'proforma_invoice_final.pdf',
          size: 204800,
          type: 'application/pdf',
        },
      },
    }

    render(
      <MemoryRouter>
        <Documents data={uploadedData} onChange={handleChange} errors={{}} />
      </MemoryRouter>,
    )

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)

    expect(handleChange).toHaveBeenCalledWith({
      uploadedDocs: {},
    })
  })

  describe('validateStep3Documents', () => {
    it('returns error when quotation is missing', () => {
      const res = validateStep3Documents({ uploadedDocs: {} })
      expect(res.isValid).toBe(false)
      expect(res.errors.machinery_quotation).toBe(
        'Machinery Quotation / Proforma Invoice is required',
      )
    })

    it('passes when machinery_quotation is uploaded', () => {
      const res = validateStep3Documents({
        uploadedDocs: {
          machinery_quotation: {
            id: 'machinery_quotation',
            name: 'quote.pdf',
            size: 1024,
            type: 'application/pdf',
          },
        },
      })
      expect(res.isValid).toBe(true)
      expect(res.errors).toEqual({})
    })
  })
})
