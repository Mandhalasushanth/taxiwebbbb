// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PropertyAndLoanDetails } from '../../src/modules/loans/components/PropertyLoan/steps/PropertyAndLoanDetails/PropertyAndLoanDetails'
import { validateStep2PropertyDetails } from '../../src/modules/loans/validation/propertyLoanValidation'
import type { PropertyLoanData } from '../../src/modules/loans/types/propertyLoan.types'
import { INITIAL_PROPERTY_LOAN_DATA } from '../../src/modules/loans/components/PropertyLoan/propertyLoan.constants'

describe('Property Loan – Step 2 Property & Loan Details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all fields across Loan Requirement and Property Details cards matching screenshot', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <PropertyAndLoanDetails
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Card 1: Loan Requirement
    expect(screen.getByRole('heading', { level: 2, name: 'Loan Requirement' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Requested Loan Amount/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 25,00,000')).toBeInTheDocument()

    expect(screen.getByText('Purpose of Loan')).toBeInTheDocument()
    expect(screen.getByText('Select purpose')).toBeInTheDocument()

    // Card 2: Property Details
    expect(screen.getByRole('heading', { level: 2, name: 'Property Details' })).toBeInTheDocument()
    expect(screen.getByText('Property Type')).toBeInTheDocument()
    expect(screen.getByText('Select property type')).toBeInTheDocument()

    expect(screen.getByLabelText(/City/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Hyderabad')).toBeInTheDocument()

    expect(screen.getByText('State')).toBeInTheDocument()
    expect(screen.getByText('Select state / UT')).toBeInTheDocument()

    expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('6-digit PIN code')).toBeInTheDocument()

    expect(screen.getByText('Property Ownership')).toBeInTheDocument()
    expect(screen.getByText('Select ownership')).toBeInTheDocument()
  })

  it('formats numeric typing in Requested Loan Amount into Indian currency string', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <PropertyAndLoanDetails
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const amountInput = screen.getByLabelText(/Requested Loan Amount/i)
    fireEvent.change(amountInput, { target: { value: '2500000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ requestedLoanAmount: '25,00,000' }),
    )
  })

  it('opens Purpose of Loan dropdown and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <PropertyAndLoanDetails
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Purpose of Loan/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Home Purchase' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Home Construction' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Home Renovation' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Plot Purchase' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Plot + Construction' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Balance Transfer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Home Purchase' }))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ loanPurpose: 'Home Purchase' }),
    )
  })

  it('opens Property Type dropdown and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <PropertyAndLoanDetails
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Property Type/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Apartment / Flat' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Independent House' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Plot' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Commercial Property' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Apartment / Flat' }))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ propertyType: 'Apartment / Flat' }),
    )
  })

  it('opens Property Ownership dropdown and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <PropertyAndLoanDetails
          data={INITIAL_PROPERTY_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Property Ownership/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Self' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Joint / Family' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Not Yet Purchased' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Self' }))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ propertyOwnership: 'Self' }),
    )
  })

  it('validates Step 2 Property Details accurately (required fields, amount bounds, option bounds, and state/pincode mismatch)', () => {
    // 1. Missing fields
    const emptyResult = validateStep2PropertyDetails(INITIAL_PROPERTY_LOAN_DATA)
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.requestedLoanAmount).toBeDefined()
    expect(emptyResult.errors.loanPurpose).toBeDefined()
    expect(emptyResult.errors.propertyType).toBeDefined()
    expect(emptyResult.errors.city).toBeDefined()
    expect(emptyResult.errors.state).toBeDefined()
    expect(emptyResult.errors.pincode).toBeDefined()
    expect(emptyResult.errors.propertyOwnership).toBeDefined()

    // 2. Minimum amount violation (under ₹1 Lakh)
    const lowAmountResult = validateStep2PropertyDetails({
      ...INITIAL_PROPERTY_LOAN_DATA,
      requestedLoanAmount: '50,000',
      loanPurpose: 'Home Purchase',
      propertyType: 'Apartment / Flat',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      propertyOwnership: 'Self',
    })
    expect(lowAmountResult.isValid).toBe(false)
    expect(lowAmountResult.errors.requestedLoanAmount).toContain('Minimum loan amount is ₹1,00,000')

    // 3. State and PIN code mismatch (Delhi pincode with Telangana state)
    const mismatchResult = validateStep2PropertyDetails({
      ...INITIAL_PROPERTY_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Home Purchase',
      propertyType: 'Apartment / Flat',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '110001',
      propertyOwnership: 'Self',
    })
    expect(mismatchResult.isValid).toBe(false)
    expect(mismatchResult.errors.pincode).toBeDefined()

    // 4. Repeating PIN digits
    const repeatingPinResult = validateStep2PropertyDetails({
      ...INITIAL_PROPERTY_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Home Purchase',
      propertyType: 'Apartment / Flat',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '111111',
      propertyOwnership: 'Self',
    })
    expect(repeatingPinResult.isValid).toBe(false)
    expect(repeatingPinResult.errors.pincode).toContain('Please enter a valid 6-digit PIN code')

    // 5. Valid data
    const validData: PropertyLoanData = {
      ...INITIAL_PROPERTY_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Home Purchase',
      propertyType: 'Apartment / Flat',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      propertyOwnership: 'Self',
    }
    const validResult = validateStep2PropertyDetails(validData)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
