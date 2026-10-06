import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import { useState, type FormEvent, type ChangeEvent } from 'react'
import { StepActionBar } from '@shared/components'
import { GSTBusinessDetails } from '../GSTBusinessDetails/GSTBusinessDetails'
import { GSTBankDetails } from '../GSTBankDetails/GSTBankDetails'
import { GSTAuthorisedSignatory } from '../GSTAuthorisedSignatory/GSTAuthorisedSignatory'
import { validateGstBusinessForm } from '@modules/gst/validation/gstStepBusiness.validator'
import './GSTStepBusiness.css'

import { type GstBusinessFormData, type BusinessFormData } from '@modules/gst/types/gstBusiness.types'
export type { GstBusinessFormData, BusinessFormData }

interface GSTStepBusinessProps {
  data: GstBusinessFormData
  isEditMode?: boolean
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  onNext: () => void
  onCancel?: () => void
  onSaveDraft?: () => void
}

export const GSTStepBusiness = ({
  data,
  isEditMode = false,
  onChange,
  onNext,
  onCancel,
  onSaveDraft,
}: GSTStepBusinessProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepError, setStepError] = useState<string | null>(null)

  const clearErr = (k: string) => {
    setStepError(null)
    setErrors((prev) => {
      if (!prev[k]) return prev
      const { [k]: _, ...rest } = prev
      return rest
    })
  }

  const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('aadhaarConsent', e.target.checked)
    clearErr('aadhaarConsent')
  }

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const errs = validateGstBusinessForm(data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setStepError(GST_STEP_ERROR)
      const firstErrorField = Object.keys(errs)[0]
      const el = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onNext()
  }

  return (
    <form className="gst-step-business gst-step-business-container" onSubmit={handleSubmit} noValidate>
      {/* 1. Business Details Section */}
      <GSTBusinessDetails
        data={data}
        onChange={onChange}
        errors={errors}
        onClearError={clearErr}
      />

      {/* 2. Bank Account Details Section */}
      <GSTBankDetails
        data={data}
        onChange={onChange}
        errors={errors}
        onClearError={clearErr}
      />

      {/* 3. Authorised Signatory Details Section */}
      <GSTAuthorisedSignatory
        data={data}
        onChange={onChange}
        errors={errors}
        onClearError={clearErr}
      />

      {/* 4. Aadhaar Authentication Consent Section */}
      <div className="gst-form-card gst-consent-card">
        <div className="gst-form-card__header">
          <div className="gst-form-card__icon-badge gst-form-card__icon-badge--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="gst-form-card__title">Aadhaar Authentication Consent</h2>
            <p className="gst-consent-subtitle">
              Mandatory consent for biometric / OTP-based Aadhaar verification as per GST Rules
            </p>
          </div>
        </div>

        <div className="gst-form-card__body">
          <div
            className={`gst-consent-box ${
              data.aadhaarConsent ? 'gst-consent-box--checked' : ''
            } ${errors.aadhaarConsent ? 'gst-consent-box--error' : ''}`}
          >
            <label
              htmlFor="aadhaarConsent"
              className="gst-consent-checkbox-wrapper"
            >
              <input
                id="aadhaarConsent"
                name="aadhaarConsent"
                type="checkbox"
                checked={data.aadhaarConsent}
                onChange={handleConsentChange}
                className="gst-consent-checkbox"
                aria-invalid={Boolean(errors.aadhaarConsent)}
              />
              <span className="gst-consent-text">
                I hereby give consent to use my Aadhaar details for GST registration authentication and OTP verification with UIDAI. <span className="gst-required-star">*</span>
              </span>
            </label>

            {errors.aadhaarConsent && (
              <div className="gst-consent-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-consent-error-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.aadhaarConsent}</span>
              </div>
            )}

            <div className="gst-consent-security-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-consent-shield-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>UIDAI Compliant: Aadhaar details are encrypted and utilized solely for identity authentication as mandated under GST Rule 8.</span>
            </div>
          </div>
        </div>
      </div>

      <GSTStepErrorBanner message={stepError} />

      {/* Action Buttons */}
      <StepActionBar
        onBack={onCancel}
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        nextLabel={isEditMode ? 'Update & Review' : 'Continue'}
      />
    </form>
  )
}

export default GSTStepBusiness
