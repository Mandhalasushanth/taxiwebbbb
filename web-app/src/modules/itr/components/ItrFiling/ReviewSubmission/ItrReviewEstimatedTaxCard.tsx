import React from 'react'
import { CalculatorIcon } from '../itrFiling.constants'
import { formatINR, type calculateItrTax } from '../itrTaxCalculator'

export type ItrTaxCalculationResult = ReturnType<typeof calculateItrTax>

export interface ItrReviewEstimatedTaxCardProps {
  selectedRegime: 'new' | 'old' | ''
  taxResult: ItrTaxCalculationResult
}

export const ItrReviewEstimatedTaxCard: React.FC<ItrReviewEstimatedTaxCardProps> = ({
  selectedRegime,
  taxResult,
}) => {
  return (
    <div className="itr-step-card itr-rv2-tax-card itr-rv2-card-tax">
      <div className="itr-rv2-tax-card__header">
        <div className="itr-rv2-tax-card__title-row">
          <span className="itr-rv2-tax-icon" aria-hidden="true">
            <CalculatorIcon size={18} />
          </span>
          <h3 className="itr-rv2-tax-card__title">Estimated Tax Summary</h3>
        </div>
        <span className="itr-rv2-regime-badge">
          {selectedRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}
        </span>
      </div>

      <div className="itr-rv2-tax-rows">
        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">1. Gross Total Income</span>
          <span className="itr-rv2-tax-row__val">{formatINR(taxResult.grossTotalIncome)}</span>
        </div>
        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">2. Less: Standard Deduction</span>
          <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
            &minus; {formatINR(taxResult.stdDeduction)}
          </span>
        </div>
        {selectedRegime === 'old' && taxResult.totalChapterVIDeductions > 0 && (
          <div className="itr-rv2-tax-row">
            <span className="itr-rv2-tax-row__label">3. Less: Chapter VI-A Deductions</span>
            <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
              &minus; {formatINR(taxResult.totalChapterVIDeductions)}
            </span>
          </div>
        )}

        <div className="itr-rv2-tax-row itr-rv2-tax-row--bold">
          <span>Net Taxable Income</span>
          <span>{formatINR(taxResult.netTaxableIncome)}</span>
        </div>

        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">Gross Income Tax (per Slabs)</span>
          <span className="itr-rv2-tax-row__val">{formatINR(taxResult.grossTax)}</span>
        </div>
        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">Health &amp; Education Cess (4%)</span>
          <span className="itr-rv2-tax-row__val">{formatINR(taxResult.cess)}</span>
        </div>
        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">Total Tax Liability</span>
          <span className="itr-rv2-tax-row__val">{formatINR(taxResult.totalTaxLiability)}</span>
        </div>
        <div className="itr-rv2-tax-row">
          <span className="itr-rv2-tax-row__label">Less: Taxes Already Paid (TDS Credits)</span>
          <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
            &minus; {formatINR(taxResult.tdsCredits)}
          </span>
        </div>
      </div>

      {/* Net Tax Payable / Refund Due box (matches reference screenshot) */}
      <div className={`itr-rv2-net-tax-box ${taxResult.refundDue > 0 ? 'itr-rv2-net-tax-box--refund' : ''}`}>
        <div className="itr-rv2-net-tax-label">
          <span className="itr-rv2-net-tax-title">
            {taxResult.refundDue > 0 ? 'Refund Due' : 'Net Tax Payable'}
          </span>
          <span className="itr-rv2-net-tax-sub">
            {taxResult.refundDue > 0 ? 'Expected refund after e-filing' : 'Payable before return filing'}
          </span>
        </div>
        <div className="itr-rv2-net-tax-amount">
          {taxResult.refundDue > 0 ? `+ ${formatINR(taxResult.refundDue)}` : formatINR(taxResult.netTaxPayable)}
        </div>
      </div>

      {/* CA Review Info Note (matches reference screenshot) */}
      <div className="itr-rv2-info-note">
        <span className="itr-rv2-info-note__circle" aria-hidden="true">i</span>
        <p className="itr-rv2-info-note__text">
          This is an initial estimation based on your declared figures. Your assigned CA will thoroughly review your documents, verify TDS credits with the Income Tax Department, and prepare the final return for your confirmation before e-filing.
        </p>
      </div>
    </div>
  )
}
