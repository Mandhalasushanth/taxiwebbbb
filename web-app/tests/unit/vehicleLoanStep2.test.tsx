// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { VehicleAndLoanDetails } from '../../src/modules/loans/components/VehicleLoan/steps/VehicleAndLoanDetails/VehicleAndLoanDetails'
import { validateStep2VehicleAndLoanDetails } from '../../src/modules/loans/validation/vehicleLoanValidation'
import type { VehicleLoanData } from '../../src/modules/loans/types/vehicleLoan.types'
import { INITIAL_VEHICLE_LOAN_DATA } from '../../src/modules/loans/components/VehicleLoan/vehicleLoan.constants'

const VALID_STEP2_DATA: VehicleLoanData = {
  ...INITIAL_VEHICLE_LOAN_DATA,
  requestedLoanAmount: '5,00,000',
  loanAmount: '5,00,000',
  vehicleCondition: 'New Vehicle',
  vehicleCategory: 'Car',
  vehicleMakeBrand: 'Maruti Suzuki',
  vehicleBrand: 'Maruti Suzuki',
  vehicleModel: 'Swift',
  vehicleMakeModel: 'Swift',
  approximateVehiclePrice: '8,00,000',
  onRoadPrice: '8,00,000',
  dealerSelected: 'Yes',
  dealerName: 'Varun Motors',
  purchaseTimeline: 'Within 30 days',
  registrationState: 'Telangana',
}

