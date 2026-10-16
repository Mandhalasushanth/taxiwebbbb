import React from 'react'
import { formatCurrency } from '@shared/utils'
import './GSTReviewComputation.css'

export interface GSTReviewTaxComputationProps {
  turnover?: number | null
  purchases?: number | null
  outputGst?: number | null
  eligibleItc?: number | null
  netLiability?: number | null
  calculationMethod?: 'ca_calculate' | 'estimated_figures' | ''
  isPending?: boolean
  onEdit?: () => void
}

export const GSTReviewTaxComputationCard: React.FC<GSTReviewTaxComputationProps> = ({
  turnover = 866598,
  purchases = 452300,
  outputGst = 155988,
  eligibleItc = 78976,
  netLiability = 77012,
  calculationMethod,
  isPending = false,
  onEdit,
}) => {
  const isCaCalculationPending = isPending || calculationMethod === 'ca_calculate'
  const isEstimated = calculationMethod === 'estimated_figures'

  const title = isCaCalculationPending
    ? 'Tax Computation'
    : isEstimated
      ? 'Tax Computation (Estimated)'
      : 'Tax Computation (Reconciled)'

  return (
    <div className="gst-comp-card">
      <div className="gst-comp-card__header">
        <div className="gst-comp-card__title-group">
          <h3 className="gst-comp-card__title">{title}</h3>
          {isCaCalculationPending && (
            <span className="gst-comp-badge gst-comp-badge--pending">
              Pending CA Computation
            </span>
          )}
          {isEstimated && (
            <span className="gst-comp-badge gst-comp-badge--estimated">
              Estimated Figures
            </span>
          )}
        </div>
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

      {isCaCalculationPending && (
        <div className="gst-comp-pending-note" role="note">
          <svg
            className="gst-comp-pending-note__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="gst-comp-pending-note__text">
            <strong>Calculation Method:</strong> Let TaxEdge CA calculate from documents. Your Chartered Accountant will compute turnover, purchases, and eligible ITC directly from your uploaded documents upon submission.
          </p>
        </div>
      )}

      <div className="gst-comp-card__rows">
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Gross Taxable Turnover</span>
          <span className="gst-comp-row__value">
            {isCaCalculationPending ? '— Pending' : formatCurrency(turnover ?? 0)}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Estimated Taxable Purchases</span>
          <span className="gst-comp-row__value">
            {isCaCalculationPending ? '— Pending' : formatCurrency(purchases ?? 0)}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Output GST (18%)</span>
          <span className="gst-comp-row__value">
            {isCaCalculationPending ? '— Pending' : formatCurrency(outputGst ?? 0)}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Eligible Input Tax Credit (ITC)</span>
          <span className={`gst-comp-row__value ${!isCaCalculationPending ? 'gst-comp-row__value--green' : ''}`}>
            {isCaCalculationPending ? '— Pending' : `- ${formatCurrency(eligibleItc ?? 0)}`}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Net Tax Liability (Govt)</span>
          <span className="gst-comp-row__value">
            {isCaCalculationPending ? '— Pending' : formatCurrency(netLiability ?? 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GSTReviewTaxComputationCard
