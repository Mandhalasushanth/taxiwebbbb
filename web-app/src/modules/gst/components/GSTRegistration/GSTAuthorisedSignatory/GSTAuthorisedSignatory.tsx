import { type ChangeEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'

export interface GSTAuthorisedSignatoryProps {
  data: Pick<
    GstBusinessFormData,
    'signatoryName' | 'signatoryPan' | 'dob' | 'designation' | 'signatoryMobile' | 'signatoryEmail'
  >
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const GSTAuthorisedSignatory = ({
  data,
  onChange,
  errors = {},
  onClearError,
}: GSTAuthorisedSignatoryProps) => {
  const handleSignatoryNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('signatoryName', gstInput.letters(e.target.value))
    onClearError?.('signatoryName')
  }

  const handleSignatoryPanChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('signatoryPan', gstInput.pan(e.target.value))
    onClearError?.('signatoryPan')
  }

  const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('dob', e.target.value)
    onClearError?.('dob')
  }

  const handleDesignationChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('designation', gstInput.designation(e.target.value))
    onClearError?.('designation')
  }

  const handleSignatoryMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('signatoryMobile', gstInput.mobile(e.target.value))
    onClearError?.('signatoryMobile')
  }

  const handleSignatoryEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('signatoryEmail', gstInput.email(e.target.value))
    onClearError?.('signatoryEmail')
  }

  return (
    <div className="gst-form-card">
      <div className="gst-form-card__header">
        <div className="gst-form-card__icon-badge gst-form-card__icon-badge--blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="gst-form-card__title">Authorised Signatory</h2>
      </div>

      <div className="gst-form-card__body">
        {/* Row 1: Signatory Name & PAN */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="signatoryName" className="gst-form-label">
              Signatory Name <span className="gst-required-star">*</span>
            </label>
            <input
              id="signatoryName"
              type="text"
              className={`gst-form-input ${errors.signatoryName ? 'gst-input--error' : ''}`}
              placeholder="Enter full name"
              value={data.signatoryName}
              onChange={handleSignatoryNameChange}
            />
            {errors.signatoryName && <span className="gst-field-error">{errors.signatoryName}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="signatoryPan" className="gst-form-label">
              Signatory PAN <span className="gst-required-star">*</span>
            </label>
            <input
              id="signatoryPan"
              type="text"
              maxLength={10}
              className={`gst-form-input ${errors.signatoryPan ? 'gst-input--error' : ''}`}
              placeholder="Enter PAN"
              value={data.signatoryPan}
              onChange={handleSignatoryPanChange}
            />
            {errors.signatoryPan && <span className="gst-field-error">{errors.signatoryPan}</span>}
          </div>
        </div>

        {/* Row 2: Date of Birth & Designation */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="dob" className="gst-form-label">
              Date of Birth <span className="gst-required-star">*</span>
            </label>
            <div className="gst-date-input-wrapper">
              <input
                id="dob"
                type="date"
                className={`gst-form-input gst-form-input--date ${!data.dob ? 'gst-date--placeholder' : 'has-value'} ${errors.dob ? 'gst-input--error' : ''}`}
                placeholder="DD-MM-YYYY"
                value={data.dob}
                onChange={handleDobChange}
              />
            </div>
            {errors.dob && <span className="gst-field-error">{errors.dob}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="designation" className="gst-form-label">
              Designation <span className="gst-required-star">*</span>
            </label>
            <input
              id="designation"
              type="text"
              className={`gst-form-input ${errors.designation ? 'gst-input--error' : ''}`}
              placeholder="Enter designation"
              value={data.designation}
              onChange={handleDesignationChange}
            />
            {errors.designation && <span className="gst-field-error">{errors.designation}</span>}
          </div>
        </div>

        {/* Row 3: Signatory Mobile & Email */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="signatoryMobile" className="gst-form-label">
              Signatory Mobile <span className="gst-required-star">*</span>
            </label>
            <input
              id="signatoryMobile"
              type="tel"
              inputMode="numeric"
              className={`gst-form-input ${errors.signatoryMobile ? 'gst-input--error' : ''}`}
              placeholder="Enter 10-digit mobile number"
              value={data.signatoryMobile}
              onChange={handleSignatoryMobileChange}
            />
            {errors.signatoryMobile && <span className="gst-field-error">{errors.signatoryMobile}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="signatoryEmail" className="gst-form-label">
              Signatory Email <span className="gst-required-star">*</span>
            </label>
            <input
              id="signatoryEmail"
              type="email"
              className={`gst-form-input ${errors.signatoryEmail ? 'gst-input--error' : ''}`}
              placeholder="Enter email address"
              value={data.signatoryEmail}
              onChange={handleSignatoryEmailChange}
            />
            {errors.signatoryEmail && <span className="gst-field-error">{errors.signatoryEmail}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GSTAuthorisedSignatory