describe('Vehicle Loan – Step 2 Vehicle & Loan Details', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all 3 cards and fields matching the user screenshots', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Card 1: Loan Requirement
    expect(screen.getByRole('heading', { level: 2, name: 'Loan Requirement' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Requested Loan Amount/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 5,00,000')).toBeInTheDocument()

    // Card 2: Vehicle Details
    expect(screen.getByRole('heading', { level: 2, name: 'Vehicle Details' })).toBeInTheDocument()
    expect(screen.getByText('Vehicle Condition')).toBeInTheDocument()
    expect(screen.getByText('Select condition')).toBeInTheDocument()

    expect(screen.getByText('Vehicle Category')).toBeInTheDocument()
    expect(screen.getByText('Select category')).toBeInTheDocument()

    expect(screen.getByLabelText(/Vehicle Make \/ Brand/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Maruti Suzuki')).toBeInTheDocument()

    expect(screen.getByLabelText(/Vehicle Model/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Swift')).toBeInTheDocument()

    expect(screen.getByLabelText(/Approximate Vehicle Price/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 8,00,000')).toBeInTheDocument()

    // Card 3: Purchase Details
    expect(screen.getByRole('heading', { level: 2, name: 'Purchase Details' })).toBeInTheDocument()
    expect(screen.getByText('Dealer Selected?')).toBeInTheDocument()
    expect(screen.getByText('Select an option')).toBeInTheDocument()

    expect(screen.getByText('Purchase Timeline')).toBeInTheDocument()
    expect(screen.getByText('Select timeline')).toBeInTheDocument()

    expect(screen.getByText('Registration State')).toBeInTheDocument()
    expect(screen.getByText('Select State / UT')).toBeInTheDocument()
  })

  it('formats numeric typing in Requested Loan Amount into Indian currency string', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const amountInput = screen.getByLabelText(/Requested Loan Amount/i)
    fireEvent.change(amountInput, { target: { value: '500000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ requestedLoanAmount: '5,00,000', loanAmount: '5,00,000' }),
    )
  })

  it('formats numeric typing in Approximate Vehicle Price into Indian currency string', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const priceInput = screen.getByLabelText(/Approximate Vehicle Price/i)
    fireEvent.change(priceInput, { target: { value: '800000' } })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ approximateVehiclePrice: '8,00,000', onRoadPrice: '8,00,000' }),
    )
  })

  it('allows text input in Vehicle Make / Brand and Vehicle Model', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const brandInput = screen.getByLabelText(/Vehicle Make \/ Brand/i)
    fireEvent.change(brandInput, { target: { value: 'Maruti Suzuki' } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleMakeBrand: 'Maruti Suzuki', vehicleBrand: 'Maruti Suzuki' }),
    )

    const modelInput = screen.getByLabelText(/Vehicle Model/i)
    fireEvent.change(modelInput, { target: { value: 'Swift' } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleModel: 'Swift', vehicleMakeModel: 'Swift' }),
    )
  })

  it('opens Vehicle Condition dropdown and selects New Vehicle', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Vehicle Condition/i })
    fireEvent.click(trigger)

    const option = screen.getByRole('option', { name: 'New Vehicle' })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleCondition: 'New Vehicle' }),
    )
  })

  it('opens Vehicle Category dropdown and selects Car', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Vehicle Category/i })
    fireEvent.click(trigger)

    const option = screen.getByRole('option', { name: 'Car' })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleCategory: 'Car' }),
    )
  })

  it('opens Dealer Selected? dropdown and selects Yes', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Dealer Selected\?/i })
    fireEvent.click(trigger)

    const option = screen.getByRole('option', { name: 'Yes' })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ dealerSelected: 'Yes' }),
    )
  })

  it('opens Purchase Timeline dropdown and selects Within 30 days', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /Purchase Timeline/i })
    fireEvent.click(trigger)

    const option = screen.getByRole('option', { name: 'Within 30 days' })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ purchaseTimeline: 'Within 30 days' }),
    )
  })

  it('renders field validation errors when provided', () => {
    render(
      <MemoryRouter>
        <VehicleAndLoanDetails
          data={INITIAL_VEHICLE_LOAN_DATA}
          onChange={vi.fn()}
          errors={{
            requestedLoanAmount: 'Requested loan amount is required',
            vehicleCondition: 'Please select vehicle condition',
            vehicleCategory: 'Please select vehicle category',
            vehicleMakeBrand: 'Vehicle make / brand is required',
            vehicleModel: 'Vehicle model is required',
            approximateVehiclePrice: 'Approximate vehicle price is required',
            dealerSelected: 'Please specify if dealer is selected',
            purchaseTimeline: 'Please select purchase timeline',
            registrationState: 'Please select registration state',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Requested loan amount is required')).toBeInTheDocument()
    expect(screen.getByText('Please select vehicle condition')).toBeInTheDocument()
    expect(screen.getByText('Please select vehicle category')).toBeInTheDocument()
    expect(screen.getByText('Vehicle make / brand is required')).toBeInTheDocument()
    expect(screen.getByText('Vehicle model is required')).toBeInTheDocument()
    expect(screen.getByText('Approximate vehicle price is required')).toBeInTheDocument()
    expect(screen.getByText('Please specify if dealer is selected')).toBeInTheDocument()
    expect(screen.getByText('Please select purchase timeline')).toBeInTheDocument()
    expect(screen.getByText('Please select registration state')).toBeInTheDocument()
  })

  describe('Validation: validateStep2VehicleAndLoanDetails', () => {
    it('fails when all required fields are empty', () => {
      const result = validateStep2VehicleAndLoanDetails({})
      expect(result.isValid).toBe(false)
      expect(result.errors.requestedLoanAmount).toBe('Requested loan amount is required')
      expect(result.errors.vehicleCondition).toBe('Please select vehicle condition')
      expect(result.errors.vehicleCategory).toBe('Please select vehicle category')
      expect(result.errors.vehicleMakeBrand).toBe('Vehicle make / brand is required')
      expect(result.errors.vehicleModel).toBe('Vehicle model is required')
      expect(result.errors.approximateVehiclePrice).toBe('Approximate vehicle price is required')
      expect(result.errors.dealerSelected).toBe('Please specify if dealer is selected')
      expect(result.errors.purchaseTimeline).toBe('Please select purchase timeline')
      expect(result.errors.registrationState).toBe('Please select registration state')
    })

    it('fails when requested loan amount exceeds approximate vehicle price', () => {
      const result = validateStep2VehicleAndLoanDetails({
        ...VALID_STEP2_DATA,
        requestedLoanAmount: '9,00,000',
        approximateVehiclePrice: '8,00,000',
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.requestedLoanAmount).toBe(
        'Requested loan amount cannot exceed approximate vehicle price',
      )
    })

    it('passes when all details are valid and loan amount <= vehicle price', () => {
      const result = validateStep2VehicleAndLoanDetails(VALID_STEP2_DATA)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })
})
