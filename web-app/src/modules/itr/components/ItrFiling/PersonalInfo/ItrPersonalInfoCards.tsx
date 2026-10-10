import React from 'react'
import {
  UserCategoryIcon,
  ShieldCategoryIcon,
  CalendarIcon,
  GlobeIcon,
  DocumentCategoryIcon,
  type AssessmentYearOption,
  type ResidentialStatusOption,
  type FilingTypeOption,
  type TaxpayerProfile,
} from '../itrFiling.constants'

export const AY_OPTIONS: { ay: AssessmentYearOption; fy: string }[] = [
  { ay: 'AY 2025-26', fy: 'FY 2024-2025' },
  { ay: 'AY 2026-27', fy: 'FY 2025-2026' },
]

export const RESIDENTIAL_OPTIONS: {
  id: ResidentialStatusOption
  label: string
  desc: string
}[] = [
  {
    id: 'resident',
    label: 'Resident',
    desc: 'Applicable to individuals residing primarily in India during the financial year.',
  },
  {
    id: 'nri',
    label: 'Non-Resident (NRI)',
    desc: 'Applicable to individuals residing outside India during the financial year.',
  },
  {
    id: 'rnor',
    label: 'Resident but NOR',
    desc: 'Applicable to individuals who are resident in India but Not Ordinarily Resident.',
  },
]

export const FILING_OPTIONS: {
  id: FilingTypeOption
  label: string
  subtext: string
}[] = [
  {
    id: 'original',
    label: 'Original Return (u/s 139(1))',
    subtext: 'Filing on or before statutory due date.',
  },
  {
    id: 'belated',
    label: 'Belated Return (u/s 139(4))',
    subtext: 'Filing after statutory due date with applicable late fees.',
  },
  {
    id: 'revised',
    label: 'Revised Return (u/s 139(5))',
    subtext: 'Correct omission or error in previously filed return.',
  },
  {
    id: 'updated',
    label: 'Updated Return (ITR-U) (u/s 139(8A))',
    subtext: 'Filing within 24 months from the end of relevant AY.',
  },
]

export const ItrTaxpayerProfileCard: React.FC<{ taxpayerProfile: TaxpayerProfile }> = ({
  taxpayerProfile,
}) => (
  <section className="itr-info-card" aria-labelledby="taxpayer-identity-heading">
    <div className="itr-info-card__top">
      <div className="itr-info-card__title-row">
        <div className="itr-info-card__icon-wrap">
          <UserCategoryIcon size={20} />
        </div>
        <h2 id="taxpayer-identity-heading" className="itr-info-card__title">
          Taxpayer Identity
        </h2>
      </div>
      <span className="itr-badge-verified">
        <ShieldCategoryIcon size={13} />
        <span>Auto-Verified</span>
      </span>
    </div>

    <p className="itr-info-card__desc">
      Auto-filled from your TaxEdge profile. Verified with Income Tax Department PAN Master.
    </p>

    <div className="itr-taxpayer-details-box">
      <div className="itr-detail-row">
        <span className="itr-detail-label">PAN Number</span>
        <strong className="itr-detail-val itr-detail-val--mono">{taxpayerProfile.panNumber}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Aadhaar Number</span>
        <strong className="itr-detail-val itr-detail-val--mono">{taxpayerProfile.aadhaarNumber}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Full Legal Name</span>
        <strong className="itr-detail-val">{taxpayerProfile.fullName}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Date of Birth</span>
        <strong className="itr-detail-val">{taxpayerProfile.dob}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Mobile Number</span>
        <strong className="itr-detail-val">{taxpayerProfile.mobileNumber}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Email Address</span>
        <strong className="itr-detail-val">{taxpayerProfile.emailAddress}</strong>
      </div>
      <div className="itr-detail-row">
        <span className="itr-detail-label">Registered Address</span>
        <strong className="itr-detail-val">{taxpayerProfile.registeredAddress}</strong>
      </div>
    </div>
  </section>
)

