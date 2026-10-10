import React from 'react'
import type { CompanyDetailsFormData } from '../../types/incorporation.types'
import { filterDigits, isValidNicCode } from '../../utils/validation'

const NIC_CODE_LENGTH = 5
const ACTIVITY_MAX_LENGTH = 500
/** Letters, digits and the punctuation MCA allows in a company name (e.g. "Sharma & Sons Tech"). */
const COMPANY_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s&.,'()-]{2,119}$/
const ACTIVITY_PATTERN = /[A-Za-z]{3,}/

type NameActivityField = 'firstPreferredName' | 'primaryBusinessActivity' | 'nicCode' | 'secondaryBusinessActivity'

/** Errors for the proposed name and business activity fields, keyed by field. */
export const getNameActivityErrors = (data: CompanyDetailsFormData): Record<string, string> => {
  const name = (data.firstPreferredName || '').trim()
  const activity = (data.primaryBusinessActivity || '').trim()
  const nic = (data.nicCode || '').trim()
  const checks: Array<[NameActivityField, string]> = [
    ['firstPreferredName', !name ? 'Proposed company name is required' : !COMPANY_NAME_PATTERN.test(name) ? 'Enter a valid company name (min 3 characters, letters and numbers)' : ''],
    ['primaryBusinessActivity', !activity ? 'Primary business activity is required' : !ACTIVITY_PATTERN.test(activity) ? 'Describe the business activity in words' : ''],
    ['nicCode', !nic ? 'NIC 5-digit code is required' : !isValidNicCode(nic) ? 'Enter a valid 5-digit numeric NIC code' : ''],
  ]
  return Object.fromEntries(checks.filter(([, message]) => Boolean(message)))
}

/** Keeps the NIC code numeric and 5 digits long as the user types or pastes. */
export const normalizeNameActivityValue = (field: string, value: string): string =>
  field === 'nicCode' ? filterDigits(value, NIC_CODE_LENGTH) : value

interface CompanyNameActivityCardsProps {
  data: CompanyDetailsFormData
  errors: Record<string, string>
  onChange: (field: NameActivityField, value: string) => void
}

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <span className="company-field-error">{message}</span> : null

/** "Proposed Company Names" and "Business Activity / NIC" cards of the Company Details step. */
export const CompanyNameActivityCards: React.FC<CompanyNameActivityCardsProps> = ({ data, errors, onChange }) => (
  <>
    <section className="company-details-card">
      <div className="company-details-card__header">
        <h2 className="company-details-card__title">Proposed Company Names</h2>
        <p className="company-details-card__subtitle">
          Provide your preferred name for SPICe+ Part A name reservation / incorporation.
        </p>
      </div>

      <div className="company-details-group">
        <label htmlFor="company-proposed-name" className="company-details-label">
          Proposed Company Name<span className="company-details-required"> *</span>
        </label>
        <input
          id="company-proposed-name"
          type="text"
          maxLength={120}
          className={`company-details-input ${errors.firstPreferredName ? 'company-input--error' : ''}`}
          placeholder="Enter your proposed company name"
          value={data.firstPreferredName}
          onChange={(e) => onChange('firstPreferredName', e.target.value)}
        />
        <FieldError message={errors.firstPreferredName} />
        <p className="company-details-helper">{data.mandatorySuffix}</p>
      </div>
    </section>

    <section className="company-details-card">
      <div className="company-details-card__header">
        <h2 className="company-details-card__title">Business Activity / NIC</h2>
        <p className="company-details-card__subtitle">
          Define the main objective and National Industrial Classification code of your company.
        </p>
      </div>

      <div className="company-details-group">
        <label htmlFor="company-primary-activity" className="company-details-label">
          Primary Business Activity<span className="company-details-required"> *</span>
        </label>
        <input
          id="company-primary-activity"
          type="text"
          maxLength={ACTIVITY_MAX_LENGTH}
          className={`company-details-input ${errors.primaryBusinessActivity ? 'company-input--error' : ''}`}
          placeholder="Enter Primary Business Activity"
          value={data.primaryBusinessActivity}
          onChange={(e) => onChange('primaryBusinessActivity', e.target.value)}
        />
        <FieldError message={errors.primaryBusinessActivity} />
        <p className="company-details-helper">Used for Main Objects in MoA Memorandum of Association.</p>
      </div>

      <div className="company-details-group">
        <label htmlFor="company-nic-code" className="company-details-label">
          NIC 5-Digit Code<span className="company-details-required"> *</span>
        </label>
        <input
          id="company-nic-code"
          type="text"
          inputMode="numeric"
          maxLength={NIC_CODE_LENGTH}
          className={`company-details-input ${errors.nicCode ? 'company-input--error' : ''}`}
          placeholder="Enter 5-digit NIC Code"
          value={data.nicCode}
          onChange={(e) => onChange('nicCode', e.target.value)}
        />
        <FieldError message={errors.nicCode} />
        <p className="company-details-helper">National Industrial Classification 5-Digit Code.</p>
      </div>

      <div className="company-details-group">
        <label htmlFor="company-secondary-activity" className="company-details-label">
          Secondary Business Activity (Optional)
        </label>
        <textarea
          id="company-secondary-activity"
          rows={4}
          maxLength={ACTIVITY_MAX_LENGTH}
          className="company-details-input company-details-textarea"
          placeholder="Enter Secondary Business Activity"
          value={data.secondaryBusinessActivity}
          onChange={(e) => onChange('secondaryBusinessActivity', e.target.value)}
        />
      </div>
    </section>
  </>
)
