import React, { useState, useRef, useEffect } from 'react'
import './PasscodeLoginView.css'

export interface PasscodeLoginViewProps {
  mobile: string
  countryCode: string
  onChangeNumber: () => void
  onLogin: (passcode: string) => void
  isSubmitting: boolean
  error: string | null
  onForgotPasscode?: () => void
  notice?: string | null
}

const PASSCODE_LENGTH = 6

export const PasscodeLoginView: React.FC<PasscodeLoginViewProps> = ({
  mobile,
  countryCode,
  onChangeNumber,
  onLogin,
  isSubmitting,
  error,
  onForgotPasscode,
  notice,
}) => {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: PASSCODE_LENGTH }, () => ''))
  const [showPasscode, setShowPasscode] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Auto-focus first digit box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index: number, val: string) => {
    const cleanDigit = val.replace(/\D/g, '').slice(-1)
    const nextDigits = digits.map((d, i) => (i === index ? cleanDigit : d))
    setDigits(nextDigits)

    if (cleanDigit && index < PASSCODE_LENGTH - 1) {
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
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PASSCODE_LENGTH)
    if (!pasted) return

    const pastedChars = pasted.split('')
    const nextDigits = digits.map((_, i) => pastedChars[i] || '')
    setDigits(nextDigits)

    const nextFocusIndex = Math.min(pastedChars.length, PASSCODE_LENGTH - 1)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  const isPasscodeComplete = digits.every((d) => d.length === 1 && /\d/.test(d))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasscodeComplete || isSubmitting) return
    onLogin(digits.join(''))
  }

  return (
    <form className="passcode-login-form" onSubmit={handleSubmit} noValidate>
      {/* Top Section: Mobile Number + Passcode Boxes */}
      <div className="passcode-login-form__top-section">
        {/* Mobile Number Display matching Reference Image */}
        <div className="passcode-login-form__mobile-field">
          <div className="passcode-login-form__mobile-label-row">
            <label className="passcode-login-form__label">Mobile Number</label>
            <button
              type="button"
              className="passcode-login-form__change-btn"
              onClick={onChangeNumber}
            >
              Change Number
            </button>
          </div>

          <div className="passcode-login-form__mobile-boxes">
            <div className="passcode-login-form__country-box">
              {countryCode}
            </div>
            <div className="passcode-login-form__number-box">
              {mobile}
            </div>
          </div>
        </div>

        {/* Passcode 6-Box Input Field */}
        <div className="passcode-login-form__field">
          <div className="passcode-login-form__label-row">
            <label className="passcode-login-form__label">
              Enter 6–Digit Passcode
            </label>
            <button
              type="button"
              className="passcode-login-form__toggle-visibility-btn"
              onClick={() => setShowPasscode((prev) => !prev)}
            >
              {showPasscode ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="passcode-login-form__boxes" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={`passcode-box-${idx}`}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type={showPasscode ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`passcode-login-form__box ${
                  error ? 'passcode-login-form__box--error' : ''
                } ${digit ? 'passcode-login-form__box--filled' : ''}`}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoComplete="off"
                aria-label={`Digit ${idx + 1} of 6`}
              />
            ))}
          </div>

          {error && <span className="passcode-login-form__error-msg">{error}</span>}
          {!error && notice && (
            <span className="passcode-login-form__notice-msg" role="status">{notice}</span>
          )}
        </div>

        {/* Action Row below boxes: Forgot Passcode? */}
        <div className="passcode-login-form__forgot-row">
          <button
            type="button"
            className="passcode-login-form__forgot-link"
            onClick={onForgotPasscode}
          >
            Forgot Passcode?
          </button>
        </div>
      </div>

      {/* Bottom Actions: Login Button */}
      <div className="passcode-login-form__bottom-actions">
        <button
          type="submit"
          className={`passcode-login-form__btn-primary ${
            isPasscodeComplete && !isSubmitting
              ? 'passcode-login-form__btn-primary--active'
              : 'passcode-login-form__btn-primary--disabled'
          }`}
          disabled={!isPasscodeComplete || isSubmitting}
        >
          <span>{isSubmitting ? 'Verifying...' : 'Verify Passcode'}</span>
        </button>
      </div>
    </form>
  )
}

export default PasscodeLoginView