export const ItrFilingOptionsCard: React.FC<{
  assessmentYear: AssessmentYearOption
  onAssessmentYearChange: (ay: AssessmentYearOption) => void
  residentialStatus: ResidentialStatusOption
  onResidentialStatusChange: (status: ResidentialStatusOption) => void
  ayError?: string | null
  resError?: string | null
}> = ({
  assessmentYear,
  onAssessmentYearChange,
  residentialStatus,
  onResidentialStatusChange,
  ayError,
  resError,
}) => {
  const activeResidentialOption =
    RESIDENTIAL_OPTIONS.find((r) => r.id === residentialStatus) || null

  return (
    <>
      <section className={`itr-info-card ${ayError ? 'itr-info-card--error' : ''}`} aria-labelledby="ay-heading">
        <div className="itr-info-card__title-row">
          <div className="itr-info-card__icon-wrap">
            <CalendarIcon size={20} />
          </div>
          <h2 id="ay-heading" className="itr-info-card__title">
            Assessment Year (AY) <span className="itr-required-star" aria-hidden="true">*</span>
          </h2>
        </div>

        <p className="itr-info-card__desc">
          Select the assessment year for which you are filing this income tax return.
        </p>

        <div className="itr-ay-buttons-grid">
          {AY_OPTIONS.map((opt) => (
            <button
              key={opt.ay}
              type="button"
              className={`itr-ay-btn ${assessmentYear === opt.ay ? 'itr-ay-btn--active' : ''}`}
              onClick={() => onAssessmentYearChange(opt.ay)}
            >
              <span className="itr-ay-main">{opt.ay}</span>
              <span className="itr-ay-sub">{opt.fy}</span>
            </button>
          ))}
        </div>

        {ayError && (
          <div className="itr-field-error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{ayError}</span>
          </div>
        )}
      </section>

      <section className={`itr-info-card ${resError ? 'itr-info-card--error' : ''}`} aria-labelledby="res-heading">
        <div className="itr-info-card__title-row">
          <div className="itr-info-card__icon-wrap">
            <GlobeIcon size={20} />
          </div>
          <h2 id="res-heading" className="itr-info-card__title">
            Residential Status <span className="itr-required-star" aria-hidden="true">*</span>
          </h2>
        </div>

        <p className="itr-info-card__desc">
          Select your residential status in India for the selected financial year.
        </p>

        <div className="itr-status-group">
          <div className="itr-status-buttons">
            {RESIDENTIAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`itr-status-btn ${residentialStatus === opt.id ? 'itr-status-btn--active' : ''}`}
                onClick={() => onResidentialStatusChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {activeResidentialOption ? (
            <div className="itr-info-callout">
              <span className="itr-info-callout__text">
                Selected Status: <strong>{activeResidentialOption.label}</strong> – {activeResidentialOption.desc}
              </span>
            </div>
          ) : (
            <div className="itr-info-callout">
              <span className="itr-info-callout__text itr-info-callout__text--italic">
                Please select your residential status above.
              </span>
            </div>
          )}

          {resError && (
            <div className="itr-field-error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{resError}</span>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export const ItrFilingTypeCard: React.FC<{
  filingType: FilingTypeOption
  onFilingTypeChange: (ft: FilingTypeOption) => void
  error?: string | null
}> = ({ filingType, onFilingTypeChange, error }) => (
  <section className={`itr-info-card ${error ? 'itr-info-card--error' : ''}`} aria-labelledby="filing-type-heading">
    <div className="itr-info-card__title-row">
      <div className="itr-info-card__icon-wrap">
        <DocumentCategoryIcon size={20} />
      </div>
      <h2 id="filing-type-heading" className="itr-info-card__title">
        Filing Type <span className="itr-required-star" aria-hidden="true">*</span>
      </h2>
    </div>

    <p className="itr-info-card__desc">
      Select your return filing type according to the Income Tax Act, 1961.
    </p>

    <div className="itr-filing-options-list">
      {FILING_OPTIONS.map((f) => {
        const isSelected = filingType === f.id
        return (
          <label
            key={f.id}
            className={`itr-filing-option-card ${isSelected ? 'itr-filing-option-card--active' : ''}`}
          >
            <div className="itr-radio-outer">
              <input
                type="radio"
                name="filingType"
                value={f.id}
                checked={isSelected}
                onChange={() => onFilingTypeChange(f.id)}
                className="itr-filing-radio-input"
              />
              <span className={`itr-custom-radio ${isSelected ? 'itr-custom-radio--checked' : ''}`} />
            </div>
            <div className="itr-filing-option-text">
              <span className="itr-filing-option-title">{f.label}</span>
              <span className="itr-filing-option-desc">{f.subtext}</span>
            </div>
          </label>
        )
      })}
    </div>

    {error && (
      <div className="itr-field-error" role="alert">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <span>{error}</span>
      </div>
    )}
  </section>
)
