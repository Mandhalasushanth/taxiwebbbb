// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Settings } from '../../src/modules/profile/pages/Settings/Settings'
import { userRepository } from '@core/auth'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@store/index', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        id: 'usr_test123',
        mobile: '9876543210',
        fullName: 'Test User',
      },
    }),
}))

vi.mock('@core/auth', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    authStorage: {
      getUser: () => ({
        id: 'usr_test123',
        mobile: '9876543210',
        fullName: 'Test User',
      }),
    },
    userRepository: {
      savePasscodeState: vi.fn(),
    },
  }
})

describe('Settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders Appearance & Settings header', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /appearance & settings/i })).toBeDefined()
    expect(screen.queryByRole('button', { name: /back to profile/i })).toBeNull()
  })

  it('renders Preferences section with push notifications toggle and toggles state', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /^preferences$/i })).toBeDefined()
    expect(screen.getByText('Push Notifications')).toBeDefined()
    expect(screen.getByText('Filing alerts and deadline reminders')).toBeDefined()

    const switchBtn = screen.getByRole('switch', { name: /toggle push notifications/i })
    expect(switchBtn).toBeDefined()
    expect(switchBtn.getAttribute('aria-checked')).toBe('true')

    // Toggle off
    fireEvent.click(switchBtn)
    expect(switchBtn.getAttribute('aria-checked')).toBe('false')
    expect(localStorage.getItem('taxedge_push_notifications_enabled')).toBe('false')

    // Toggle back on
    fireEvent.click(switchBtn)
    expect(switchBtn.getAttribute('aria-checked')).toBe('true')
    expect(localStorage.getItem('taxedge_push_notifications_enabled')).toBe('true')
  })

  it('does NOT render theme or biometric authentication', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    // Verify Theme selector is absent
    expect(screen.queryByText(/choose your preferred application appearance/i)).toBeNull()
    expect(screen.queryByLabelText(/light theme/i)).toBeNull()
    expect(screen.queryByLabelText(/dark theme/i)).toBeNull()

    // Verify Biometric authentication is absent
    expect(screen.queryByText(/biometric authentication/i)).toBeNull()
  })

  it('renders Security section with Change Passcode and Logout', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /^security$/i })).toBeDefined()
    expect(screen.getByText('Change Passcode')).toBeDefined()
    expect(screen.getByText('Update your 6-digit security PIN')).toBeDefined()
    expect(screen.getByText('Logout')).toBeDefined()
    expect(screen.getByText('Sign out of your active session')).toBeDefined()
  })

  it('opens Change Passcode modal and saves new valid passcode', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    const changePasscodeBtn = screen.getByText('Change Passcode').closest('button')!
    fireEvent.click(changePasscodeBtn)

    expect(screen.getByRole('heading', { name: /change security passcode/i })).toBeDefined()

    const newPassInput = screen.getByLabelText(/new 6-digit passcode/i)
    const confirmPassInput = screen.getByLabelText(/confirm new passcode/i)
    const submitBtn = screen.getByRole('button', { name: /update passcode/i }) as HTMLButtonElement

    expect(submitBtn.disabled).toBe(true)

    // Enter matching 6-digit passcode
    fireEvent.change(newPassInput, { target: { value: '492815' } })
    fireEvent.change(confirmPassInput, { target: { value: '492815' } })

    expect(submitBtn.disabled).toBe(false)

    fireEvent.click(submitBtn)

    expect(userRepository.savePasscodeState).toHaveBeenCalledWith('9876543210', '492815')
    expect(screen.getByText('Passcode Updated')).toBeDefined()
  })

  it('renders App Information footer', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    expect(screen.getByText('TaxEdge Fin Solutions • v1.0.0')).toBeDefined()
    expect(screen.getByText(/encrypted connection/i)).toBeDefined()
  })
})
