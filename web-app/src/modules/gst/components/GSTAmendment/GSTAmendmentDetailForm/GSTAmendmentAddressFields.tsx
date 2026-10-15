import React, { type ChangeEvent } from 'react'
import { INDIAN_STATES_AND_UTS } from '@modules/gst/utils/gstBusinessDetails.constants'
import './GSTAmendmentAddressFields.css'

interface GSTAmendmentAddressFieldsProps {
  isAdditionalPlace?: boolean
  address: string
  city: string
  district: string
  stateUt: string
  pinCode: string
  natureOfPremises: string
  errors: Record<string, string>
  onAddressChange: (val: string) => void
  onCityChange: (val: string) => void
  onDistrictChange: (val: string) => void
  onStateUtChange: (val: string) => void
  onPinCodeChange: (e: ChangeEvent<HTMLInputElement>) => void
  onNatureOfPremisesChange: (val: string) => void
}

const PREMISES_NATURE_OPTIONS = [
  'Owned',
  'Leased',
  'Rented',
  'Consent',
  'Shared',
  'Others',
]

export const GSTAmendmentAddressFields: React.FC<GSTAmendmentAddressFieldsProps> = ({
  isAdditionalPlace = false,
  address,
  city,
  district,
  stateUt,
  pinCode,
  natureOfPremises,
  errors,
  onAddressChange,
  onCityChange,
  onDistrictChange,
  onStateUtChange,
  onPinCodeChange,
  onNatureOfPremisesChange,
}) => {
  return (
    <div className="gst-amend-card-box">
      <div className="gst-amend-card-box__header-flex">
        <div className="gst-amend-card-header-icon-box gst-amend-card-header-icon-box--edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div>
          <h3 className="gst-amend-card-box__title">Amended details</h3>
          <p className="gst-amend-card-box__subtitle">Enter revised information for verification</p>
        </div>
      </div>

      {/* Field 1: New Principal Business Address / New Additional Place Address */}
      <div className="gst-amend-field-group">
        <label htmlFor="new-address-input" className="gst-amend-field-label">
          {isAdditionalPlace ? 'New Additional Place Address' : 'New Principal Business Address'} <span className="gst-amend-star">*</span>
        </label>
        <input
          id="new-address-input"
          type="text"
          placeholder="Enter business address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className={`gst-amend-text-input ${errors.address ? 'has-error' : ''}`}
        />
        {errors.address && <span className="gst-amend-error-msg">{errors.address}</span>}
      </div>

      {isAdditionalPlace ? (
        <>
          {/* Additional Place Layout: City / Town & PIN Code stacked */}
          <div className="gst-amend-field-group">
            <label htmlFor="city-input" className="gst-amend-field-label">
              City / Town <span className="gst-amend-star">*</span>
            </label>
            <input
              id="city-input"
              type="text"
              placeholder="Enter city or town"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className={`gst-amend-text-input ${errors.city ? 'has-error' : ''}`}
            />
            {errors.city && <span className="gst-amend-error-msg">{errors.city}</span>}
          </div>

          <div className="gst-amend-field-group">
            <label htmlFor="pincode-input" className="gst-amend-field-label">
              PIN Code <span className="gst-amend-star">*</span>
            </label>
            <input
              id="pincode-input"
              type="text"
              placeholder="Enter 6-digit PIN code"
              maxLength={6}
              value={pinCode}
              onChange={onPinCodeChange}
              className={`gst-amend-text-input ${errors.pinCode ? 'has-error' : ''}`}
            />
            <div className="gst-amend-subrow-hint">
              {errors.pinCode ? (
                <span className="gst-amend-error-msg">{errors.pinCode}</span>
              ) : (
                <span />
              )}
              <span className="gst-amend-counter-hint">{pinCode.length} / 6 digits</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Principal Place Layout: City & District */}
          <div className="gst-amend-form-row">
            <div className="gst-amend-field-group">
              <label htmlFor="city-input" className="gst-amend-field-label">
                City / Town <span className="gst-amend-star">*</span>
              </label>
              <input
                id="city-input"
                type="text"
                placeholder="Enter city or town"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className={`gst-amend-text-input ${errors.city ? 'has-error' : ''}`}
              />
              {errors.city && <span className="gst-amend-error-msg">{errors.city}</span>}
            </div>

            <div className="gst-amend-field-group">
              <label htmlFor="district-input" className="gst-amend-field-label">
                District <span className="gst-amend-star">*</span>
              </label>
              <input
                id="district-input"
                type="text"
                placeholder="Enter district"
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
                className={`gst-amend-text-input ${errors.district ? 'has-error' : ''}`}
              />
              {errors.district && <span className="gst-amend-error-msg">{errors.district}</span>}
            </div>
          </div>

          {/* Row 3: State / Union Territory & PIN Code */}
          <div className="gst-amend-form-row">
            <div className="gst-amend-field-group">
              <label htmlFor="state-ut-select" className="gst-amend-field-label">
                State / Union Territory <span className="gst-amend-star">*</span>
              </label>
              <div className="gst-amend-select-wrapper">
                <select
                  id="state-ut-select"
                  value={stateUt}
                  onChange={(e) => onStateUtChange(e.target.value)}
                  className={`gst-amend-select-input ${errors.stateUt ? 'has-error' : ''}`}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <span className="gst-amend-select-chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
              {errors.stateUt && <span className="gst-amend-error-msg">{errors.stateUt}</span>}
            </div>

            <div className="gst-amend-field-group">
              <label htmlFor="pincode-input" className="gst-amend-field-label">
                PIN Code <span className="gst-amend-star">*</span>
              </label>
              <input
                id="pincode-input"
                type="text"
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
                value={pinCode}
                onChange={onPinCodeChange}
                className={`gst-amend-text-input ${errors.pinCode ? 'has-error' : ''}`}
              />
              <div className="gst-amend-subrow-hint">
                {errors.pinCode ? (
                  <span className="gst-amend-error-msg">{errors.pinCode}</span>
                ) : (
                  <span />
                )}
                <span className="gst-amend-counter-hint">{pinCode.length} / 6 digits</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Nature of Possession */}
      <div className="gst-amend-field-group">
        <label htmlFor="premises-nature-select" className="gst-amend-field-label">
          Nature of Possession <span className="gst-amend-star">*</span>
        </label>
        <div className="gst-amend-select-wrapper">
          <select
            id="premises-nature-select"
            value={natureOfPremises}
            onChange={(e) => onNatureOfPremisesChange(e.target.value)}
            className={`gst-amend-select-input ${errors.natureOfPremises ? 'has-error' : ''}`}
          >
            <option value="">Select Nature of Premises</option>
            {PREMISES_NATURE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="gst-amend-select-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        {errors.natureOfPremises && (
          <span className="gst-amend-error-msg">{errors.natureOfPremises}</span>
        )}
      </div>
    </div>
  )
}

export default GSTAmendmentAddressFields
