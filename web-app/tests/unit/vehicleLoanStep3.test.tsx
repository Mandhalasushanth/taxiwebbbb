// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Documents } from '../../src/modules/loans/components/VehicleLoan/steps/Documents/Documents'
import { validateStep3Documents } from '../../src/modules/loans/validation/vehicleLoanValidation'
import type { VehicleLoanData } from '../../src/modules/loans/types/vehicleLoan.types'
import { INITIAL_VEHICLE_LOAN_DATA } from '../../src/modules/loans/components/VehicleLoan/vehicleLoan.constants'

const BASE_DATA: VehicleLoanData = {
  ...INITIAL_VEHICLE_LOAN_DATA,
  requestedLoanAmount: '5,00,000',
  loanAmount: '5,00,000',
  vehicleCategory: 'Car',
  vehicleMakeBrand: 'Maruti Suzuki',
  vehicleModel: 'Swift',
  approximateVehiclePrice: '8,00,000',
  dealerSelected: 'Yes',
  purchaseTimeline: 'Within 30 days',
  registrationState: 'Telangana',
}

describe('Vehicle Loan – Step 3 Documents (Dynamic by Vehicle Condition)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  describe('Used Vehicle Mode (Old Vehicle - Screenshot 1)', () => {
    const usedVehicleData: VehicleLoanData = {
      ...BASE_DATA,
      vehicleCondition: 'Used Vehicle',
    }

    it('renders header, subtitle, 0 of 1 progress box, and RC Copy as the only required document', () => {
      render(
        <MemoryRouter>
          <Documents data={usedVehicleData} onChange={vi.fn()} errors={{}} />
        </MemoryRouter>,
      )

      // Summary Progress Box is removed
      expect(screen.queryByText(/required documents uploaded/i)).not.toBeInTheDocument()

      // Section: REQUIRED DOCUMENTS
      expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
      expect(screen.getByText('RC Copy')).toBeInTheDocument()
      expect(screen.getByText('Registration certificate for the used vehicle')).toBeInTheDocument()
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Upload RC Copy/i })).toBeInTheDocument()

      // Should NOT show New Vehicle documents or Optional Documents section
      expect(screen.queryByText('Vehicle Quotation / Proforma Invoice')).not.toBeInTheDocument()
      expect(screen.queryByText('Booking Receipt')).not.toBeInTheDocument()
      expect(screen.queryByText('OPTIONAL DOCUMENTS')).not.toBeInTheDocument()
    })

    it('validation fails without RC Copy and passes once RC Copy is uploaded', () => {
      const failResult = validateStep3Documents(usedVehicleData)
      expect(failResult.isValid).toBe(false)
      expect(failResult.errors.rc_copy).toBe('RC Copy is required')

      const passResult = validateStep3Documents({
        ...usedVehicleData,
        uploadedDocs: {
          rc_copy: {
            name: 'rc_certificate.pdf',
            size: '1.2 MB',
            uploadedAt: '2026-10-15',
          },
        },
      })
      expect(passResult.isValid).toBe(true)
      expect(Object.keys(passResult.errors)).toHaveLength(0)
    })
  })

  describe('New Vehicle Mode (Screenshot 2)', () => {
    const newVehicleData: VehicleLoanData = {
      ...BASE_DATA,
      vehicleCondition: 'New Vehicle',
    }

    it('renders Vehicle Quotation under REQUIRED and Booking Receipt under OPTIONAL', () => {
      render(
        <MemoryRouter>
          <Documents data={newVehicleData} onChange={vi.fn()} errors={{}} />
        </MemoryRouter>,
      )

      // Summary Box is removed
      expect(screen.queryByText(/required documents uploaded/i)).not.toBeInTheDocument()

      // Required: Vehicle Quotation / Proforma Invoice
      expect(screen.getByText('REQUIRED DOCUMENTS')).toBeInTheDocument()
      expect(screen.getByText('Vehicle Quotation / Proforma Invoice')).toBeInTheDocument()
      expect(screen.getByText('Quotation or proforma invoice for the selected new vehicle')).toBeInTheDocument()

      // Optional: Booking Receipt
      expect(screen.getByText('OPTIONAL DOCUMENTS')).toBeInTheDocument()
      expect(screen.getByText('Booking Receipt')).toBeInTheDocument()
      expect(screen.getByText('Vehicle booking receipt, if available')).toBeInTheDocument()
      expect(screen.getByText('Optional')).toBeInTheDocument()

      // Should NOT show RC Copy
      expect(screen.queryByText('RC Copy')).not.toBeInTheDocument()
    })

    it('validation requires Vehicle Quotation but Booking Receipt is strictly optional', () => {
      const failResult = validateStep3Documents(newVehicleData)
      expect(failResult.isValid).toBe(false)
      expect(failResult.errors.vehicle_quotation).toBe('Vehicle Quotation / Proforma Invoice is required')

      // With only quotation uploaded, validation passes
      const passResult = validateStep3Documents({
        ...newVehicleData,
        uploadedDocs: {
          vehicle_quotation: {
            name: 'dealer_invoice.pdf',
            size: '2.5 MB',
            uploadedAt: '2026-10-15',
          },
        },
      })
      expect(passResult.isValid).toBe(true)
      expect(Object.keys(passResult.errors)).toHaveLength(0)
    })
  })

  describe('Document Upload and Removal Interactions', () => {
    it('shows uploaded document details and updates summary counter when uploaded', () => {
      const uploadedData: VehicleLoanData = {
        ...BASE_DATA,
        vehicleCondition: 'Used Vehicle',
        uploadedDocs: {
          rc_copy: {
            name: 'used_car_rc.pdf',
            size: '520 KB',
            uploadedAt: '2026-10-15',
          },
        },
      }

      render(
        <MemoryRouter>
          <Documents data={uploadedData} onChange={vi.fn()} errors={{}} />
        </MemoryRouter>,
      )

      expect(screen.queryByText(/required documents uploaded/i)).not.toBeInTheDocument()
      expect(screen.getByText(/used_car_rc\.pdf/i)).toBeInTheDocument()
    })

    it('triggers onChange when removing an uploaded document', () => {
      const handleChange = vi.fn()
      const uploadedData: VehicleLoanData = {
        ...BASE_DATA,
        vehicleCondition: 'Used Vehicle',
        uploadedDocs: {
          rc_copy: {
            name: 'used_car_rc.pdf',
            size: '520 KB',
            uploadedAt: '2026-10-15',
          },
        },
      }

      render(
        <MemoryRouter>
          <Documents data={uploadedData} onChange={handleChange} errors={{}} />
        </MemoryRouter>,
      )

      const deleteBtn = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteBtn)

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ uploadedDocs: {} }),
      )
    })
  })
})
