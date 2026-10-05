import React, { useState } from 'react'
import { LockIcon, EyeIcon, EyeOffIcon } from '../RegistrationIcons/RegistrationIcons'
import { routePaths } from '@core/config'
import { LegalDocumentModal, type LegalDocumentId } from '@modules/legal'
import { PASSCODE_LENGTH } from '../../validation/registrationValidation'
import './RegistrationSecurityFields.css'

const TERMS_ERROR_ID = 'reg-agreeTerms-error'

export interface RegistrationSecurityValues {
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

export interface RegistrationSecurityErrors {
  password?: string
  confirmPassword?: string
  agreeTerms?: string
}

export interface RegistrationSecurityFieldsProps {
  values: RegistrationSecurityValues
  errors: RegistrationSecurityErrors
  isFormValid: boolean
  isSubmitting: boolean
  submitLabel?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onToggleTerms: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const RegistrationSecurityFields: React.FC<RegistrationSecurityFieldsProps> = ({
  values,
  errors,
  isFormValid,
  isSubmitting,
  submitLabel = 'Complete Registration',
  onChange,
  onBlur,
  onToggleTerms,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [openPolicy, setOpenPolicy] = useState<LegalDocumentId | null>(null)

  /**
   * Plain click opens the policy in a dialog (form data stays intact);
   * Ctrl/Cmd/middle-click still opens the published page in a new tab.
   */
  const renderPolicyLink = (id: LegalDocumentId, href: string, label: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="reg-security-fields__terms-link"
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return
        e.preventDefault()
        setOpenPolicy(id)
      }}
    >
      {label}
    </a>
  )

  return (
    <div className="reg-security-fields">
      {/* Row 7: Passcode & Confirm Passcode */}
      <div className="reg-security-fields__row">
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-password">
            Create Passcode <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.password ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <LockIcon />
            </span>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PASSCODE_LENGTH}
              className="reg-field__input"
              placeholder={`Set your ${PASSCODE_LENGTH}-digit passcode`}
              value={values.password}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="reg-field__eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <p className="reg-field__error">{errors.password}</p>}
        </div>

        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-confirmPassword">
            Confirm Passcode <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.confirmPassword ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <LockIcon />
            </span>
            <input
              id="reg-confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PASSCODE_LENGTH}
              className="reg-field__input"
              placeholder={`Confirm ${PASSCODE_LENGTH}-digit passcode`}
              value={values.confirmPassword}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="reg-field__eye-btn"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide confirm passcode' : 'Show confirm passcode'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="reg-field__error">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Row 8: Terms and Privacy Checkbox */}
      <div
        className={`reg-security-fields__terms ${errors.agreeTerms ? 'reg-security-fields__terms--error' : ''}`}
      >
        <label className="reg-security-fields__checkbox-label" htmlFor="reg-agreeTerms">
          <input
            id="reg-agreeTerms"
            name="agreeTerms"
            type="checkbox"
            className="reg-security-fields__checkbox-input"
            checked={values.agreeTerms}
            onChange={onToggleTerms}
            aria-invalid={Boolean(errors.agreeTerms)}
            aria-describedby={errors.agreeTerms ? TERMS_ERROR_ID : undefined}
            aria-label="I agree to the Terms of Service and Privacy Policy"
          />
          <span className="reg-security-fields__custom-checkbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </label>
        <span className="reg-security-fields__terms-text">
          By creating an account, I agree to the{' '}
          {renderPolicyLink('terms', routePaths.legal.terms, 'Terms of Service')}{' '}
          and{' '}
          {renderPolicyLink('privacy', routePaths.legal.privacy, 'Privacy Policy')}
          .
        </span>
      </div>
      {errors.agreeTerms && (
        <p id={TERMS_ERROR_ID} className="reg-field__error reg-security-fields__terms-error" role="alert">
          {errors.agreeTerms}
        </p>
      )}

      {/* Row 9: Continue Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`reg-security-fields__btn ${
          isFormValid && !isSubmitting
            ? 'reg-security-fields__btn--active'
            : 'reg-security-fields__btn--inactive'
        }`}
      >
        {isSubmitting ? 'Processing...' : submitLabel}
      </button>

      <LegalDocumentModal documentId={openPolicy} onClose={() => setOpenPolicy(null)} />
    </div>
  )
}
