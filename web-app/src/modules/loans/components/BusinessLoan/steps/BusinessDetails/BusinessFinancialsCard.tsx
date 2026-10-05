import React from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
import {
  formatCurrencyString,
  handleNumericKeyDown,
} from '@modules/loans/utils/loanInputFormatters'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'

export interface BusinessFinancialsCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Business Financials Card - Annual Turnover & Annual Net Profit
 * Enforces digits-only input.
 */
export const BusinessFinancialsCard: React.FC<BusinessFinancialsCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="business-details-grid business-financials-grid">
      {/* 1. Annual Turnover (FY 2024-25 / Latest) */}
      <div className="business-field-card">
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <TrendingUp size={20} aria-hidden="true" />
            </div>
            <label htmlFor="annualTurnover" className="business-field-title">
              Annual Turnover (FY 2024–25 / Latest) (₹) <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <input
          id="annualTurnover"
          type="text"
          className={`custom-form-input ${errors.annualTurnover ? 'custom-form-input--error' : ''}`}
          placeholder="e.g. 5000000"
          value={data.annualTurnover || ''}
          onChange={(e) => onChange({ annualTurnover: formatCurrencyString(e.target.value) })}
          onKeyDown={handleNumericKeyDown}
          aria-label="Annual Turnover (FY 2024–25 / Latest)"
        />
        {errors.annualTurnover && (
          <span className="field-error-text">{errors.annualTurnover}</span>
        )}
      </div>

      {/* 2. Annual Net Profit (After Tax) */}
      <div className="business-field-card">
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <BarChart3 size={20} aria-hidden="true" />
            </div>
            <label htmlFor="annualNetProfit" className="business-field-title">
              Annual Net Profit (After Tax) (₹) <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <input
          id="annualNetProfit"
          type="text"
          className={`custom-form-input ${errors.annualNetProfit ? 'custom-form-input--error' : ''}`}
          placeholder="e.g. 500000"
          value={data.annualNetProfit || ''}
          onChange={(e) => onChange({ annualNetProfit: formatCurrencyString(e.target.value) })}
          onKeyDown={handleNumericKeyDown}
          aria-label="Annual Net Profit (After Tax)"
        />
        {errors.annualNetProfit && (
          <span className="field-error-text">{errors.annualNetProfit}</span>
        )}
      </div>
    </div>
  )
}

export default BusinessFinancialsCard
