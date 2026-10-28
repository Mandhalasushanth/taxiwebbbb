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
    },
  }
})

describe('Profile page security & support popups', () => {
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

  it('clicking "Change Password" in SECURITY shows the popup with title "Change Password"', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const item = screen.getByText('Change Password')
    fireEvent.click(item)

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()

    // Dismiss with OK
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('heading', { name: 'Change Password' })).toBeNull()
  })

  it('clicking "Terms & Conditions" in SUPPORT shows the popup with title "Terms & Conditions"', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const item = screen.getByText('Terms & Conditions')
    fireEvent.click(item)

    expect(screen.getByRole('heading', { name: 'Terms & Conditions' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()

    // Dismiss with OK
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('heading', { name: 'Terms & Conditions' })).toBeNull()
  })

  it('clicking "Rate TaxEdge" in SUPPORT shows the popup with title "Rate TaxEdge"', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const item = screen.getByText('Rate TaxEdge')
    fireEvent.click(item)

    expect(screen.getByRole('heading', { name: 'Rate TaxEdge' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
  })

  it('clicking "Privacy Policy" in SUPPORT shows the popup with title "Privacy Policy"', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const item = screen.getByText('Privacy Policy')
    fireEvent.click(item)

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
  })

  it('clicking "Two-Factor Authentication" and "Login History" in SECURITY shows the popup with respective titles', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Two-Factor Authentication'))
    expect(screen.getByRole('heading', { name: 'Two-Factor Authentication' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    fireEvent.click(screen.getByText('Login History'))
    expect(screen.getByRole('heading', { name: 'Login History' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    fireEvent.click(screen.getByText('Privacy Settings'))
    expect(screen.getByRole('heading', { name: 'Privacy Settings' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
  })

  it('Customer Support retains its link and does not open unavailable popup', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const supportLink = screen.getByText('Customer Support').closest('a')
    expect(supportLink).not.toBeNull()
    expect(supportLink?.getAttribute('href')).toBe('/support')
    expect(screen.queryByText("This section isn't available yet.")).toBeNull()
  })
})
