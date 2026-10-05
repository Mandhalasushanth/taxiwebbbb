import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { authStorage, resolvePostLoginPath } from '@core/auth'
import type { SessionEndReason } from '@core/auth'
import { useAuthStore } from '@store/index'
import { formatMobile, validateMobileNumber } from '@shared/utils'
import { authFlowService } from '../../services/authFlowService'
import { COUNTRY_CODES } from '../../constants/authData.constants'
import { MobileEntryView } from './MobileEntryView'
import { OtpVerificationView } from './OtpVerificationView'
import { PasscodeLoginView } from './PasscodeLoginView'
import { SetPasscodeView } from './SetPasscodeView'
import './SignInCard.css'

export type AuthMode = 'mobile' | 'otp' | 'passcode' | 'reset'

const PASSCODE_RESET_NOTICE = 'Passcode updated. Sign in with your new passcode.'

/** Explains why the user is back on the login screen; plain sign-outs need no message. */
const SESSION_END_NOTICES: Partial<Record<SessionEndReason, string>> = {
  timeout: 'Automatic session timeout: you were signed out after a period of inactivity. Please sign in again.',
  expired: 'Your session has expired. Please sign in again.',
}

export interface SignInCardProps {
  initialMobile?: string
  initialMode?: AuthMode
}

