// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { validateStep3Documents } from '../../src/modules/loans/validation/businessWorkingCapitalValidation'
import { INITIAL_BWC_DATA } from '../../src/modules/loans/components/BusinessWorkingCapital/businessWorkingCapital.constants'
import { Documents } from '../../src/modules/loans/components/BusinessWorkingCapital/steps/Documents/Documents'

const MOCK_DOC = {
  name: 'sample_document.pdf',
  size: '1.2 MB',
  uploadedAt: '2026-10-14T10:00:00.000Z',
}

const VALID_BUSINESS_DOCS = {
  panCard: MOCK_DOC,
  businessRegistrationProof: MOCK_DOC,
}

const VALID_WC_DOCS = {
  panCard: MOCK_DOC,
  bankStatements: MOCK_DOC,
  businessLicenseProof: MOCK_DOC,
}

describe('Business & Working Capital – Step 3 Documents', () => {
  afterEach(cleanup)

  it('fails when business loan mandatory documents are not uploaded', () => {
    const result = validateStep3Documents({ ...INITIAL_BWC_DATA, financingFacility: 'business-loan' })
    expect(result.isValid).toBe(false)
    expect(result.errors.panCard).toMatch(/PAN Card/)
    expect(result.errors.businessRegistrationProof).toMatch(/Business Registration Proof/)
    expect(result.error).toMatch(/2 pending required documents/)
  })

  it('passes when business loan uploads both required documents', () => {
    const data = {
      ...INITIAL_BWC_DATA,
      financingFacility: 'business-loan' as const,
      uploadedDocs: VALID_BUSINESS_DOCS,
    }
    const result = validateStep3Documents(data)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('fails when working capital mandatory documents are not uploaded', () => {
    const result = validateStep3Documents({ ...INITIAL_BWC_DATA, financingFacility: 'working-capital' })
    expect(result.isValid).toBe(false)
    expect(result.errors.panCard).toMatch(/PAN Card/)
    expect(result.errors.bankStatements).toMatch(/Bank Statement/)
    expect(result.errors.businessLicenseProof).toMatch(/License/)
    expect(result.error).toMatch(/3 pending required documents/)
  })

  it('passes when working capital uploads all 3 required documents', () => {
    const data = {
      ...INITIAL_BWC_DATA,
      financingFacility: 'working-capital' as const,
      uploadedDocs: VALID_WC_DOCS,
    }
    const result = validateStep3Documents(data)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('renders document checklist sections and the 4 business loan upload cards in the DOM', () => {
    render(
      <Documents
        data={{ ...INITIAL_BWC_DATA, financingFacility: 'business-loan' }}
        onChange={() => {}}
        errors={{}}
      />,
    )
    expect(screen.getByTestId('bwc-step-documents')).toBeInTheDocument()
    expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
    expect(screen.getByText('OPTIONAL DOCUMENTS')).toBeInTheDocument()
    expect(screen.getByText('Business / Promoter PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Business Registration Proof')).toBeInTheDocument()
    expect(screen.getByText('Business Bank Statement (Last 6 Months)')).toBeInTheDocument()
    expect(screen.getByText('Equipment Quotation / Project Estimate')).toBeInTheDocument()
  })

  it('renders document checklist sections and the 4 working capital upload cards in the DOM', () => {
    render(
      <Documents
        data={{ ...INITIAL_BWC_DATA, financingFacility: 'working-capital' }}
        onChange={() => {}}
        errors={{}}
      />,
    )
    expect(screen.getByTestId('bwc-step-documents')).toBeInTheDocument()
    expect(screen.getByText('Business / Promoter PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Business Bank Statement (Last 12 Months)')).toBeInTheDocument()
    expect(screen.getByText('Business License / Trade Proof')).toBeInTheDocument()
    expect(screen.getByText('Audited Financials / P&L (Last 2 Years)')).toBeInTheDocument()
  })
})
