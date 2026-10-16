import React from 'react'
import type { ReviewDetailsData, DocumentSummaryItem } from '@modules/gst/utils/gstReviewData'
import './GSTReviewFilingDetails.css'

interface GSTReviewFilingDetailsProps {
  details: ReviewDetailsData
  onEdit?: () => void
}

export interface GSTReviewDocumentsCardProps {
  verifiedCount?: number
  hasMissingDocs?: boolean
  missingCount?: number
  onEdit?: () => void
  onSubmitDocuments?: () => void
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
  const isNil = details.filingType === 'Nil Return'
  const rows = [
    { label: 'GSTIN', value: details.gstin },
    { label: 'Business Entity', value: details.businessName },
    { label: 'Taxpayer Scheme', value: details.scheme },
    { label: 'Return Type', value: details.filingType },
    { label: 'Financial Year', value: details.financialYear },
    { label: 'Filing Period', value: details.filingPeriod },
    { label: 'Filing Frequency', value: details.frequency },
    ...(!isNil ? [{ label: 'Return Form', value: details.returnForm }] : []),
    ...(!isNil && details.calculationMethod ? [{ label: 'Calculation Method', value: details.calculationMethod }] : []),
    {
      label: 'Attached Documents',
      value: isNil
        ? 'Not Required (Nil Return)'
        : details.attachedDocsCount > 0
          ? `${details.attachedDocsCount} of 12 Files Attached (Local)`
          : '0 of 12 Documents Uploaded (Action Required)',
    },
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
  verifiedCount = 0,
  hasMissingDocs = false,
  missingCount = 0,
  onEdit,
  onSubmitDocuments,
}) => {
  const handleAction = onSubmitDocuments || onEdit

  return (
    <div className="gst-review-card">
      <div className="gst-review-card__header gst-review-card__header--split">
        <h3 className="gst-review-card__title">Documents</h3>
        {!hasMissingDocs && onEdit && (
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

      {hasMissingDocs ? (
        <div className="gst-review-doc-card-box gst-review-doc-card-box--missing">
          <div className="gst-review-doc-card-main">
            <div className="gst-review-doc-card-icon gst-review-doc-card-icon--missing" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="gst-review-doc-card-content">
              <h4 className="gst-review-doc-card-title gst-review-doc-card-title--missing">
                Documents Required (All 12 Documents)
              </h4>
              <p className="gst-review-doc-card-subtitle gst-review-doc-card-subtitle--missing">
                {missingCount > 0
                  ? `Please upload all 12 required documents (${missingCount} pending) before proceeding with your return filing.`
                  : 'Please upload all 12 required documents before proceeding with your return filing.'}
              </p>
            </div>
          </div>
          {handleAction && (
            <button
              type="button"
              className="gst-review-submit-docs-btn"
              onClick={handleAction}
              aria-label="Upload Documents"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload Documents</span>
            </button>
          )}
        </div>
      ) : (
        <div className="gst-review-doc-card-box">
          <div className="gst-review-doc-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="gst-review-doc-card-content">
            <h4 className="gst-review-doc-card-title">All Required Documents Attached</h4>
            <p className="gst-review-doc-card-subtitle">
              {verifiedCount} local documents attached and ready for CA computation upon submission.
            </p>
          </div>
        </div>
      )}
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
          Documents: {displayCount} Attached
        </span>
      </div>
    </div>
  )
}

export default GSTReviewFilingDetailsCard
