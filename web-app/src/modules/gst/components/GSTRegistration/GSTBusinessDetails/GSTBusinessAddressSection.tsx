import React, { type ChangeEvent } from 'react'
import { HSN_SAC_LENGTHS, validatePincodeMatchesState } from '@shared/utils'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import { INDIAN_STATES_AND_UTS } from '@modules/gst/utils/gstBusinessDetails.constants'

export interface GSTBusinessAddressSectionProps {
  data: Pick<
    GstBusinessFormData,
    'businessAddress' | 'city' | 'district' | 'state' | 'pinCode' | 'hsnSacCode'
  >
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const GSTBusinessAddressSection: React.FC<GSTBusinessAddressSectionProps> = ({
  data,
  onChange,
  errors = {},
  onClearError,
}) => {
  const handleBusinessAddressChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange('businessAddress', gstInput.address(e.target.value))
    onClearError?.('businessAddress')
  }

  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('city', gstInput.letters(e.target.value, 50))
    onClearError?.('city')
  }

  const handleDistrictChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('district', gstInput.letters(e.target.value, 50))
    onClearError?.('district')
  }

  const handleStateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange('state', e.target.value)
    onClearError?.('state')
    // A PIN / State mismatch error is re-evaluated against the new state
    onClearError?.('pinCode')
  }

  // Live PIN ↔ State check so a mismatch is visible before pressing Continue
  const pinStateMismatch = errors.pinCode ? null : validatePincodeMatchesState(data.pinCode, data.state)
  const pinCodeMessage = errors.pinCode || pinStateMismatch

  const handlePinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('pinCode', gstInput.pinCode(e.target.value))
    onClearError?.('pinCode')
  }

  const handleHsnSacChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('hsnSacCode', gstInput.hsnSac(e.target.value))
    onClearError?.('hsnSacCode')
  }

  return (
    <>
      {/* Row 5: Business Address */}
      <div className="gst-form-group">
        <label htmlFor="businessAddress" className="gst-form-label">
          Business Address <span className="gst-required-star">*</span>
        </label>
        <input
          id="businessAddress"
          type="text"
          className={`gst-form-input ${errors.businessAddress ? 'gst-input--error' : ''}`}
          placeholder="Building, street, locality"
          value={data.businessAddress}
          onChange={handleBusinessAddressChange}
        />
        {errors.businessAddress && <span className="gst-field-error">{errors.businessAddress}</span>}
      </div>

      {/* Row 6: City & District */}
      <div className="gst-form-grid gst-form-grid--2col">
        <div className="gst-form-group">
          <label htmlFor="city" className="gst-form-label">
            City <span className="gst-required-star">*</span>
          </label>
          <input
            id="city"
            type="text"
            className={`gst-form-input ${errors.city ? 'gst-input--error' : ''}`}
            placeholder="City"
            value={data.city}
            onChange={handleCityChange}
          />
          {errors.city && <span className="gst-field-error">{errors.city}</span>}
        </div>

        <div className="gst-form-group">
          <label htmlFor="district" className="gst-form-label">
            District <span className="gst-required-star">*</span>
          </label>
          <input
            id="district"
            type="text"
            className={`gst-form-input ${errors.district ? 'gst-input--error' : ''}`}
            placeholder="District"
            value={data.district}
            onChange={handleDistrictChange}
          />
          {errors.district && <span className="gst-field-error">{errors.district}</span>}
        </div>
      </div>

      {/* Row 7: State & PIN Code */}
      <div className="gst-form-grid gst-form-grid--2col">
        <div className="gst-form-group">
          <label htmlFor="state" className="gst-form-label">
            State / UT <span className="gst-required-star">*</span>
          </label>
          <div className="gst-select-wrapper">
            <select
              id="state"
              className={`gst-form-select ${!data.state ? 'gst-select--placeholder' : ''} ${errors.state ? 'gst-input--error' : ''}`}
              data-empty={!data.state}
              value={data.state}
              onChange={handleStateChange}
            >
              <option value="">Select State / UT</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <span className="gst-select-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          {errors.state && <span className="gst-field-error">{errors.state}</span>}
        </div>

        <div className="gst-form-group">
          <label htmlFor="pinCode" className="gst-form-label">
            PIN Code <span className="gst-required-star">*</span>
          </label>
          <input
            id="pinCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            className={`gst-form-input ${pinCodeMessage ? 'gst-input--error' : ''}`}
            placeholder="Enter your PIN code"
            value={data.pinCode}
            onChange={handlePinCodeChange}
            aria-invalid={Boolean(pinCodeMessage)}
          />
          {pinCodeMessage && <span className="gst-field-error" role="alert">{pinCodeMessage}</span>}
        </div>
      </div>

      {/* Row 8: Primary HSN / SAC Code */}
      <div className="gst-form-group">
        <label htmlFor="hsnSacCode" className="gst-form-label">
          Primary HSN / SAC Code <span className="gst-required-star">*</span>
        </label>
        <input
          id="hsnSacCode"
          name="hsnSacCode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={Math.max(...HSN_SAC_LENGTHS)}
          className={`gst-form-input ${errors.hsnSacCode ? 'gst-input--error' : ''}`}
          placeholder={`Enter ${HSN_SAC_LENGTHS.join(' / ')} digit HSN or SAC code`}
          value={data.hsnSacCode}
          onChange={handleHsnSacChange}
        />
        {errors.hsnSacCode && <span className="gst-field-error">{errors.hsnSacCode}</span>}
      </div>
    </>
  )
}
