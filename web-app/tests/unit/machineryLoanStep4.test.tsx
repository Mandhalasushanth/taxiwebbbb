// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ReviewAndDeclaration } from '../../src/modules/loans/components/MachineryLoan/steps/ReviewAndDeclaration/ReviewAndDeclaration'
import { validateStep4ReviewAndDeclaration } from '../../src/modules/loans/validation/machineryLoanValidation'
import type { MachineryLoanData } from '../../src/modules/loans/types/machineryLoan.types'
import { INITIAL_MACHINERY_LOAN_DATA } from '../../src/modules/loans/components/MachineryLoan/machineryLoan.constants'

const MOCK_CUSTOMER = {
  fullName: 'Sushanth',
  mobile: '9030045048',
  email: 'mandhalasushanth@gmail.com',
  pan: 'PFMPS0972B',
  aadhaar: 'XXXX XXXX 8949',
  dob: '2000-01-21',
}

const BASE_REVIEW_DATA: MachineryLoanData = {
  ...INITIAL_MACHINERY_LOAN_DATA,
  currentAddress: {
    houseBuilding: 'Vxbxnb',
    streetLocality: 'Vxbxnb, Sghdh',
    city: 'Delhi',
    state: 'Delhi (NCT)',
    pincode: '950998',
  },
  permanentSameAsCurrent: 'yes',
  requestedLoanAmount: '95,95,989',
  loanAmount: '95,95,989',
  machineryType: 'Packaging Machinery',
  machineryNameDescription: 'Bxbxncj',
  machineryCondition: 'New',
  machineryPurchaseType: 'Authorized Dealer',
  approximateMachineryCost: '98,98,989',
  dealerSupplierName: 'Bxbx',
  uploadedDocs: {
    machinery_quotation: {
      id: 'machinery_quotation',
      name: 'invoice.pdf',
      size: 1024,
      type: 'application/pdf',
    },
  },
  termsAccepted: false,
}

describe('Machinery Loan – Step 4 Review & Declaration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all review sections matching Screenshots 1 & 2', () => {
    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={BASE_REVIEW_DATA}
          customer={MOCK_CUSTOMER}
          onChange={vi.fn()}
          onNavigateToStep={vi.fn()}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // 1. Applicant Details Card
    expect(screen.getByRole('heading', { level: 2, name: 'Applicant Details' })).toBeInTheDocument()
    expect(screen.getByText('Name, contact, PAN, Aadhaar and address')).toBeInTheDocument()
    expect(screen.getByText('Sushanth')).toBeInTheDocument()
    expect(screen.getByText('+91 9030045048')).toBeInTheDocument()
    expect(screen.getByText('mandhalasushanth@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('PFMPS0972B')).toBeInTheDocument()
    expect(screen.getByText('XXXX XXXX 8949')).toBeInTheDocument()
    expect(screen.getByText('21-01-2000')).toBeInTheDocument()
    expect(screen.getByText(/Vxbxnb, Vxbxnb, Sghdh, Delhi, Delhi \(NCT\), 950998/)).toBeInTheDocument()
    expect(screen.getByText('Same as current address')).toBeInTheDocument()

    // 2. Machinery & Loan Details Card
    expect(screen.getByRole('heading', { level: 2, name: 'Machinery & Loan Details' })).toBeInTheDocument()
    expect(screen.getByText('Machinery selection and financing requirement')).toBeInTheDocument()
    expect(screen.getByText('Packaging Machinery')).toBeInTheDocument()
    expect(screen.getByText('Bxbxncj')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Authorized Dealer')).toBeInTheDocument()
    expect(screen.getByText('₹95,95,989')).toBeInTheDocument()
    expect(screen.getByText('₹98,98,989')).toBeInTheDocument()
    expect(screen.getByText('Bxbx')).toBeInTheDocument()

    // 3. Documents Card
    expect(screen.getByRole('heading', { level: 2, name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByText('1 of 1 required documents uploaded')).toBeInTheDocument()
    expect(screen.getByText('Machinery Quotation / Proforma Invoice')).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()

    // 4. Declaration Card
    expect(screen.getByText('Applicant Declaration')).toBeInTheDocument()
    expect(
      screen.getByText(
        'I confirm that the information provided in this application is accurate and complete.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Agent Review • Verified Lending Partners • Zero Upfront Charges'),
    ).toBeInTheDocument()
  })

  it('navigates to step 1, 2, or 3 when clicking the respective Edit buttons', () => {
    const handleNavigate = vi.fn()
    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={BASE_REVIEW_DATA}
          customer={MOCK_CUSTOMER}
          onChange={vi.fn()}
          onNavigateToStep={handleNavigate}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons).toHaveLength(3)

    // Click Edit on Applicant Details
    fireEvent.click(editButtons[0])
    expect(handleNavigate).toHaveBeenCalledWith(1)

    // Click Edit on Machinery & Loan Details
    fireEvent.click(editButtons[1])
    expect(handleNavigate).toHaveBeenCalledWith(2)

    // Click Edit on Documents
    fireEvent.click(editButtons[2])
    expect(handleNavigate).toHaveBeenCalledWith(3)
  })

  it('triggers onChange when applicant declaration checkbox is clicked', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={BASE_REVIEW_DATA}
          customer={MOCK_CUSTOMER}
          onChange={handleChange}
          onNavigateToStep={vi.fn()}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith({ termsAccepted: true })
  })

  describe('validateStep4ReviewAndDeclaration', () => {
    it('fails when declaration is not accepted', () => {
      const res = validateStep4ReviewAndDeclaration({ termsAccepted: false })
      expect(res.isValid).toBe(false)
      expect(res.errors.termsAccepted).toBe(
        'Please accept the declaration to submit your application.',
      )
    })

    it('passes when declaration is accepted', () => {
      const res = validateStep4ReviewAndDeclaration({ termsAccepted: true })
      expect(res.isValid).toBe(true)
      expect(res.errors).toEqual({})
    })
  })
})
