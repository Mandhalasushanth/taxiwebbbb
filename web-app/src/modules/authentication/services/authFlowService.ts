import { env } from '@core/config'
import { isValidEmail } from '@shared/utils'
import { authStorage, permissionsFor, userRepository } from '@core/auth'
import type { AuthSession, AuthUser, UserRole } from '@core/auth'

import { authApi } from '../api/authApi'
import { DuplicateIdentityError, findIdentityConflicts } from './identityRegistry'
import type {
  LoginPayload,
  ResetPasscodePayload,
  SaveRegistrationStep1Payload,
  VerifyOtpPayload,
  VerifyPasscodePayload,
} from '../types/auth.types'

/* ------------------------------------------------------------------ *
 * Development mocks - delete this block once the API is live.
 * ------------------------------------------------------------------ */
/**
 * Demo sign-ins while mocks are on:
 *   9000000001  Super admin      9000000004  GST agent
 *   9000000002  Admin            9000000005  ITR agent
 *   9000000003  Manager          anything else  Customer
 */
const DEMO_ROLES: Record<string, { role: UserRole; fullName: string; id: string; department?: string }> = {
  '9000000001': { role: 'SUPER_ADMIN', fullName: 'Vasavi Reddy', id: 'stf_001', department: 'Operations' },
  '9000000002': { role: 'ADMIN', fullName: 'Rahul Menon', id: 'stf_002', department: 'Operations' },
  '9000000003': { role: 'MANAGER', fullName: 'Priya Nair', id: 'stf_003', department: 'Compliance' },
  '9000000004': { role: 'GST_AGENT', fullName: 'Imran Shaikh', id: 'stf_004', department: 'Compliance' },
  '9000000005': { role: 'ITR_AGENT', fullName: 'Sneha Kulkarni', id: 'stf_005', department: 'Compliance' },
}

const mockUser = (mobile: string): AuthUser => {
  const clean = mobile.replace(/\D/g, '')

  // 1. Retrieve previously stored user/profile data if this user has existing data
  const existingUser = userRepository.getUserByMobile(clean) as AuthUser | null
  if (existingUser) {
    const hasPass = Boolean(userRepository.hasPasscode(clean))
    return {
      ...existingUser,
      isProfileComplete: Boolean(existingUser.isProfileComplete || hasPass),
    }
  }

  // 2. Demo staff roles if applicable
  const demo = DEMO_ROLES[clean]
  if (demo) {
    return {
      id: demo.id,
      fullName: demo.fullName,
      email: `${demo.fullName.split(' ')[0].toLowerCase()}@taxedge.in`,
      mobile: clean,
      role: demo.role,
      department: demo.department,
      permissions: permissionsFor(demo.role),
      isProfileComplete: false,
    }
  }

  // 3. Fresh user state
  return {
    id: `usr_${clean || Date.now().toString(36)}`,
    fullName: '',
    email: '',
    mobile: clean,
    role: 'CUSTOMER',
    customerType: 'INDIVIDUAL',
    permissions: [],
    isProfileComplete: false,
  }
}

const mockSession = (mobile: string): AuthSession => ({
  user: mockUser(mobile),
  tokens: {
    accessToken: `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    refreshToken: `ref_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  },
})

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
/* ------------------------------------------------------------------ */

const digitsOf = (value: string | undefined) => (value ?? '').replace(/\D/g, '')

/**
 * Server-side style checks for profile creation (mirrors what the API must enforce):
 * the profile can only be saved for the mobile number verified by OTP in this session,
 * and the email must be well formed.
 */
