// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { CapitalDetails } from '../../src/modules/incorporation/components/CapitalDetails/CapitalDetails'
import { IncorporationProvider, useIncorporationFlow } from '../../src/modules/incorporation/hooks/useIncorporationFlow'

// Helper component to initialize test promoters
const TestSetup: React.FC<{ children: React.ReactNode; initialPromoters?: Array<{ id: number; fullName: string; pan: string; equityShares?: string }> }> = ({
  children,
  initialPromoters = [
    { id: 1, fullName: 'John Doe', pan: 'ABCDE1234F', equityShares: '' },
    { id: 2, fullName: 'Jane Smith', pan: 'XYZAB5678C', equityShares: '' },
  ],
}) => {
  const { updateFormData } = useIncorporationFlow()

  React.useEffect(() => {
    updateFormData({
      promoters: initialPromoters.map((p) => ({
        ...p,
        din: '',
        dob: '1990-01-01',
        fatherName: 'Father',
        gender: 'Male',
        nationality: 'Indian',
        designation: 'Director',
        category: 'Director',
        email: 'test@example.com',
        mobile: '9876543210',
        isResident: true,
        addressLine1: 'Street 1',
        addressLine2: '',
        city: 'City',
        district: 'District',
        state: 'State',
        pincode: '500001',
        isSameAddress: true,
        equityShares: p.equityShares || '',
        equityAmount: '',
        shareholdingPercent: '',
      })),
    })
  }, [updateFormData])

  return <>{children}</>
}

describe('CapitalDetails Live Dynamic Calculations Interactive Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('verifies the 9 interactive calculation steps from user specification', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <TestSetup>
            <CapitalDetails />
          </TestSetup>
        </IncorporationProvider>
      </MemoryRouter>
    )

    const authCapInput = screen.getByPlaceholderText('e.g. 100000') as HTMLInputElement
    const faceValueInput = screen.getByPlaceholderText('e.g. 10') as HTMLInputElement

    // Step 0: Initial state verification
    // Authorised Shares shows '-- shares' (safe empty state)
    expect(screen.getByText('-- shares')).toBeInTheDocument()
    // Subscribed Capital and director amounts show '₹0'
    expect(screen.getAllByText('₹0').length).toBeGreaterThanOrEqual(1)

    // Step 1: Enter a valid Authorised Capital value (₹5,000)
    fireEvent.change(authCapInput, { target: { value: '5000' } })
    expect(authCapInput.value).toBe('5000')
    // Face value is still empty, so Authorised Shares stays at safe empty state
    expect(screen.getByText('-- shares')).toBeInTheDocument()

    // Step 2: Enter a valid Face Value per Share (₹10)
    fireEvent.change(faceValueInput, { target: { value: '10' } })
    expect(faceValueInput.value).toBe('10')

    // Step 3: Confirm Authorised Shares updates immediately without submitting the form
    // 5,000 / 10 = 500 shares
    expect(screen.getByText('500 shares')).toBeInTheDocument()

    // Step 4: Change Face Value and confirm Authorised Shares recalculates
    // Change Face Value to 100 -> 5,000 / 100 = 50 shares
    fireEvent.change(faceValueInput, { target: { value: '100' } })
    expect(screen.getByText('50 shares')).toBeInTheDocument()

    // Change Face Value to 5 -> 5,000 / 5 = 1,000 shares
    fireEvent.change(faceValueInput, { target: { value: '5' } })
    expect(screen.getByText('1,000 shares')).toBeInTheDocument()

    // Set back to 10 for the following steps
    fireEvent.change(faceValueInput, { target: { value: '10' } })
    expect(screen.getByText('500 shares')).toBeInTheDocument()

    // Step 5: Navigate to Shareholding Pattern and enter allocated shares
    const shareInputs = screen.getAllByPlaceholderText('Enter shares') as HTMLInputElement[]
    expect(shareInputs).toHaveLength(2)

    // Director 1: 200 shares
    fireEvent.change(shareInputs[0], { target: { value: '200' } })
    // Director 2: 100 shares
    fireEvent.change(shareInputs[1], { target: { value: '100' } })

    // Step 6: Confirm Subscribed Capital and shareholder amounts update immediately
    // Total Allocated Shares: 200 + 100 = 300 shares
    // Subscribed Capital: 300 * 10 = ₹3,000
    expect(screen.getByText('₹3,000')).toBeInTheDocument()
    // Shareholder 1 Amount: 200 * 10 = ₹2,000 (appears in calc box and subtitle)
    expect(screen.getAllByText(/₹2,000/).length).toBeGreaterThanOrEqual(1)
    // Shareholder 2 Amount: 100 * 10 = ₹1,000 (appears in calc box and subtitle)
    expect(screen.getAllByText(/₹1,000/).length).toBeGreaterThanOrEqual(1)
    // Percentages: 200/300 = 66.67%, 100/300 = 33.33%
    expect(screen.getByText('66.67%')).toBeInTheDocument()
    expect(screen.getByText('33.33%')).toBeInTheDocument()

    // Step 7: Change shareholder allocations and confirm all dependent totals update
    // Update Director 1 to 400 shares (Total = 500 shares)
    fireEvent.change(shareInputs[0], { target: { value: '400' } })
    // Total Subscribed Capital: 500 * 10 = ₹5,000
    expect(screen.getByText('₹5,000')).toBeInTheDocument()
    // Shareholder 1: 400 * 10 = ₹4,000, 80%
    expect(screen.getAllByText(/₹4,000/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('80%')).toBeInTheDocument()
    // Shareholder 2: 100 * 10 = ₹1,000, 20%
    expect(screen.getByText('20%')).toBeInTheDocument()

    // Step 8: Clear inputs and verify empty states and validation
    fireEvent.change(authCapInput, { target: { value: '' } })
    expect(screen.getByText('-- shares')).toBeInTheDocument()

    // Test fractional share validation (₹2,767,545 and ₹10)
    fireEvent.change(authCapInput, { target: { value: '2767545' } })
    fireEvent.change(faceValueInput, { target: { value: '10' } })
    expect(screen.getByText('2,76,754.5 shares')).toBeInTheDocument()
    expect(screen.getByText('Authorised capital must be a multiple of face value per share')).toBeInTheDocument()

    // Adjust to integer multiple
    fireEvent.change(faceValueInput, { target: { value: '5' } })
    expect(screen.getByText('5,53,509 shares')).toBeInTheDocument()
    expect(screen.queryByText('Authorised capital must be a multiple of face value per share')).not.toBeInTheDocument()
  })
})
