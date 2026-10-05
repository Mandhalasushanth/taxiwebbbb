import React from 'react'
import './TdsRefundComputationCard.css'

export interface TdsRefundComputationCardProps {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  tdsDeducted: number
  tcsCollected: number
  advanceAndSelfTax: number
  totalTaxCredits: number
  estimatedRefund: number
}

export const TdsRefundComputationCard: React.FC<TdsRefundComputationCardProps> = ({
  grossIncome,
  totalDeductions,
  taxableIncome,
  tdsDeducted,
  tcsCollected,
  advanceAndSelfTax,
  totalTaxCredits,
  estimatedRefund,
}) => {
  return (
    <section className="tds-review-card" data-testid="tds-review-computation">
      <div className="tds-review-card-header">
        <div className="tds-review-title-wrap">
          <svg className="tds-review-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
          </svg>
          <h3 className="tds-review-title">Estimated Tax Computation</h3>
        </div>
        <span className="tds-computation-prelim-badge">Preliminary</span>
      </div>
      <div className="tds-review-rows">
        <div className="tds-review-row">
          <span className="tds-review-label">Gross Total Income</span>
          <span className="tds-review-value">₹{grossIncome.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-review-row">
          <span className="tds-review-label">Total Deductions</span>
          <span className="tds-review-value">₹{totalDeductions.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-review-row">
          <span className="tds-review-label">Total Taxable Income</span>
          <span className="tds-review-value">₹{taxableIncome.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-review-row">
          <span className="tds-review-label">Total Tax Calculated</span>
          <span className="tds-review-value">₹0</span>
        </div>
        <div className="tds-computation-divider" />
        <div className="tds-computation-subhead">TAX CREDITS</div>
        <div className="tds-review-row">
          <span className="tds-review-label">Total TDS Deducted</span>
          <span className="tds-review-value">₹{tdsDeducted.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-review-row">
          <span className="tds-review-label">Total TCS Collected</span>
          <span className="tds-review-value">₹{tcsCollected.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-review-row">
          <span className="tds-review-label">Advance &amp; Self Assessment Tax</span>
          <span className="tds-review-value">₹{advanceAndSelfTax.toLocaleString('en-IN')}</span>
        </div>
        <div className="tds-computation-divider" />
        <div className="tds-computation-total-row">
          <span>Total Tax Credits</span>
          <span className="tds-computation-credits-val">₹{totalTaxCredits.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Estimated Refund Box */}
      <div className="tds-refund-box" data-testid="tds-refund-amount-box">
        <span className="tds-refund-box-label">Estimated Refund</span>
        <span className="tds-refund-box-amount">₹{estimatedRefund.toLocaleString('en-IN')}</span>
      </div>

      {/* Disclaimer */}
      <div className="tds-disclaimer-box">
        <svg className="tds-disclaimer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          This is an estimated refund based on the details provided and Form 26AS data. The final refund amount will be confirmed after Chartered Accountant verification and Income Tax Department processing.
        </span>
      </div>
    </section>
  )
}
