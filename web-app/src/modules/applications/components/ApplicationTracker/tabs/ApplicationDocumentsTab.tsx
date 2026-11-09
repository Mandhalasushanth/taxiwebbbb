import React from 'react'
import type { ApplicationDocumentItem } from '../ApplicationTrackerView'

export interface ApplicationDocumentsTabProps {
  documents: ApplicationDocumentItem[]
  appliedDate: string
  onPreviewDoc: (doc: ApplicationDocumentItem) => void
  onUploadDoc?: (doc: ApplicationDocumentItem, file: File) => void
}

export const ApplicationDocumentsTab: React.FC<ApplicationDocumentsTabProps> = ({
  documents,
  appliedDate,
  onPreviewDoc,
  onUploadDoc,
}) => {
  const pendingDocs = documents.filter(
    (d) => d.status === 'pending' || d.status === 'requested' || d.status === 'rejected'
  )
  const uploadedDocs = documents.filter(
    (d) => d.status !== 'pending' && d.status !== 'requested' && d.status !== 'rejected'
  )

  return (
    <div className="app-tracker-web-tab-content">
      {/* 1. CA / Manager Requested Documents (Action Required) */}
      {pendingDocs.length > 0 && (
        <div className="app-tracker-clean-card" style={{ borderLeft: '4px solid #f97316', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 className="app-tracker-card-subtitle" style={{ color: '#ea580c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Documents Requested by CA / Agent</span>
                <span style={{ fontSize: '12px', background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {pendingDocs.length} Action Needed
                </span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Your assigned CA manager or agent has requested the following document(s) for verification or re-upload.
              </p>
            </div>
          </div>

          <div className="app-tracker-docs-list">
            {pendingDocs.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="app-tracker-doc-item"
                style={{ background: '#fffaf0', border: '1px dashed #fdba74', padding: '12px 16px' }}
              >
                <div className="app-tracker-doc-item-left">
                  <div className="app-tracker-doc-thumb-icon" style={{ color: '#ea580c', background: '#ffedd5' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="app-tracker-doc-details">
                    <h4 className="app-tracker-doc-item-title" style={{ color: '#9a3412', fontWeight: 600 }}>{doc.name}</h4>
                    <span className="app-tracker-doc-item-meta" style={{ color: '#c2410c' }}>
                      {doc.rejectionReason || doc.requestMessage || 'Requested by CA · Please upload clear PDF/Image'}
                    </span>
                    <span className="app-tracker-doc-item-date" style={{ color: '#9a3412' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Pending Submission
                    </span>
                  </div>
                </div>

                <label
                  className="app-tracker-doc-view-btn"
                  style={{
                    cursor: 'pointer',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                  title={`Upload ${doc.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload</span>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && onUploadDoc) {
                        onUploadDoc(doc, file)
                      }
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Uploaded Documents Card */}
      <div className="app-tracker-clean-card">
        <h3 className="app-tracker-card-subtitle">Uploaded Documents</h3>

        {uploadedDocs.length === 0 ? (
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#64748b' }}>
            No uploaded documents to display yet.
          </p>
        ) : (
          <div className="app-tracker-docs-list">
            {uploadedDocs.map((doc, idx) => (
              <div key={doc.id || idx} className="app-tracker-doc-item">
                <div className="app-tracker-doc-item-left">
                  <div className="app-tracker-doc-thumb-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="app-tracker-doc-details">
                    <h4 className="app-tracker-doc-item-title">{doc.name}</h4>
                    <span className="app-tracker-doc-item-meta">{doc.meta}</span>
                    <span className="app-tracker-doc-item-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {doc.date || appliedDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="app-tracker-doc-view-btn"
                  onClick={() => onPreviewDoc(doc)}
                  title={`View ${doc.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>View</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Info Banner */}
      <div className="app-tracker-clean-card app-tracker-info-banner">
        <div className="app-tracker-info-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <p className="app-tracker-info-banner-desc" style={{ margin: 0, fontWeight: 500 }}>
          {pendingDocs.length > 0
            ? 'Please upload any requested documents above so your assigned CA can complete verification.'
            : 'These are the documents you uploaded during the application.'}
        </p>
      </div>
    </div>
  )
}
