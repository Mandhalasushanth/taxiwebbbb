// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Payments } from './Payments'
import { userStorage } from '@core/storage/userStorage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@modules/applications', () => ({
  useApplications: () => ({ data: [] }),
}))

vi.mock('@core/auth', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    authStorage: {
      ...actual.authStorage,
      getUser: () => ({
        id: 'usr_test_123',
        fullName: 'Test User',
        mobile: '9876543210',
        isProfileComplete: true,
      }),
    },
  }
})

describe('Payments Component', () => {
  beforeEach(() => {
    vi.spyOn(userStorage, 'getUserApplications').mockReturnValue([])
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('renders heading and empty states when user has no applications', () => {
    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    )

    // Heading
    expect(screen.getByText('Manage your payments')).toBeDefined()
    expect(
      screen.getByText('View dues, payments and receipts in one place.')
    ).toBeDefined()

    // Overview Stats
    expect(screen.getByText('Payment Overview')).toBeDefined()
    expect(screen.getByText('Total Paid')).toBeDefined()
    expect(screen.getByText('Pending')).toBeDefined()
    expect(screen.getByText('Transactions')).toBeDefined()

    // Empty Dues Card
    expect(screen.getByTestId('empty-dues-card')).toBeDefined()
    expect(screen.getByText('No payments yet')).toBeDefined()
    expect(
      screen.getByText(
        'Your service payments and receipts will appear here after you apply for a service.'
      )
    ).toBeDefined()
    expect(screen.getByText('Explore Services')).toBeDefined()

    // Empty Activity Box
    expect(screen.getByTestId('empty-activity-box')).toBeDefined()
    expect(screen.getByText('Nothing to show yet')).toBeDefined()
    expect(
      screen.getByText('Completed and pending payments will appear here.')
    ).toBeDefined()

    // Quick Links
    expect(screen.getByText('Payment History')).toBeDefined()
    expect(screen.getByText('Invoices & Receipts')).toBeDefined()
  })

  it('navigates to services when Explore Services button is clicked in empty state', () => {
    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    )

    const exploreBtn = screen.getByText('Explore Services')
    fireEvent.click(exploreBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/all-services')
  })

  it('renders pending payments and paid payments when applications exist', () => {
    vi.spyOn(userStorage, 'getUserApplications').mockReturnValue([
      {
        id: 'app-pending-1',
        code: 'GST-2026-00045',
        title: 'GST Quarterly Return Filing Service',
        meta: 'India',
        statusLabel: 'Pending Payment',
        statusTone: 'warning',
        progress: 25,
        icon: '📄',
        to: '/track',
        paymentStatus: 'Pending',
        amount: 2500,
      } as any,
      {
        id: 'app-paid-1',
        code: 'ITR-2026-00032',
        title: 'ITR Filing Standard Assisted Plan',
        meta: 'India',
        statusLabel: 'Completed',
        statusTone: 'success',
        progress: 100,
        icon: '📄',
        to: '/track',
        paymentStatus: 'Paid',
        paidAt: '20 Oct 2026',
        amount: 1800,
      } as any,
    ])

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    )

    // Dues section should now show Pending Payments
    expect(screen.getByText('Pending Payments')).toBeDefined()
    expect(screen.getByText('GST Quarterly Return Filing Service')).toBeDefined()
    expect(screen.getByText('Payment Due')).toBeDefined()
    expect(screen.getAllByText('₹2,500').length).toBe(2) // in overview card and pending card
    expect(screen.getByText('Pay Now')).toBeDefined()

    // Payment Activity section should show paid app
    expect(screen.getByText('ITR Filing Standard Assisted Plan')).toBeDefined()
    expect(screen.getAllByText('₹1,800').length).toBe(2) // in overview card and activity card
    expect(screen.getByText('Paid ✓')).toBeDefined()
    expect(screen.getByText('View Receipt')).toBeDefined()

    // Overview Stats should be calculated
    expect(screen.getByText('2')).toBeDefined() // Transactions count
  })

  it('opens and closes Quick Links dialogs for Payment History and Invoices & Receipts', () => {
    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    )

    // Open Payment History
    const historyBtn = screen.getByTestId('quick-link-history')
    fireEvent.click(historyBtn)

    expect(
      screen.getByText(
        'You have no completed payments yet. Once you make a payment, your full transaction history will appear here.'
      )
    ).toBeDefined()

    // Close dialog
    const closeBtn = screen.getByLabelText('Close dialog')
    fireEvent.click(closeBtn)

    expect(
      screen.queryByText(
        'You have no completed payments yet. Once you make a payment, your full transaction history will appear here.'
      )
    ).toBeNull()

    // Open Invoices & Receipts
    const receiptsBtn = screen.getByTestId('quick-link-receipts')
    fireEvent.click(receiptsBtn)

    expect(
      screen.getByText(
        'No invoices or payment receipts are available yet. Invoices are generated automatically upon successful payment.'
      )
    ).toBeDefined()
  })

  it('opens checkout modal when Pay Now is clicked', () => {
    vi.spyOn(userStorage, 'getUserApplications').mockReturnValue([
      {
        id: 'app-pending-1',
        code: 'GST-2026-00045',
        title: 'GST Quarterly Return Filing Service',
        meta: 'India',
        statusLabel: 'Pending Payment',
        statusTone: 'warning',
        progress: 25,
        icon: '📄',
        to: '/track',
        paymentStatus: 'Pending',
        amount: 2500,
      } as any,
    ])

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    )

    const payNowBtn = screen.getByText('Pay Now')
    fireEvent.click(payNowBtn)

    expect(screen.getByText('Complete Payment')).toBeDefined()
    expect(
      screen.getByText('GST Quarterly Return Filing Service (App #GST-2026-00045)')
    ).toBeDefined()

    // Close checkout modal
    const closeCheckout = screen.getByLabelText('Close checkout')
    fireEvent.click(closeCheckout)

    expect(screen.queryByText('Complete Payment')).toBeNull()
  })
})
