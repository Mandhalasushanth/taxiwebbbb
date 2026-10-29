import React from 'react'
import type { ApplicationDocumentItem } from '../ApplicationTrackerView'

export interface ApplicationDocumentsTabProps {
  documents: ApplicationDocumentItem[]
  appliedDate: string
  onPreviewDoc: (doc: ApplicationDocumentItem) => void
}

export const ApplicationDocumentsTab: React.FC<ApplicationDocumentsTabProps> = ({
  documents,
  appliedDate,
  onPreviewDoc,
}) => {
  return (
    <div className="app-tracker-web-tab-content">
      {/* Uploaded Documents Card */}
      <div className="app-tracker-clean-card">
        <h3 className="app-tracker-card-subtitle">Uploaded Documents</h3>

        <div className="app-tracker-docs-list">
          {documents.map((doc, idx) => (
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
          These are the documents you uploaded during the application.
        </p>
      </div>
    </div>
  )
}
