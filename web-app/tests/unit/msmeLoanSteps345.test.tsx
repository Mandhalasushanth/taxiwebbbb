// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Documents } from '../../src/modules/loans/components/MsmeLoan/steps/Documents/Documents'
import { ReviewAndSubmit } from '../../src/modules/loans/components/MsmeLoan/steps/ReviewAndSubmit/ReviewAndSubmit'
import { ApplicationSubmitted } from '../../src/modules/loans/components/MsmeLoan/steps/ApplicationSubmitted/ApplicationSubmitted'
import {
  validateStep3Documents,
  validateStep4ReviewAndDeclaration,
} from '../../src/modules/loans/validation/msmeLoanValidation'
import type { MsmeLoanData } from '../../src/modules/loans/types/msmeLoan.types'
import type { VerifiedCustomerDetails } from '../../src/modules/loans/types'

const MOCK_CUSTOMER: VerifiedCustomerDetails = {
  fullName: 'Aravind',
  mobile: '7386928105',
  email: 'aravind@gmail.com',
  pan: 'BAUPH4950Y',
  aadhaar: '999988886498',
  dob: '01-01-2000',
  isVerified: true,
}

const MOCK_COMPLETE_DATA: MsmeLoanData = {
  currentAddress: {
    houseBuilding: 'Flat 101, Green Valley',
    streetLocality: 'Karimnagar Main Road',
    city: 'Karimnagar',
    pincode: '664358',
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
  businessName: 'Jxbdn',
  businessConstitution: 'Proprietorship',
  businessActivity: 'Manufacturing',
  establishmentDate: '2003-10-12',
  operatingAddress: {
    houseBuilding: 'Vdbdj, Dhhdjfj',
    streetLocality: 'Dbjdj',
    city: 'Raipur',
    state: 'Chhattisgarh',
    pincode: '506465',
  },
  udyamStatus: 'Registered',
  udyamNumber: 'UDYAM-XX-00-0000000',
  gstStatus: 'Not Registered',
  gstin: '',
  annualTurnover: '64,686',
  avgMonthlySales: '5,000',
  requestedLoanAmount: '5,00,000',
  loanAmount: '5,00,000',
  loanPurpose: 'Working Capital',
  employees: '32',
  operatingDuration: '1–3 years',
  ownership: 'Sole Owner',
  uploadedDocs: {
    udyam_certificate: {
      id: 'udyam_certificate',
      name: 'Udyam_Registration.pdf',
      size: 1024 * 350,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    },
  },
  termsAccepted: true,
}

describe('MSME Loan – Steps 3, 4, 5', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  describe('Step 3: Documents', () => {
    it('renders Required Documents section and Udyam Registration Certificate upload card', () => {
      const handleChange = vi.fn()
      render(
        <MemoryRouter>
          <Documents data={{ ...MOCK_COMPLETE_DATA, uploadedDocs: {} }} onChange={handleChange} errors={{}} />
        </MemoryRouter>,
      )

      expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
      expect(screen.getByText('Udyam Registration Certificate')).toBeInTheDocument()
      expect(screen.getByText('Official Udyam Registration Certificate issued by Ministry of MSME')).toBeInTheDocument()
      expect(screen.getByTestId('upload-btn-udyam_certificate')).toBeInTheDocument()
    })

    it('renders uploaded document state with Replace and Remove options', () => {
      const handleChange = vi.fn()
      render(
        <MemoryRouter>
          <Documents data={MOCK_COMPLETE_DATA} onChange={handleChange} errors={{}} />
        </MemoryRouter>,
      )

      expect(screen.getByText(/Udyam_Registration\.pdf/)).toBeInTheDocument()
      expect(screen.getByText('Replace')).toBeInTheDocument()

      const removeBtn = screen.getByTestId('delete-doc-udyam_certificate')
      fireEvent.click(removeBtn)
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ uploadedDocs: {} }))
    })

    it('validates required documents in validateStep3Documents', () => {
      const invalidResult = validateStep3Documents({ uploadedDocs: {} })
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.udyam_certificate).toBeDefined()

      const validResult = validateStep3Documents(MOCK_COMPLETE_DATA)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual({})
    })
  })

  describe('Step 4: Review Your Application', () => {
    it('renders Applicant Details, MSME & Business Details, and Documents review cards matching screenshots', () => {
      const handleChange = vi.fn()
      const handleNavigate = vi.fn()
      render(
        <MemoryRouter>
          <ReviewAndSubmit
            data={MOCK_COMPLETE_DATA}
            customer={MOCK_CUSTOMER}
            onChange={handleChange}
            onNavigateToStep={handleNavigate}
            errors={{}}
          />
        </MemoryRouter>,
      )

      // Card 1: Applicant Details
      expect(screen.getByText('Applicant Details')).toBeInTheDocument()
      expect(screen.getByText('Aravind')).toBeInTheDocument()
      expect(screen.getByText('+91 7386928105')).toBeInTheDocument()
      expect(screen.getByText('aravind@gmail.com')).toBeInTheDocument()
      expect(screen.getByText('BAUPH4950Y')).toBeInTheDocument()
      expect(screen.getByText('XXXX XXXX 6498')).toBeInTheDocument()
      expect(screen.getByText('01-01-2000')).toBeInTheDocument()
      expect(screen.getByText('Same as current address')).toBeInTheDocument()

      // Card 2: MSME & Business Details
      expect(screen.getByText('MSME & Business Details')).toBeInTheDocument()
      expect(screen.getByText('Jxbdn')).toBeInTheDocument()
      expect(screen.getByText('Proprietorship')).toBeInTheDocument()
      expect(screen.getByText('Manufacturing')).toBeInTheDocument()
      expect(screen.getByText('12-10-2003')).toBeInTheDocument()
      expect(screen.getByText('UDYAM-XX-00-0000000')).toBeInTheDocument()
      expect(screen.getByText('Not Registered')).toBeInTheDocument()
      expect(screen.getByText('1–3 years')).toBeInTheDocument()
      expect(screen.getByText('32')).toBeInTheDocument()
      expect(screen.getByText('₹64,686')).toBeInTheDocument()
      expect(screen.getByText('Sole Owner')).toBeInTheDocument()

      // Card 3: Documents
      expect(screen.getByText('Documents')).toBeInTheDocument()
      expect(screen.getByText('1 of 1 required documents uploaded')).toBeInTheDocument()
      expect(screen.getByText('Uploaded')).toBeInTheDocument()

      // Navigation Edit buttons
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(3)

      fireEvent.click(editButtons[0])
      expect(handleNavigate).toHaveBeenCalledWith(1)

      fireEvent.click(editButtons[1])
      expect(handleNavigate).toHaveBeenCalledWith(2)

      fireEvent.click(editButtons[2])
      expect(handleNavigate).toHaveBeenCalledWith(3)
    })

    it('toggles Declaration & Authorization checkbox and validates termsAccepted', () => {
      const handleChange = vi.fn()
      const handleNavigate = vi.fn()
      render(
        <MemoryRouter>
          <ReviewAndSubmit
            data={{ ...MOCK_COMPLETE_DATA, termsAccepted: false }}
            customer={MOCK_CUSTOMER}
            onChange={handleChange}
            onNavigateToStep={handleNavigate}
            errors={{}}
          />
        </MemoryRouter>,
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith({ termsAccepted: true })

      const invalidResult = validateStep4ReviewAndDeclaration({ termsAccepted: false })
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.termsAccepted).toBeDefined()

      const validResult = validateStep4ReviewAndDeclaration({ termsAccepted: true })
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual({})
    })
  })

  describe('Step 5: Application Submitted', () => {
    it('renders Application Submitted confirmation screen matching Screenshot 3', () => {
      const handleGoHome = vi.fn()
      const handleContactSupport = vi.fn()

      render(
        <MemoryRouter>
          <ApplicationSubmitted
            referenceNumber="TXE-LN-304407"
            applicationType="MSME Loan"
            annualTurnover="64,686"
            submittedAt="2026-10-16T17:18:00Z"
            onGoHome={handleGoHome}
            onContactSupport={handleContactSupport}
          />
        </MemoryRouter>,
      )

      expect(screen.getByText('Application Submitted')).toBeInTheDocument()
      expect(screen.getByText('Your application is under review')).toBeInTheDocument()
      expect(
        screen.getByText('Our agent will review your application and come in contact with you soon.'),
      ).toBeInTheDocument()

      expect(screen.getByText('TXE-LN-304407')).toBeInTheDocument()
      expect(screen.getByText('MSME Loan')).toBeInTheDocument()
      expect(screen.getByText('₹64,686')).toBeInTheDocument()
      expect(screen.getByText('Under Review')).toBeInTheDocument()

      expect(screen.getByText('What happens next?')).toBeInTheDocument()
      expect(screen.getByText('Our agent will review your application.')).toBeInTheDocument()
      expect(
        screen.getByText('We may contact you if additional information is required.'),
      ).toBeInTheDocument()

      const goHomeBtn = screen.getByRole('button', { name: /Go to Home/i })
      fireEvent.click(goHomeBtn)
      expect(handleGoHome).toHaveBeenCalled()

      const supportBtn = screen.getByRole('button', { name: /Contact Support/i })
      fireEvent.click(supportBtn)
      expect(handleContactSupport).toHaveBeenCalled()
    })
  })
})
