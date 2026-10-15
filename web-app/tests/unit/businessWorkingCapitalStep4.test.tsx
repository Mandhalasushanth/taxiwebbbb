// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { validateStep4Review } from '../../src/modules/loans/validation/businessWorkingCapitalValidation'
import { INITIAL_BWC_DATA } from '../../src/modules/loans/components/BusinessWorkingCapital/businessWorkingCapital.constants'
import { ReviewAndSubmit } from '../../src/modules/loans/components/BusinessWorkingCapital/steps/ReviewAndSubmit/ReviewAndSubmit'

const MOCK_CUSTOMER = {
  fullName: 'Rajesh Kumar Sharma',
  mobile: '9876543210',
  email: 'rajesh.sharma@example.com',
  pan: 'ABCDE1234F',
  aadhaar: '123456789012',
  dob: '15/08/1985',
  isVerified: true,
}

const REVIEW_DATA = {
  ...INITIAL_BWC_DATA,
  financingFacility: 'business-loan' as const,
  businessName: 'Sharma Trading Co.',
  businessConstitution: 'proprietorship',
  businessActivity: 'trading',
  loanAmount: '25,00,000',
  loanPurpose: 'business-expansion',
  operatingAddress: 'Plot 45, Industrial Area, Sector 5',
  businessPincode: '560001',
  establishmentDate: '2015-06-01',
  purposeDescription: 'Opening a second outlet to increase sales',
  avgMonthlySales: '8,00,000',
  avgMonthlyExpenses: '5,50,000',
  currentAddress: {
    houseBuilding: 'Flat 402, Sunrise Apartments',
    streetLocality: 'MG Road',
    city: 'Bengaluru',
    pincode: '560001',
    state: 'Karnataka',
  },
  kycConsent: true,
  uploadedDocs: {
    panCard: { id: 'panCard', name: 'pan.pdf', size: 1024 },
    businessRegistrationProof: { id: 'businessRegistrationProof', name: 'udyam.pdf', size: 2048 },
  } as unknown as typeof INITIAL_BWC_DATA.uploadedDocs,
  termsAccepted: false,
}

describe('Business & Working Capital – Step 4 Review & Submit', () => {
  afterEach(cleanup)

  it('rejects submission when terms declaration is not accepted', () => {
    const result = validateStep4Review({ ...REVIEW_DATA, termsAccepted: false })
    expect(result.isValid).toBe(false)
    expect(result.errors.termsAccepted).toMatch(/declaration/)
  })

  it('passes validation when terms declaration is accepted', () => {
    const result = validateStep4Review({ ...REVIEW_DATA, termsAccepted: true })
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('renders all review dossier cards and triggers step navigation on edit click', () => {
    const onNavigateToStep = vi.fn()
    const onChange = vi.fn()

    render(
      <ReviewAndSubmit
        data={REVIEW_DATA}
        customer={MOCK_CUSTOMER}
        onChange={onChange}
        onNavigateToStep={onNavigateToStep}
        errors={{}}
      />,
    )

    expect(screen.getByTestId('bwc-step-review')).toBeInTheDocument()
    expect(screen.getByTestId('review-applicant-card')).toBeInTheDocument()
    expect(screen.getByTestId('review-business-card')).toBeInTheDocument()
    expect(screen.getByTestId('review-documents-card')).toBeInTheDocument()
    expect(screen.getByTestId('review-loan-card')).toBeInTheDocument()

    // Test navigation back to steps
    fireEvent.click(screen.getByRole('button', { name: /Edit Applicant Details/i }))
    expect(onNavigateToStep).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: /Edit Business Details/i }))
    expect(onNavigateToStep).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: /Edit Documents/i }))
    expect(onNavigateToStep).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole('button', { name: /Edit Loan Details/i }))
    expect(onNavigateToStep).toHaveBeenLastCalledWith(2)
    expect(onNavigateToStep).not.toHaveBeenCalledWith(4)
  })

  it('handles declaration checkbox change', () => {
    const onChange = vi.fn()
    render(
      <ReviewAndSubmit
        data={REVIEW_DATA}
        customer={MOCK_CUSTOMER}
        onChange={onChange}
        onNavigateToStep={() => {}}
        errors={{}}
      />,
    )

    const checkbox = screen.getByTestId('bwc-terms-checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledWith({ termsAccepted: true })
  })
})
