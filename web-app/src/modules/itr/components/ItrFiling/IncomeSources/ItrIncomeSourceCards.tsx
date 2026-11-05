import React from 'react'
import { Wallet } from 'lucide-react'
import { FieldInfoTooltip } from '@shared/components'
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
    <div className="itr-salary-card" id="itr-capital-gains" data-section="capital_gains">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">📈</div>
          <div className="itr-salary-card__titles">
            <div className="itr-salary-card__title-row">
              <h3 className="itr-salary-card__title">Capital Gains &amp; Trading</h3>
              <FieldInfoTooltip
                title="Capital Gains & Trading Information"
                ariaLabel="Trading and asset gains field guide"
                iconSize={18}
                description="Enter details of your gains or profits from stocks, mutual funds, F&O, crypto or property. Provide short-term gains (assets held ≤ 12 months) and long-term gains (assets held > 12 months)."
              />
            </div>
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
    const updated: OtherSourcesDetails = { ...otherSourcesDetails, [field]: val }
    if (field === 'savingsInterest') {
      updated.interestIncome = val
    } else if (field === 'otherMiscellaneous') {
      updated.otherIncome = val
    }
    onOtherSourcesDetailsChange(updated)
  }

  const savingsVal = otherSourcesDetails.savingsInterest ?? otherSourcesDetails.interestIncome ?? ''
  const fdVal = otherSourcesDetails.fdInterest ?? ''
  const dividendVal = otherSourcesDetails.dividendIncome ?? ''
  const pensionVal = otherSourcesDetails.familyPension ?? ''
  const miscVal = otherSourcesDetails.otherMiscellaneous ?? otherSourcesDetails.otherIncome ?? ''

  return (
    <div className="itr-salary-card" id="itr-other-sources" data-section="other_sources">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">
            <Wallet size={22} />
          </div>
          <div className="itr-salary-card__titles">
            <div className="itr-salary-card__title-row">
              <h3 className="itr-salary-card__title">Income from Other Sources</h3>
              <FieldInfoTooltip
                title="Other Sources Information"
                ariaLabel="Savings, interest and misc income guide"
                iconSize={18}
                description="Enter other income received during the financial year, including savings and FD interest, dividends from shares or mutual funds, family pension received, and any other taxable income. Enter 0 if none."
              />
            </div>
            <p className="itr-salary-card__sub">Bank interest, dividends, family pension</p>
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
          <label className="itr-form-label" htmlFor="os-savings">
            Savings Interest <span className="itr-required-star">*</span>
          </label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-savings"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="e.g. 10000 (0 if none)"
              value={savingsVal}
              onChange={(e) => handleOtherSourcesChange('savingsInterest', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>

        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="os-fd">
            FD / Term Interest <span className="itr-required-star">*</span>
          </label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-fd"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="e.g. 25000 (0 if none)"
              value={fdVal}
              onChange={(e) => handleOtherSourcesChange('fdInterest', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="os-dividend">
            Dividend Income <span className="itr-required-star">*</span>
          </label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-dividend"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="e.g. 5000 (0 if none)"
              value={dividendVal}
              onChange={(e) => handleOtherSourcesChange('dividendIncome', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>

        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="os-pension">
            Family Pension <span className="itr-required-star">*</span>
          </label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="os-pension"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="e.g. 0 if none"
              value={pensionVal}
              onChange={(e) => handleOtherSourcesChange('familyPension', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>

      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="os-misc">
          Other Miscellaneous <span className="itr-required-star">*</span>
        </label>
        <div className="itr-input-currency-wrap">
          <span className="itr-currency-prefix">₹</span>
          <input
            id="os-misc"
            type="text"
            inputMode="numeric"
            maxLength={14}
            className="itr-input-currency"
            placeholder="e.g. 0 if none"
            value={miscVal}
            onChange={(e) => handleOtherSourcesChange('otherMiscellaneous', e.target.value.replace(/[^0-9,]/g, ''))}
          />
        </div>
      </div>
    </div>
  )
}