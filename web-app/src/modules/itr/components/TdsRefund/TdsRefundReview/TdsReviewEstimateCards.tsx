import React from 'react'
import { TdsIcons } from '@modules/itr/utils/tdsRefund.constants'
import type { TdsBusinessDetails, UploadedFileMeta } from '@modules/itr/types/tdsRefund.types'

const DOCUMENT_LABELS: Record<'panDoc' | 'aadhaarDoc', string> = {
  panDoc: 'Business PAN',
  aadhaarDoc: 'Aadhaar Card',
}

const EditButton: React.FC<{ onClick: () => void; testId: string }> = ({ onClick, testId }) => (
  <button type="button" className="tds-review-edit-btn" onClick={onClick} data-testid={testId}><TdsIcons.Edit />Edit</button>
)

export interface TdsReviewDocumentsCardProps {
  businessDetails?: TdsBusinessDetails
  onEdit: () => void
}

/** Documents attached on the Application Details step (Business PAN / Aadhaar uploads). */
export const TdsReviewDocumentsCard: React.FC<TdsReviewDocumentsCardProps> = ({ businessDetails, onEdit }) => {
  const docs = (Object.keys(DOCUMENT_LABELS) as Array<keyof typeof DOCUMENT_LABELS>)
    .map((key) => ({ key, label: DOCUMENT_LABELS[key], meta: businessDetails?.[key] as UploadedFileMeta | undefined }))
    .filter((doc) => Boolean(doc.meta))

  return (
    <section className="tds-review-card" data-testid="tds-review-documents">
      <div className="tds-review-card-header">
        <div className="tds-review-title-wrap"><TdsIcons.FileText className="tds-review-icon" /><h3 className="tds-review-title">Documents ({docs.length})</h3></div>
        <EditButton onClick={onEdit} testId="edit-documents-btn" />
      </div>
      {docs.length > 0 ? (
        <div className="tds-review-docs-pills">
          {docs.map((doc) => (
            <span key={doc.key} className="tds-review-doc-pill" title={doc.meta?.name}>
              <span className="tds-review-doc-pill-check" aria-hidden="true">✓</span>
              <span>{doc.label}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="tds-review-empty-text">No documents uploaded yet</p>
      )}
    </section>
  )
}

