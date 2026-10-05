import React from 'react'
import { Calculator, ShieldCheck } from 'lucide-react'
import type { TdsIncomeTaxData } from '../../../types/tdsRefund.types'
import { TdsCategoryToggles } from './TdsCategoryToggles'
import './TdsRefundTaxDetailsSection.css'

export type { TdsIncomeTaxData }
export { TdsCategoryToggles }

export interface TdsRefundTaxDetailsSectionProps {
  data: TdsIncomeTaxData
  onChange: (updated: Partial<TdsIncomeTaxData>) => void
}

export const TdsRefundTaxDetailsSection: React.FC<TdsRefundTaxDetailsSectionProps> = ({
  data,
  onChange,
}) => {
  return (
    <>
      {/* Card 3: Income & Tax Information */}
      <div className="tds-card" data-testid="tds-card-income">
        <div className="tds-card-header">
          <div className="tds-card-title-wrap">
            <div className="tds-card-icon-box tds-card-icon-box--calc" aria-hidden="true">
              <Calculator size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="tds-card-title">Income &amp; Tax Information</h2>
              <span className="tds-card-subtitle">Tax calculation breakdown and additional earnings</span>
            </div>
          </div>
        </div>

        <div className="tds-income-form">
          {/* Tax Regime Selector */}
          <div className="tds-form-group">
            <label className="tds-label">
              Income Tax Regime <span className="tds-required">*</span>
            </label>
            <div className="tds-taxRegime-grid">
              <button
                type="button"
                className={`tds-taxRegime-card ${data.taxRegime === 'new' ? 'tds-taxRegime-card--active' : ''}`}
                onClick={() => onChange({ taxRegime: 'new' })}
                data-testid="taxRegime-new"
              >
                <div className="tds-taxRegime-title">New Tax Regime</div>
                <div className="tds-taxRegime-sub">Default (Lower tax slabs, standard deduction)</div>
              </button>
              <button
                type="button"
                className={`tds-taxRegime-card ${data.taxRegime === 'old' ? 'tds-taxRegime-card--active' : ''}`}
                onClick={() => onChange({ taxRegime: 'old' })}
                data-testid="taxRegime-old"
              >
                <div className="tds-taxRegime-title">Old Tax Regime</div>
                <div className="tds-taxRegime-sub">With 80C, 80D, HRA &amp; Home Loan deductions</div>
              </button>
            </div>
          </div>

          {/* Core Income Inputs Grid */}
          <div className="tds-form-grid-2">
            <div className="tds-form-group">
              <label htmlFor="tds-salary-income" className="tds-label">
                Annual Salary Income (₹) <span className="tds-required">*</span>
              </label>
              <input
                id="tds-salary-income"
                type="text"
                className="tds-input"
                value={data.salaryIncome}
                onChange={(e) => onChange({ salaryIncome: e.target.value })}
                placeholder="Enter your salary income"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-other-income" className="tds-label">Other Income / Moonlighting (₹)</label>
              <input
                id="tds-other-income"
                type="text"
                className="tds-input"
                value={data.otherIncome}
                onChange={(e) => onChange({ otherIncome: e.target.value })}
                placeholder="Enter other income"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-interest-income" className="tds-label">Interest Income (Savings/FD) (₹)</label>
              <input
                id="tds-interest-income"
                type="text"
                className="tds-input"
                value={data.interestIncome}
                onChange={(e) => onChange({ interestIncome: e.target.value })}
                placeholder="Enter interest income"
              />
            </div>
          </div>

          {/* Conditional Income Sources & Deductions Toggles */}
          <div className="tds-form-group">
            <label className="tds-label">Additional Income Streams &amp; Deductions</label>
            <TdsCategoryToggles data={data} onChange={onChange} />
          </div>
        </div>
      </div>

      {/* Card 4: Taxes Paid Details */}
      <div className="tds-card" data-testid="tds-card-taxes-paid">
        <div className="tds-card-header">
          <div className="tds-card-title-wrap">
            <div className="tds-card-icon-box tds-card-icon-box--shield" aria-hidden="true">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="tds-card-title">Taxes Already Paid (As per 26AS / AIS)</h2>
              <span className="tds-card-subtitle">Tax credits deducted at source or paid in advance</span>
            </div>
          </div>
        </div>

        <div className="tds-income-form">
          <div className="tds-form-grid-2">
            <div className="tds-form-group">
              <label htmlFor="tds-total-tds" className="tds-label">
                Total TDS Deducted (₹) <span className="tds-required">*</span>
              </label>
              <input
                id="tds-total-tds"
                type="text"
                className="tds-input"
                value={data.totalTdsDeducted}
                onChange={(e) => onChange({ totalTdsDeducted: e.target.value })}
                placeholder="Enter total TDS deducted"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-tcs-amount" className="tds-label">TCS Collected (₹)</label>
              <input
                id="tds-tcs-amount"
                type="text"
                className="tds-input"
                value={data.tcsAmount}
                onChange={(e) => onChange({ tcsAmount: e.target.value })}
                placeholder="Enter TCS amount"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-advance-tax" className="tds-label">Advance Tax Paid (₹)</label>
              <input
                id="tds-advance-tax"
                type="text"
                className="tds-input"
                value={data.advanceTax}
                onChange={(e) => onChange({ advanceTax: e.target.value })}
                placeholder="Enter advance tax paid"
              />
            </div>
            <div className="tds-form-group">
              <label htmlFor="tds-self-tax" className="tds-label">Self-Assessment Tax Paid (₹)</label>
              <input
                id="tds-self-tax"
                type="text"
                className="tds-input"
                value={data.selfAssessmentTax}
                onChange={(e) => onChange({ selfAssessmentTax: e.target.value })}
                placeholder="Enter self-assessment tax paid"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
