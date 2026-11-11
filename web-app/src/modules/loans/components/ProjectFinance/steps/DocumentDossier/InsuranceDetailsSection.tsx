import React from 'react'
import { getTodayIso } from '@shared/utils/dateUtils'
import { formatCurrencyString } from '@modules/loans/utils/loanInputFormatters'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import { TYPE_OF_INSURANCE_OPTIONS } from './securityComplianceConstants'

export interface InsuranceDetailsSectionProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isOpen: boolean
  onToggle: () => void
  onOpenPicker?: () => void
  errors?: Record<string, string>
}

const ShieldSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ChevronSvg: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

export const InsuranceDetailsSection: React.FC<InsuranceDetailsSectionProps> = ({
  data,
  onChange,
  isOpen,
  onToggle,
  errors = {},
}) => {
  const handleAmountInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    onChange({ [field]: formatCurrencyString(rawValue) })
  }

  return (
    <div className="pf-collapsible-card">
      <div className="pf-collapsible-header" onClick={onToggle}>
        <div className="pf-collapsible-header__left">
          <div className="pf-section-icon-tile pf-section-icon-tile--orange">
            <ShieldSvg />
          </div>
          <h2 className="pf-collapsible-title">4. Insurance Details</h2>
        </div>
        <ChevronSvg isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className="pf-collapsible-body">
          <p className="pf-section-intro-desc">
            Provide details of insurance coverage for the project (if applicable).
          </p>

          {/* Type of Insurance */}
          <div className="pf-field-group">
            <label htmlFor="typeOfInsurance" className="pf-field-label">Type of Insurance</label>
            <select
              id="typeOfInsurance"
              className={`pf-custom-select ${errors.typeOfInsurance ? 'pf-custom-select--error' : ''}`}
              value={data.typeOfInsurance || ''}
              onChange={(e) => onChange({ typeOfInsurance: e.target.value })}
            >
              <option value="" disabled>Select insurance type</option>
              {TYPE_OF_INSURANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.typeOfInsurance && (
              <span className="pf-field-error-msg">{errors.typeOfInsurance}</span>
            )}
          </div>

          {/* Coverage Amount */}
          <div className="pf-field-group">
            <label htmlFor="insuranceCoverageAmount" className="pf-field-label">
              Coverage Amount (₹)
            </label>
            <input
              id="insuranceCoverageAmount"
              type="text"
              className={`pf-custom-input ${errors.insuranceCoverageAmount ? 'pf-custom-input--error' : ''}`}
              placeholder="Enter amount"
              value={data.insuranceCoverageAmount || ''}
              onChange={(e) => handleAmountInput('insuranceCoverageAmount', e.target.value)}
            />
            {errors.insuranceCoverageAmount && (
              <span className="pf-field-error-msg">{errors.insuranceCoverageAmount}</span>
            )}
          </div>

          {/* Policy Validity */}
          <div className="pf-field-group">
            <label htmlFor="insurancePolicyValidity" className="pf-field-label">
              Policy Validity
            </label>
            <input
              id="insurancePolicyValidity"
              type="date"
              max={getTodayIso()}
              className="pf-custom-input"
              placeholder="DD MMM YYYY"
              value={data.insurancePolicyValidity || ''}
              onChange={(e) => onChange({ insurancePolicyValidity: e.target.value })}
            />
          </div>

          {/* Insurance Provider */}
          <div className="pf-field-group">
            <label htmlFor="typeOfInsurance" className="pf-field-label">
              Insurance Provider Name
            </label>
            <input
              id="typeOfInsurance"
              type="text"
              className="pf-custom-input"
              placeholder="Enter provider name"
              value={data.typeOfInsurance || ''}
              onChange={(e) => onChange({ typeOfInsurance: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
