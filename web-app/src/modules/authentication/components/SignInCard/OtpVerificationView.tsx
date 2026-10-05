import React, { useState, useEffect, useRef } from 'react'
import './OtpVerificationView.css'

export interface OtpVerificationViewProps {
  mobile: string
  countryCode: string
  onChangeNumber: () => void
  onVerifyOtp: (otp: string) => void
  onResendOtp: () => void
  isSubmitting: boolean
  error: string | null
}

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 30

export const OtpVerificationView: React.FC<OtpVerificationViewProps> = ({
  mobile,
  countryCode,
  onChangeNumber,
  onVerifyOtp,
  onResendOtp,
  isSubmitting,
  error,
}) => {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Resend Countdown Timer using functional interval
  useEffect(() => {
    if (countdown <= 0) return
    const timerId = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timerId)
  }, [countdown])

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index: number, val: string) => {
    const cleanDigit = val.replace(/\D/g, '').slice(-1)
    const nextDigits = digits.map((d, i) => (i === index ? cleanDigit : d))
    setDigits(nextDigits)

    if (cleanDigit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const nextDigits = digits.map((d, i) => (i === index ? '' : d))
        setDigits(nextDigits)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const pastedChars = pasted.split('')
    const nextDigits = digits.map((_, i) => pastedChars[i] || '')
    setDigits(nextDigits)

    const nextFocusIndex = Math.min(pastedChars.length, OTP_LENGTH - 1)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  const isOtpComplete = digits.every((d) => d.length === 1 && /\d/.test(d))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOtpComplete || isSubmitting) return
    onVerifyOtp(digits.join(''))
  }

  const handleResend = () => {
    if (countdown > 0) return
    setCountdown(COUNTDOWN_SECONDS)
    setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
    inputRefs.current[0]?.focus()
    onResendOtp()
  }

  return (
    <form className="otp-verification-form" onSubmit={handleSubmit} noValidate>
      {/* Top Section: Mobile Number + OTP Boxes */}
      <div className="otp-verification-form__top-section">
        {/* Mobile Number Display matching Reference Image 2 */}
        <div className="otp-verification-form__mobile-field">
          <div className="otp-verification-form__mobile-label-row">
            <label className="otp-verification-form__label">Mobile Number</label>
            <button
              type="button"
              className="otp-verification-form__change-btn"
              onClick={onChangeNumber}
            >
              Change Number
            </button>
          </div>

          <div className="otp-verification-form__mobile-boxes">
            <div className="otp-verification-form__country-box">
              {countryCode}
            </div>
            <div className="otp-verification-form__number-box">
              {mobile}
            </div>
          </div>
        </div>

        {/* OTP Field */}
        <div className="otp-verification-form__field">
          <label className="otp-verification-form__label">Enter 6-Digit OTP</label>
          <div className="otp-verification-form__boxes" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={`otp-box-${idx}`}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`otp-verification-form__box ${
                  error ? 'otp-verification-form__box--error' : ''
                } ${digit ? 'otp-verification-form__box--filled' : ''}`}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1} of 6`}
              />
            ))}
          </div>

          {error && <span className="otp-verification-form__error-msg">{error}</span>}
        </div>

        {/* Resend Support */}
        <div className="otp-verification-form__resend-row">
          {countdown > 0 ? (
            <span className="otp-verification-form__timer-text">
              Resend code in 0:{countdown < 10 ? `0${countdown}` : countdown}
            </span>
          ) : (
            <button
              type="button"
              className="otp-verification-form__resend-btn"
              onClick={handleResend}
            >
              Resend code
            </button>
          )}
        </div>
      </div>

      {/* Bottom Actions: Verify Button */}
      <div className="otp-verification-form__bottom-actions">
        <button
          type="submit"
          className={`otp-verification-form__btn-primary ${
            isOtpComplete && !isSubmitting
              ? 'otp-verification-form__btn-primary--active'
              : 'otp-verification-form__btn-primary--disabled'
          }`}
          disabled={!isOtpComplete || isSubmitting}
        >
          <span>{isSubmitting ? 'Verifying...' : 'Verify OTP'}</span>
        </button>
      </div>
    </form>
  )
}

export default OtpVerificationView
