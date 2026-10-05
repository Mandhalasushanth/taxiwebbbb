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
import {
  userRepository,
  LocalStorageUserRepository,
  ApiUserRepository,
  type IUserRepository,
} from '../../src/core/storage/userRepository'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import { SignInCard } from '../../src/modules/authentication/components/SignInCard/SignInCard'
import { useAuthStore } from '../../src/store'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/auth/login' }),
  }
})

describe('Dynamic Authentication Flow & Storage Abstraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userRepository.clearAll()
    authStorage.clearAll()
    useAuthStore.getState().signOut()
  })

  afterEach(() => {
    cleanup()
  })

  describe('userRepository storage abstraction layer', () => {
    it('implements IUserRepository interface methods cleanly', () => {
      const storageRepo: IUserRepository = new LocalStorageUserRepository()
      const apiRepo: IUserRepository = new ApiUserRepository()

      expect(typeof storageRepo.getUserByMobile).toBe('function')
      expect(typeof storageRepo.createUser).toBe('function')
      expect(typeof storageRepo.updateUser).toBe('function')
      expect(typeof storageRepo.hasPasscode).toBe('function')
      expect(typeof storageRepo.savePasscodeState).toBe('function')
      expect(typeof storageRepo.getProfile).toBe('function')
      expect(typeof storageRepo.saveProfile).toBe('function')
      expect(typeof storageRepo.getSession).toBe('function')
      expect(typeof storageRepo.clearSession).toBe('function')

      // Ensure ApiUserRepository conforms to same interface
      expect(typeof apiRepo.getUserByMobile).toBe('function')
      expect(typeof apiRepo.createUser).toBe('function')
      expect(typeof apiRepo.updateUser).toBe('function')
      expect(typeof apiRepo.hasPasscode).toBe('function')
      expect(typeof apiRepo.savePasscodeState).toBe('function')
      expect(typeof apiRepo.getProfile).toBe('function')
      expect(typeof apiRepo.saveProfile).toBe('function')
      expect(typeof apiRepo.getSession).toBe('function')
      expect(typeof apiRepo.clearSession).toBe('function')
    })

    it('separates session information from permanent user data', () => {
      const mobile = '9876543210'
      const user = {
        id: `usr_${mobile}`,
        fullName: 'Amit Verma',
        email: 'amit@example.com',
        mobile,
        role: 'CUSTOMER' as const,
        isProfileComplete: true,
      }

      // 1. Create user and establish session
      userRepository.createUser(user, '581923')
      userRepository.saveSession({
        user,
        tokens: { accessToken: 'tok_active', refreshToken: 'ref_active' },
      })

      expect(userRepository.getSession()).not.toBeNull()
      expect(userRepository.hasPasscode(mobile)).toBe(true)
      expect(userRepository.getUserByMobile(mobile)?.fullName).toBe('Amit Verma')

      // 2. Clear session (simulate manual logout or session expiry)
      userRepository.clearSession()

      // Session tokens and active session user are cleared
      expect(userRepository.getSession()).toBeNull()

      // BUT permanent user data and passcode status MUST remain intact
      expect(userRepository.hasPasscode(mobile)).toBe(true)
      expect(userRepository.getUserByMobile(mobile)?.fullName).toBe('Amit Verma')
      expect(userRepository.getUserByMobile(mobile)?.email).toBe('amit@example.com')
    })

    it('retrieves previously stored frontend data when the same user logs out and logs in again', async () => {
      const mobile = '9988776655'

      // First session: User registers with profile info
      await authFlowService.saveRegistrationStep1({
        mobile,
        passcode: '901284',
        user: {
          id: `usr_${mobile}`,
          fullName: 'Priya Patel',
          email: 'priya@example.com',
          mobile,
          role: 'CUSTOMER',
          city: 'Hyderabad',
          pan: 'ABCDE1234F',
          isProfileComplete: true,
        },
      })

      // Verify data is saved
      const savedProfile = authFlowService.getProfile(mobile)
      expect(savedProfile?.fullName).toBe('Priya Patel')
      expect(savedProfile?.city).toBe('Hyderabad')

      // User logs out (session cleared)
      await authFlowService.logout()
      expect(authFlowService.getSession()).toBeNull()

      // User logs in again: Mobile -> OTP
      const reLoginSession = await authFlowService.verifyOtp({ mobile, otp: '654321' })

      // User's previously entered frontend data is retrieved
      expect(reLoginSession.user.fullName).toBe('Priya Patel')
      expect(reLoginSession.user.city).toBe('Hyderabad')
      expect(reLoginSession.user.pan).toBe('ABCDE1234F')
    })
  })

  describe('authFlowService dynamic passcode & OTP behaviors', () => {
    it('accepts any valid 6-digit numeric OTP without hardcoding', async () => {
      const mobile = '9876543210'

      // Test with arbitrary 6-digit numeric codes
      const session1 = await authFlowService.verifyOtp({ mobile, otp: '654321' })
      expect(session1.user.mobile).toBe(mobile)

      const session2 = await authFlowService.verifyOtp({ mobile, otp: '888888' })
      expect(session2.user.mobile).toBe(mobile)

      const session3 = await authFlowService.verifyOtp({ mobile, otp: '012938' })
      expect(session3.user.mobile).toBe(mobile)
    })

    it('rejects invalid OTP formats', async () => {
      const mobile = '9876543210'

      await expect(authFlowService.verifyOtp({ mobile, otp: '123' })).rejects.toThrow(
        'Please enter a valid 6-digit numeric OTP.'
      )
      await expect(authFlowService.verifyOtp({ mobile, otp: 'abcdef' })).rejects.toThrow(
        'Please enter a valid 6-digit numeric OTP.'
      )
      await expect(authFlowService.verifyOtp({ mobile, otp: '1234567' })).rejects.toThrow(
        'Please enter a valid 6-digit numeric OTP.'
      )
    })

    it('Scenario 1: User without passcode (Mobile -> OTP -> Dashboard -> Logout -> Mobile -> OTP -> Dashboard)', async () => {
      const mobile = '9876543210'

      // Step 1: Initial check - user has no passcode
      expect(authFlowService.hasPasscode(mobile)).toBe(false)

      // Step 2: User verifies OTP
      const session = await authFlowService.verifyOtp({ mobile, otp: '482019' })
      expect(session).toBeDefined()
      expect(session.user.isProfileComplete).toBe(false)

      // Confirm user still has no passcode
      expect(authFlowService.hasPasscode(mobile)).toBe(false)

      // Step 3: User logs out (session tokens and user are cleared)
      authStorage.setTokens(session.tokens)
      authStorage.setUser(session.user)
      expect(authStorage.getTokens()).not.toBeNull()

      authStorage.clear()
      expect(authStorage.getTokens()).toBeNull()

      // Step 4: User comes back again -> still has no passcode!
      expect(authFlowService.hasPasscode(mobile)).toBe(false)

      // OTP verification works again with another 6-digit code
      const sessionReturn = await authFlowService.verifyOtp({ mobile, otp: '776655' })
      expect(sessionReturn.user.mobile).toBe(mobile)
      expect(authFlowService.hasPasscode(mobile)).toBe(false)
    })

    it('Scenario 2: User creates passcode -> subsequent logins require passcode matching', async () => {
      const mobile = '9123456780'

      // Initial state: no passcode
      expect(authFlowService.hasPasscode(mobile)).toBe(false)

      // User creates a passcode during profile completion
      const testPasscode = '492817'
      await authFlowService.saveRegistrationStep1({
        mobile,
        passcode: testPasscode,
        user: {
          id: `usr_${mobile}`,
          fullName: 'Sagarika Sharma',
          email: 'sagarika@example.com',
          mobile,
          role: 'CUSTOMER',
          isProfileComplete: true,
        },
      })

      // State is now dynamically updated: user HAS passcode
      expect(authFlowService.hasPasscode(mobile)).toBe(true)

      // User logs out / session expires
      authStorage.clear()
      expect(authStorage.getTokens()).toBeNull()

      // Passcode status MUST persist across logout/session expiry
      expect(authFlowService.hasPasscode(mobile)).toBe(true)

      // Entering incorrect passcode throws error
      await expect(
        authFlowService.verifyPasscode({ mobile, passcode: '111111' })
      ).rejects.toThrow('Incorrect passcode. Please enter the passcode you created during registration.')

      // Entering correct passcode succeeds and creates authenticated session
      const validSession = await authFlowService.verifyPasscode({ mobile, passcode: testPasscode })
      expect(validSession.user.mobile).toBe(mobile)
      expect(validSession.user.fullName).toBe('Sagarika Sharma')
      expect(validSession.user.isProfileComplete).toBe(true)
    })
  })

  describe('SignInCard UI dynamic flow', () => {
    it('Case A (No Passcode): User enters Mobile -> OTP -> navigates directly to Dashboard without asking for Passcode', async () => {
      render(
        <MemoryRouter>
          <SignInCard />
        </MemoryRouter>
      )

      // 1. Enter mobile number
      const mobileInput = screen.getByPlaceholderText('Enter your mobile number')
      fireEvent.change(mobileInput, { target: { value: '9876543210' } })

      const continueBtn = screen.getByRole('button', { name: /^continue$/i })
      fireEvent.click(continueBtn)

      // 2. Should transition to OTP view
      await waitFor(() => {
        expect(screen.getByText('Enter 6-Digit OTP')).toBeInTheDocument()
      })

      // 3. Enter 6-digit OTP
      const digits = ['5', '8', '2', '9', '1', '0']
      digits.forEach((digit, i) => {
        const box = screen.getByLabelText(`Digit ${i + 1} of 6`)
        fireEvent.change(box, { target: { value: digit } })
      })

      // 4. Verify OTP button click
      const verifyBtn = screen.getByRole('button', { name: /verify otp/i })
      fireEvent.click(verifyBtn)

      // 5. User should be directly taken to dashboard without passcode view
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })

      // Ensure Passcode view was NOT displayed
      expect(screen.queryByText(/enter your 6-digit passcode/i)).not.toBeInTheDocument()
    })

    it('Case B (Has Passcode): User enters Mobile -> OTP -> transitions to Passcode View -> verifies Passcode', async () => {
      const mobile = '9876543211'
      const createdPasscode = '381920'

      // Seed registered user with a created passcode through repository
      userRepository.createUser({
        id: `usr_${mobile}`,
        fullName: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        mobile,
        role: 'CUSTOMER',
        isProfileComplete: true,
      }, createdPasscode)

      render(
        <MemoryRouter>
          <SignInCard />
        </MemoryRouter>
      )

      // 1. Enter mobile number
      const mobileInput = screen.getByPlaceholderText('Enter your mobile number')
      fireEvent.change(mobileInput, { target: { value: mobile } })

      const continueBtn = screen.getByRole('button', { name: /^continue$/i })
      fireEvent.click(continueBtn)

      // 2. Transition to OTP view
      await waitFor(() => {
        expect(screen.getByText('Enter 6-Digit OTP')).toBeInTheDocument()
      })

      // 3. Enter arbitrary 6-digit OTP
      const digits = ['7', '6', '5', '4', '3', '2']
      digits.forEach((digit, i) => {
        const box = screen.getByLabelText(`Digit ${i + 1} of 6`)
        fireEvent.change(box, { target: { value: digit } })
      })

      const verifyBtn = screen.getByRole('button', { name: /verify otp/i })
      fireEvent.click(verifyBtn)

      // 4. Because user has a passcode, must transition to Passcode Login View!
      await waitFor(() => {
        expect(screen.getByText(/enter your 6-digit passcode/i)).toBeInTheDocument()
      })
      expect(mockNavigate).not.toHaveBeenCalled()

      // 5. Try entering incorrect passcode first
      const wrongPasscode = ['1', '1', '1', '1', '1', '1']
      wrongPasscode.forEach((digit, i) => {
        const box = screen.getByLabelText(`Digit ${i + 1} of 6`)
        fireEvent.change(box, { target: { value: wrongPasscode[i] } })
      })

      const verifyPasscodeBtn = screen.getByRole('button', { name: /verify passcode/i })
      fireEvent.click(verifyPasscodeBtn)

      // Should display error message
      await waitFor(() => {
        expect(
          screen.getByText(/incorrect passcode/i)
        ).toBeInTheDocument()
      })
      expect(mockNavigate).not.toHaveBeenCalled()

      // 6. Enter correct passcode
      const correctDigits = createdPasscode.split('')
      correctDigits.forEach((digit, i) => {
        const box = screen.getByLabelText(`Digit ${i + 1} of 6`)
        fireEvent.change(box, { target: { value: correctDigits[i] } })
      })
      fireEvent.click(verifyPasscodeBtn)

      // Should succeed and navigate to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })
    })
  })
})
