import type { AuthSession, AuthUser } from '@core/auth'

export interface LoginPayload {
  mobile: string
  password: string
}

export interface SendOtpPayload {
  mobile: string
}

export interface VerifyOtpPayload {
  mobile: string
  otp: string
}

export interface VerifyPasscodePayload {
  mobile: string
  passcode: string
}

export interface ResetPasscodePayload {
  mobile: string
  passcode: string
}

export interface SaveRegistrationStep1Payload {
  mobile: string
  passcode: string
  user: AuthUser
}

export type LoginResponse = AuthSession
