// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoanMarketplace } from '../../src/modules/loans/components/LoanMarketplace/LoanMarketplace'
import { LOAN_MARKETPLACE_ITEMS } from '../../src/modules/loans/constants/loanMarketplace.constants'
import {
  safeNavigateTo,
  isValidLoanMarketplaceItem,
  buildLoanCardAriaLabel,
} from '../../src/modules/loans/utils/loanMarketplace.utils'
import { useAuthStore } from '../../src/store/auth/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoanMarketplace Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('contains exactly 9 loans in the marketplace catalog matching the specification', () => {
    expect(LOAN_MARKETPLACE_ITEMS).toHaveLength(9)

    const expectedOrder = [
      { id: 'business-loan', title: 'Business Loan' },
      { id: 'personal-loan', title: 'Personal Loan' },
      { id: 'home-loan', title: 'Home Loan' },
      { id: 'property-loan', title: 'Property Loan' },
      { id: 'vehicle-loan', title: 'Vehicle Loan' },
      { id: 'working-capital', title: 'Working Capital' },
      { id: 'machinery-loan', title: 'Machinery Loan' },
      { id: 'project-finance', title: 'Project Finance' },
      { id: 'msme-loan', title: 'MSME Loan' },
    ]

    expectedOrder.forEach((expected, index) => {
      const item = LOAN_MARKETPLACE_ITEMS[index]
      expect(item.id).toBe(expected.id)
      expect(item.title).toBe(expected.title)
    })
  })

  it('renders all 9 loan cards and header inside LoanMarketplace without rate badges', () => {
    render(
      <MemoryRouter>
        <LoanMarketplace />
      </MemoryRouter>
    )

    expect(screen.getByText('Capital & Financing')).toBeInTheDocument()
    expect(screen.getByText('Loan Marketplace & Assistance')).toBeInTheDocument()

    // Verify all 9 loan titles are rendered
    expect(screen.getByText('Business Loan')).toBeInTheDocument()
    expect(screen.getByText('Personal Loan')).toBeInTheDocument()
    expect(screen.getByText('Home Loan')).toBeInTheDocument()
    expect(screen.getByText('Property Loan')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Loan')).toBeInTheDocument()
    expect(screen.getByText('Working Capital')).toBeInTheDocument()
    expect(screen.getByText('Machinery Loan')).toBeInTheDocument()
    expect(screen.getByText('Project Finance')).toBeInTheDocument()
    expect(screen.getByText('MSME Loan')).toBeInTheDocument()

    // Verify rate badges are removed
    expect(screen.queryByText('From 12% p.a.')).not.toBeInTheDocument()
    expect(screen.queryByText('From 10.5% p.a.')).not.toBeInTheDocument()
    expect(screen.queryByText('Custom Pricing')).not.toBeInTheDocument()
    expect(screen.queryByText('From 7.5% p.a.')).not.toBeInTheDocument()
  })

  it('opens CompleteProfileModal when user profile is incomplete on loan click', () => {
    useAuthStore.setState({
      user: {
        id: 'usr_test_1',
        fullName: 'Test User',
        mobile: '9876543210',
        email: 'test@example.com',
        role: 'customer',
        isProfileComplete: false,
      },
      isAuthenticated: true,
    })

    render(
      <MemoryRouter>
        <LoanMarketplace />
      </MemoryRouter>
    )

    // Modal should initially not be open
    expect(screen.queryByText('Complete Your Profile')).not.toBeInTheDocument()

    // Click Vehicle Loan card
    const vehicleCard = screen.getByTestId('loan-card-vehicle-loan')
    fireEvent.click(vehicleCard)

    // Modal should now be visible
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    expect(
      screen.getByText('Please complete your profile to access TaxEdge services.')
    ).toBeInTheDocument()

    // Click "Complete Profile" button inside modal
    const completeBtn = screen.getByRole('button', { name: /complete profile/i })
    fireEvent.click(completeBtn)

    // ?redirect= brings the user back to the chosen loan after completing the profile (BUG-CP-013)
    expect(mockNavigate).toHaveBeenCalledWith('/auth/register?redirect=%2Floans%2Fvehicle-loan', {
      state: { returnTo: '/loans/vehicle-loan', mobile: '9876543210' },
    })
  })

  it('navigates directly to loan when user profile is complete', () => {
    useAuthStore.setState({
      user: {
        id: 'usr_test_2',
        fullName: 'Verified User',
        mobile: '9876543210',
        email: 'verified@example.com',
        role: 'customer',
        isProfileComplete: true,
      },
      isAuthenticated: true,
    })

    render(
      <MemoryRouter>
        <LoanMarketplace />
      </MemoryRouter>
    )

    // Click Home Loan card
    const homeCard = screen.getByTestId('loan-card-home-loan')
    fireEvent.click(homeCard)

    expect(screen.queryByText('Complete Your Profile')).not.toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/loans/home-loan')
  })

  it('safely handles exception during navigation in safeNavigateTo', () => {
    const faultyNavigate = vi.fn().mockImplementationOnce(() => {
      throw new Error('Navigation failed')
    })

    // Should catch the exception and try fallback
    expect(() => safeNavigateTo(faultyNavigate, '/test-path', '/loans')).not.toThrow()
    expect(faultyNavigate).toHaveBeenCalledTimes(2)
  })

  it('validates loan items safely with isValidLoanMarketplaceItem', () => {
    expect(isValidLoanMarketplaceItem(LOAN_MARKETPLACE_ITEMS[0])).toBe(true)
    expect(isValidLoanMarketplaceItem(null)).toBe(false)
    expect(isValidLoanMarketplaceItem(undefined)).toBe(false)
    expect(isValidLoanMarketplaceItem({})).toBe(false)
    expect(isValidLoanMarketplaceItem({ id: '1' })).toBe(false)
  })

  it('builds accessible ARIA labels with buildLoanCardAriaLabel', () => {
    const label = buildLoanCardAriaLabel('Business Loan', 'From 12% p.a.', 'Unsecured capital')
    expect(label).toBe('Business Loan, starting from From 12% p.a.. Unsecured capital')
  })
})
