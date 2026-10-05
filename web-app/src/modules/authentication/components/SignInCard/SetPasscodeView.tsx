import React, { useState } from 'react'
import {
  PASSCODE_LENGTH,
  validateConfirmPasscode,
  validateNewPasscode,
} from '../../validation/passcodeValidation'
import { PasscodeDigitInput } from './PasscodeDigitInput'
import './SetPasscodeView.css'

export interface SetPasscodeViewProps {
  mobile: string
  countryCode: string
  onSubmit: (passcode: string) => void
  onCancel: () => void
  isSubmitting: boolean
  error: string | null
}

interface FieldErrors {
  passcode?: string
  confirmPasscode?: string
}

/** "Set New Passcode" step of the Forgot Passcode flow, shown after the OTP is verified. */
export const SetPasscodeView: React.FC<SetPasscodeViewProps> = ({
  mobile,
  countryCode,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}) => {
  const [passcode, setPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const isComplete = passcode.length === PASSCODE_LENGTH && confirmPasscode.length === PASSCODE_LENGTH
  const canSubmit = isComplete && !isSubmitting

  const handlePasscodeChange = (val: string) => {
    setPasscode(val)
    setFieldErrors((prev) => ({ ...prev, passcode: undefined }))
  }

  const handleConfirmChange = (val: string) => {
    setConfirmPasscode(val)
    setFieldErrors((prev) => ({ ...prev, confirmPasscode: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const nextErrors: FieldErrors = {
      passcode: validateNewPasscode(passcode, mobile),
      confirmPasscode: validateConfirmPasscode(passcode, confirmPasscode),
    }
    setFieldErrors(nextErrors)
    if (nextErrors.passcode || nextErrors.confirmPasscode) return
    onSubmit(passcode)
  }

  const renderFieldError = (message?: string) =>
    message ? <span className="set-passcode-form__error-msg">{message}</span> : null

  return (
    <form className="set-passcode-form" onSubmit={handleSubmit} noValidate>
      <div className="set-passcode-form__mobile-row">
        <span className="set-passcode-form__mobile-label">Resetting passcode for</span>
        <span className="set-passcode-form__mobile-value">{`${countryCode} ${mobile}`}</span>
      </div>

      <div className="set-passcode-form__field">
        <div className="set-passcode-form__label-row">
          <label className="set-passcode-form__label">New 6–Digit Passcode</label>
          <button
            type="button"
            className="set-passcode-form__link-btn"
            onClick={() => setShowPasscode((prev) => !prev)}
          >
            {showPasscode ? 'Hide' : 'Show'}
          </button>
        </div>
        <PasscodeDigitInput
          value={passcode}
          onChange={handlePasscodeChange}
          length={PASSCODE_LENGTH}
          label="New passcode"
          masked={!showPasscode}
          hasError={Boolean(fieldErrors.passcode)}
          autoFocus
        />
        {renderFieldError(fieldErrors.passcode)}
      </div>

      <div className="set-passcode-form__field">
        <label className="set-passcode-form__label">Confirm New Passcode</label>
        <PasscodeDigitInput
          value={confirmPasscode}
          onChange={handleConfirmChange}
          length={PASSCODE_LENGTH}
          label="Confirm passcode"
          masked={!showPasscode}
          hasError={Boolean(fieldErrors.confirmPasscode)}
        />
        {renderFieldError(fieldErrors.confirmPasscode)}
      </div>

      <p className="set-passcode-form__hint">
        Avoid repeated, sequential or patterned digits and parts of your mobile number.
      </p>

      {renderFieldError(error ?? undefined)}

      <div className="set-passcode-form__actions">
        <button
          type="submit"
          className={`set-passcode-form__btn-primary ${canSubmit ? 'set-passcode-form__btn-primary--active' : 'set-passcode-form__btn-primary--disabled'}`}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Saving...' : 'Set New Passcode'}
        </button>
        <button type="button" className="set-passcode-form__link-btn set-passcode-form__cancel" onClick={onCancel}>
          Back to Sign In
        </button>
      </div>
    </form>
  )
}

export default SetPasscodeView
