import React from 'react'
import {
  ASSET_TYPE_OPTIONS,
  type CapitalGainsDetails,
  type OtherSourcesDetails,
} from '../itrFiling.constants'
import './ItrIncomeSourceCards.css'

export {
  ItrSalaryIncomeCard,
  type ItrSalaryIncomeCardProps,
  ItrHousePropertyCard,
  type ItrHousePropertyCardProps,
} from './ItrSalaryHouseCards'

export {
  ItrBusinessIncomeCard,
  type ItrBusinessIncomeCardProps,
} from './ItrBusinessIncomeCard'

/* ==========================================================================
   4. Capital Gains Card
   ========================================================================== */
export interface ItrCapitalGainsCardProps {
  capitalGainsDetails: CapitalGainsDetails
  onCapitalGainsDetailsChange: (details: CapitalGainsDetails) => void
  onToggle: () => void
  showErrors?: boolean
}

export const ItrCapitalGainsCard: React.FC<ItrCapitalGainsCardProps> = ({
  capitalGainsDetails,
  onCapitalGainsDetailsChange,
  onToggle,
  showErrors = false,
}) => {
  const toggleAssetType = (type: string) => {
    const current = capitalGainsDetails.assetTypes
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    onCapitalGainsDetailsChange({ ...capitalGainsDetails, assetTypes: updated })
  }

  const handleCapitalGainsChange = (field: keyof Omit<CapitalGainsDetails, 'assetTypes'>, val: string) => {
    onCapitalGainsDetailsChange({ ...capitalGainsDetails, [field]: val })
  }

  return (
    <div className="itr-salary-card">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">📈</div>
          <div className="itr-salary-card__titles">
            <h3 className="itr-salary-card__title">Capital Gains &amp; Trading</h3>
            <p className="itr-salary-card__sub">Stocks, mutual funds, F&amp;O, crypto, property</p>
          </div>
        </div>
        <div
          className="itr-salary-checkbox-wrap"
          onClick={onToggle}
          title="Toggle Capital Gains"
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

      <div className="itr-form-group">
        <label className="itr-form-label">
          Asset Types Traded <span className="itr-required-star">*</span>
        </label>
        <div className="itr-asset-pills-row">
          {ASSET_TYPE_OPTIONS.map((type) => {
            const isActive = capitalGainsDetails.assetTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                className={`itr-asset-pill ${isActive ? 'itr-asset-pill--active' : ''}`}
                onClick={() => toggleAssetType(type)}
              >
                {type}
              </button>
            )
          })}
        </div>
        {showErrors && capitalGainsDetails.assetTypes.length === 0 && (
          <span className="itr-field-error-text">Please select at least one asset type</span>
        )}
      </div>

      {capitalGainsDetails.assetTypes.includes('F&O & Intraday Trading') && (
        <div className="itr-cg-info-note">
          <span className="itr-cg-info-note__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10" fill="#1d4ed8" stroke="none" />
              <line x1="12" y1="16" x2="12" y2="12" stroke="#fff" strokeWidth="2.5" />
              <line x1="12" y1="8" x2="12.01" y2="8" stroke="#fff" strokeWidth="3" />
            </svg>
          </span>
          <span className="itr-cg-info-note__text">
            F&amp;O and Intraday trades are treated as business income under Section 43(5). ITR-3 will apply.
          </span>
        </div>
      )}

      {capitalGainsDetails.assetTypes.includes('Crypto / VDA') && (
        <div className="itr-cg-warning-note">
          <span className="itr-cg-warning-note__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10" fill="#dc2626" stroke="none" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2.5" />
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="#fff" strokeWidth="3" />
            </svg>
          </span>
          <span className="itr-cg-warning-note__text">
            Virtual Digital Assets (VDA) are taxed at 30% u/s 115BBH.
          </span>
        </div>
      )}

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="cg-stcg">
            Short-Term Gains (STCG) <span className="itr-required-star">*</span>
          </label>
          <div className={`itr-input-currency-wrap ${showErrors && !capitalGainsDetails.stcg?.trim() ? 'itr-input-currency-wrap--error' : ''}`}>
            <span className="itr-currency-prefix">₹</span>
            <input
              id="cg-stcg"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter short-term gains"
              value={capitalGainsDetails.stcg}
              onChange={(e) => handleCapitalGainsChange('stcg', e.target.value.replace(/[^0-9,]/g, ''))}
              required
            />
          </div>
          {showErrors && !capitalGainsDetails.stcg?.trim() && (
            <span className="itr-field-error-text">Short-Term Gains is required</span>
          )}
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="cg-ltcg">
            Long-Term Gains (LTCG) <span className="itr-required-star">*</span>
          </label>
          <div className={`itr-input-currency-wrap ${showErrors && !capitalGainsDetails.ltcg?.trim() ? 'itr-input-currency-wrap--error' : ''}`}>
            <span className="itr-currency-prefix">₹</span>
            <input
              id="cg-ltcg"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter long-term gains"
              value={capitalGainsDetails.ltcg}
              onChange={(e) => handleCapitalGainsChange('ltcg', e.target.value.replace(/[^0-9,]/g, ''))}
              required
            />
          </div>
          {showErrors && !capitalGainsDetails.ltcg?.trim() && (
            <span className="itr-field-error-text">Long-Term Gains is required</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   5. Other Sources Card
   ========================================================================== */
export interface ItrOtherSourcesCardProps {
  otherSourcesDetails: OtherSourcesDetails
  onOtherSourcesDetailsChange: (details: OtherSourcesDetails) => void
  onToggle: () => void
}

export const ItrOtherSourcesCard: React.FC<ItrOtherSourcesCardProps> = ({
  otherSourcesDetails,
  onOtherSourcesDetailsChange,
  onToggle,
}) => {
  const handleOtherSourcesChange = (field: keyof OtherSourcesDetails, val: string) => {
    onOtherSourcesDetailsChange({ ...otherSourcesDetails, [field]: val })
  }

  return (
    <div className="itr-salary-card">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">💰</div>
          <div className="itr-salary-card__titles">
            <h3 className="itr-salary-card__title">Other Sources</h3>
            <p className="itr-salary-card__sub">Interest, dividends, gifts, and more</p>
          </div>
        </div>
        <div
          className="itr-salary-checkbox-wrap"
          onClick={onToggle}
          title="Toggle Other Sources"
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

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="os-interest">Interest Income (FD / Savings)</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-interest"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter interest income"
              value={otherSourcesDetails.interestIncome}
              onChange={(e) => handleOtherSourcesChange('interestIncome', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="os-dividend">Dividend Income</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-dividend"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter dividend income"
              value={otherSourcesDetails.dividendIncome}
              onChange={(e) => handleOtherSourcesChange('dividendIncome', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>

      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="os-other">Any Other Income (Gifts, Lottery, etc.)</label>
        <div className="itr-input-currency-wrap">
          <span className="itr-currency-prefix">₹</span>
          <input
            id="os-other"
            type="text"
            inputMode="numeric"
            maxLength={14}
            className="itr-input-currency"
            placeholder="Enter other income"
            value={otherSourcesDetails.otherIncome}
            onChange={(e) => handleOtherSourcesChange('otherIncome', e.target.value.replace(/[^0-9,]/g, ''))}
          />
        </div>
      </div>
    </div>
  )
}
