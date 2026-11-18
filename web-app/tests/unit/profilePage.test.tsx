// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Profile } from '../../src/modules/profile/pages/Profile/Profile'

vi.mock('@store/index', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useAuthStore: (selector: any) =>
      selector({
        user: {
          id: 'usr_mock_123',
          fullName: 'John Doe',
          mobile: '9876543210',
          isProfileComplete: true,
        },
        signOut: vi.fn(),
      }),
  }
})

vi.mock('@modules/applications', () => ({
  useApplications: () => ({
    data: [],
  }),
}))

vi.mock('@core/auth', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    authStorage: {
      getUser: () => ({
        id: 'usr_mock_123',
        fullName: 'John Doe',
        mobile: '9876543210',
        isProfileComplete: true,
      }),
      clear: vi.fn(),
    },
  }
})

describe('Profile page sections & actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    class MockIntersectionObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    window.IntersectionObserver = MockIntersectionObserver as any
  })

  afterEach(() => {
    cleanup()
  })

  it('renders ACCOUNT section with Personal Information and KYC Details links', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'ACCOUNT' })).toBeDefined()

    const personalLink = screen.getByText('Personal Information').closest('a')
    expect(personalLink).not.toBeNull()
    expect(personalLink?.getAttribute('href')).toBe('/profile/personal')

    const kycLink = screen.getByText('KYC Details').closest('a')
    expect(kycLink).not.toBeNull()
    expect(kycLink?.getAttribute('href')).toBe('/profile/kyc')
  })

  it('renders CUSTOMER SUPPORT section with Customer Support, Terms & Conditions, Privacy Policy, and Refund & Cancellation Policy links', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'CUSTOMER SUPPORT' })).toBeDefined()

    const supportLink = screen.getByText('Customer Support').closest('a')
    expect(supportLink).not.toBeNull()
    expect(supportLink?.getAttribute('href')).toBe('/support')

    const termsLink = screen.getByText('Terms & Conditions').closest('a')
    expect(termsLink).not.toBeNull()
    expect(termsLink?.getAttribute('href')).toBe('/legal/terms')
    expect(termsLink?.getAttribute('target')).toBeNull()

    const privacyLink = screen.getByText('Privacy Policy').closest('a')
    expect(privacyLink).not.toBeNull()
    expect(privacyLink?.getAttribute('href')).toBe('/legal/privacy')
    expect(privacyLink?.getAttribute('target')).toBeNull()

    const refundLink = screen.getByText('Refund & Cancellation Policy').closest('a')
    expect(refundLink).not.toBeNull()
    expect(refundLink?.getAttribute('href')).toBe('/legal/refund')
    expect(refundLink?.getAttribute('target')).toBeNull()
  })

  it('renders SETTINGS section with Change Passcode and Delete Account', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'SETTINGS' })).toBeDefined()
    expect(screen.getByText('Change Passcode')).toBeDefined()
    expect(screen.getByText('Delete Account')).toBeDefined()
  })

  it('does NOT render removed items (Rate Finsolz, 2FA, Login History, Privacy Settings, GST Details, ITR History, Loan History)', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.queryByText('Rate Finsolz')).toBeNull()
    expect(screen.queryByText('Two-Factor Authentication')).toBeNull()
    expect(screen.queryByText('Login History')).toBeNull()
    expect(screen.queryByText('Privacy Settings')).toBeNull()
    expect(screen.queryByText('GST Details')).toBeNull()
    expect(screen.queryByText('ITR History')).toBeNull()
    expect(screen.queryByText('Loan History')).toBeNull()
    expect(screen.queryByText('My Applications')).toBeNull()
    expect(screen.queryByText('Payments & Invoices')).toBeNull()
    expect(screen.queryByText('Notifications')).toBeNull()
  })

  it('clicking "Change Passcode" opens the Change Passcode modal', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('change-passcode-modal-card')).toBeNull()

    fireEvent.click(screen.getByText('Change Passcode'))
    expect(screen.getByTestId('change-passcode-modal-card')).toBeDefined()
    expect(screen.getByText('Update your 6-digit security passcode')).toBeDefined()

    // Dismiss with Cancel button
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('change-passcode-modal-card')).toBeNull()
  })

  it('clicking "Delete Account" opens the Delete Account modal matching design', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('delete-account-modal-card')).toBeNull()

    fireEvent.click(screen.getByText('Delete Account'))
    expect(screen.getByTestId('delete-account-modal-card')).toBeDefined()
    expect(screen.getByText('Permanent Action – 60-Day Grace Period')).toBeDefined()
    expect(screen.getByText(/Your data will be retained for 60 days before permanent erasure:/i)).toBeDefined()
    expect(screen.getByText('All profile records, application tracking, and filings will be permanently erased.')).toBeDefined()
    expect(screen.getByText('Your registered mobile number will be blocked from logging in during this period.')).toBeDefined()
    expect(screen.getByText('All KYC, PAN, and Aadhaar associations will be permanently unlinked.')).toBeDefined()
    expect(screen.getByText('Active mobile authentication sessions will be immediately revoked.')).toBeDefined()

    // Confirm button is disabled when checkbox is unchecked or reason is missing
    const confirmBtn = screen.getByTestId('delete-account-confirm-btn') as HTMLButtonElement
    expect(confirmBtn.disabled).toBe(true)

    // Select reason & check the understand checkbox
    fireEvent.click(screen.getByTestId('delete-account-reason-0'))
    const checkbox = screen.getByTestId('delete-account-understand-checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    expect(confirmBtn.disabled).toBe(false)

    // Dismiss with Cancel button
    fireEvent.click(screen.getByTestId('delete-account-cancel-btn'))
    expect(screen.queryByTestId('delete-account-modal-card')).toBeNull()
  })

  it('retains the Logout button at the bottom', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByText('Log out')
    expect(logoutBtn).toBeDefined()
  })
})
