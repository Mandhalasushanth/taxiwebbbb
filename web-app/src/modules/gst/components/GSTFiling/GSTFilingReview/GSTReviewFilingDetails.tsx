import React from 'react'
import type { ReviewDetailsData, DocumentSummaryItem } from '@modules/gst/utils/gstReviewData'
import type { UploadedFileInfo } from '@modules/gst/utils/gstDocumentsData'
import './GSTReviewFilingDetails.css'

export interface GSTReviewFilingDetailsProps {
  details: ReviewDetailsData
  hasMissingDocs?: boolean
  missingDocsCount?: number
  onEdit?: () => void
}

export interface GSTReviewDocumentsCardProps {
  isNil?: boolean
  verifiedCount?: number
  hasMissingDocs?: boolean
  missingCount?: number
  uploadedFiles?: Record<string, UploadedFileInfo>
  onEdit?: () => void
  onSubmitDocuments?: () => void
  onViewDoc?: (docId: string, fileInfo: UploadedFileInfo, title: string) => void
}

interface GSTReviewDocumentsSummaryProps {
  summaryItems: DocumentSummaryItem[]
  overallVerifiedCount?: number
  totalDocsCount?: number
}

export const GSTReviewFilingDetailsCard: React.FC<GSTReviewFilingDetailsProps> = ({
  details,
  hasMissingDocs = false,
  missingDocsCount = 12,
  onEdit,
}) => {
  const isNil = details.filingType === 'Nil Return'
  const isMissing = !isNil && (hasMissingDocs || details.attachedDocsCount === 0)

  const rows = [
    { label: 'Filing Frequency', value: details.frequency },
    { label: 'Financial Year', value: details.financialYear },
    { label: 'Filing Period', value: details.filingPeriod },
    { label: 'GSTIN', value: details.gstin },
    { label: 'Business Entity', value: details.businessName },
    { label: 'Taxpayer Scheme', value: details.scheme },
    { label: 'Filing Return Type', value: details.returnForm },
    { label: 'Tax Calculation Method', value: details.calculationMethod },
    { label: 'Filing Type', value: details.filingType },
    {
      label: 'Attached Documents',
      value: isNil
        ? 'Nil Return (None Required)'
        : isMissing
          ? `${missingDocsCount || 12} Documents Missing`
          : `${details.attachedDocsCount || 12} Documents Attached`,
      isMissing,
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
            <span
              className={`gst-review-row__value ${
                row.isMissing ? 'gst-review-row__value--missing' : ''
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const GSTReviewDocumentsCard: React.FC<GSTReviewDocumentsCardProps> = ({
  isNil = false,
  verifiedCount = 0,
  hasMissingDocs = false,
  missingCount = 12,
  uploadedFiles = {},
  onEdit,
  onSubmitDocuments,
}) => {
  const handleAction = onSubmitDocuments || onEdit
  const uploadedDocEntries = Object.entries(uploadedFiles).filter(([, fileInfo]) => Boolean(fileInfo?.name))

  // 1. Nil Return State matching Image 1
  if (isNil) {
    return (
      <div className="gst-review-card">
        <div className="gst-review-card__header gst-review-card__header--split">
          <h3 className="gst-review-card__title">Documents</h3>
        </div>
        <div className="gst-review-doc-card-box gst-review-doc-card-box--nil">
          <div className="gst-review-doc-card-icon gst-review-doc-card-icon--nil" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="gst-review-doc-card-content">
            <h4 className="gst-review-doc-card-title gst-review-doc-card-title--nil">
              No Documents Required
            </h4>
            <p className="gst-review-doc-card-subtitle gst-review-doc-card-subtitle--nil">
              Nil Return filings do not require financial records or invoice uploads.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 2. Regular Return with Missing Documents matching Image 2
  if (hasMissingDocs) {
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

        <div className="gst-review-docs-missing-container">
          <div className="gst-review-doc-card-box gst-review-doc-card-box--missing">
            <div className="gst-review-doc-card-icon gst-review-doc-card-icon--missing" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="gst-review-doc-card-content">
              <h4 className="gst-review-doc-card-title gst-review-doc-card-title--missing">
                {missingCount || 12} Documents Missing
              </h4>
              <p className="gst-review-doc-card-subtitle gst-review-doc-card-subtitle--missing">
                Please upload all {missingCount || 12} required documents to proceed with filing.
              </p>
            </div>
          </div>

          {handleAction && (
            <button
              type="button"
              className="gst-review-reupload-btn"
              onClick={handleAction}
              aria-label="Reupload Here"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="gst-review-reupload-btn__icon"
                aria-hidden="true"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
              <span>Reupload Here &gt;</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // 3. Regular Return with Documents Attached
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

      <div className="gst-review-docs-content">
        <div className="gst-review-doc-card-box">
          <div className="gst-review-doc-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="gst-review-doc-card-content">
            <h4 className="gst-review-doc-card-title">All Required Documents Attached</h4>
            <p className="gst-review-doc-card-subtitle">
              {verifiedCount || uploadedDocEntries.length} local documents attached and ready for CA computation upon submission.
            </p>
          </div>
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
          Documents: {displayCount} Attached
        </span>
      </div>
    </div>
  )
}

export default GSTReviewFilingDetailsCard
