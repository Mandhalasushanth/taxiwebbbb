import React from 'react'
import type { ComplianceFields } from '@modules/gst/hooks/useGSTComplianceState'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import { StepActionBar } from '@shared/components'
import './GSTComplianceReview.css'

export interface GSTComplianceReviewProps {
  fields: ComplianceFields
  purchaseFile: File | null
  salesFile: File | null
  noticeFile: File | null
  isSubmitting?: boolean
  onEdit: () => void
  onSaveDraft?: () => void
  onViewDoc: (file: File, title: string) => void
  onSubmit: () => void
}

const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr) return 'None'
  try {
    const parts = dateStr.split('-').map(Number)
    if (parts.length === 3 && !parts.some(isNaN)) {
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const formatFinancialYearDisplay = (fy?: string): string => {
  if (!fy) return 'None'
  return fy.replace(/^FY\s*/i, '')
}

export const GSTComplianceReview: React.FC<GSTComplianceReviewProps> = ({
  fields,
  purchaseFile,
  salesFile,
  noticeFile,
  isSubmitting = false,
  onEdit,
  onSaveDraft,
  onViewDoc,
  onSubmit,
}) => {
  const isNotice = fields.requestType === 'Notice Response'
  const isRecon = fields.requestType === 'Reconciliation Support'

  const renderDocItem = (title: string, file: File | null) => {
    if (!file) {
      return (
        <div className="gst-review-doc-row" key={title}>
          <div className="gst-review-doc-info">
            <div className="gst-review-doc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <div className="gst-review-doc-text">
              <span className="gst-review-doc-title">{title}</span>
              <span className="gst-review-doc-meta">No file attached</span>
            </div>
          </div>
        </div>
      )
    }

    const fileSize = formatGstFileSize(file.size)

    return (
      <div className="gst-review-doc-row" key={title}>
        <div className="gst-review-doc-info">
          <div className="gst-review-doc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <div className="gst-review-doc-text">
            <span className="gst-review-doc-title">{title}</span>
            <span className="gst-review-doc-meta">
              {file.name} &bull; {fileSize}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="gst-review-view-btn"
          onClick={() => onViewDoc(file, title)}
          aria-label={`View ${title}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>View</span>
        </button>
      </div>
    )
  }

  return (
    <div className="gst-compliance-review-wrapper">
      {/* Top Status Callout Banner */}
      <div className="gst-compliance-review-banner">
        <div className="gst-compliance-review-banner-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="gst-compliance-review-banner-text">
          <h3 className="gst-compliance-review-banner-title">Ready for CA Review &amp; Filing</h3>
          <p className="gst-compliance-review-banner-desc">
            TaxEdge CA compliance desk will verify your records and prepare the official response.
          </p>
        </div>
      </div>

      {/* Card 1: Request & Filing Details */}
      <div className="gst-compliance-review-card">
        <div className="gst-compliance-review-card-header">
          <h2 className="gst-compliance-review-card-title">Request &amp; Filing Details</h2>
          <button
            type="button"
            className="gst-compliance-review-edit-btn"
            onClick={onEdit}
            aria-label="Edit Request & Filing Details"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div className="gst-compliance-review-card-body">
          <div className="gst-compliance-review-row">
            <span className="gst-compliance-review-label">GSTIN</span>
            <span className="gst-compliance-review-value">{fields.gstin || 'None'}</span>
          </div>
          <div className="gst-compliance-review-row">
            <span className="gst-compliance-review-label">Financial Year</span>
            <span className="gst-compliance-review-value">{formatFinancialYearDisplay(fields.financialYear)}</span>
          </div>
          <div className="gst-compliance-review-row">
            <span className="gst-compliance-review-label">Request Type</span>
            <span className="gst-compliance-review-value">{fields.requestType || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Dynamic Details according to selection */}
      {isNotice && (
        <div className="gst-compliance-review-card">
          <div className="gst-compliance-review-card-header">
            <h2 className="gst-compliance-review-card-title">Notice Details</h2>
            <button
              type="button"
              className="gst-compliance-review-edit-btn"
              onClick={onEdit}
              aria-label="Edit Notice Details"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>

          <div className="gst-compliance-review-card-body">
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">Notice / Order No.</span>
              <span className="gst-compliance-review-value">{fields.noticeNumber || 'None'}</span>
            </div>
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">Notice Issue Date</span>
              <span className="gst-compliance-review-value">{formatDateDisplay(fields.issueDate)}</span>
            </div>
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">Reply Due Date</span>
              <span className="gst-compliance-review-value">{formatDateDisplay(fields.dueDate)}</span>
            </div>
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">Remarks / Grounds</span>
              <span className="gst-compliance-review-value">{fields.additionalInfo?.trim() ? fields.additionalInfo : 'None'}</span>
            </div>
          </div>
        </div>
      )}

      {isRecon && (
        <div className="gst-compliance-review-card">
          <div className="gst-compliance-review-card-header">
            <h2 className="gst-compliance-review-card-title">Reconciliation Parameters</h2>
            <button
              type="button"
              className="gst-compliance-review-edit-btn"
              onClick={onEdit}
              aria-label="Edit Reconciliation Parameters"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>

          <div className="gst-compliance-review-card-body">
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">GSTR-2B Ref / Period</span>
              <span className="gst-compliance-review-value">{fields.gstr2bRef?.trim() ? fields.gstr2bRef : 'NOT_PROVIDED'}</span>
            </div>
            <div className="gst-compliance-review-row">
              <span className="gst-compliance-review-label">Remarks</span>
              <span className="gst-compliance-review-value">{fields.notes?.trim() ? fields.notes : 'None'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Attached Documents */}
      <div className="gst-compliance-review-card">
        <div className="gst-compliance-review-card-header">
          <h2 className="gst-compliance-review-card-title">Attached Documents</h2>
          <button
            type="button"
            className="gst-compliance-review-edit-btn"
            onClick={onEdit}
            aria-label="Edit Attached Documents"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div className="gst-compliance-review-docs-list">
          {isNotice && renderDocItem('Notice Copy', noticeFile)}
          {isRecon && (
            <>
              {renderDocItem('Purchase Register', purchaseFile)}
              {renderDocItem('Sales Register', salesFile)}
            </>
          )}
          {!isNotice && !isRecon && (
            <p className="gst-review-doc-empty">No documents required for this request.</p>
          )}
        </div>
      </div>

      {/* Web Standard Step Action Bar */}
      <StepActionBar
        onBack={onEdit}
        backLabel="Back to Edit"
        onSaveDraft={onSaveDraft}
        onNext={onSubmit}
        nextLabel="Submit Compliance Request"
        isSubmitting={isSubmitting}
        nextTestId="gst-compliance-review-submit-btn"
        className="gst-compliance-review-action-bar"
      />
    </div>
  )
}

export default GSTComplianceReview
