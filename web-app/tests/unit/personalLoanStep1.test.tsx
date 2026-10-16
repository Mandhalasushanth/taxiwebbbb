// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PersonalLoan } from '../../src/modules/loans/components/PersonalLoan/PersonalLoan'
import { KycVerification } from '../../src/modules/loans/components/PersonalLoan/steps/KycVerification/KycVerification'
import { validateStep1KycVerification } from '../../src/modules/loans/validation/personalLoanValidation'
import type { KycStepData, VerifiedCustomerDetails } from '../../src/modules/loans/types'

const MOCK_CUSTOMER: VerifiedCustomerDetails = {
  fullName: 'Vani',
  mobile: '9030045048',
  email: 'vani@gmail.com',
  pan: 'HGFDH8523V',
  aadhaar: '999988887777',
  dob: '02-02-2000',
  isVerified: true,
}

const MOCK_KYC_DATA: KycStepData = {
  currentAddress: {
    houseBuilding: 'Flat 402, Sunrise Apartments',
    streetLocality: 'MG Road, Near City Mall',
    city: 'Patna',
    pincode: '800001',
    state: 'Bihar',
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
}

describe('Personal Loan – Step 1 KYC Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders read-only Verified Customer Details matching KYC records', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <KycVerification
          data={MOCK_KYC_DATA}
          customer={MOCK_CUSTOMER}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Verified Customer Details')).toBeInTheDocument()
    expect(screen.getByText('Details fetched from KYC')).toBeInTheDocument()
    expect(
      screen.getByText('Identity information fetched from verified KYC records cannot be edited.'),
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText('Full Legal Name') as HTMLInputElement
    expect(nameInput.value).toBe('Vani')
    expect(nameInput.readOnly).toBe(true)

    const mobileInput = screen.getByLabelText('Mobile Number') as HTMLInputElement
    expect(mobileInput.value).toBe('+91 9030045048')
    expect(mobileInput.readOnly).toBe(true)

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement
    expect(emailInput.value).toBe('vani@gmail.com')

    const panInput = screen.getByLabelText('PAN Number') as HTMLInputElement
    expect(panInput.value).toBe('HGFDH8523V')

    const dobInput = screen.getByLabelText('Date of Birth') as HTMLInputElement
    expect(dobInput.value).toBe('02-02-2000')
  })

  it('renders Address Details and toggles Permanent Address when selecting "No"', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <KycVerification
          data={MOCK_KYC_DATA}
          customer={MOCK_CUSTOMER}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Address Details')).toBeInTheDocument()
    expect(screen.getByText('Current Address')).toBeInTheDocument()
    expect(screen.getByLabelText(/House \/ Flat \/ Building/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Street \/ Locality \/ Landmark/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/City \/ District/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument()

    // Initially "Permanent Address" heading is not rendered because same as current is "yes"
    expect(screen.queryByText('Permanent Address')).not.toBeInTheDocument()

    // Click "No" for permanent address toggle
    const noBtn = screen.getByRole('radio', { name: 'No' })
    fireEvent.click(noBtn)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ permanentSameAsCurrent: 'no' }),
    )

    // Re-render with permanentSameAsCurrent = 'no'
    rerender(
      <MemoryRouter>
        <KycVerification
          data={{ ...MOCK_KYC_DATA, permanentSameAsCurrent: 'no' }}
          customer={MOCK_CUSTOMER}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Permanent Address')).toBeInTheDocument()
  })

  it('validates Step 1 KYC accurately (required fields, junk text, state mismatch, and consent)', () => {
    // Empty data validation
    const emptyResult = validateStep1KycVerification({
      currentAddress: { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' },
      permanentSameAsCurrent: 'yes',
      permanentAddress: { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' },
      kycConsent: false,
    })
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors['currentAddress.houseBuilding']).toBeDefined()
    expect(emptyResult.errors['currentAddress.city']).toBeDefined()
    expect(emptyResult.errors['currentAddress.pincode']).toBeDefined()
    expect(emptyResult.errors['currentAddress.state']).toBeDefined()
    expect(emptyResult.errors.kycConsent).toBeDefined()

    // Pincode and state mismatch validation
    const mismatchResult = validateStep1KycVerification({
      ...MOCK_KYC_DATA,
      currentAddress: {
        ...MOCK_KYC_DATA.currentAddress,
        pincode: '110001', // Delhi pincode
        state: 'Bihar',
      },
    })
    expect(mismatchResult.isValid).toBe(false)
    expect(mismatchResult.errors['currentAddress.pincode']).toBeDefined()

    // Valid data
    const validResult = validateStep1KycVerification(MOCK_KYC_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })

  it('renders the complete Personal Loan page with title and FlowStepper', () => {
    render(
      <MemoryRouter>
        <PersonalLoan />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Personal Loan' })).toBeInTheDocument()
    expect(screen.getByTestId('pl-step-kyc')).toBeInTheDocument()
  })
})
