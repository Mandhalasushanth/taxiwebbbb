// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Documents } from '../../src/modules/loans/components/HomeLoan/steps/Documents/Documents'
import { validateStep3Documents } from '../../src/modules/loans/validation/homeLoanValidation'
import type { HomeLoanData } from '../../src/modules/loans/types/homeLoan.types'
import { INITIAL_HOME_LOAN_DATA } from '../../src/modules/loans/components/HomeLoan/homeLoan.constants'

describe('Home Loan – Step 3 Property Documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders required and optional document cards matching user specification', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <Documents
          data={INITIAL_HOME_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Sections
    expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
    expect(screen.getByText('OPTIONAL DOCUMENTS')).toBeInTheDocument()

    // Required Docs
    expect(screen.getByText('Property / Sale Agreement Document')).toBeInTheDocument()
    expect(screen.getByText('Upload the property document available with you.')).toBeInTheDocument()

    expect(screen.getByText('Bank Statement / Income Document')).toBeInTheDocument()
    expect(
      screen.getByText('Latest 6 months bank statement showing regular credits or operational funds'),
    ).toBeInTheDocument()

    // Optional Docs
    expect(screen.getByText('Property Quotation / Builder Document')).toBeInTheDocument()
    expect(screen.getByText('Builder quotation, cost sheet or demand letter if available')).toBeInTheDocument()

    expect(screen.getByText('Additional Property Document')).toBeInTheDocument()
    expect(
      screen.getByText('Any other property records, tax receipts or possession letters'),
    ).toBeInTheDocument()

    // Pending count note
    expect(
      screen.getByText('Upload the 2 pending required documents to continue.'),
    ).toBeInTheDocument()
  })

  it('renders uploaded state with filename and size when documents are provided', () => {
    const handleChange = vi.fn()
    const dataWithDoc: HomeLoanData = {
      ...INITIAL_HOME_LOAN_DATA,
      uploadedDocs: {
        property_sale_agreement: {
          id: 'property_sale_agreement',
          name: 'sale_deed.pdf',
          size: 204800,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
          file: new File(['mock content'], 'sale_deed.pdf', { type: 'application/pdf' }),
        },
      },
    }

    render(
      <MemoryRouter>
        <Documents
          data={dataWithDoc}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(/sale_deed\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/200\.0 KB/)).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    // Now only 1 pending required doc
    expect(
      screen.getByText('Upload the 1 pending required document to continue.'),
    ).toBeInTheDocument()
  })

  it('validates Step 3 documents accurately (flags missing required documents, passes when uploaded)', () => {
    // 1. Missing all required docs
    const emptyResult = validateStep3Documents(INITIAL_HOME_LOAN_DATA)
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.property_sale_agreement).toBeDefined()
    expect(emptyResult.errors.bank_statement_income).toBeDefined()
    expect(emptyResult.error).toBe('Upload the 2 pending required documents to continue.')

    // 2. Only 1 uploaded
    const partialResult = validateStep3Documents({
      ...INITIAL_HOME_LOAN_DATA,
      uploadedDocs: {
        property_sale_agreement: {
          id: 'property_sale_agreement',
          name: 'agreement.pdf',
          size: 1024,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
      },
    })
    expect(partialResult.isValid).toBe(false)
    expect(partialResult.errors.bank_statement_income).toBeDefined()
    expect(partialResult.errors.property_sale_agreement).toBeUndefined()
    expect(partialResult.error).toBe('Upload the 1 pending required document to continue.')

    // 3. Oversized file (>10MB)
    const oversizedResult = validateStep3Documents({
      ...INITIAL_HOME_LOAN_DATA,
      uploadedDocs: {
        property_sale_agreement: {
          id: 'property_sale_agreement',
          name: 'agreement.pdf',
          size: 15 * 1024 * 1024,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
        bank_statement_income: {
          id: 'bank_statement_income',
          name: 'bank.pdf',
          size: 2048,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
      },
    })
    expect(oversizedResult.isValid).toBe(false)
    expect(oversizedResult.errors.property_sale_agreement).toContain('exceeds maximum allowed size of 10MB')

    // 4. Invalid file format (e.g. .exe or .txt)
    const invalidTypeResult = validateStep3Documents({
      ...INITIAL_HOME_LOAN_DATA,
      uploadedDocs: {
        property_sale_agreement: {
          id: 'property_sale_agreement',
          name: 'agreement.exe',
          size: 1024,
          type: 'application/x-msdownload',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
        bank_statement_income: {
          id: 'bank_statement_income',
          name: 'bank.pdf',
          size: 2048,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
      },
    })
    expect(invalidTypeResult.isValid).toBe(false)
    expect(invalidTypeResult.errors.property_sale_agreement).toContain('must be a PDF or image file')

    // 5. Both required uploaded and valid
    const completeResult = validateStep3Documents({
      ...INITIAL_HOME_LOAN_DATA,
      uploadedDocs: {
        property_sale_agreement: {
          id: 'property_sale_agreement',
          name: 'agreement.pdf',
          size: 1024,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
        bank_statement_income: {
          id: 'bank_statement_income',
          name: 'bank.pdf',
          size: 2048,
          type: 'application/pdf',
          uploadedAt: '2026-10-15T10:00:00.000Z',
        },
      },
    })
    expect(completeResult.isValid).toBe(true)
    expect(Object.keys(completeResult.errors).length).toBe(0)
    expect(completeResult.error).toBeUndefined()
  })
})