export const SignInCard: React.FC<SignInCardProps> = ({
  initialMobile = '',
  initialMode = 'mobile',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  // One-time notice: captured when the login screen opens right after a timeout / expiry,
  // then cleared so later visits (or a reload) show the normal login screen
  const [sessionNotice] = useState(() => {
    const reason = useAuthStore.getState().sessionEndReason
    return reason ? SESSION_END_NOTICES[reason] : undefined
  })
  useEffect(() => {
    if (useAuthStore.getState().sessionEndReason) useAuthStore.getState().clearSessionEndReason()
  }, [])
  const getPostLoginPath = () => resolvePostLoginPath(location.search, location.state, routePaths.dashboard)
  const signIn = useAuthStore((state) => state.signIn)

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode)
  const [mobile, setMobile] = useState(initialMobile)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isResetFlow, setIsResetFlow] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Login supports Indian numbers only (OTP + validation are +91-specific)
  const selectedCountry = COUNTRY_CODES[0]
  const cleanMobile = mobile.replace(/\D/g, '').trim()

  const handleMobileChange = (val: string) => {
    const cleaned = formatMobile(val)
    setMobile(cleaned)
    if (error) setError(null)
  }

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const mobileError = validateMobileNumber(cleanMobile)
    if (mobileError) {
      setError(mobileError)
      return
    }

    setError(null)
    setIsSubmitting(true)
    setIsResetFlow(false)

    try {
      await authFlowService.sendOtp(cleanMobile)
      setAuthMode('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to proceed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const session = await authFlowService.verifyOtp({
        mobile: cleanMobile,
        otp,
      })

      // Check dynamically if user has created a passcode
      const userHasPasscode = authFlowService.hasPasscode(cleanMobile)
      if (userHasPasscode) {
        if (isResetFlow) {
          // Forgot passcode: OTP proves ownership, so let them choose a new passcode right here
          setAuthMode('reset')
          return
        }
        // For users who have created a passcode: OTP is verified, now prompt for passcode
        setAuthMode('passcode')
        return
      }

      // For new users or users with verified OTP: start persistent session
      authStorage.setTokens(session.tokens)
      authStorage.setUser(session.user)
      signIn(session)
      const targetPath = getPostLoginPath()
      navigate(targetPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    try {
      await authFlowService.sendOtp(cleanMobile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.')
    }
  }

  const handleSetNewPasscode = async (passcode: string) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await authFlowService.resetPasscode({ mobile: cleanMobile, passcode })
      setIsResetFlow(false)
      setNotice(PASSCODE_RESET_NOTICE)
      setAuthMode('passcode')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update passcode. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelReset = () => {
    setIsResetFlow(false)
    setError(null)
    setAuthMode('passcode')
  }

  const handlePasscodeLogin = async (passcode: string) => {
    setError(null)
    setNotice(null)
    setIsSubmitting(true)
    try {
      const session = await authFlowService.verifyPasscode({
        mobile: cleanMobile,
        passcode,
      })
      authStorage.setTokens(session.tokens)
      authStorage.setUser(session.user)
      signIn(session)
      const targetPath = getPostLoginPath()
      navigate(targetPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect passcode. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPasscode = async () => {
    setError(null)
    setNotice(null)
    setIsSubmitting(true)
    setIsResetFlow(true)
    try {
      await authFlowService.sendOtp(cleanMobile)
      setAuthMode('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeNumber = () => {
    setAuthMode('mobile')
    setIsResetFlow(false)
    setNotice(null)
    setError(null)
  }


  const getSubtitle = () => {
    if (authMode === 'otp') return 'Enter the 6-digit OTP sent to your mobile number'
    if (authMode === 'passcode') return 'Enter your 6-digit passcode to sign in'
    if (authMode === 'reset') return 'Set a new 6-digit passcode for your account'
    return 'Sign in to continue to your TaxEdge account'
  }

  return (
    <div className="sign-in-card">
      {authMode === 'mobile' ? (
        <div className="sign-in-card__brand sign-in-card__brand--stacked">
          <img
            src="/assets/images/taxedge-brand-icon.png"
            alt="TaxEdge"
            className="sign-in-card__brand-icon sign-in-card__brand-icon--stacked"
          />
          <div className="sign-in-card__brand-text-block sign-in-card__brand-text-block--stacked">
            <div className="sign-in-card__brand-title">
              <span className="brand-title--navy">Tax</span>
              <span className="brand-title--orange">Edge</span>
            </div>
            <span className="sign-in-card__brand-sub">FIN SOLUTIONS</span>
          </div>
        </div>
      ) : (
        <div className="sign-in-card__brand sign-in-card__brand--inline">
          <div className="sign-in-card__brand-row">
            <img
              src="/assets/images/taxedge-brand-icon.png"
              alt="TaxEdge"
              className="sign-in-card__brand-icon"
            />
            <div className="sign-in-card__brand-divider" />
            <div className="sign-in-card__brand-text-block">
              <div className="sign-in-card__brand-title">
                <span className="brand-title--navy">Tax</span>
                <span className="brand-title--orange">Edge</span>
              </div>
              <span className="sign-in-card__brand-sub">FIN SOLUTIONS</span>
            </div>
          </div>
        </div>
      )}

      <header className={`sign-in-card__header ${authMode === 'mobile' ? 'sign-in-card__header--stacked' : ''}`}>
        <h2 className="sign-in-card__title">Welcome Back 👋</h2>
        <p className="sign-in-card__subtitle">{getSubtitle()}</p>
      </header>

      {sessionNotice && (
        <p className="sign-in-card__session-notice" role="alert">
          {sessionNotice}
        </p>
      )}

      {authMode === 'mobile' && (
        <MobileEntryView
          mobile={mobile}
          onMobileChange={handleMobileChange}
          selectedCountryCode={selectedCountry.code}
          onSubmit={handleMobileSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}

      {authMode === 'otp' && (
        <OtpVerificationView
          mobile={cleanMobile}
          countryCode={selectedCountry.code}
          onChangeNumber={handleChangeNumber}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}

      {authMode === 'passcode' && (
        <PasscodeLoginView
          mobile={cleanMobile}
          countryCode={selectedCountry.code}
          onChangeNumber={handleChangeNumber}
          onLogin={handlePasscodeLogin}
          isSubmitting={isSubmitting}
          error={error}
          onForgotPasscode={handleForgotPasscode}
          notice={notice}
        />
      )}

      {authMode === 'reset' && (
        <SetPasscodeView
          mobile={cleanMobile}
          countryCode={selectedCountry.code}
          onSubmit={handleSetNewPasscode}
          onCancel={handleCancelReset}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  )
}

export default SignInCard
