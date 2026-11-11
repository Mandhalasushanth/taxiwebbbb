import React from 'react'
import { getTodayIso } from '@shared/utils/dateUtils'
import { formatCurrencyString } from '@modules/loans/utils/loanInputFormatters'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import {
  REPAYMENT_PERIOD_OPTIONS,
  MORATORIUM_PERIOD_OPTIONS,
  REPAYMENT_FREQUENCY_OPTIONS,
  PRIMARY_REPAYMENT_SOURCE_OPTIONS,
  SECONDARY_REPAYMENT_SOURCE_OPTIONS,
} from './loanRequirementConstants'

export interface RepaymentDetailsSectionProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isRepaymentOpen: boolean
  onToggleRepayment: () => void
  isScheduleOpen: boolean
  onToggleSchedule: () => void
  isSourcesOpen: boolean
  onToggleSources: () => void
  onOpenPicker?: (
    picker:
      | 'repaymentPeriodYears'
      | 'moratoriumPeriodMonths'
      | 'repaymentFrequency'
      | 'primaryRepaymentSource'
      | 'secondaryRepaymentSource'
  ) => void
  errors?: Record<string, string>
}

const ChevronSvg: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

const CalendarSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const BarChartSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const TrendingUpSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

export const RepaymentDetailsSection: React.FC<RepaymentDetailsSectionProps> = ({
  data,
  onChange,
  isRepaymentOpen,
  onToggleRepayment,
  isScheduleOpen,
  onToggleSchedule,
  isSourcesOpen,
  onToggleSources,
  errors = {},
}) => {
  const handleAmountInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    onChange({ [field]: formatCurrencyString(rawValue) })
  }

  const handleNumericInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    const sanitized = rawValue.replace(/[^\d.]/g, '')
    onChange({ [field]: sanitized })
  }

  return (
    <>
      {/* 2. Repayment Details */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleRepayment}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile pf-section-icon-tile--orange">
              <CalendarSvg />
            </div>
            <h2 className="pf-collapsible-title">2. Repayment Details</h2>
          </div>
          <ChevronSvg isOpen={isRepaymentOpen} />
        </div>

        {isRepaymentOpen && (
          <div className="pf-collapsible-body">
            {/* Repayment Period */}
            <div className="pf-field-group">
              <label htmlFor="repaymentPeriodYears" className="pf-field-label">
                Repayment Period (Years) <span className="pf-required-star">*</span>
              </label>
              <select
                id="repaymentPeriodYears"
                className={`pf-custom-select ${errors.repaymentPeriodYears ? 'pf-custom-select--error' : ''}`}
                value={data.repaymentPeriodYears || ''}
                onChange={(e) => onChange({ repaymentPeriodYears: e.target.value })}
              >
                <option value="" disabled>Select years</option>
                {REPAYMENT_PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.repaymentPeriodYears && (
                <span className="pf-field-error-msg">{errors.repaymentPeriodYears}</span>
              )}
            </div>

            {/* Moratorium Period */}
            <div className="pf-field-group">
              <label htmlFor="moratoriumPeriodMonths" className="pf-field-label">Moratorium Period (Months)</label>
              <select
                id="moratoriumPeriodMonths"
                className="pf-custom-select"
                value={data.moratoriumPeriodMonths || ''}
                onChange={(e) => onChange({ moratoriumPeriodMonths: e.target.value })}
              >
                <option value="" disabled>Select months</option>
                {MORATORIUM_PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Repayment Frequency */}
            <div className="pf-field-group">
              <label htmlFor="repaymentFrequency" className="pf-field-label">
                Repayment Frequency <span className="pf-required-star">*</span>
              </label>
              <select
                id="repaymentFrequency"
                className={`pf-custom-select ${errors.repaymentFrequency ? 'pf-custom-select--error' : ''}`}
                value={data.repaymentFrequency || ''}
                onChange={(e) => onChange({ repaymentFrequency: e.target.value })}
              >
                <option value="" disabled>Select frequency</option>
                {REPAYMENT_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.repaymentFrequency && (
                <span className="pf-field-error-msg">{errors.repaymentFrequency}</span>
              )}
            </div>

            {/* Expected Interest Rate */}
            <div className="pf-field-group">
              <label htmlFor="expectedInterestRatePercent" className="pf-field-label">
                Expected Interest Rate (%) <span className="pf-required-star">*</span>
              </label>
              <div className="pf-input-with-suffix">
                <input
                  id="expectedInterestRatePercent"
                  type="text"
                  className={`pf-custom-input ${errors.expectedInterestRatePercent ? 'pf-custom-input--error' : ''}`}
                  placeholder="Enter interest rate"
                  value={data.expectedInterestRatePercent || ''}
                  onChange={(e) => handleNumericInput('expectedInterestRatePercent', e.target.value)}
                />
                <span className="pf-input-suffix">%</span>
              </div>
              {errors.expectedInterestRatePercent && (
                <span className="pf-field-error-msg">{errors.expectedInterestRatePercent}</span>
              )}
            </div>

            {/* Repayment Start Date */}
            <div className="pf-field-group">
              <label htmlFor="repaymentStartDate" className="pf-field-label">
                Repayment Start Date <span className="pf-required-star">*</span>
              </label>
              <input
                id="repaymentStartDate"
                type="date"
                max={getTodayIso()}
                className={`pf-custom-input ${errors.repaymentStartDate ? 'pf-custom-input--error' : ''}`}
                placeholder="DD MMM YYYY"
                value={data.repaymentStartDate || ''}
                onChange={(e) => onChange({ repaymentStartDate: e.target.value })}
              />
              {errors.repaymentStartDate && (
                <span className="pf-field-error-msg">{errors.repaymentStartDate}</span>
              )}
            </div>

            {/* Preferred EMI / Instalment */}
            <div className="pf-field-group">
              <label htmlFor="preferredEmiInstalment" className="pf-field-label">
                Preferred EMI / Instalment (₹) (Optional)
              </label>
              <input
                id="preferredEmiInstalment"
                type="text"
                className="pf-custom-input"
                placeholder="Enter amount"
                value={data.preferredEmiInstalment || ''}
                onChange={(e) => handleAmountInput('preferredEmiInstalment', e.target.value)}
              />
              <span className="pf-helper-text">
                Optional. If left blank, the auto-calculated EMI will be applied.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Repayment Schedule (Indicative) */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleSchedule}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile pf-section-icon-tile--orange">
              <BarChartSvg />
            </div>
            <h2 className="pf-collapsible-title">3. Repayment Schedule (Indicative)</h2>
          </div>
          <ChevronSvg isOpen={isScheduleOpen} />
        </div>

        {isScheduleOpen && (
          <div className="pf-collapsible-body">
            <p className="pf-section-intro-desc">
              Preview of estimated repayment schedule based on above details.
            </p>

            <div className="pf-table-scroll-container">
              <table className="pf-financial-table">
                <thead>
                  <tr>
                    <th className="pf-table-col-header">Year</th>
                    <th className="pf-table-col-header pf-text-center">Opening Debt (₹)</th>
                    <th className="pf-table-col-header pf-text-center">Principal (₹)</th>
                    <th className="pf-table-col-header pf-text-center">Interest (₹)</th>
                    <th className="pf-table-col-header pf-text-center">Closing Debt (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pf-table-cell-label">Year 1</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                  </tr>
                  <tr>
                    <td className="pf-table-cell-label">Year 2</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                  </tr>
                  <tr>
                    <td className="pf-table-cell-label">Year 3</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                    <td className="pf-text-center pf-text-muted">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Repayment Sources */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleSources}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile pf-section-icon-tile--orange">
              <TrendingUpSvg />
            </div>
            <h2 className="pf-collapsible-title">4. Repayment Sources</h2>
          </div>
          <ChevronSvg isOpen={isSourcesOpen} />
        </div>

        {isSourcesOpen && (
          <div className="pf-collapsible-body">
            <p className="pf-section-intro-desc">
              Specify the expected sources of repayment.
            </p>

            {/* Primary Source of Repayment */}
            <div className="pf-field-group">
              <label htmlFor="primaryRepaymentSource" className="pf-field-label">
                Primary Source of Repayment <span className="pf-required-star">*</span>
              </label>
              <select
                id="primaryRepaymentSource"
                className={`pf-custom-select ${errors.primaryRepaymentSource ? 'pf-custom-select--error' : ''}`}
                value={data.primaryRepaymentSource || ''}
                onChange={(e) => onChange({ primaryRepaymentSource: e.target.value })}
              >
                <option value="" disabled>Select source</option>
                {PRIMARY_REPAYMENT_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.primaryRepaymentSource && (
                <span className="pf-field-error-msg">{errors.primaryRepaymentSource}</span>
              )}
            </div>

            {/* Secondary Source (Optional) */}
            <div className="pf-field-group">
              <label htmlFor="secondaryRepaymentSource" className="pf-field-label">Secondary Source (Optional)</label>
              <select
                id="secondaryRepaymentSource"
                className="pf-custom-select"
                value={data.secondaryRepaymentSource || ''}
                onChange={(e) => onChange({ secondaryRepaymentSource: e.target.value })}
              >
                <option value="" disabled>Select source</option>
                {SECONDARY_REPAYMENT_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* DSCR (Projected) */}
            <div className="pf-field-group">
              <label htmlFor="dscrProjected" className="pf-field-label">
                DSCR (Projected) <span className="pf-required-star">*</span>
              </label>
              <input
                id="dscrProjected"
                type="text"
                className={`pf-custom-input ${errors.dscrProjected ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter DSCR"
                value={data.dscrProjected || ''}
                onChange={(e) => handleNumericInput('dscrProjected', e.target.value)}
              />
              <span className="pf-helper-text">
                Auto-calculated based on projected financials. Editable.
              </span>
              {errors.dscrProjected && (
                <span className="pf-field-error-msg">{errors.dscrProjected}</span>
              )}
            </div>

            {/* Explain Repayment Sources */}
            <div className="pf-field-group">
              <label htmlFor="explainRepaymentSources" className="pf-field-label">
                Explain Repayment Sources <span className="pf-required-star">*</span>
              </label>
              <textarea
                id="explainRepaymentSources"
                rows={4}
                className={`pf-custom-textarea ${errors.explainRepaymentSources ? 'pf-custom-textarea--error' : ''}`}
                placeholder="Enter details about expected cash flows and repayment"
                value={data.explainRepaymentSources || ''}
                onChange={(e) => onChange({ explainRepaymentSources: e.target.value })}
              />
              {errors.explainRepaymentSources && (
                <span className="pf-field-error-msg">{errors.explainRepaymentSources}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
