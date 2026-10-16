// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { HomeLoanRequirement } from '../../src/modules/loans/components/HomeLoan/steps/HomeLoanRequirement/HomeLoanRequirement'
import { validateStep2Requirements } from '../../src/modules/loans/validation/homeLoanValidation'
import type { HomeLoanData } from '../../src/modules/loans/types/homeLoan.types'
import { INITIAL_HOME_LOAN_DATA } from '../../src/modules/loans/components/HomeLoan/homeLoan.constants'

describe('Home Loan – Step 2 Home Loan Requirement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all four requirement fields matching the user specification', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <HomeLoanRequirement
          data={INITIAL_HOME_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Tell us about your home loan')).toBeInTheDocument()
    expect(
      screen.getByText('Specify your loan requirement, property status and estimated property value.'),
    ).toBeInTheDocument()

    // 1. Requested Loan Amount
    expect(screen.getByLabelText(/Requested Loan Amount/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 25,00,000')).toBeInTheDocument()

    // 2. What do you need the loan for?
    expect(screen.getByText('What do you need the loan for?')).toBeInTheDocument()
    expect(screen.getByText('Select purpose')).toBeInTheDocument()

    // 3. Property Status
    expect(screen.getByText('Property Status')).toBeInTheDocument()
    expect(screen.getByText('Select property status')).toBeInTheDocument()

    // 4. Approximate Property Value
    expect(screen.getByLabelText(/Approximate Property Value/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 40,00,000')).toBeInTheDocument()
  })

  it('formats numeric typing in Requested Loan Amount into Indian currency string', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <HomeLoanRequirement
          data={INITIAL_HOME_LOAN_DATA}
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

  it('formats numeric typing in Approximate Property Value into Indian currency string', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <HomeLoanRequirement
          data={INITIAL_HOME_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const propertyValueInput = screen.getByLabelText(/Approximate Property Value/i)
    fireEvent.change(propertyValueInput, { target: { value: '4000000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ approximatePropertyValue: '40,00,000' }),
    )
  })

  it('opens purpose dropdown and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <HomeLoanRequirement
          data={INITIAL_HOME_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /What do you need the loan for/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Purchase a New Home' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Purchase a Resale Home' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Construct a House' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Home Renovation' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Balance Transfer' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Purchase a New Home' }))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ loanPurpose: 'Purchase a New Home' }),
    )
  })

  it('opens property status dropdown and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <HomeLoanRequirement
          data={INITIAL_HOME_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Property Status/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Property Identified' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Looking for Property' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Under Construction' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ready to Move' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Under Construction' }))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ propertyStatus: 'Under Construction' }),
    )
  })

  it('validates Step 2 requirements accurately (required fields, min/max bounds, property value >= loan amount)', () => {
    // 1. Missing fields
    const emptyResult = validateStep2Requirements(INITIAL_HOME_LOAN_DATA)
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.requestedLoanAmount).toBeDefined()
    expect(emptyResult.errors.loanPurpose).toBeDefined()
    expect(emptyResult.errors.propertyStatus).toBeDefined()
    expect(emptyResult.errors.approximatePropertyValue).toBeDefined()

    // 2. Minimum loan amount violation (under ₹1 Lakh)
    const lowAmountResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '50,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '50,00,000',
    })
    expect(lowAmountResult.isValid).toBe(false)
    expect(lowAmountResult.errors.requestedLoanAmount).toContain('Minimum loan amount is ₹1,00,000')

    // 3. Property value less than loan amount
    const invalidRatioResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '50,00,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '30,00,000',
    })
    expect(invalidRatioResult.isValid).toBe(false)
    expect(invalidRatioResult.errors.approximatePropertyValue).toContain(
      'Property value cannot be less than the requested loan amount',
    )

    // 4. Maximum loan amount violation (over ₹10 Crores)
    const maxLoanResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '12,00,00,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '15,00,00,000',
    })
    expect(maxLoanResult.isValid).toBe(false)
    expect(maxLoanResult.errors.requestedLoanAmount).toContain('Maximum loan amount is ₹10,00,00,000 (10 Crores)')

    // 5. Invalid option selection for purpose and status
    const invalidOptionResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Random Unlisted Purpose',
      propertyStatus: 'Fake Status',
      approximatePropertyValue: '40,00,000',
    })
    expect(invalidOptionResult.isValid).toBe(false)
    expect(invalidOptionResult.errors.loanPurpose).toContain('Please select a valid loan purpose')
    expect(invalidOptionResult.errors.propertyStatus).toContain('Please select a valid property status')

    // 6. Minimum & Maximum bounds on property value
    const lowValueResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '50,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '80,000',
    })
    expect(lowValueResult.isValid).toBe(false)
    expect(lowValueResult.errors.approximatePropertyValue).toContain('Minimum property value must be at least ₹1,00,000')

    const highValueResult = validateStep2Requirements({
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '150,00,00,000',
    })
    expect(highValueResult.isValid).toBe(false)
    expect(highValueResult.errors.approximatePropertyValue).toContain('Maximum property value cannot exceed ₹100 Crores')

    // 7. Valid requirement data
    const validData: HomeLoanData = {
      ...INITIAL_HOME_LOAN_DATA,
      requestedLoanAmount: '25,00,000',
      loanPurpose: 'Purchase a New Home',
      propertyStatus: 'Ready to Move',
      approximatePropertyValue: '40,00,000',
    }
    const validResult = validateStep2Requirements(validData)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
