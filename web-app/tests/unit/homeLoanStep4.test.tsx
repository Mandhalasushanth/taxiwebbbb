// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ReviewAndSubmit } from '../../src/modules/loans/components/HomeLoan/steps/ReviewAndSubmit/ReviewAndSubmit'
import { validateStep4Review } from '../../src/modules/loans/validation/homeLoanValidation'
import { INITIAL_HOME_LOAN_DATA } from '../../src/modules/loans/components/HomeLoan/homeLoan.constants'
import type { HomeLoanData } from '../../src/modules/loans/types/homeLoan.types'
import type { VerifiedCustomerDetails } from '../../src/modules/loans/types'

const MOCK_CUSTOMER: VerifiedCustomerDetails = {
  fullName: 'Vani',
  mobile: '9030045048',
  email: 'vani@gmail.com',
  pan: 'HGFDH8523V',
  aadhaar: 'XXXX XXXX 5217',
  dob: '02-02-2000',
  isVerified: true,
}

const VALID_HOME_LOAN_DATA: HomeLoanData = {
  ...INITIAL_HOME_LOAN_DATA,
  currentAddress: {
    houseBuilding: 'Flat 402, Sunrise Apartments',
    streetLocality: 'MG Road, Near City Mall',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
  },
  permanentSameAsCurrent: 'yes',
  kycConsent: true,
  requestedLoanAmount: '25,00,000',
  loanPurpose: 'Purchase a New Home',
  propertyStatus: 'Property Identified',
  approximatePropertyValue: '85,65,95,964',
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
      name: 'statement.pdf',
      size: 2048,
      type: 'application/pdf',
      uploadedAt: '2026-10-15T10:00:00.000Z',
    },
  },
  termsAccepted: true,
}

describe('Home Loan – Step 4 Review & Submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all review dossier cards matching user specification and triggers navigation on Edit click', () => {
    const handleNavigate = vi.fn()
    const handleChange = vi.fn()

    render(
      <ReviewAndSubmit
        data={VALID_HOME_LOAN_DATA}
        customer={MOCK_CUSTOMER}
        onChange={handleChange}
        onNavigateToStep={handleNavigate}
        errors={{}}
      />,
    )

    // 1. Applicant Details Card
    expect(screen.getByText('Applicant Details')).toBeInTheDocument()
    expect(screen.getByText('Vani')).toBeInTheDocument()
    expect(screen.getByText('+91 9030045048')).toBeInTheDocument()
    expect(screen.getByText('vani@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('HGFDH8523V')).toBeInTheDocument()
    expect(screen.getByText('XXXX XXXX 5217')).toBeInTheDocument()
    expect(screen.getByText('02-02-2000')).toBeInTheDocument()
    expect(screen.getByText('Same as current address')).toBeInTheDocument()

    // 2. Home Loan Requirement Card
    expect(screen.getByText('Home Loan Requirement')).toBeInTheDocument()
    expect(screen.getByText('Home Loan')).toBeInTheDocument()
    expect(screen.getByText('₹25,00,000')).toBeInTheDocument()
    expect(screen.getByText('Purchase a New Home')).toBeInTheDocument()
    expect(screen.getByText('Property Identified')).toBeInTheDocument()
    expect(screen.getByText('₹85,65,95,964')).toBeInTheDocument()

    // 3. Documents Card
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 required documents uploaded')).toBeInTheDocument()
    expect(screen.getByText('Property / Sale Agreement Document')).toBeInTheDocument()
    expect(screen.getByText('Bank Statement / Income Document')).toBeInTheDocument()

    // 4. Applicant Declaration Card
    expect(screen.getByText('Applicant Declaration')).toBeInTheDocument()
    expect(
      screen.getByText(
        'I confirm that the information provided in this application is accurate and complete.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Agent Review • Verified Lending Partners • Zero Upfront Charges'),
    ).toBeInTheDocument()

    // Verify Edit buttons trigger correct step navigation
    const editApplicantBtn = screen.getByRole('button', { name: 'Edit Applicant Details' })
    fireEvent.click(editApplicantBtn)
    expect(handleNavigate).toHaveBeenCalledWith(1)

    const editRequirementBtn = screen.getByRole('button', { name: 'Edit Home Loan Requirement' })
    fireEvent.click(editRequirementBtn)
    expect(handleNavigate).toHaveBeenCalledWith(2)

    const editDocumentsBtn = screen.getByRole('button', { name: 'Edit Documents' })
    fireEvent.click(editDocumentsBtn)
    expect(handleNavigate).toHaveBeenCalledWith(3)
  })

  it('toggles Applicant Declaration checkbox when clicked', () => {
    const handleChange = vi.fn()
    render(
      <ReviewAndSubmit
        data={{ ...VALID_HOME_LOAN_DATA, termsAccepted: false }}
        customer={MOCK_CUSTOMER}
        onChange={handleChange}
        onNavigateToStep={vi.fn()}
        errors={{}}
      />,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ termsAccepted: true }))
  })

  it('validates Step 4 review pre-flight checks (requires valid steps 1-3 and declaration accepted)', () => {
    // 1. Missing declaration
    const missingDeclResult = validateStep4Review({
      ...VALID_HOME_LOAN_DATA,
      termsAccepted: false,
    })
    expect(missingDeclResult.isValid).toBe(false)
    expect(missingDeclResult.errors.termsAccepted).toBeDefined()

    // 2. Missing documents fails pre-flight
    const missingDocsResult = validateStep4Review({
      ...VALID_HOME_LOAN_DATA,
      uploadedDocs: {},
    })
    expect(missingDocsResult.isValid).toBe(false)
    expect(missingDocsResult.errors.property_sale_agreement).toBeDefined()
    expect(missingDocsResult.error).toContain('Property Documents need attention')

    // 3. Invalid requirement fails pre-flight
    const invalidReqResult = validateStep4Review({
      ...VALID_HOME_LOAN_DATA,
      loanPurpose: '',
    })
    expect(invalidReqResult.isValid).toBe(false)
    expect(invalidReqResult.errors.loanPurpose).toBeDefined()
    expect(invalidReqResult.error).toContain('Home Loan Requirement need attention')

    // 4. Invalid KYC address fails pre-flight
    const invalidKycResult = validateStep4Review({
      ...VALID_HOME_LOAN_DATA,
      currentAddress: { ...VALID_HOME_LOAN_DATA.currentAddress, houseBuilding: '' },
    })
    expect(invalidKycResult.isValid).toBe(false)
    expect(invalidKycResult.errors['currentAddress.houseBuilding']).toBeDefined()
    expect(invalidKycResult.error).toContain('KYC Verification need attention')

    // 5. Fully valid application
    const validResult = validateStep4Review(VALID_HOME_LOAN_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
