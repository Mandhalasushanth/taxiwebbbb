import React from 'react'
import type { PropertyLoanStepProps } from '@modules/loans/types/propertyLoan.types'
import { formatMobile } from '@shared/utils'
import { loanInputHelpers } from '@modules/loans/utils/loanInputFormatters'
import './ApplicantIncome.css'

export const ApplicantIncome: React.FC<PropertyLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      onChange({ annualIncome: '' })
      return
    }
    const num = parseInt(raw, 10)
    onChange({ annualIncome: num.toLocaleString('en-IN') })
  }

  const renderPersonalDetailsCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Personal Details</h2>
      <p className="property-card__subtext">Tell us about yourself.</p>

      <div className="property-form-grid">
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-full-name">
            Full Name <span className="property-required-star">*</span>
          </label>
          <input
            id="lap-full-name"
            type="text"
            className={`property-form-input ${errors.personalFullName ? 'property-input--error' : ''}`}
            placeholder="Enter full name"
            value={data.personalFullName || ''}
            onChange={(e) => onChange({ personalFullName: loanInputHelpers.lettersOnly(e.target.value) })}
          />
          {errors.personalFullName && <span className="property-error-text">{errors.personalFullName}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-pan">
            PAN <span className="property-required-star">*</span>
          </label>
          <input
            id="lap-pan"
            type="text"
            maxLength={10}
            className={`property-form-input ${errors.personalPan ? 'property-input--error' : ''}`}
            placeholder="Enter PAN (e.g. ABCDE1234F)"
            value={data.personalPan || ''}
            onChange={(e) => onChange({ personalPan: loanInputHelpers.cleanPan(e.target.value) })}
          />
          {errors.personalPan && <span className="property-error-text">{errors.personalPan}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-mobile">
            Mobile Number <span className="property-required-star">*</span>
          </label>
          <div className={`property-input-prefix-box ${errors.personalMobile ? 'property-input--error' : ''}`}>
            <span className="property-input-prefix">+91</span>
            <input
              id="lap-mobile"
              type="tel"
              className="property-input-prefixed"
              placeholder="Enter mobile number"
              value={data.personalMobile || ''}
              onChange={(e) => onChange({ personalMobile: formatMobile(e.target.value) })}
            />
          </div>
          {errors.personalMobile && <span className="property-error-text">{errors.personalMobile}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-dob">
            Date of Birth <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <input
              id="lap-dob"
              type="text"
              className={`property-form-input ${errors.personalDob ? 'property-input--error' : ''}`}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
              maxLength={10}
              value={data.personalDob || ''}
              onChange={(e) => onChange({ personalDob: loanInputHelpers.formatDob(e.target.value) })}
            />
            <span className="property-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
          {errors.personalDob && <span className="property-error-text">{errors.personalDob}</span>}
        </div>

        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-current-address">
            Current Address <span className="property-required-star">*</span>
          </label>
          <div className="property-input-icon-box">
            <span className="property-input-icon-left" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input
              id="lap-current-address"
              type="text"
              className={`property-form-input property-form-input--with-icon ${errors.personalAddress ? 'property-input--error' : ''}`}
              placeholder="Enter your current address"
              value={data.personalAddress || ''}
              onChange={(e) => onChange({ personalAddress: e.target.value })}
            />
          </div>
          {errors.personalAddress && <span className="property-error-text">{errors.personalAddress}</span>}
        </div>
      </div>
    </div>
  )

  const renderPersonalInfoCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Personal Information</h2>
      <p className="property-card__subtext">Help us know you better.</p>

      <div className="property-form-grid">
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-gender">
            Gender <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-gender"
              className={`property-form-select ${errors.gender ? 'property-input--error' : ''}`}
              value={data.gender || ''}
              onChange={(e) => onChange({ gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {errors.gender && <span className="property-error-text">{errors.gender}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-marital-status">
            Marital Status <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-marital-status"
              className={`property-form-select ${errors.maritalStatus ? 'property-input--error' : ''}`}
              value={data.maritalStatus || ''}
              onChange={(e) => onChange({ maritalStatus: e.target.value })}
            >
              <option value="">Select marital status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          {errors.maritalStatus && <span className="property-error-text">{errors.maritalStatus}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-residence-type">
            Residence Type <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-residence-type"
              className={`property-form-select ${errors.residenceType ? 'property-input--error' : ''}`}
              value={data.residenceType || ''}
              onChange={(e) => onChange({ residenceType: e.target.value })}
            >
              <option value="">Select residence type</option>
              <option value="Owned by Self / Spouse">Owned by Self / Spouse</option>
              <option value="Owned by Parents">Owned by Parents</option>
              <option value="Rented with Family">Rented with Family</option>
              <option value="Rented Alone">Rented Alone</option>
              <option value="Company Provided">Company Provided</option>
            </select>
          </div>
          {errors.residenceType && <span className="property-error-text">{errors.residenceType}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-years-address">
            Years at Current Address <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-years-address"
              className={`property-form-select ${errors.yearsAtCurrentAddress ? 'property-input--error' : ''}`}
              value={data.yearsAtCurrentAddress || ''}
              onChange={(e) => onChange({ yearsAtCurrentAddress: e.target.value })}
            >
              <option value="">Select years</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="More than 5 years">More than 5 years</option>
            </select>
          </div>
          {errors.yearsAtCurrentAddress && <span className="property-error-text">{errors.yearsAtCurrentAddress}</span>}
        </div>
      </div>
    </div>
  )

  const renderEmploymentCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Employment Details</h2>
      <p className="property-card__subtext">Tell us about your current employment.</p>

      <div className="property-form-grid">
        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-employer-cat">
            Employer Category <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-employer-cat"
              className={`property-form-select ${errors.employerCategory ? 'property-input--error' : ''}`}
              value={data.employerCategory || ''}
              onChange={(e) => onChange({ employerCategory: e.target.value })}
            >
              <option value="">Select category</option>
              <option value="Private Ltd">Private Ltd</option>
              <option value="Public Ltd">Public Ltd</option>
              <option value="Government / PSU">Government / PSU</option>
              <option value="LLP / Partnership">LLP / Partnership</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="MNC">MNC</option>
            </select>
          </div>
          {errors.employerCategory && <span className="property-error-text">{errors.employerCategory}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-employer-name">
            Employer Name <span className="property-required-star">*</span>
          </label>
          <input
            id="lap-employer-name"
            type="text"
            className={`property-form-input ${errors.employerName ? 'property-input--error' : ''}`}
            placeholder="Enter employer name"
            value={data.employerName || ''}
            onChange={(e) => onChange({ employerName: e.target.value })}
          />
          {errors.employerName && <span className="property-error-text">{errors.employerName}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-total-exp">
            Total Work Experience <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-total-exp"
              className={`property-form-select ${errors.totalExperience ? 'property-input--error' : ''}`}
              value={data.totalExperience || ''}
              onChange={(e) => onChange({ totalExperience: e.target.value })}
            >
              <option value="">Select experience</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>
          {errors.totalExperience && <span className="property-error-text">{errors.totalExperience}</span>}
        </div>

        <div className="property-form-field">
          <label className="property-form-label" htmlFor="lap-job-years">
            Years in Current Job <span className="property-required-star">*</span>
          </label>
          <div className="property-select-wrap">
            <select
              id="lap-job-years"
              className={`property-form-select ${errors.yearsInCurrentJob ? 'property-input--error' : ''}`}
              value={data.yearsInCurrentJob || ''}
              onChange={(e) => onChange({ yearsInCurrentJob: e.target.value })}
            >
              <option value="">Select years</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          {errors.yearsInCurrentJob && <span className="property-error-text">{errors.yearsInCurrentJob}</span>}
        </div>

        <div className="property-form-field property-form-field--full">
          <label className="property-form-label" htmlFor="lap-annual-income">
            Annual Income <span className="property-required-star">*</span>
          </label>
          <div className={`property-input-prefix-box ${errors.annualIncome ? 'property-input--error' : ''}`}>
            <span className="property-input-prefix">₹</span>
            <input
              id="lap-annual-income"
              type="text"
              className="property-input-prefixed"
              placeholder="Enter annual income"
              value={data.annualIncome || ''}
              onChange={handleIncomeChange}
            />
          </div>
          {errors.annualIncome && <span className="property-error-text">{errors.annualIncome}</span>}
        </div>
      </div>
    </div>
  )

  const renderExistingLoansCard = () => (
    <div className="property-card">
      <h2 className="property-card__heading">Existing Loans & Obligations</h2>
      <p className="property-card__subtext">Tell us about your current loans and other monthly obligations.</p>

      <div className="property-form-field property-form-field--full">
        <label className="property-form-label">
          Do you have any existing loans? <span className="property-required-star">*</span>
        </label>
        <div className="property-toggle-group">
          <button
            type="button"
            className={`property-toggle-btn ${data.hasExistingLoans === true ? 'property-toggle-btn--active' : ''}`}
            onClick={() => onChange({ hasExistingLoans: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`property-toggle-btn ${data.hasExistingLoans === false ? 'property-toggle-btn--active' : ''}`}
            onClick={() => onChange({ hasExistingLoans: false })}
          >
            No
          </button>
        </div>
        {errors.hasExistingLoans && <span className="property-error-text">{errors.hasExistingLoans}</span>}
      </div>
    </div>
  )

  return (
    <div className="property-loan-step property-applicant-income-step" data-testid="step-applicant-income">
      {renderPersonalDetailsCard()}
      {renderPersonalInfoCard()}
      {renderEmploymentCard()}
      {renderExistingLoansCard()}
    </div>
  )
}

export default ApplicantIncome
