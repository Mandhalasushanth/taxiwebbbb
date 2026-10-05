import React from 'react'
import { formatINR } from '../itrTaxCalculator'

export interface ItrReviewTaxSummaryCardProps {
  selectedRegime: 'new' | 'old' | ''
  grossTotalIncome: number
  stdDeduction: number
  totalChapterVIDeductions: number
  netTaxableIncome: number
  grossTax: number
  cess: number
  totalTaxLiability: number
  tdsCredits: number
  netTaxPayable: number
  refundDue: number
}

export const ItrReviewTaxSummaryCard: React.FC<ItrReviewTaxSummaryCardProps> = ({
  selectedRegime,
  grossTotalIncome,
  stdDeduction,
  totalChapterVIDeductions,
  netTaxableIncome,
  grossTax,
  cess,
  totalTaxLiability,
  tdsCredits,
  netTaxPayable,
  refundDue,
}) => {
  return (
    <div className="itr-rv2-right-col">
      {/* Estimated Tax Summary */}
      <div className="itr-rv2-tax-card">
        <div className="itr-rv2-tax-card__header">
          <div className="itr-rv2-tax-card__title-row">
            <span className="itr-rv2-tax-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
              </svg>
            </span>
            <h3 className="itr-rv2-tax-card__title">Estimated Tax Summary</h3>
          </div>
          <span className="itr-rv2-regime-badge">
            {selectedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
          </span>
        </div>

        <div className="itr-rv2-tax-rows">
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">1. Gross Total Income</span>
            <span className="itr-rv2-tax-row__val">{formatINR(grossTotalIncome)}</span>
          </div>
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">2. Less: Standard Deduction</span>
            <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(stdDeduction)}</span>
          </div>
          {selectedRegime === 'old' && totalChapterVIDeductions > 0 && (
            <div className="itr-rv2-tax-row">
              <span className="itr-rv2-tax-row__label">3. Less: Chapter VI-A Deductions</span>
              <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(totalChapterVIDeductions)}</span>
            </div>
          )}
          {selectedRegime === 'new' && (
            <div className="itr-rv2-tax-row">
              <span className="itr-rv2-tax-row__label itr-rv2-tax-row__label--muted">3. Chapter VI-A Deductions</span>
              <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--muted">Not Applicable</span>
            </div>
          )}

          {/* Net Taxable Income */}
          <div className="itr-rv2-tax-row itr-rv2-tax-row--bold">
            <span>Net Taxable Income</span>
            <span>{formatINR(netTaxableIncome)}</span>
          </div>

          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">Gross Income Tax (per Slabs)</span>
            <span className="itr-rv2-tax-row__val">{formatINR(grossTax)}</span>
          </div>
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">Health &amp; Education Cess (4%)</span>
            <span className="itr-rv2-tax-row__val">{formatINR(cess)}</span>
          </div>
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">Total Tax Liability</span>
            <span className="itr-rv2-tax-row__val">{formatINR(totalTaxLiability)}</span>
          </div>
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">Less: Taxes Already Paid (TDS Credits)</span>
            <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(tdsCredits)}</span>
          </div>
        </div>

        {/* Net Tax Payable / Refund */}
        <div className={`itr-rv2-net-tax-box ${refundDue > 0 ? 'itr-rv2-net-tax-box--refund' : ''}`}>
          <div className="itr-rv2-net-tax-label">
            {refundDue > 0 ? 'Refund Due' : 'Net Tax Payable'}
            <span className="itr-rv2-net-tax-sub">
              {refundDue > 0 ? 'Expected refund after e-filing' : 'Payable before return filing'}
            </span>
          </div>
          <div className="itr-rv2-net-tax-amount">
            {refundDue > 0 ? `+ ${formatINR(refundDue)}` : formatINR(netTaxPayable)}
          </div>
        </div>

        {/* Info note */}
        <div className="itr-rv2-info-note">
          <span className="itr-rv2-info-note__icon">ℹ️</span>
          <span>
            This is an initial estimation based on your declared figures. Your assigned CA will thoroughly review your documents, verify TDS credits with the Income Tax Department, and prepare the final return for your confirmation before e-filing.
          </span>
        </div>
      </div>

      {/* CA Assigned Trust Box */}
      <div className="itr-rv2-ca-trust-card">
        <div className="itr-rv2-ca-trust-header">
          <div className="itr-rv2-ca-avatar">CA</div>
          <div className="itr-rv2-ca-meta">
            <div className="itr-rv2-ca-name">Senior CA Meera Iyer</div>
            <div className="itr-rv2-ca-title">Dedicated Tax Filing Expert · 12+ Yrs Exp</div>
          </div>
        </div>
        <div className="itr-rv2-ca-badges">
          <span className="itr-rv2-ca-badge">⚡ 4-Hour Review SLA</span>
          <span className="itr-rv2-ca-badge">🛡️ Notice Assistance</span>
        </div>
      </div>
    </div>
  )
}
