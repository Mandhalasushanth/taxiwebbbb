import React from 'react'
import type { PropertyLoanStepProps } from '@modules/loans/types/propertyLoan.types'
import { formatMobile } from '@shared/utils'
import { loanInputHelpers } from '@modules/loans/utils/loanInputFormatters'
import './Ownership.css'

export const Ownership: React.FC<PropertyLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const isJoint = data.ownershipType === 'joint'

  const handleOutstandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      onChange({ outstandingLoanAmount: '' })
      return
    }
    const num = parseInt(raw, 10)
    onChange({ outstandingLoanAmount: num.toLocaleString('en-IN') })
  }

  const renderOwnershipDetailsCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Ownership Details</h2>
      <p className="property-card__subtext">Tell us about the ownership of the property.</p>

      <div className="property-form-field property-form-field--full">
        <label className="property-form-label">
          Ownership Type <span className="property-required-star">*</span>
        </label>
        <div className="property-ownership-radio-group">
          <button
            type="button"
            className={`property-ownership-card ${data.ownershipType === 'sole' ? 'property-ownership-card--active' : ''}`}
            onClick={() => onChange({ ownershipType: 'sole' })}
          >
            <div className="property-radio-circle">
              {data.ownershipType === 'sole' && <div className="property-radio-inner" />}
            </div>
            <span className="property-ownership-label">Sole Ownership</span>
          </button>

          <button
            type="button"
            className={`property-ownership-card ${data.ownershipType === 'joint' ? 'property-ownership-card--active' : ''}`}
            onClick={() => onChange({ ownershipType: 'joint' })}
          >
            <div className="property-radio-circle">
              {data.ownershipType === 'joint' && <div className="property-radio-inner" />}
            </div>
            <span className="property-ownership-label">Joint Ownership</span>
          </button>
        </div>
        {errors.ownershipType && <span className="property-error-text">{errors.ownershipType}</span>}
      </div>
    </div>
  )

  const renderCoOwnerCard = () => {
    if (!isJoint) return null
    return (
      <div className="property-card property-co-owner-card">
        <h2 className="property-card__heading">Co-owner Details (If Joint Ownership)</h2>
        <p className="property-card__subtext">Provide details of the co-owner / co-applicant.</p>

        <div className="property-form-grid">
          <div className="property-form-field">
            <label className="property-form-label" htmlFor="lap-co-owner-name">
              Co-owner Full Name <span className="property-required-star">*</span>
            </label>
            <div className="property-input-icon-box">
              <span className="property-input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="lap-co-owner-name"
                type="text"
                className={`property-form-input property-form-input--with-icon ${errors.coOwnerFullName ? 'property-input--error' : ''}`}
                placeholder="Enter full name"
                value={data.coOwnerFullName || ''}
                onChange={(e) => onChange({ coOwnerFullName: loanInputHelpers.lettersOnly(e.target.value) })}
              />
            </div>
            {errors.coOwnerFullName && <span className="property-error-text">{errors.coOwnerFullName}</span>}
          </div>

          <div className="property-form-field">
            <label className="property-form-label" htmlFor="lap-co-rel">
              Relationship with Applicant <span className="property-required-star">*</span>
            </label>
            <div className="property-select-wrap property-select-wrap--icon">
              <span className="property-input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <select
                id="lap-co-rel"
                className={`property-form-select property-form-select--with-icon ${errors.coOwnerRelationship ? 'property-input--error' : ''}`}
                value={data.coOwnerRelationship || ''}
                onChange={(e) => onChange({ coOwnerRelationship: e.target.value })}
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Business Partner">Business Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {errors.coOwnerRelationship && <span className="property-error-text">{errors.coOwnerRelationship}</span>}
          </div>

          <div className="property-form-field">
            <label className="property-form-label" htmlFor="lap-co-pan">
              Co-owner PAN <span className="property-required-star">*</span>
            </label>
            <div className="property-input-icon-box">
              <span className="property-input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <input
                id="lap-co-pan"
                type="text"
                maxLength={10}
                className={`property-form-input property-form-input--with-icon ${errors.coOwnerPan ? 'property-input--error' : ''}`}
                placeholder="Enter PAN (e.g. ABCDE1234F)"
                value={data.coOwnerPan || ''}
                onChange={(e) => onChange({ coOwnerPan: loanInputHelpers.cleanPan(e.target.value) })}
              />
            </div>
            {errors.coOwnerPan && <span className="property-error-text">{errors.coOwnerPan}</span>}
          </div>

          <div className="property-form-field">
            <label className="property-form-label" htmlFor="lap-co-mobile">
              Co-owner Mobile Number <span className="property-required-star">*</span>
            </label>
            <div className={`property-input-prefix-box ${errors.coOwnerMobile ? 'property-input--error' : ''}`}>
              <span className="property-input-prefix">+91</span>
              <input
                id="lap-co-mobile"
                type="tel"
                className="property-input-prefixed"
                placeholder="Enter mobile number"
                value={data.coOwnerMobile || ''}
                onChange={(e) => onChange({ coOwnerMobile: formatMobile(e.target.value) })}
              />
            </div>
            {errors.coOwnerMobile && <span className="property-error-text">{errors.coOwnerMobile}</span>}
          </div>
        </div>
      </div>
    )
  }

  const renderExistingPropertyLoanCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Existing Property Loan (If any)</h2>
      <p className="property-card__subtext">Tell us if there is an existing loan on this property.</p>

      <div className="property-form-grid">
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-lender">
            Current Lender
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 2 7h20L12 2z" />
              </svg>
            </span>
            <select
              id="lap-lender"
              className="property-form-select property-form-select--with-icon"
              value={data.currentLender || ''}
              onChange={(e) => onChange({ currentLender: e.target.value })}
            >
              <option value="">Select lender</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
              <option value="Bajaj Finserv">Bajaj Finserv</option>
              <option value="Tata Capital">Tata Capital</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-loan-type">
            Existing Loan Type
          </label>
          <div className="property-select-wrap property-select-wrap--icon">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <select
              id="lap-loan-type"
              className="property-form-select property-form-select--with-icon"
              value={data.existingLoanType || ''}
              onChange={(e) => onChange({ existingLoanType: e.target.value })}
            >
              <option value="">Select loan type</option>
              <option value="Home Loan">Home Loan</option>
              <option value="Loan Against Property">Loan Against Property</option>
              <option value="Top-up Loan">Top-up Loan</option>
              <option value="Construction Loan">Construction Loan</option>
              <option value="Plot Loan">Plot Loan</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-outstanding">
            Outstanding Loan Amount
          </label>
          <div className="property-input-prefix-box">
            <span className="property-input-prefix">₹</span>
            <input
              id="lap-outstanding"
              type="text"
              className="property-input-prefixed"
              placeholder="Enter outstanding amount"
              value={data.outstandingLoanAmount || ''}
              onChange={handleOutstandingChange}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderOwnershipConfirmationCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Ownership Confirmation</h2>
      <p className="property-card__subtext">Please confirm the following.</p>

      <label className="property-checkbox-row">
        <input
          type="checkbox"
          className="property-checkbox"
          checked={Boolean(data.ownershipConfirmed)}
          onChange={(e) => onChange({ ownershipConfirmed: e.target.checked })}
        />
        <span className="property-checkbox-text">
          I/We confirm that the property details provided above are correct and I/We have the legal right to offer this property as security for the loan.
        </span>
      </label>
      {errors.ownershipConfirmed && <span className="property-error-text">{errors.ownershipConfirmed}</span>}
    </div>
  )

  return (
    <div className="property-loan-step property-ownership-step" data-testid="step-ownership">
      {renderOwnershipDetailsCard()}
      {renderCoOwnerCard()}
      {renderExistingPropertyLoanCard()}
      {renderOwnershipConfirmationCard()}
    </div>
  )
}

export default Ownership
