// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@core/config', async () => {
  const actual = await vi.importActual<any>('@core/config')
  return {
    ...actual,
    env: {
      ...actual.env,
      enableMocks: true,
    },
  }
})

import { authStorage } from '../../src/core/auth/authStorage'
import { userRepository } from '../../src/core/storage/userRepository'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import { SignInCard } from '../../src/modules/authentication/components/SignInCard/SignInCard'
import { Settings } from '../../src/modules/profile/pages/Settings/Settings'
import { useAuthStore } from '../../src/store'

const mockNavigate = vi.fn()
let currentLocation = {
  state: null as any,
  search: '',
  pathname: '/profile/settings',
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => currentLocation,
  }
})

describe('Passcode Reset and Change Passcode Flow', () => {
  const testMobile = '9876543210'

  beforeEach(() => {
    vi.clearAllMocks()
    userRepository.clearAll()
    authStorage.clearAll()
    useAuthStore.getState().signOut()
    currentLocation = {
      state: null,
      search: '',
      pathname: '/profile/settings',
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('Change Passcode in Settings sends OTP, signs out, and redirects to reset OTP verification', async () => {
    // Seed authenticated user with a mobile number
    const mockUser = {
      id: 'usr_test',
      name: 'Test User',
      mobile: testMobile,
      isRegistered: true,
      isProfileComplete: true,
    }
    useAuthStore.getState().signIn({
      user: mockUser,
      tokens: { accessToken: 'token1', refreshToken: 'token2' },
    })
    authStorage.setUser(mockUser)
    userRepository.createUser(mockUser, '123456')

    const sendOtpSpy = vi.spyOn(authFlowService, 'sendOtp')

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    )

    // Click Change Passcode row
    const changePasscodeBtn = screen.getByRole('button', { name: /change passcode/i })
    fireEvent.click(changePasscodeBtn)

    await waitFor(() => {
      expect(sendOtpSpy).toHaveBeenCalledWith(testMobile)
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', {
        state: {
          mode: 'otp',
          mobile: testMobile,
          isResetFlow: true,
        },
        replace: true,
      })
    })

    // Confirm user session is signed out for security
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('Reset flow: Verify OTP -> Set Passcode -> Reset Passcode -> Passcode Login -> Dashboard', async () => {
    const existingUser = {
      id: 'usr_reset',
      name: 'Reset User',
      mobile: testMobile,
      isRegistered: true,
      isProfileComplete: true,
    }
    userRepository.createUser(existingUser, '112233')

    // Simulate arriving at /auth/login with reset state
    currentLocation = {
      pathname: '/auth/login',
      search: '',
      state: {
        mode: 'otp',
        mobile: testMobile,
        isResetFlow: true,
      },
    }

    render(
      <MemoryRouter>
        <SignInCard />
      </MemoryRouter>
    )

    // 1. Should be on OTP verification step with reset code labels
    expect(screen.getByText(/enter 6-digit reset code/i)).toBeInTheDocument()

    // Enter 6-digit OTP
    const otpBoxes = screen.getAllByRole('textbox')
    expect(otpBoxes.length).toBe(6)
    const otpDigits = ['1', '2', '3', '4', '5', '6']
    otpDigits.forEach((digit, i) => {
      fireEvent.change(otpBoxes[i], { target: { value: digit } })
    })

    const verifyBtn = screen.getByRole('button', { name: /verify reset code/i })
    fireEvent.click(verifyBtn)

    // 2. Transitions to Set Passcode View
    await waitFor(() => {
      expect(screen.getByText(/new passcode/i)).toBeInTheDocument()
      expect(screen.getByText(/confirm passcode/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset passcode/i })).toBeInTheDocument()
    })

    // Enter new passcode (e.g. 642819)
    const newPasscode = '642819'
    const newPasscodeInputs = screen.getAllByLabelText(/new passcode digit/i)
    newPasscode.split('').forEach((d, idx) => {
      fireEvent.change(newPasscodeInputs[idx], { target: { value: d } })
    })

    const confirmPasscodeInputs = screen.getAllByLabelText(/confirm passcode digit/i)
    newPasscode.split('').forEach((d, idx) => {
      fireEvent.change(confirmPasscodeInputs[idx], { target: { value: d } })
    })

    // Click Reset Passcode
    const resetBtn = screen.getByRole('button', { name: /reset passcode/i })
    expect(resetBtn).not.toBeDisabled()
    fireEvent.click(resetBtn)

    // 3. Transitions to Passcode Login with success notice
    await waitFor(() => {
      expect(screen.getByText(/passcode updated\. sign in with your new passcode/i)).toBeInTheDocument()
      expect(screen.getByText(/enter 6–digit passcode/i)).toBeInTheDocument()
    })

    // Confirm repository has the new passcode
    expect(userRepository.verifyPasscode(testMobile, newPasscode)).toBe(true)

    // 4. Enter the new passcode on the login screen
    const loginPasscodeInputs = screen.getAllByLabelText(/digit [1-6] of 6/i)
    newPasscode.split('').forEach((d, idx) => {
      fireEvent.change(loginPasscodeInputs[idx], { target: { value: d } })
    })

    const loginBtn = screen.getByRole('button', { name: /verify passcode|login/i })
    fireEvent.click(loginBtn)

    // 5. Successful login navigates to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })
  })
})
