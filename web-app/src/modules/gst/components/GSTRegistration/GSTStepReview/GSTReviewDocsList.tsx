import type { FC } from 'react'
import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import {
  DocChecklistIcon,
  CheckCircleIcon,
  ViewEyeIcon,
  EditPencilIcon,
} from '@modules/gst/shared/GSTDocIcons/GSTDocIcons'
import './GSTReviewDocsList.css'

interface GSTReviewDocsListProps {
  documents: DocumentItem[]
  onViewDoc: (title: string, fileName: string) => void
  /** Opens the Documents step to change uploads */
  onEdit?: () => void
}

export const GSTReviewDocsList: FC<GSTReviewDocsListProps> = ({ documents, onViewDoc, onEdit }) => {
  const uploadedCount = documents.filter((d) => d.isUploaded || d.fileName).length
  const totalCount = documents.length

  return (
    <div className="gst-review-card">
      <div className="gst-review-card__header">
        <div className="gst-review-card__header-left">
          <div className="gst-review-card__icon-badge gst-review-card__icon-badge--docs">
            <DocChecklistIcon width={20} height={20} />
          </div>
          <h3 className="gst-review-card__title">Uploaded Documents</h3>
        </div>

        <div className="gst-review-docs-header-actions">
          <div className="gst-review-doc-badge">
            {uploadedCount}/{totalCount} Uploaded
          </div>
          {onEdit && (
            <button
              type="button"
              className="gst-review-card__edit-btn"
              onClick={onEdit}
              aria-label="Edit Uploaded Documents"
            >
              <EditPencilIcon width={14} height={14} className="gst-review-card__edit-icon" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="gst-review-card__body">
        <div className="gst-review-docs-list">
          {documents.map((doc) => {
            const isUploaded = Boolean(doc.isUploaded && doc.fileName)
            const fileName = doc.fileName || 'Not uploaded yet'

            return (
              <div
                key={doc.id}
                className={`gst-review-doc-item ${!isUploaded ? 'gst-review-doc-item--pending' : ''}`}
              >
                <div className="gst-review-doc-item__left">
                  <div className="gst-review-doc-item__check">
                    {isUploaded ? (
                      <CheckCircleIcon width={16} height={16} className="gst-review-check-icon--success" />
                    ) : (
                      <span className="gst-review-doc-item__pending-bullet" />
                    )}
                  </div>
                  <div className="gst-review-doc-item__info">
                    <h4 className="gst-review-doc-item__title">{doc.title}</h4>
                    <span className="gst-review-doc-item__filename">{fileName}</span>
                  </div>
                </div>

                {isUploaded ? (
                  <button
                    type="button"
                    className="gst-review-doc-item__view-btn"
                    onClick={() => onViewDoc(doc.title, fileName)}
                    aria-label={`View ${doc.title}`}
                  >
                    <ViewEyeIcon width={14} height={14} />
                    <span>View</span>
                  </button>
                ) : (
                  <span className="gst-review-doc-item__status-tag">Pending</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