const assertRegistrationAllowed = (payload: SaveRegistrationStep1Payload, cleanMobile: string): void => {
  const verifiedMobile = digitsOf(authStorage.getUser()?.mobile)
  if (verifiedMobile && (cleanMobile !== verifiedMobile || digitsOf(payload.user.mobile) !== verifiedMobile)) {
    throw new Error('Mobile number does not match the number verified by OTP. Please sign in again.')
  }
  if (payload.user.email && !isValidEmail(payload.user.email)) {
    throw new Error('Please enter a valid email address.')
  }
  // Unique constraint: one account per PAN and per email
  const conflicts = findIdentityConflicts({ mobile: cleanMobile, pan: payload.user.pan, email: payload.user.email })
  if (Object.keys(conflicts).length > 0) {
    throw new DuplicateIdentityError(conflicts)
  }
}

/**
 * Business rules for signing in and registration.
 * Calls the userRepository storage abstraction, isolating UI from direct storage/API.
 */
export const authFlowService = {
  /** Retrieve user by mobile through storage abstraction */
  getUserByMobile(mobile: string): AuthUser | null {
    const clean = mobile.replace(/\D/g, '')
    return (userRepository.getUserByMobile(clean) as AuthUser | null) || null
  },

  /** Create new user through storage abstraction */
  createUser(user: AuthUser, passcode?: string) {
    return userRepository.createUser(user, passcode)
  },

  /** Update existing user profile through storage abstraction */
  updateUser(user: Partial<AuthUser> & { mobile: string }) {
    return userRepository.updateUser(user)
  },

  /** Check dynamically if user has created a passcode */
  hasPasscode(mobile: string): boolean {
    const clean = mobile.replace(/\D/g, '')
    return Boolean(userRepository.hasPasscode(clean))
  },

  /** Save passcode state through storage abstraction */
  savePasscodeState(mobile: string, passcode: string): void {
    const clean = mobile.replace(/\D/g, '')
    userRepository.savePasscodeState(clean, passcode)
    const record = authStorage.getRegisteredUser(clean)
    authStorage.saveRegisteredUser({
      mobile: clean,
      isRegistered: true,
      user: record?.user ?? mockUser(clean),
      passcode,
    })
  },

  /** Get user profile through storage abstraction */
  getProfile(mobile: string): AuthUser | null {
    const clean = mobile.replace(/\D/g, '')
    return (userRepository.getProfile(clean) as AuthUser | null) || null
  },

  /** Save user profile through storage abstraction */
  saveProfile(mobile: string, profile: Partial<AuthUser>): void {
    const clean = mobile.replace(/\D/g, '')
    userRepository.saveProfile(clean, profile)
  },

  /** Check if a mobile number is already registered (has completed registration with a passcode) */
  isRegistered(mobile: string): boolean {
    return this.hasPasscode(mobile)
  },

  /** Retrieve active session */
  getSession(): AuthSession | null {
    return (userRepository.getSession() as AuthSession | null) || null
  },

  /** Clear session on logout / expiry without deleting user data */
  clearSession(): void {
    userRepository.clearSession()
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    if (env.enableMocks) {
      await delay()
      return mockSession(payload.mobile)
    }
    return authApi.login(payload)
  },

  async verifyPasscode(payload: VerifyPasscodePayload): Promise<AuthSession> {
    const clean = payload.mobile.replace(/\D/g, '')
    if (env.enableMocks) {
      await delay(300)
      const hasPass = Boolean(userRepository.hasPasscode(clean))
      if (!hasPass) {
        throw new Error('No passcode created for this account. Please log in via OTP.')
      }

      const isMatch = Boolean(userRepository.verifyPasscode(clean, payload.passcode))
      if (!isMatch) {
        throw new Error('Incorrect passcode. Please enter the passcode you created during registration.')
      }

      const storedUser = (userRepository.getUserByMobile(clean) as AuthUser | null) || mockUser(clean)
      const userProfile: AuthUser = {
        ...storedUser,
        isProfileComplete: true,
      }

      const session: AuthSession = {
        user: userProfile,
        tokens: {
          accessToken: `tok_${clean}_${Date.now().toString(36)}`,
          refreshToken: `ref_${clean}_${Date.now().toString(36)}`,
        },
      }
      userRepository.saveSession(session)
      authStorage.setTokens(session.tokens)
      authStorage.setUser(userProfile)
      return session
    }

    return authApi.login({ mobile: payload.mobile, password: payload.passcode })
  },

  async saveRegistrationStep1(payload: SaveRegistrationStep1Payload): Promise<void> {
    const clean = payload.mobile.replace(/\D/g, '')
    assertRegistrationAllowed(payload, clean)
    const step1User: AuthUser = {
      ...payload.user,
      isProfileComplete: true,
    }

    // Persist passcode and profile through storage abstraction
    userRepository.createUser(step1User, payload.passcode)

    authStorage.saveRegisteredUser({
      mobile: clean,
      passcode: payload.passcode,
      isRegistered: true,
      user: step1User,
    })
    authStorage.setUser(step1User)

    const session: AuthSession = {
      user: step1User,
      tokens: authStorage.getTokens() || {
        accessToken: `tok_${clean}_${Date.now().toString(36)}`,
        refreshToken: `ref_${clean}_${Date.now().toString(36)}`,
      },
    }
    userRepository.saveSession(session)
  },

  async completeRegistration(mobile: string, customerType?: string): Promise<void> {
    const clean = mobile.replace(/\D/g, '')
    const existing = (userRepository.getUserByMobile(clean) as AuthUser | null)
    if (existing) {
      const updatedUser: AuthUser = {
        ...existing,
        customerType: customerType || existing.customerType,
        isProfileComplete: true,
      }
      userRepository.saveProfile(clean, updatedUser)
      const record = authStorage.getRegisteredUser(clean)
      if (record) {
        authStorage.saveRegisteredUser({
          ...record,
          isRegistered: true,
          user: updatedUser,
        })
      }
      authStorage.setUser(updatedUser)

      const currentTokens = authStorage.getTokens()
      if (currentTokens) {
        userRepository.saveSession({ user: updatedUser, tokens: currentTokens })
      }
    }
  },

  /** Replaces the passcode of an existing account after its OTP has been verified (Forgot Passcode). */
  async resetPasscode(payload: ResetPasscodePayload): Promise<void> {
    const clean = payload.mobile.replace(/\D/g, '')
    if (env.enableMocks) {
      await delay(300)
      if (!this.hasPasscode(clean)) {
        throw new Error('No registered account found for this mobile number.')
      }
      userRepository.savePasscodeState(clean, payload.passcode)
      const record = authStorage.getRegisteredUser(clean)
      authStorage.saveRegisteredUser({
        mobile: clean,
        isRegistered: true,
        user: record?.user ?? mockUser(clean),
        passcode: payload.passcode,
      })
      return
    }
    await authApi.setPasscode({ mobile: clean, passcode: payload.passcode })
  },

  async sendOtp(mobile: string): Promise<void> {
    if (env.enableMocks) {
      await delay(300)
      return
    }
    await authApi.sendOtp({ mobile })
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    const cleanOtp = (payload.otp || '').trim()
    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error('Please enter a valid 6-digit numeric OTP.')
    }

    if (env.enableMocks) {
      await delay(300)
      const clean = payload.mobile.replace(/\D/g, '')
      // Check if user already exists or create initial user record without passcode
      let user = (userRepository.getUserByMobile(clean) as AuthUser | null)
      if (!user) {
        const initialUser = mockUser(clean)
        userRepository.createUser(initialUser)
        user = initialUser
      }

      const session: AuthSession = {
        user,
        tokens: {
          accessToken: `tok_${clean}_${Date.now().toString(36)}`,
          refreshToken: `ref_${clean}_${Date.now().toString(36)}`,
        },
      }
      return session
    }
    return authApi.verifyOtp({ ...payload, otp: cleanOtp })
  },

  async logout(): Promise<void> {
    userRepository.clearSession()
    if (env.enableMocks) return
    try {
      await authApi.logout()
    } catch {
      /* signing out locally must succeed even if the server call fails */
    }
  },
}
