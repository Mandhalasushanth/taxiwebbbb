// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ReviewAndSubmit } from '../../src/modules/loans/components/PropertyLoan/steps/ReviewAndSubmit/ReviewAndSubmit'
import { validateStep4Review } from '../../src/modules/loans/validation/propertyLoanValidation'
import type { PropertyLoanData } from '../../src/modules/loans/types/propertyLoan.types'
import type { VerifiedCustomerDetails } from '../../src/modules/loans/types'

const MOCK_CUSTOMER: VerifiedCustomerDetails = {
  fullName: 'Shashiprakash',
  mobile: '9347074726',
  email: 'shashiprakash.paladugu@gmail.com',
  pan: 'HFGPP3149F',
  aadhaar: '999988888265',
  dob: '2000-01-01',
  isVerified: true,
}

const MOCK_VALID_DATA: PropertyLoanData = {
  currentAddress: {
    houseBuilding: 'Hhnnn',
    streetLocality: 'Hnk',
    city: 'Hanamkonda',
    pincode: '506001',
    state: 'Telangana',
  },
  permanentSameAsCurrent: 'yes',
  permanentAddress: {
    houseBuilding: '',
    streetLocality: '',
    city: '',
    pincode: '',
    state: '',
  },
  kycConsent: true,

  requestedLoanAmount: '65,69,958',
  loanPurpose: 'Home Construction',
  constructionStage: 'Planning Stage',
  propertyType: 'Plot',
  city: 'Hanamkonda',
  state: 'Telangana',
  pincode: '506001',
  propertyOwnership: 'Self',

  uploadedDocs: {
    property_ownership: {
      id: 'property_ownership',
      name: 'title_deed.pdf',
      size: 1024 * 500,
      type: 'application/pdf',
      status: 'uploaded',
    },
  },
  termsAccepted: true,
}

describe('Property Loan – Step 4 Review & Submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all 4 review cards and applicant declaration matching user screenshots', () => {
    const handleNavigate = vi.fn()
    const handleChange = vi.fn()

    render(
      <MemoryRouter>
        <ReviewAndSubmit
          data={MOCK_VALID_DATA}
          customer={MOCK_CUSTOMER}
          onChange={handleChange}
          onNavigateToStep={handleNavigate}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Card 1: Applicant Details
    expect(screen.getByRole('heading', { level: 2, name: 'Applicant Details' })).toBeInTheDocument()
    expect(screen.getByText('Shashiprakash')).toBeInTheDocument()
    expect(screen.getByText('+91 9347074726')).toBeInTheDocument()
    expect(screen.getByText('shashiprakash.paladugu@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('HFGPP3149F')).toBeInTheDocument()
    expect(screen.getByText('XXXX XXXX 8265')).toBeInTheDocument()
    expect(screen.getByText('01-01-2000')).toBeInTheDocument()
    expect(screen.getByText('Same as current address')).toBeInTheDocument()

    // Card 2: Loan Requirement
    expect(screen.getByRole('heading', { level: 2, name: 'Loan Requirement' })).toBeInTheDocument()
    expect(screen.getByText('Property Loan')).toBeInTheDocument()
    expect(screen.getByText('₹65,69,958')).toBeInTheDocument()
    expect(screen.getByText('Home Construction')).toBeInTheDocument()
    expect(screen.getByText('Planning Stage')).toBeInTheDocument()

    // Card 3: Property Details
    expect(screen.getByRole('heading', { level: 2, name: 'Property Details' })).toBeInTheDocument()
    expect(screen.getByText('Plot')).toBeInTheDocument()
    expect(screen.getAllByText('Hanamkonda').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Telangana').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('506001').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Self')).toBeInTheDocument()

    // Card 4: Documents
    expect(screen.getByRole('heading', { level: 2, name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByText('1 of 1 required documents uploaded')).toBeInTheDocument()
    expect(screen.getByText('Property Ownership Document')).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Construction Document (If Available)')).toBeInTheDocument()
    expect(screen.getAllByText('Optional').length).toBe(4)

    // Card 5: Applicant Declaration
    expect(screen.getByText('Applicant Declaration')).toBeInTheDocument()
    expect(
      screen.getByText('I confirm that the information provided in this application is accurate and complete.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Agent Review • Verified Lending Partners • Zero Upfront Charges'),
    ).toBeInTheDocument()
  })

  it('triggers onNavigateToStep when clicking Edit buttons on review cards', () => {
    const handleNavigate = vi.fn()
    render(
      <MemoryRouter>
        <ReviewAndSubmit
          data={MOCK_VALID_DATA}
          customer={MOCK_CUSTOMER}
          onNavigateToStep={handleNavigate}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit Applicant Details' }))
    expect(handleNavigate).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Loan Requirement' }))
    expect(handleNavigate).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Property Details' }))
    expect(handleNavigate).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Documents' }))
    expect(handleNavigate).toHaveBeenCalledWith(3)
  })

  it('validates Step 4 review requirements (declaration consent and prior step checks)', () => {
    // 1. Missing declaration
    const missingDeclResult = validateStep4Review({
      ...MOCK_VALID_DATA,
      termsAccepted: false,
      declarationAgreed: false,
    })
    expect(missingDeclResult.isValid).toBe(false)
    expect(missingDeclResult.errors.termsAccepted).toBeDefined()

    // 2. Prior Step 2 missing field
    const brokenStep2Result = validateStep4Review({
      ...MOCK_VALID_DATA,
      requestedLoanAmount: '',
      requiredAmount: '',
    })
    expect(brokenStep2Result.isValid).toBe(false)
    expect(brokenStep2Result.error).toContain('Property & Loan Details')

    // 3. Fully valid
    const validResult = validateStep4Review(MOCK_VALID_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
