import React from 'react'
import { FieldInfoTooltip } from '@shared/components'
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
    <div className="itr-salary-card" id="itr-business-income" data-section="business">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">🏪</div>
          <div className="itr-salary-card__titles">
            <div className="itr-salary-card__title-row">
              <h3 className="itr-salary-card__title">Business / Profession</h3>
              <FieldInfoTooltip
                title="Business / Profession Information"
                ariaLabel="Commercial and professional income guide"
                iconSize={18}
                description="Choose how you report your business income (presumptive or regular books) and provide your total business turnover/receipts (total sales or services before expenses) and declared net profit (your business profit after all expenses)."
              />
            </div>
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

      {/* Reporting method */}
      <div className="itr-form-group">
        <label className="itr-form-label">
          How do you report this business? <span className="itr-required-star">*</span>
        </label>
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
          <label className="itr-form-label" htmlFor="biz-turnover">
            Gross Turnover <span className="itr-required-star">*</span>
          </label>
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
          <label className="itr-form-label" htmlFor="biz-profit">
            Declared Profit <span className="itr-required-star">*</span>
          </label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="biz-profit"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter declared profit"
              value={businessDetails.declaredNetProfit}
              onChange={(e) => handleBusinessChange('declaredNetProfit', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}