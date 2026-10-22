// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { MsmeAndBusinessDetails } from '../../src/modules/loans/components/MsmeLoan/steps/MsmeAndBusinessDetails'
import { validateStep2MsmeDetails } from '../../src/modules/loans/validation/msmeLoanValidation'
import type { MsmeLoanData } from '../../src/modules/loans/types/msmeLoan.types'

const MOCK_VALID_STEP2_DATA: MsmeLoanData = {
  currentAddress: {
    houseBuilding: 'Flat 402, Sunrise Apartments',
    streetLocality: 'MG Road',
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
  businessName: 'Apex Industrial Solutions',
  businessConstitution: 'Private Limited Company',
  businessActivity: 'Manufacturing',
  establishmentDate: '2019-04-15',
  operatingAddress: {
    houseBuilding: 'Plot 12B, Industrial Estate',
    streetLocality: 'Phase 1, Peenya',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
  },
  udyamStatus: 'Registered',
  udyamNumber: 'UDYAM-KR-03-0012345',
  gstStatus: 'Registered',
  gstin: '29ABCDE1234F1Z5',
  annualTurnover: '1,50,00,000',
  avgMonthlySales: '12,50,000',
  requestedLoanAmount: '25,00,000',
  loanAmount: '25,00,000',
  loanPurpose: 'Working Capital',
}

describe('MSME Loan – Step 2 MSME & Business Details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all 5 cards in Step 2: Business Details, Business Activity, Operating Address, MSME Registration, Business Information', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MsmeAndBusinessDetails data={MOCK_VALID_STEP2_DATA} onChange={handleChange} errors={{}} />
      </MemoryRouter>,
    )

    // Card 1
    expect(screen.getByText('Business Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/Business \/ Trade Name/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Business Constitution/ })).toBeInTheDocument()

    // Card 2
    expect(screen.getByText('Business Activity')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Primary Business Activity/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Business Establishment Date/)).toBeInTheDocument()

    // Card 3
    expect(screen.getByText('Business Operating Address')).toBeInTheDocument()
    expect(screen.getByLabelText(/House \/ Flat \/ Building/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Street \/ Locality \/ Landmark/)).toBeInTheDocument()
    expect(screen.getByLabelText(/City \/ District/)).toBeInTheDocument()
    expect(screen.getByLabelText(/State \/ Union Territory/)).toBeInTheDocument()
    expect(screen.getByLabelText(/PIN Code/)).toBeInTheDocument()

    // Card 4
    expect(screen.getByText('MSME Registration')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Udyam \/ MSME Registration Status/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /GST Registration Status/ })).toBeInTheDocument()

    // Card 5
    expect(screen.getByText('Business Information')).toBeInTheDocument()
    expect(screen.getByLabelText(/Annual Turnover/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Avg Monthly Sales/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Requested Loan Amount/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Loan Purpose/ })).toBeInTheDocument()
  })

  it('allows entering business name and selecting options', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, businessName: '', udyamStatus: 'Not Registered' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const nameInput = screen.getByPlaceholderText('Enter business name')
    fireEvent.change(nameInput, { target: { value: 'Global Tech Works' } })
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ businessName: 'Global Tech Works' }))
  })

  it('conditionally shows Udyam registration number input only when status is Registered', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, udyamStatus: 'Not Registered' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByPlaceholderText('UDYAM-XX-00-0000000')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, udyamStatus: 'Registered' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('UDYAM-XX-00-0000000')).toBeInTheDocument()
  })

  it('conditionally shows GSTIN input only when status is Registered', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, gstStatus: 'Exempt' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByPlaceholderText('e.g. 27ABCDE1234F1Z5')).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, gstStatus: 'Registered' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('e.g. 27ABCDE1234F1Z5')).toBeInTheDocument()
  })

  it('formats amounts with commas and ₹ prefix', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MsmeAndBusinessDetails
          data={{ ...MOCK_VALID_STEP2_DATA, annualTurnover: '' }}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const turnoverInput = screen.getByPlaceholderText('Enter annual turnover')
    fireEvent.change(turnoverInput, { target: { value: '5000000' } })
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ annualTurnover: '50,00,000' }))
  })

  describe('validateStep2MsmeDetails validation logic', () => {
    it('passes with complete and valid Step 2 data', () => {
      const result = validateStep2MsmeDetails(MOCK_VALID_STEP2_DATA)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('fails when mandatory fields are missing', () => {
      const result = validateStep2MsmeDetails({})
      expect(result.isValid).toBe(false)
      expect(result.errors.businessName).toBeDefined()
      expect(result.errors.businessConstitution).toBe('Please select business constitution')
      expect(result.errors.businessActivity).toBe('Please select primary business activity')
      expect(result.errors.establishmentDate).toBeDefined()
      expect(result.errors['operatingAddress.houseBuilding']).toBeDefined()
      expect(result.errors['operatingAddress.streetLocality']).toBeDefined()
      expect(result.errors['operatingAddress.city']).toBeDefined()
      expect(result.errors['operatingAddress.state']).toBe('Please select a state / UT')
      expect(result.errors['operatingAddress.pincode']).toBe('PIN code is required')
      expect(result.errors.udyamStatus).toBe('Please select registration status')
      expect(result.errors.gstStatus).toBe('Please select GST status')
      expect(result.errors.annualTurnover).toBeDefined()
      expect(result.errors.requestedLoanAmount).toBeDefined()
      expect(result.errors.loanPurpose).toBe('Please select loan purpose')
    })

    it('validates Udyam registration number when status is Registered', () => {
      const result = validateStep2MsmeDetails({
        ...MOCK_VALID_STEP2_DATA,
        udyamStatus: 'Registered',
        udyamNumber: 'INVALID_UDYAM',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.udyamNumber).toBe('Enter a valid Udyam number (e.g. UDYAM-XX-00-0000000)')
    })

    it('validates GSTIN format when status is Registered', () => {
      const result = validateStep2MsmeDetails({
        ...MOCK_VALID_STEP2_DATA,
        gstStatus: 'Registered',
        gstin: 'INVALIDGSTIN',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.gstin).toBe('Enter a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)')
    })

    it('does not require Udyam number or GSTIN when status is Not Registered or Exempt', () => {
      const result = validateStep2MsmeDetails({
        ...MOCK_VALID_STEP2_DATA,
        udyamStatus: 'Not Registered',
        udyamNumber: '',
        gstStatus: 'Exempt',
        gstin: '',
      })
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })
})
