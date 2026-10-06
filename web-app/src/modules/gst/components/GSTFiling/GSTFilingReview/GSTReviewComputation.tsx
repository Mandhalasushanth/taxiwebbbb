import React from 'react'
import { formatCurrency } from '@shared/utils'
import './GSTReviewComputation.css'

export interface GSTReviewTaxComputationProps {
  turnover?: number
  outputGst?: number
  eligibleItc?: number
  netLiability?: number
  onEdit?: () => void
}

export interface GSTReviewFilingFeeProps {
  baseFee?: number
  gstFee?: number
  totalFee?: number
  onEdit?: () => void
}

export const GSTReviewTaxComputationCard: React.FC<GSTReviewTaxComputationProps> = ({
  turnover = 866598,
  outputGst = 155988,
  eligibleItc = 78976,
  netLiability = 77012,
  onEdit,
}) => {
  return (
    <div className="gst-comp-card">
      <div className="gst-comp-card__header">
        <h3 className="gst-comp-card__title">Tax Computation (Reconciled)</h3>
        {onEdit && (
          <button
            type="button"
            className="gst-review-card__edit-btn"
            onClick={onEdit}
            aria-label="Edit Tax Computation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="gst-review-card__edit-icon"
              aria-hidden="true"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="gst-comp-card__rows">
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Gross Taxable Turnover</span>
          <span className="gst-comp-row__value">{formatCurrency(turnover)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Output GST (18%)</span>
          <span className="gst-comp-row__value">{formatCurrency(outputGst)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Eligible Input Tax Credit (ITC)</span>
          <span className="gst-comp-row__value gst-comp-row__value--green">
            - {formatCurrency(eligibleItc)}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Net Tax Liability (Govt)</span>
          <span className="gst-comp-row__value">{formatCurrency(netLiability)}</span>
        </div>
      </div>
    </div>
  )
}

export const GSTReviewFilingFeeCard: React.FC<GSTReviewFilingFeeProps> = ({
  baseFee = 1986,
  gstFee = 358,
  totalFee = 2344,
  onEdit,
}) => {
  return (
    <div className="gst-comp-card">
      <div className="gst-comp-card__header">
        <h3 className="gst-comp-card__title">Professional Filing Fee</h3>
        {onEdit && (
          <button
            type="button"
            className="gst-review-card__edit-btn"
            onClick={onEdit}
            aria-label="Edit Professional Filing Fee"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="gst-review-card__edit-icon"
              aria-hidden="true"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="gst-comp-card__rows">
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">CA Consultancy &amp; Reconciliation</span>
          <span className="gst-comp-row__value">{formatCurrency(baseFee)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Platform GST (18%)</span>
          <span className="gst-comp-row__value">{formatCurrency(gstFee)}</span>
        </div>
      </div>

      <div className="gst-comp-payable-box">
        <span className="gst-comp-payable-label">Total Payable</span>
        <span className="gst-comp-payable-amount">{formatCurrency(totalFee)}</span>
      </div>
    </div>
  )
}

export default GSTReviewTaxComputationCard
