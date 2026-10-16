// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Documents } from '../../src/modules/loans/components/PropertyLoan/steps/Documents/Documents'
import { validateStep3Documents } from '../../src/modules/loans/validation/propertyLoanValidation'
import type { PropertyLoanData } from '../../src/modules/loans/types/propertyLoan.types'
import { INITIAL_PROPERTY_LOAN_DATA } from '../../src/modules/loans/components/PropertyLoan/propertyLoan.constants'

describe('Property Loan – Step 3 Property Documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders required and optional document cards matching user screenshot', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <Documents
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Sections
    expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
    expect(screen.getByText('OPTIONAL DOCUMENTS')).toBeInTheDocument()

    // Required Doc
    expect(screen.getByText('Property Ownership Document')).toBeInTheDocument()
    expect(screen.getByText('Title deed, allotment letter or land ownership proof')).toBeInTheDocument()

    // Optional Docs
    expect(screen.getByText('Construction Document (If Available)')).toBeInTheDocument()
    expect(screen.getByText('Contractor agreement, quotation or estimate if available')).toBeInTheDocument()

    expect(screen.getByText('Sanctioned Building Plan')).toBeInTheDocument()
    expect(screen.getByText('Approved architectural plan or municipal sanctioned layout')).toBeInTheDocument()

    expect(screen.getByText('Construction Cost Estimate')).toBeInTheDocument()
    expect(screen.getByText('Civil work estimate or architect valuation')).toBeInTheDocument()

    expect(screen.getByText('Additional Property Document')).toBeInTheDocument()
    expect(screen.getByText('Any additional land records or construction permits')).toBeInTheDocument()

    // Pending count note
    expect(screen.getByTestId('prop-docs-pending-note')).toHaveTextContent(
      'Upload the 1 pending required document to continue.',
    )
  })

  it('renders uploaded state with formatted size and action buttons', () => {
    const handleChange = vi.fn()
    const mockDataWithUpload: PropertyLoanData = {
      ...INITIAL_PROPERTY_LOAN_DATA,
      uploadedDocs: {
        property_ownership: {
          id: 'property_ownership',
          name: 'title_deed.pdf',
          size: 1024 * 350,
          type: 'application/pdf',
          status: 'uploaded',
          uploadedAt: '2026-10-15T10:00:00Z',
        },
      },
    }

    render(
      <MemoryRouter>
        <Documents
          data={mockDataWithUpload}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(/title_deed\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/350\.0 KB/)).toBeInTheDocument()
    expect(screen.queryByTestId('prop-docs-pending-note')).not.toBeInTheDocument()
  })

  it('validates Step 3 documents accurately (required presence, file size, mime type)', () => {
    // 1. Missing required doc
    const emptyResult = validateStep3Documents(INITIAL_PROPERTY_LOAN_DATA)
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.property_ownership).toBe('Property Ownership Document is required')
    expect(emptyResult.error).toBe('Upload the 1 pending required document to continue.')

    // 2. Oversized file (>10MB)
    const oversizedResult = validateStep3Documents({
      ...INITIAL_PROPERTY_LOAN_DATA,
      uploadedDocs: {
        property_ownership: {
          id: 'property_ownership',
          name: 'huge_deed.pdf',
          size: 12 * 1024 * 1024,
          type: 'application/pdf',
          status: 'uploaded',
        },
      },
    })
    expect(oversizedResult.isValid).toBe(false)
    expect(oversizedResult.errors.property_ownership).toContain('exceeds maximum allowed size of 10MB')

    // 3. Invalid file extension (.exe)
    const invalidExtResult = validateStep3Documents({
      ...INITIAL_PROPERTY_LOAN_DATA,
      uploadedDocs: {
        property_ownership: {
          id: 'property_ownership',
          name: 'virus.exe',
          size: 50000,
          type: 'application/x-msdownload',
          status: 'uploaded',
        },
      },
    })
    expect(invalidExtResult.isValid).toBe(false)
    expect(invalidExtResult.errors.property_ownership).toContain('must be a PDF or image file')

    // 4. Valid upload
    const validResult = validateStep3Documents({
      ...INITIAL_PROPERTY_LOAN_DATA,
      uploadedDocs: {
        property_ownership: {
          id: 'property_ownership',
          name: 'sale_deed.pdf',
          size: 2 * 1024 * 1024,
          type: 'application/pdf',
          status: 'uploaded',
        },
      },
    })
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
