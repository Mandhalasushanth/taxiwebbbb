import React from 'react'
import type { PropertyLoanStepProps } from '@modules/loans/types/propertyLoan.types'
import { loanInputHelpers } from '@modules/loans/utils/loanInputFormatters'
import { CANONICAL_INDIAN_STATES_AND_UTS } from '@shared/services/indianStates'
import './PropertyDetails.css'

export const PropertyDetails: React.FC<PropertyLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '')
    if (pin.length === 6 && !data.propertyCity) {
      onChange({
        propertyPincode: pin,
        propertyCity: 'Hyderabad',
        propertyDistrict: 'Hyderabad',
        propertyState: 'Telangana',
      })
    } else {
      onChange({ propertyPincode: pin })
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      onChange({ estimatedMarketValue: '' })
      return
    }
    const num = parseInt(raw, 10)
    onChange({ estimatedMarketValue: num.toLocaleString('en-IN') })
  }

  const renderLocationCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Property Location</h2>
      <p className="property-card__subtext">Tell us where the property is located.</p>

      <div className="property-form-grid">
        {/* PIN Code */}
        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-pincode">
            PIN Code <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input
              id="lap-pincode"
              type="text"
              maxLength={6}
              className={`property-form-input property-form-input--with-icon ${errors.propertyPincode ? 'property-input--error' : ''}`}
              placeholder="500018"
              value={data.propertyPincode || ''}
              onChange={handlePincodeChange}
            />
          </div>
          {errors.propertyPincode && <span className="property-error-text">{errors.propertyPincode}</span>}
        </div>

        {/* City */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-city">
            City <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                <line x1="9" y1="22" x2="9" y2="2" />
                <line x1="8" y1="6" x2="8.01" y2="6" />
                <line x1="16" y1="6" x2="16.01" y2="6" />
                <line x1="16" y1="10" x2="16.01" y2="10" />
                <line x1="16" y1="14" x2="16.01" y2="14" />
              </svg>
            </span>
            <input
              id="lap-city"
              type="text"
              className={`property-form-input property-form-input--with-icon ${errors.propertyCity ? 'property-input--error' : ''}`}
              placeholder="Enter city"
              value={data.propertyCity || ''}
              onChange={(e) => onChange({ propertyCity: loanInputHelpers.lettersOnly(e.target.value, 50) })}
            />
          </div>
          {errors.propertyCity && <span className="property-error-text">{errors.propertyCity}</span>}
        </div>

        {/* District */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-district">
            District <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                <line x1="9" y1="22" x2="9" y2="2" />
                <line x1="8" y1="6" x2="8.01" y2="6" />
                <line x1="16" y1="6" x2="16.01" y2="6" />
              </svg>
            </span>
            <input
              id="lap-district"
              type="text"
              className={`property-form-input property-form-input--with-icon ${errors.propertyDistrict ? 'property-input--error' : ''}`}
              placeholder="Enter district"
              value={data.propertyDistrict || ''}
              onChange={(e) => onChange({ propertyDistrict: loanInputHelpers.lettersOnly(e.target.value, 50) })}
            />
          </div>
          {errors.propertyDistrict && <span className="property-error-text">{errors.propertyDistrict}</span>}
        </div>

        {/* State */}
        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-state">
            State <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </span>
            <select
              id="lap-state"
              className={`property-form-select property-form-select--with-icon ${errors.propertyState ? 'property-input--error' : ''}`}
              value={data.propertyState || ''}
              onChange={(e) => onChange({ propertyState: e.target.value })}
            >
              <option value="">Select state</option>
              {CANONICAL_INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          {errors.propertyState && <span className="property-error-text">{errors.propertyState}</span>}
        </div>

        {/* Property Address */}
        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-prop-address">
            Property Address <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <input
              id="lap-prop-address"
              type="text"
              className={`property-form-input property-form-input--with-icon ${errors.propertyAddress ? 'property-input--error' : ''}`}
              placeholder="Enter full property address"
              value={data.propertyAddress || ''}
              onChange={(e) => onChange({ propertyAddress: e.target.value })}
            />
          </div>
          {errors.propertyAddress && <span className="property-error-text">{errors.propertyAddress}</span>}
        </div>

        {/* Landmark (Optional) */}
        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-landmark">
            Landmark (Optional)
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input
              id="lap-landmark"
              type="text"
              className="property-form-input property-form-input--with-icon"
              placeholder="Enter landmark"
              value={data.propertyLandmark || ''}
              onChange={(e) => onChange({ propertyLandmark: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderPropertyInfoCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Property Information</h2>
      <p className="property-card__subtext">Tell us more about the property.</p>

      <div className="property-form-grid">
        {/* Property Type */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-prop-type">
            Property Type <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </span>
            <select
              id="lap-prop-type"
              className={`property-form-select property-form-select--with-icon ${errors.propertyType ? 'property-input--error' : ''}`}
              value={data.propertyType || ''}
              onChange={(e) => onChange({ propertyType: e.target.value })}
            >
              <option value="">Select property type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Plot / Land">Plot / Land</option>
            </select>
          </div>
          {errors.propertyType && <span className="property-error-text">{errors.propertyType}</span>}
        </div>

        {/* Property Sub-type */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-sub-type">
            Property Sub-type <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </span>
            <select
              id="lap-sub-type"
              className={`property-form-select property-form-select--with-icon ${errors.propertySubType ? 'property-input--error' : ''}`}
              value={data.propertySubType || ''}
              onChange={(e) => onChange({ propertySubType: e.target.value })}
            >
              <option value="">Select property subtype</option>
              <option value="Flat / Apartment">Flat / Apartment</option>
              <option value="Independent House / Villa">Independent House / Villa</option>
              <option value="Office Space">Office Space</option>
              <option value="Shop / Showroom">Shop / Showroom</option>
              <option value="Warehouse / Godown">Warehouse / Godown</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Land">Commercial Land</option>
            </select>
          </div>
          {errors.propertySubType && <span className="property-error-text">{errors.propertySubType}</span>}
        </div>

        {/* Construction Status */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-construction-status">
            Construction Status <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </span>
            <select
              id="lap-construction-status"
              className={`property-form-select property-form-select--with-icon ${errors.constructionStatus ? 'property-input--error' : ''}`}
              value={data.constructionStatus || ''}
              onChange={(e) => onChange({ constructionStatus: e.target.value })}
            >
              <option value="">Select construction status</option>
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
            </select>
          </div>
          {errors.constructionStatus && <span className="property-error-text">{errors.constructionStatus}</span>}
        </div>

        {/* Current Usage */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-usage">
            Current Usage <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </span>
            <select
              id="lap-usage"
              className={`property-form-select property-form-select--with-icon ${errors.currentUsage ? 'property-input--error' : ''}`}
              value={data.currentUsage || ''}
              onChange={(e) => onChange({ currentUsage: e.target.value })}
            >
              <option value="">Select current usage</option>
              <option value="Self Occupied">Self Occupied</option>
              <option value="Rented / Leased">Rented / Leased</option>
              <option value="Vacant">Vacant</option>
            </select>
          </div>
          {errors.currentUsage && <span className="property-error-text">{errors.currentUsage}</span>}
        </div>

        {/* Area Type */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-area-type">
            Area Type <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="18" height="18" x="3" y="3" rx="2" />
              </svg>
            </span>
            <select
              id="lap-area-type"
              className={`property-form-select property-form-select--with-icon ${errors.areaType ? 'property-input--error' : ''}`}
              value={data.areaType || ''}
              onChange={(e) => onChange({ areaType: e.target.value })}
            >
              <option value="">Select area type</option>
              <option value="Built-up Area">Built-up Area</option>
              <option value="Carpet Area">Carpet Area</option>
              <option value="Super Built-up Area">Super Built-up Area</option>
              <option value="Plot Area">Plot Area</option>
            </select>
          </div>
          {errors.areaType && <span className="property-error-text">{errors.areaType}</span>}
        </div>

        {/* Area */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-area">
            Area <span className="property-required-star">*</span>
          </label>
          <div className={`property-input-suffix-box ${errors.propertyArea ? 'property-input--error' : ''}`}>
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </span>
            <input
              id="lap-area"
              type="text"
              className="property-input-suffixed"
              placeholder="Enter area"
              value={data.propertyArea || ''}
              onChange={(e) => onChange({ propertyArea: e.target.value.replace(/\D/g, '') })}
            />
            <span className="property-input-suffix">sq. ft.</span>
          </div>
          {errors.propertyArea && <span className="property-error-text">{errors.propertyArea}</span>}
        </div>

        {/* Property Age */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-prop-age">
            Property Age <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <select
              id="lap-prop-age"
              className={`property-form-select property-form-select--with-icon ${errors.propertyAge ? 'property-input--error' : ''}`}
              value={data.propertyAge || ''}
              onChange={(e) => onChange({ propertyAge: e.target.value })}
            >
              <option value="">Select property age</option>
              <option value="0-5 years">0-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10-15 years">10-15 years</option>
              <option value="15+ years">15+ years</option>
            </select>
          </div>
          {errors.propertyAge && <span className="property-error-text">{errors.propertyAge}</span>}
        </div>

        {/* Approving Authority */}
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-authority">
            Approving Authority <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <select
              id="lap-authority"
              className={`property-form-select property-form-select--with-icon ${errors.approvingAuthority ? 'property-input--error' : ''}`}
              value={data.approvingAuthority || ''}
              onChange={(e) => onChange({ approvingAuthority: e.target.value })}
            >
              <option value="">Select approving authority</option>
              <option value="Municipal Corporation">Municipal Corporation</option>
              <option value="Development Authority (e.g. HMDA, BDA)">Development Authority (e.g. HMDA, BDA)</option>
              <option value="Gram Panchayat (with NOC)">Gram Panchayat (with NOC)</option>
              <option value="DTCP Approved">DTCP Approved</option>
              <option value="Other Statutory Authority">Other Statutory Authority</option>
            </select>
          </div>
          {errors.approvingAuthority && <span className="property-error-text">{errors.approvingAuthority}</span>}
        </div>
      </div>
    </div>
  )

  const renderPropertyValueCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Property Value</h2>
      <p className="property-card__subtext">Enter the estimated value of the property.</p>

      <div className="property-form-field property-form-field--full">
        <label className="property-form-label" htmlFor="lap-market-val">
          Estimated Market Value <span className="property-required-star">*</span>
        </label>
        <div className={`property-input-prefix-box ${errors.estimatedMarketValue ? 'property-input--error' : ''}`}>
          <span className="property-input-prefix">₹</span>
          <input
            id="lap-market-val"
            type="text"
            className="property-input-prefixed"
            placeholder="Enter estimated market value"
            value={data.estimatedMarketValue || ''}
            onChange={handleValueChange}
          />
        </div>
        <div className="property-notice-hint">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>The lender confirms this through a technical valuation visit.</span>
        </div>
        {errors.estimatedMarketValue && <span className="property-error-text">{errors.estimatedMarketValue}</span>}
      </div>
    </div>
  )

  return (
    <div className="property-loan-step property-details-step" data-testid="step-property-details">
      {renderLocationCard()}
      {renderPropertyInfoCard()}
      {renderPropertyValueCard()}
    </div>
  )
}

export default PropertyDetails
