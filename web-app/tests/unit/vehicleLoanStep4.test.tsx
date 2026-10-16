// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ReviewAndDeclaration } from '../../src/modules/loans/components/VehicleLoan/steps/ReviewAndDeclaration/ReviewAndDeclaration'
import { validateStep4 } from '../../src/modules/loans/validation/vehicleLoanValidation'
import type { VehicleLoanData } from '../../src/modules/loans/types/vehicleLoan.types'
import { INITIAL_VEHICLE_LOAN_DATA } from '../../src/modules/loans/components/VehicleLoan/vehicleLoan.constants'

const MOCK_CUSTOMER = {
  fullName: 'Vikramaditya Sharma',
  mobile: '9876543210',
  email: 'vikram.sharma@example.com',
  pan: 'ABCDE1234F',
  aadhaar: 'XXXX XXXX 9012',
  dob: '1988-06-15',
}

const BASE_REVIEW_DATA: VehicleLoanData = {
  ...INITIAL_VEHICLE_LOAN_DATA,
  currentAddress: {
    houseBuilding: 'Plot 42, Green Meadows',
    streetLocality: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  },
  permanentSameAsCurrent: 'yes',
  requestedLoanAmount: '6,50,000',
  loanAmount: '6,50,000',
  vehicleCondition: 'Used Vehicle',
  vehicleCategory: 'Car',
  vehicleMakeBrand: 'Honda',
  vehicleModel: 'City',
  approximateVehiclePrice: '9,00,000',
  dealerSelected: 'Yes',
  dealerName: 'Varun Motors',
  purchaseTimeline: 'Within 7 days',
  registrationState: 'Telangana',
  termsAccepted: false,
}

describe('Vehicle Loan – Step 4 Review & Declaration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all review sections with applicant, loan, vehicle details, documents, and declaration', () => {
    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={BASE_REVIEW_DATA}
          customer={MOCK_CUSTOMER}
          onChange={vi.fn()}
          onNavigateToStep={vi.fn()}
          errors={{}}
        />
      </MemoryRouter>,
    )

    // Applicant Card
    expect(screen.getByRole('heading', { level: 2, name: 'Applicant Details' })).toBeInTheDocument()
    expect(screen.getByText('Vikramaditya Sharma')).toBeInTheDocument()
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument()
    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument()
    expect(screen.getByText('Plot 42, Green Meadows, Banjara Hills, Hyderabad, Telangana, 500034')).toBeInTheDocument()

    // Vehicle & Loan Details Card
    expect(screen.getByRole('heading', { level: 2, name: 'Vehicle & Loan Details' })).toBeInTheDocument()
    expect(screen.getByText('₹6,50,000')).toBeInTheDocument()
    expect(screen.getByText('Used Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Honda')).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.getByText('₹9,00,000')).toBeInTheDocument()
    expect(screen.getByText('Varun Motors')).toBeInTheDocument()
    expect(screen.getByText('Within 7 days')).toBeInTheDocument()

    // Documents Section for Used Vehicle shows RC Copy
    expect(screen.getByRole('heading', { level: 2, name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByText('RC Copy')).toBeInTheDocument()
    expect(screen.queryByText('Vehicle Quotation / Proforma Invoice')).not.toBeInTheDocument()

    // Declaration
    expect(screen.getByText('Applicant Declaration')).toBeInTheDocument()
    expect(
      screen.getByText(
        'I confirm that the information provided in this application is accurate and complete.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('displays New Vehicle documents when vehicleCondition is New Vehicle', () => {
    const newVehicleData: VehicleLoanData = {
      ...BASE_REVIEW_DATA,
      vehicleCondition: 'New Vehicle',
    }

    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={newVehicleData}
          customer={MOCK_CUSTOMER}
          onChange={vi.fn()}
          onNavigateToStep={vi.fn()}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Vehicle Quotation / Proforma Invoice')).toBeInTheDocument()
    expect(screen.getByText('Booking Receipt')).toBeInTheDocument()
    expect(screen.queryByText('RC Copy')).not.toBeInTheDocument()
  })

  it('calls onNavigateToStep with correct step numbers when edit buttons are clicked', () => {
    const handleNavigate = vi.fn()
    render(
      <MemoryRouter>
        <ReviewAndDeclaration
          data={BASE_REVIEW_DATA}
          customer={MOCK_CUSTOMER}
          onChange={vi.fn()}
          onNavigateToStep={handleNavigate}
          errors={{}}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit Applicant Details' }))
    expect(handleNavigate).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Vehicle & Loan Details' }))
    expect(handleNavigate).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Documents' }))
    expect(handleNavigate).toHaveBeenCalledWith(3)
  })

  it('validates terms declaration checkbox in Step 4', () => {
    const failResult = validateStep4({ termsAccepted: false })
    expect(failResult.isValid).toBe(false)
    expect(failResult.errors.termsAccepted).toBe('Please accept the declaration to submit your application.')

    const passResult = validateStep4({ termsAccepted: true })
    expect(passResult.isValid).toBe(true)
    expect(Object.keys(passResult.errors)).toHaveLength(0)
  })
})
