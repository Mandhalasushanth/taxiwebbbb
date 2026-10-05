import React from 'react'
import { BUSINESS_METHODS, type BusinessDetails } from '../itrFiling.constants'
import './ItrIncomeSourceCards.css'

export interface ItrBusinessIncomeCardProps {
  businessDetails: BusinessDetails
  onBusinessDetailsChange: (details: BusinessDetails) => void
  onToggle: () => void
}

export const ItrBusinessIncomeCard: React.FC<ItrBusinessIncomeCardProps> = ({
  businessDetails,
  onBusinessDetailsChange,
  onToggle,
}) => {
  const handleBusinessChange = (field: keyof BusinessDetails, val: string) => {
    onBusinessDetailsChange({ ...businessDetails, [field]: val })
  }

  return (
    <div className="itr-salary-card">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">🏪</div>
          <div className="itr-salary-card__titles">
            <h3 className="itr-salary-card__title">Business / Profession</h3>
            <p className="itr-salary-card__sub">Presumptive (44AD/ADA) or Regular Books</p>
          </div>
        </div>
        <div
          className="itr-salary-checkbox-wrap"
          onClick={onToggle}
          title="Toggle Business"
          role="checkbox"
          aria-checked={true}
          tabIndex={0}
        >
          <div className="itr-checkbox-custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* GST Reconciliation Box */}
      <div className="itr-gst-reconcile-box">
        <div className="itr-gst-reconcile-header">
          <div className="itr-gst-reconcile-title-row">
            <span className="itr-gst-icon">🏪</span>
            <span className="itr-gst-reconcile-title">GST ↔ ITR Turnover Reconciliation</span>
            <span className="itr-gst-shield-icon" aria-hidden="true">🛡</span>
          </div>
          <p className="itr-gst-reconcile-desc">
            TaxEdge imported business turnover from your filed GST returns. GST reporting and income tax
            computation can differ due to credit notes or advances.
          </p>
        </div>
        <div className="itr-gst-table">
          <div className="itr-gst-table-header">
            <span>SOURCE / LEDGER</span>
            <span>AMOUNT</span>
          </div>
          {[
            { label: 'GSTR-1 Outward Supplies', sub: 'Invoice-level filed returns (FY 2024-25)', val: '₹ 0' },
            { label: 'GSTR-3B Outward Supplies', sub: 'Monthly summary return filings', val: '₹ 0' },
            { label: 'Books of Account Turnover', sub: 'Audited ledger / sales register', val: '₹ 0' },
            { label: 'Proposed ITR Business Turnover', sub: 'Turnover declared for Income Tax computation', val: '₹ 0' },
          ].map((row) => (
            <div key={row.label} className="itr-gst-table-row">
              <div>
                <div className="itr-gst-row-label">{row.label}</div>
                <div className="itr-gst-row-sub">{row.sub}</div>
              </div>
              <div className="itr-gst-row-val">{row.val}</div>
            </div>
          ))}
        </div>
        <div className="itr-gst-verify-note">
          <span className="itr-gst-verify-icon">✅</span>
          <span>Your Tax Executive will independently cross-verify turnover with GSTR-9 annual return records.</span>
        </div>
      </div>

      {/* Reporting method */}
      <div className="itr-form-group">
        <label className="itr-form-label">How do you report this business?</label>
        <div className="itr-business-method-list">
          {BUSINESS_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`itr-business-method-card ${businessDetails.reportingMethod === method.id ? 'itr-business-method-card--active' : ''}`}
              onClick={() => handleBusinessChange('reportingMethod', method.id)}
            >
              <div className="itr-business-method-radio">
                <div className="itr-radio-outer">
                  {businessDetails.reportingMethod === method.id && <div className="itr-radio-inner" />}
                </div>
              </div>
              <div className="itr-business-method-text">
                <div className="itr-business-method-title">{method.title}</div>
                <div className="itr-business-method-desc">{method.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="biz-turnover">Gross Turnover / Receipts</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="biz-turnover"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter gross turnover"
              value={businessDetails.grossTurnover}
              onChange={(e) => handleBusinessChange('grossTurnover', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="biz-profit">Declared Net Profit</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="biz-profit"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter declared net profit"
              value={businessDetails.declaredNetProfit}
              onChange={(e) => handleBusinessChange('declaredNetProfit', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
