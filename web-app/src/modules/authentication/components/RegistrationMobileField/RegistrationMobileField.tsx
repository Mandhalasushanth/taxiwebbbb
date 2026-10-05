import React from 'react'
import { CheckCircleIcon, PhoneIcon } from '../RegistrationIcons/RegistrationIcons'
import './RegistrationMobileField.css'

export interface RegistrationMobileFieldProps {
  value: string
  error?: string
  /** True once the number was verified by OTP — it then cannot be edited here */
  isVerified: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const RegistrationMobileField: React.FC<RegistrationMobileFieldProps> = ({
  value,
  error,
  isVerified,
  onChange,
  onBlur,
}) => (
  <div className="reg-field">
    <label className="reg-field__label" htmlFor="reg-mobile">
      Mobile Number <span className="reg-field__required">*</span>
    </label>
    <div
      className={[
        'reg-field__control',
        error ? 'reg-field__control--error' : '',
        isVerified ? 'reg-mobile-field__control--locked' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="reg-field__icon">
        <PhoneIcon />
      </span>
      <input
        id="reg-mobile"
        name="mobile"
        type="tel"
        inputMode="numeric"
        className="reg-field__input"
        placeholder="Mobile Number"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={isVerified}
        aria-readonly={isVerified}
        autoComplete="tel"
      />
      {isVerified && (
        <span className="reg-mobile-field__verified" title="Verified by OTP">
          <CheckCircleIcon />
          <span>Verified</span>
        </span>
      )}
    </div>
    {error && <p className="reg-field__error">{error}</p>}
  </div>
)

export default RegistrationMobileField
