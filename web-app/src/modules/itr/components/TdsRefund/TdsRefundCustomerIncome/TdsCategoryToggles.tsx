import React from 'react'
import type { TdsIncomeTaxData } from '../../../types/tdsRefund.types'
import './TdsRefundTaxDetailsSection.css'

export interface TdsCategoryTogglesProps {
  data: TdsIncomeTaxData
  onChange: (updated: Partial<TdsIncomeTaxData>) => void
}

export const TdsCategoryToggles: React.FC<TdsCategoryTogglesProps> = ({ data, onChange }) => {
  return (
    <div className="tds-toggles-list">
      {/* 1. Rental Income */}
      <div className="tds-toggle-card" data-testid="toggle-row-rentalIncome">
        <div className="tds-toggle-header">
          <div className="tds-toggle-info">
            <span className="tds-toggle-title">Rental Income</span>
            <span className="tds-toggle-subtitle">House property rent</span>
          </div>
          <div className="tds-yes-no-group">
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--yes ${data.rentalIncome === 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ rentalIncome: 'yes' })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--no ${data.rentalIncome !== 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ rentalIncome: 'no', annualRent: '', propertyTaxes: '' })}
            >
              No
            </button>
          </div>
        </div>
        {data.rentalIncome === 'yes' && (
          <div className="tds-toggle-subfields">
            <div className="tds-form-group">
              <label htmlFor="tds-annual-rent" className="tds-label">Annual Rent Received (₹)</label>
              <input
                id="tds-annual-rent"
                type="text"
                className="tds-input"
                value={data.annualRent || ''}
                onChange={(e) => onChange({ annualRent: e.target.value })}
                placeholder="Enter rental income"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-property-taxes" className="tds-label">Property Taxes Paid (₹)</label>
              <input
                id="tds-property-taxes"
                type="text"
                className="tds-input"
                value={data.propertyTaxes || ''}
                onChange={(e) => onChange({ propertyTaxes: e.target.value })}
                placeholder="Enter municipal taxes"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Capital Gains */}
      <div className="tds-toggle-card" data-testid="toggle-row-capitalGains">
        <div className="tds-toggle-header">
          <div className="tds-toggle-info">
            <span className="tds-toggle-title">Capital Gains</span>
            <span className="tds-toggle-subtitle">Stocks / MF / Property</span>
          </div>
          <div className="tds-yes-no-group">
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--yes ${data.capitalGains === 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ capitalGains: 'yes' })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--no ${data.capitalGains !== 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ capitalGains: 'no', stcg: '', ltcg: '' })}
            >
              No
            </button>
          </div>
        </div>
        {data.capitalGains === 'yes' && (
          <div className="tds-toggle-subfields tds-form-grid-2">
            <div className="tds-form-group">
              <label htmlFor="tds-stcg" className="tds-label">Short-Term Gains (₹)</label>
              <input
                id="tds-stcg"
                type="text"
                className="tds-input"
                value={data.stcg || ''}
                onChange={(e) => onChange({ stcg: e.target.value })}
                placeholder="Enter STCG"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-ltcg" className="tds-label">Long-Term Gains (₹)</label>
              <input
                id="tds-ltcg"
                type="text"
                className="tds-input"
                value={data.ltcg || ''}
                onChange={(e) => onChange({ ltcg: e.target.value })}
                placeholder="Enter LTCG"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Business / Profession */}
      <div className="tds-toggle-card" data-testid="toggle-row-businessIncome">
        <div className="tds-toggle-header">
          <div className="tds-toggle-info">
            <span className="tds-toggle-title">Business / Profession</span>
            <span className="tds-toggle-subtitle">Freelance or business income</span>
          </div>
          <div className="tds-yes-no-group">
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--yes ${data.businessIncome === 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ businessIncome: 'yes' })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--no ${data.businessIncome !== 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ businessIncome: 'no', turnover: '', netProfit: '' })}
            >
              No
            </button>
          </div>
        </div>
        {data.businessIncome === 'yes' && (
          <div className="tds-toggle-subfields tds-form-grid-2">
            <div className="tds-form-group">
              <label htmlFor="tds-turnover" className="tds-label">Turnover (₹)</label>
              <input
                id="tds-turnover"
                type="text"
                className="tds-input"
                value={data.turnover || ''}
                onChange={(e) => onChange({ turnover: e.target.value })}
                placeholder="Enter turnover"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-net-profit" className="tds-label">Net Profit (₹)</label>
              <input
                id="tds-net-profit"
                type="text"
                className="tds-input"
                value={data.netProfit || ''}
                onChange={(e) => onChange({ netProfit: e.target.value })}
                placeholder="Enter profit"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Home Loan Interest */}
      <div className="tds-toggle-card" data-testid="toggle-row-homeLoanInterest">
        <div className="tds-toggle-header">
          <div className="tds-toggle-info">
            <span className="tds-toggle-title">Home Loan Interest</span>
            <span className="tds-toggle-subtitle">Self-occupied house property</span>
          </div>
          <div className="tds-yes-no-group">
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--yes ${data.homeLoanInterest === 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ homeLoanInterest: 'yes' })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--no ${data.homeLoanInterest !== 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ homeLoanInterest: 'no', homeLoanInterestAmount: '' })}
            >
              No
            </button>
          </div>
        </div>
        {data.homeLoanInterest === 'yes' && (
          <div className="tds-toggle-subfields">
            <div className="tds-form-group">
              <label htmlFor="tds-interest-paid" className="tds-label">Interest Paid (Sec 24b) (₹)</label>
              <input
                id="tds-interest-paid"
                type="text"
                className="tds-input"
                value={data.homeLoanInterestAmount || ''}
                onChange={(e) => onChange({ homeLoanInterestAmount: e.target.value })}
                placeholder="Enter interest paid"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Tax Deductions */}
      <div className="tds-toggle-card" data-testid="toggle-row-taxDeductions">
        <div className="tds-toggle-header">
          <div className="tds-toggle-info">
            <span className="tds-toggle-title">Tax Deductions</span>
            <span className="tds-toggle-subtitle">Section 80C, 80D, 80G</span>
          </div>
          <div className="tds-yes-no-group">
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--yes ${data.taxDeductions === 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ taxDeductions: 'yes' })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`tds-yes-no-btn tds-yes-no-btn--no ${data.taxDeductions !== 'yes' ? 'tds-yes-no-btn--active' : ''}`}
              onClick={() => onChange({ taxDeductions: 'no', deduction80C: '', deduction80D: '' })}
            >
              No
            </button>
          </div>
        </div>
        {data.taxDeductions === 'yes' && (
          <div className="tds-toggle-subfields tds-form-grid-2">
            <div className="tds-form-group">
              <label htmlFor="tds-deduction-80c" className="tds-label">80C (PPF, ELSS, LIC) (₹)</label>
              <input
                id="tds-deduction-80c"
                type="text"
                className="tds-input"
                value={data.deduction80C || ''}
                onChange={(e) => onChange({ deduction80C: e.target.value })}
                placeholder="Up to ₹1.5L"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-deduction-80d" className="tds-label">80D (Health Ins.) (₹)</label>
              <input
                id="tds-deduction-80d"
                type="text"
                className="tds-input"
                value={data.deduction80D || ''}
                onChange={(e) => onChange({ deduction80D: e.target.value })}
                placeholder="Up to ₹75k"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
