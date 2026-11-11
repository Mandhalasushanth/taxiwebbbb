import React from 'react'
import { getTodayIso } from '@shared/utils/dateUtils'
import { formatCurrencyString } from '@modules/loans/utils/loanInputFormatters'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'

export interface FundingAndDisbursementSectionProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isMeansOfFinanceOpen: boolean
  onToggleMeansOfFinance: () => void
  isDisbursementOpen: boolean
  onToggleDisbursement: () => void
  errors?: Record<string, string>
}

const ChevronSvg: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

const PieChartSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
)

const CalendarSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export const FundingAndDisbursementSection: React.FC<FundingAndDisbursementSectionProps> = ({
  data,
  onChange,
  isMeansOfFinanceOpen,
  onToggleMeansOfFinance,
  isDisbursementOpen,
  onToggleDisbursement,
  errors = {},
}) => {
  const handleAmountInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    onChange({ [field]: formatCurrencyString(rawValue) })
  }

  const handleRatioInput = (rawValue: string) => {
    // Allows numbers and colon for ratio e.g. 70:30
    const sanitized = rawValue.replace(/[^0-9:]/g, '')
    onChange({ proposedDebtToEquityRatio: sanitized })
  }

  const handleTextInput = (field: keyof ProjectFinanceData, rawValue: string) => {
    onChange({ [field]: rawValue })
  }

  return (
    <>
      {/* 2. Means of Finance (Funding Structure) */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleMeansOfFinance}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <PieChartSvg />
            </div>
            <h2 className="pf-collapsible-title">2. Means of Finance (Funding Structure)</h2>
          </div>
          <ChevronSvg isOpen={isMeansOfFinanceOpen} />
        </div>

        {isMeansOfFinanceOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="promotersEquityContribution" className="pf-field-label">
                Promoters Equity Contribution (₹) <span className="pf-required-star">*</span>
              </label>
              <input
                id="promotersEquityContribution"
                type="text"
                className={`pf-custom-input ${errors.promotersEquityContribution ? 'pf-custom-input--error' : ''}`}
                placeholder="e.g. 27750000"
                value={data.promotersEquityContribution || ''}
                onChange={(e) => handleAmountInput('promotersEquityContribution', e.target.value)}
              />
              {errors.promotersEquityContribution && (
                <span className="pf-field-error-msg">{errors.promotersEquityContribution}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="debtTermLoanRequested" className="pf-field-label">
                Debt / Term Loan Requested (₹) <span className="pf-required-star">*</span>
              </label>
              <input
                id="debtTermLoanRequested"
                type="text"
                className={`pf-custom-input ${errors.debtTermLoanRequested ? 'pf-custom-input--error' : ''}`}
                placeholder="e.g. 64750000"
                value={data.debtTermLoanRequested || ''}
                onChange={(e) => handleAmountInput('debtTermLoanRequested', e.target.value)}
              />
              {errors.debtTermLoanRequested && (
                <span className="pf-field-error-msg">{errors.debtTermLoanRequested}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="subordinatedDebtUnsecuredLoans" className="pf-field-label">
                Subordinated Debt / Unsecured Loans (₹)
              </label>
              <input
                id="subordinatedDebtUnsecuredLoans"
                type="text"
                className="pf-custom-input"
                placeholder="e.g. 0"
                value={data.subordinatedDebtUnsecuredLoans || ''}
                onChange={(e) => handleAmountInput('subordinatedDebtUnsecuredLoans', e.target.value)}
              />
            </div>

            <div className="pf-field-group">
              <label htmlFor="govtSubsidyCapitalGrant" className="pf-field-label">
                Govt Subsidy / Capital Grant (₹)
              </label>
              <input
                id="govtSubsidyCapitalGrant"
                type="text"
                className="pf-custom-input"
                placeholder="e.g. 0"
                value={data.govtSubsidyCapitalGrant || ''}
                onChange={(e) => handleAmountInput('govtSubsidyCapitalGrant', e.target.value)}
              />
            </div>

            <div className="pf-field-group">
              <label htmlFor="proposedDebtToEquityRatio" className="pf-field-label">
                Proposed Debt to Equity Ratio <span className="pf-required-star">*</span>
              </label>
              <input
                id="proposedDebtToEquityRatio"
                type="text"
                className={`pf-custom-input ${errors.proposedDebtToEquityRatio ? 'pf-custom-input--error' : ''}`}
                placeholder="e.g. 70:30"
                value={data.proposedDebtToEquityRatio || ''}
                onChange={(e) => handleRatioInput(e.target.value)}
              />
              {errors.proposedDebtToEquityRatio && (
                <span className="pf-field-error-msg">{errors.proposedDebtToEquityRatio}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="proposedLendersLeadBank" className="pf-field-label">
                Proposed Lenders / Lead Bank
              </label>
              <input
                id="proposedLendersLeadBank"
                type="text"
                className="pf-custom-input"
                placeholder="e.g. State Bank of India / HDFC Bank"
                value={data.proposedLendersLeadBank || ''}
                onChange={(e) => handleTextInput('proposedLendersLeadBank', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Disbursement Schedule & Phasing */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleDisbursement}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <CalendarSvg />
            </div>
            <h2 className="pf-collapsible-title">3. Disbursement Schedule & Phasing</h2>
          </div>
          <ChevronSvg isOpen={isDisbursementOpen} />
        </div>

        {isDisbursementOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="phase1DrawdownInvestment" className="pf-field-label">
                Phase 1 Drawdown / Investment (₹) <span className="pf-required-star">*</span>
              </label>
              <input
                id="phase1DrawdownInvestment"
                type="text"
                className={`pf-custom-input ${errors.phase1DrawdownInvestment ? 'pf-custom-input--error' : ''}`}
                placeholder="e.g. 50000000"
                value={data.phase1DrawdownInvestment || ''}
                onChange={(e) => handleAmountInput('phase1DrawdownInvestment', e.target.value)}
              />
              {errors.phase1DrawdownInvestment && (
                <span className="pf-field-error-msg">{errors.phase1DrawdownInvestment}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="phase1Milestone" className="pf-field-label">
                Phase 1 Milestone <span className="pf-required-star">*</span>
              </label>
              <input
                id="phase1Milestone"
                type="text"
                className={`pf-custom-input ${errors.phase1Milestone ? 'pf-custom-input--error' : ''}`}
                placeholder="e.g. Land Acquisition & Foundation Civil Works"
                value={data.phase1Milestone || ''}
                onChange={(e) => handleTextInput('phase1Milestone', e.target.value)}
              />
              {errors.phase1Milestone && (
                <span className="pf-field-error-msg">{errors.phase1Milestone}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="phase2DrawdownInvestment" className="pf-field-label">
                Phase 2 Drawdown / Investment (₹)
              </label>
              <input
                id="phase2DrawdownInvestment"
                type="text"
                className="pf-custom-input"
                placeholder="e.g. 42500000"
                value={data.phase2DrawdownInvestment || ''}
                onChange={(e) => handleAmountInput('phase2DrawdownInvestment', e.target.value)}
              />
            </div>

            <div className="pf-field-group">
              <label htmlFor="phase2Milestone" className="pf-field-label">
                Phase 2 Milestone
              </label>
              <input
                id="phase2Milestone"
                type="text"
                className="pf-custom-input"
                placeholder="e.g. Plant & Machinery Erection & Trial Run"
                value={data.phase2Milestone || ''}
                onChange={(e) => handleTextInput('phase2Milestone', e.target.value)}
              />
            </div>

            <div className="pf-field-group">
              <label htmlFor="expectedCommercialOperationsDate" className="pf-field-label">
                Expected Commercial Operations Date (COD) <span className="pf-required-star">*</span>
              </label>
              <div className="pf-date-input-wrapper">
                <input
                  id="expectedCommercialOperationsDate"
                  type="date"
                  max={getTodayIso()}
                  className={`pf-custom-input ${errors.expectedCommercialOperationsDate ? 'pf-custom-input--error' : ''}`}
                  value={data.expectedCommercialOperationsDate || ''}
                  onChange={(e) => handleTextInput('expectedCommercialOperationsDate', e.target.value)}
                />
              </div>
              {errors.expectedCommercialOperationsDate && (
                <span className="pf-field-error-msg">{errors.expectedCommercialOperationsDate}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
