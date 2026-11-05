import React from 'react'
import type { UploadedDocInfo } from '../itrFiling.constants'

export interface ItrReviewUploadedDocsCardProps {
  uploadedDocs: Record<string, UploadedDocInfo>
  onEdit: () => void
}

export const ItrReviewUploadedDocsCard: React.FC<ItrReviewUploadedDocsCardProps> = ({
  uploadedDocs,
  onEdit,
}) => {
  const docCount = Object.keys(uploadedDocs).length

  return (
    <div className="itr-step-card itr-rv2-card-docs">
      <div className="itr-rv2-section-header-row">
        <h3 className="itr-rv2-section-title">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span>Uploaded Documents ({docCount})</span>
        </h3>
        <button
          type="button"
          className="itr-rv2-edit-btn"
          onClick={onEdit}
          aria-label="Edit Uploaded Documents"
        >
          Edit
        </button>
      </div>
      {docCount === 0 ? (
        <div className="itr-rv2-no-docs-box">
          No documents uploaded yet
        </div>
      ) : (
        <div className="itr-rv2-doc-list">
          {Object.entries(uploadedDocs).map(([id, doc]) => (
            <div key={id} className="itr-rv2-doc-row">
              <span className="itr-rv2-doc-check" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div className="itr-rv2-doc-info">
                <span className="itr-rv2-doc-name">{doc.fileName}</span>
                <span className="itr-rv2-doc-meta">
                  {doc.fileSize} &middot; {doc.uploadedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
