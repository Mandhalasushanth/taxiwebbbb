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
  const isCaCalculation = isPending || calculationMethod === 'ca_calculate'

  // If CA calculation is selected, show the blue message card matching Image 2 & 3
  if (isCaCalculation) {
    return (
      <div className="gst-comp-card gst-comp-card--ca-info">
        <div className="gst-comp-card__header">
          <div className="gst-comp-card__title-group">
            <div className="gst-comp-card__info-icon-wrap" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="gst-comp-card__info-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 className="gst-comp-card__title gst-comp-card__title--blue">Tax Computation</h3>
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

        <p className="gst-comp-ca-message">
          Finsolz CA will calculate your liabilities, ITC, and net payable tax directly from your uploaded invoices.
        </p>
      </div>
    )
  }

  // If user selected estimated figures, show the calculation according to the user entered details
  return (
    <div className="gst-comp-card">
      <div className="gst-comp-card__header">
        <div className="gst-comp-card__title-group">
          <h3 className="gst-comp-card__title">Tax Computation</h3>
          <span className="gst-comp-badge gst-comp-badge--estimated">
            Estimated Figures
          </span>
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

      <div className="gst-comp-card__rows">
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Gross Taxable Turnover</span>
          <span className="gst-comp-row__value">{formatCurrency(turnover ?? 0)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Estimated Taxable Purchases</span>
          <span className="gst-comp-row__value">{formatCurrency(purchases ?? 0)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Output GST (18%)</span>
          <span className="gst-comp-row__value">{formatCurrency(outputGst ?? 0)}</span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Eligible Input Tax Credit (ITC)</span>
          <span className="gst-comp-row__value gst-comp-row__value--green">
            - {formatCurrency(eligibleItc ?? 0)}
          </span>
        </div>
        <div className="gst-comp-row">
          <span className="gst-comp-row__label">Net Tax Liability (Govt)</span>
          <span className="gst-comp-row__value">{formatCurrency(netLiability ?? 0)}</span>
        </div>
      </div>
    </div>
  )
}

export default GSTReviewTaxComputationCard
