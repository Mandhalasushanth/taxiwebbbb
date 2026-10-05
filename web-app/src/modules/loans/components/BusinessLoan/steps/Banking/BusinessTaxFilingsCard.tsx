import React from 'react'
import { FileText } from 'lucide-react'
import {
  formatCurrencyString,
  formatDigitsOnly,
  handleNumericKeyDown,
  LOAN_FIELD_LIMITS,
} from '@modules/loans/utils/loanInputFormatters'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'

export interface BusinessTaxFilingsCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Business Tax Filings Card
 * Strictly loop-free and uses external CSS only.
 */
export const BusinessTaxFilingsCard: React.FC<BusinessTaxFilingsCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="banking-card">
      <div className="banking-card-header">
        <div className="banking-icon-tile">
          <FileText size={22} aria-hidden="true" />
        </div>
        <div className="banking-card-header__info">
          <h2 className="banking-card-title">Business Tax Filings</h2>
        </div>
      </div>

      <div className="banking-card-grid">
        {/* Left: ITR Acknowledgement Number (15 Digits) (Optional) */}
        <div className="banking-field-item">
          <label htmlFor="itrAcknowledgementNumber" className="banking-field-label">
            ITR Acknowledgement Number (15 Digits) (Optional)
          </label>
          <input
            id="itrAcknowledgementNumber"
            type="text"
            maxLength={LOAN_FIELD_LIMITS.ITR_ACK}
            className={`banking-input ${errors.itrAcknowledgementNumber ? 'banking-input--error' : ''}`}
            placeholder="Enter 15-digit acknowledgement number"
            value={data.itrAcknowledgementNumber || ''}
            onChange={(e) =>
              onChange({
                itrAcknowledgementNumber: formatDigitsOnly(e.target.value, LOAN_FIELD_LIMITS.ITR_ACK),
              })
            }
            onKeyDown={handleNumericKeyDown}
            aria-label="ITR Acknowledgement Number"
          />
          {errors.itrAcknowledgementNumber && (
            <span className="banking-field-error">{errors.itrAcknowledgementNumber}</span>
          )}
        </div>

        {/* Right: Gross Total Income as per ITR (₹) */}
        <div className="banking-field-item">
          <label htmlFor="grossTotalIncomeItr" className="banking-field-label">
            Gross Total Income as per ITR (₹)
          </label>
          <input
            id="grossTotalIncomeItr"
            type="text"
            className={`banking-input ${errors.grossTotalIncomeItr ? 'banking-input--error' : ''}`}
            placeholder="Enter gross total income"
            value={data.grossTotalIncomeItr || ''}
            onChange={(e) =>
              onChange({ grossTotalIncomeItr: formatCurrencyString(e.target.value) })
            }
            onKeyDown={handleNumericKeyDown}
            aria-label="Gross Total Income as per ITR"
          />
          {errors.grossTotalIncomeItr && (
            <span className="banking-field-error">{errors.grossTotalIncomeItr}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessTaxFilingsCard
