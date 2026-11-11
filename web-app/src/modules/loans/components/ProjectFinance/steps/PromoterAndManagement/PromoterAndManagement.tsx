import React, { useState } from 'react'
import { getTodayIso } from '@shared/utils/dateUtils'
import { formatCurrencyString } from '@modules/loans/utils/loanInputFormatters'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import { RepaymentDetailsSection } from './RepaymentDetailsSection'
import {
  LOAN_TYPE_OPTIONS,
  SCHEME_PRODUCT_OPTIONS,
  PREFERRED_LENDER_OPTIONS,
} from './loanRequirementConstants'
import './PromoterAndManagement.css'

export interface PromoterAndManagementProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  errors?: Record<string, string>
}

const LayersSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const ChevronSvg: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

export const PromoterAndManagement: React.FC<PromoterAndManagementProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isRequirementOpen, setIsRequirementOpen] = useState<boolean>(true)
  const [isRepaymentOpen, setIsRepaymentOpen] = useState<boolean>(true)
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(true)
  const [isSourcesOpen, setIsSourcesOpen] = useState<boolean>(true)

  // Auto-filled values from Screen 3 (Total Project Cost & Promoters Equity)
  const totalCost = data.totalEstimatedProjectCost || data.loanRequirementTotalCost || ''
  const ownContribution = data.promotersEquityContribution || data.loanRequirementOwnContribution || ''

  const handleAmountInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    onChange({ [field]: formatCurrencyString(rawValue) })
  }

  const renderLoanRequirementCard = () => (
    <div className="pf-collapsible-card">
      <div className="pf-collapsible-header" onClick={() => setIsRequirementOpen((prev) => !prev)}>
        <div className="pf-collapsible-header__left">
          <div className="pf-section-icon-tile pf-section-icon-tile--orange">
            <LayersSvg />
          </div>
          <h2 className="pf-collapsible-title">1. Loan Requirement</h2>
        </div>
        <ChevronSvg isOpen={isRequirementOpen} />
      </div>

      {isRequirementOpen && (
        <div className="pf-collapsible-body">
          {/* Total Project Cost */}
          <div className="pf-field-group">
            <label className="pf-field-label">Total Project Cost (₹)</label>
            <input
              type="text"
              className="pf-custom-input pf-custom-input--readonly"
              readOnly
              placeholder="Auto-filled"
              value={totalCost}
            />
            <span className="pf-helper-text">Auto-filled from Screen 3 (Total Project Cost)</span>
          </div>

          {/* Own Contribution */}
          <div className="pf-field-group">
            <label className="pf-field-label">Own Contribution (₹)</label>
            <input
              type="text"
              className="pf-custom-input pf-custom-input--readonly"
              readOnly
              placeholder="Auto-filled"
              value={ownContribution}
            />
            <span className="pf-helper-text">Auto-filled from Screen 3 (Promoters Equity)</span>
          </div>

          {/* Loan Required */}
          <div className="pf-field-group">
            <label htmlFor="loanRequiredAmount" className="pf-field-label">
              Loan Required (₹) <span className="pf-required-star">*</span>
            </label>
            <input
              id="loanRequiredAmount"
              type="text"
              className={`pf-custom-input ${errors.loanRequiredAmount ? 'pf-custom-input--error' : ''}`}
              placeholder="Enter amount"
              value={data.loanRequiredAmount || ''}
              onChange={(e) => handleAmountInput('loanRequiredAmount', e.target.value)}
            />
            {errors.loanRequiredAmount && (
              <span className="pf-field-error-msg">{errors.loanRequiredAmount}</span>
            )}
          </div>

          {/* Type of Loan */}
          <div className="pf-field-group">
            <label htmlFor="loanType" className="pf-field-label">
              Type of Loan <span className="pf-required-star">*</span>
            </label>
            <select
              id="loanType"
              className={`pf-custom-select ${errors.loanType ? 'pf-custom-select--error' : ''}`}
              value={data.loanType || ''}
              onChange={(e) => onChange({ loanType: e.target.value })}
            >
              <option value="" disabled>Select loan type</option>
              {LOAN_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.loanType && (
              <span className="pf-field-error-msg">{errors.loanType}</span>
            )}
          </div>

          {/* Scheme / Product */}
          <div className="pf-field-group">
            <label htmlFor="schemeProduct" className="pf-field-label">
              Scheme / Product <span className="pf-required-star">*</span>
            </label>
            <select
              id="schemeProduct"
              className={`pf-custom-select ${errors.schemeProduct ? 'pf-custom-select--error' : ''}`}
              value={data.schemeProduct || ''}
              onChange={(e) => onChange({ schemeProduct: e.target.value })}
            >
              <option value="" disabled>Select scheme</option>
              {SCHEME_PRODUCT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.schemeProduct && (
              <span className="pf-field-error-msg">{errors.schemeProduct}</span>
            )}
          </div>

          {/* Preferred Lender */}
          <div className="pf-field-group">
            <label htmlFor="preferredLender" className="pf-field-label">Preferred Lender (Optional)</label>
            <select
              id="preferredLender"
              className="pf-custom-select"
              value={data.preferredLender || ''}
              onChange={(e) => onChange({ preferredLender: e.target.value })}
            >
              <option value="" disabled>Select lender</option>
              {PREFERRED_LENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Proposed Disbursement Date */}
          <div className="pf-field-group">
            <label htmlFor="proposedDisbursementDate" className="pf-field-label">
              Proposed Disbursement Date <span className="pf-required-star">*</span>
            </label>
            <input
              id="proposedDisbursementDate"
              type="date"
              max={getTodayIso()}
              className={`pf-custom-input ${errors.proposedDisbursementDate ? 'pf-custom-input--error' : ''}`}
              placeholder="DD MMM YYYY"
              value={data.proposedDisbursementDate || ''}
              onChange={(e) => onChange({ proposedDisbursementDate: e.target.value })}
            />
            {errors.proposedDisbursementDate && (
              <span className="pf-field-error-msg">{errors.proposedDisbursementDate}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="loan-requirement-step" data-testid="loan-requirement-step">
      {/* 1. Loan Requirement */}
      {renderLoanRequirementCard()}

      {/* 2. Repayment Details, 3. Indicative Schedule & 4. Repayment Sources */}
      <RepaymentDetailsSection
        data={data}
        onChange={onChange}
        isRepaymentOpen={isRepaymentOpen}
        onToggleRepayment={() => setIsRepaymentOpen((prev) => !prev)}
        isScheduleOpen={isScheduleOpen}
        onToggleSchedule={() => setIsScheduleOpen((prev) => !prev)}
        isSourcesOpen={isSourcesOpen}
        onToggleSources={() => setIsSourcesOpen((prev) => !prev)}
        errors={errors}
      />
    </div>
  )
}

export default PromoterAndManagement
