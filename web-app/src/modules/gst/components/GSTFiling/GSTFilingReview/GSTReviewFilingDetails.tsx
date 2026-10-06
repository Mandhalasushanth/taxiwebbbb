import React from 'react'
import type { ReviewDetailsData, DocumentSummaryItem } from '@modules/gst/utils/gstReviewData'
import './GSTReviewFilingDetails.css'

interface GSTReviewFilingDetailsProps {
  details: ReviewDetailsData
  onEdit?: () => void
}

export interface GSTReviewDocumentsCardProps {
  verifiedCount?: number
  onEdit?: () => void
}

interface GSTReviewDocumentsSummaryProps {
  summaryItems: DocumentSummaryItem[]
  overallVerifiedCount?: number
  totalDocsCount?: number
}

export const GSTReviewFilingDetailsCard: React.FC<GSTReviewFilingDetailsProps> = ({
  details,
  onEdit,
}) => {
  const rows = [
    { label: 'GSTIN', value: details.gstin },
    { label: 'Business Entity', value: details.businessName },
    { label: 'Taxpayer Scheme', value: details.scheme },
    { label: 'Filing Type', value: details.filingType },
    { label: 'Financial Year', value: details.financialYear },
    { label: 'Filing Period', value: details.filingPeriod },
    { label: 'Filing Frequency', value: details.frequency },
    { label: 'Return Form', value: details.returnForm },
    { label: 'Attached Documents', value: `${details.attachedDocsCount} Files Verified` },
  ]

  return (
    <div className="gst-review-card">
      <div className="gst-review-card__header gst-review-card__header--split">
        <h3 className="gst-review-card__title">Filing Details</h3>
        {onEdit && (
          <button
            type="button"
            className="gst-review-card__edit-btn"
            onClick={onEdit}
            aria-label="Edit Filing Details"
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

      <div className="gst-review-card__rows">
        {rows.map((row) => (
          <div key={row.label} className="gst-review-row">
            <span className="gst-review-row__label">{row.label}</span>
            <span className="gst-review-row__value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const GSTReviewDocumentsCard: React.FC<GSTReviewDocumentsCardProps> = ({
  verifiedCount = 3,
  onEdit,
}) => {
  return (
    <div className="gst-review-card">
      <div className="gst-review-card__header gst-review-card__header--split">
        <h3 className="gst-review-card__title">Documents</h3>
        {onEdit && (
          <button
            type="button"
            className="gst-review-card__edit-btn"
            onClick={onEdit}
            aria-label="Edit Documents"
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

      <div className="gst-review-doc-card-box">
        <div className="gst-review-doc-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="gst-review-doc-card-content">
          <h4 className="gst-review-doc-card-title">All Required Documents Uploaded</h4>
          <p className="gst-review-doc-card-subtitle">
            {verifiedCount} documents verified and ready for CA computation.
          </p>
        </div>
      </div>
    </div>
  )
}

export const GSTReviewDocumentsSummaryCard: React.FC<GSTReviewDocumentsSummaryProps> = ({
  summaryItems,
  overallVerifiedCount,
  totalDocsCount,
}) => {
  const totalCompleted = overallVerifiedCount ?? summaryItems.reduce((acc, item) => acc + item.completed, 0)
  const totalRequired = totalDocsCount ?? summaryItems.reduce((acc, item) => acc + item.total, 0)
  const displayCount = `${totalCompleted}/${totalRequired || 12}`

  return (
    <div className="gst-review-card">
      <div className="gst-review-card__header gst-review-card__header--split">
        <h3 className="gst-review-card__title">Documents Summary</h3>
        <span className="gst-review-doc-overall-badge">
          Documents: {displayCount} Verified
        </span>
      </div>
    </div>
  )
}

export default GSTReviewFilingDetailsCard
