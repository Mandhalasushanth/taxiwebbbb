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
}

export const ItrCapitalGainsCard: React.FC<ItrCapitalGainsCardProps> = ({
  capitalGainsDetails,
  onCapitalGainsDetailsChange,
  onToggle,
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
        <label className="itr-form-label">Asset Types Traded</label>
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
      </div>

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="cg-stcg">Short-Term Gains (STCG)</label>
          <div className="itr-input-currency-wrap">
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
            />
          </div>
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="cg-ltcg">Long-Term Gains (LTCG)</label>
          <div className="itr-input-currency-wrap">
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
            />
          </div>
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
