// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { MachineryAndLoanDetails } from '../../src/modules/loans/components/MachineryLoan/steps/MachineryAndLoanDetails'
import { validateStep2MachineryDetails } from '../../src/modules/loans/validation/machineryLoanValidation'
import type { MachineryLoanData } from '../../src/modules/loans/types/machineryLoan.types'

const EMPTY_MOCK_DATA: MachineryLoanData = {
  currentAddress: { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' },
  permanentSameAsCurrent: 'yes',
  permanentAddress: { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' },
  kycConsent: true,
  requestedLoanAmount: '',
  loanAmount: '',
  machineryType: '',
  machineryNameDescription: '',
  machineryCondition: '',
  machineryPurchaseType: '',
  approximateMachineryCost: '',
  dealerSupplierName: '',
  uploadedDocs: {},
  termsAccepted: false,
}

const VALID_MOCK_DATA: MachineryLoanData = {
  ...EMPTY_MOCK_DATA,
  requestedLoanAmount: '25,00,000',
  loanAmount: '25,00,000',
  machineryType: 'CNC / Industrial Machinery',
  machineryNameDescription: 'CNC 5-Axis Milling Machine',
  machineryCondition: 'New',
  machineryPurchaseType: 'Direct from Manufacturer',
  approximateMachineryCost: '35,00,000',
  dealerSupplierName: 'Haas Automation India',
}

describe('Machinery Loan – Step 2 Machinery & Loan Details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all sections and input fields matching screenshots', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MachineryAndLoanDetails
          data={VALID_MOCK_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Section 1: Loan Requirement
    expect(screen.getByText('Loan Requirement')).toBeInTheDocument()
    expect(screen.getByLabelText(/Requested Loan Amount/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter requested loan amount')).toHaveValue('25,00,000')

    // Section 2: Machinery Details
    expect(screen.getByText('Machinery Details')).toBeInTheDocument()
    expect(screen.getByText('Machinery Type')).toBeInTheDocument()
    expect(screen.getByText('CNC / Industrial Machinery')).toBeInTheDocument()

    expect(screen.getByLabelText(/Machinery Name \/ Description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. CNC Turning Machine')).toHaveValue(
      'CNC 5-Axis Milling Machine',
    )

    expect(screen.getByText('Machinery Condition')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()

    expect(screen.getByText('Machinery Purchase Type')).toBeInTheDocument()
    expect(screen.getByText('Direct from Manufacturer')).toBeInTheDocument()

    expect(screen.getByLabelText(/Approximate Machinery Cost/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter approximate machinery cost')).toHaveValue('35,00,000')

    expect(screen.getByLabelText(/Dealer \/ Supplier Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter dealer or supplier name')).toHaveValue(
      'Haas Automation India',
    )
  })

  it('formats amounts with Indian locale commas on change', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MachineryAndLoanDetails
          data={EMPTY_MOCK_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const amountInput = screen.getByPlaceholderText('Enter requested loan amount')
    fireEvent.change(amountInput, { target: { value: '1500000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedLoanAmount: '15,00,000',
        loanAmount: '15,00,000',
      }),
    )

    const costInput = screen.getByPlaceholderText('Enter approximate machinery cost')
    fireEvent.change(costInput, { target: { value: '2000000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        approximateMachineryCost: '20,00,000',
        machineryCost: '20,00,000',
      }),
    )
  })

  it('allows selecting dropdown options for machinery type, condition and purchase type', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <MachineryAndLoanDetails
          data={EMPTY_MOCK_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Open Condition dropdown
    const conditionBtn = screen.getByRole('button', { name: /Machinery Condition/i })
    fireEvent.click(conditionBtn)

    // Select "Used / Pre-owned"
    const usedOption = screen.getByRole('option', { name: 'Used / Pre-owned' })
    fireEvent.click(usedOption)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ machineryCondition: 'Used / Pre-owned' }),
    )

    // Open Purchase Type dropdown
    const purchaseTypeBtn = screen.getByRole('button', { name: /Machinery Purchase Type/i })
    fireEvent.click(purchaseTypeBtn)

    // Select "Authorized Dealer"
    const dealerOption = screen.getByRole('option', { name: 'Authorized Dealer' })
    fireEvent.click(dealerOption)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        machineryPurchaseType: 'Authorized Dealer',
        purchaseType: 'Authorized Dealer',
      }),
    )
  })

  it('validates Step 2 fields accurately with validateStep2MachineryDetails', () => {
    // Empty data validation
    const emptyResult = validateStep2MachineryDetails(EMPTY_MOCK_DATA)
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.requestedLoanAmount).toBeDefined()
    expect(emptyResult.errors.machineryType).toBeDefined()
    expect(emptyResult.errors.machineryNameDescription).toBeDefined()
    expect(emptyResult.errors.machineryCondition).toBeDefined()
    expect(emptyResult.errors.machineryPurchaseType).toBeDefined()
    expect(emptyResult.errors.approximateMachineryCost).toBeDefined()

    // Junk text validation for machinery name
    const junkResult = validateStep2MachineryDetails({
      ...VALID_MOCK_DATA,
      machineryNameDescription: 'zzzzzzzz',
    })
    expect(junkResult.isValid).toBe(false)
    expect(junkResult.errors.machineryNameDescription).toBeDefined()

    // Valid data
    const validResult = validateStep2MachineryDetails(VALID_MOCK_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
