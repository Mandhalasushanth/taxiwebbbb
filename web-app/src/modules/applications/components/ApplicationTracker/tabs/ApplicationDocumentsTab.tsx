import React from 'react'
import type { ApplicationDocumentItem } from '../ApplicationTrackerView'
import { formatApplicationDateTime } from '../../../data/applicationTrackerData'

export interface ApplicationDocumentsTabProps {
  documents: ApplicationDocumentItem[]
  appliedDate: string
  onPreviewDoc: (doc: ApplicationDocumentItem) => void
  onDownloadDoc?: (doc: ApplicationDocumentItem) => void
  onUploadDoc?: (doc: ApplicationDocumentItem, file: File) => void
}

const isOfficialCertificateDoc = (doc: ApplicationDocumentItem): boolean => {
  const n = (doc.name || '').toLowerCase()
  const id = (doc.id || '').toLowerCase()
  return (
    id === 'reg-06' ||
    n.includes('registration certificate') ||
    (n.includes('gst') && n.includes('certificate')) ||
    n.includes('reg-06')
  )
}

export const isImageDocument = (doc: ApplicationDocumentItem): boolean => {
  const name = (doc.name || '').toLowerCase()
  const fileName = (doc.fileName || '').toLowerCase()
  const meta = (doc.meta || '').toLowerCase()
  const url = (doc.url || '').toLowerCase()

  if (doc.file instanceof File && doc.file.type.startsWith('image/')) {
    return true
  }
  if (doc.file instanceof Blob && doc.file.type.startsWith('image/')) {
    return true
  }

  // File extension checks
  const imageExtensions = /\.(jpe?g|png|webp|gif|bmp|svg)($|\?)/i
  if (imageExtensions.test(fileName) || imageExtensions.test(url)) {
    return true
  }

  // Name keywords indicating photo/image
  if (
    name.includes('photo') ||
    name.includes('photograph') ||
    name.includes('picture') ||
    name.includes('avatar') ||
    name.includes('selfie') ||
    name.includes('passphoto') ||
    name.includes('passport size')
  ) {
    return true
  }

  // Explicit IMAGE in meta (e.g. "IMAGE · 245 KB")
  if (meta.startsWith('image') || (meta.includes('image') && !meta.includes('pdf'))) {
    return true
  }

  return false
}

export const formatDocumentMeta = (doc: ApplicationDocumentItem): string => {
  const isImg = isImageDocument(doc)
  const meta = (doc.meta || '').trim()

  // If already cleanly formatted like "PDF · 245 KB" or "IMAGE · 245 KB"
  if (/^(PDF|IMAGE)\s*·\s*\d+/i.test(meta)) {
    return meta
  }

  // Extract file size if present in meta (e.g. "245 KB", "1.2 MB", "0.61 MB")
  const sizeMatch = meta.match(/(\d+(?:\.\d+)?\s*(?:KB|MB|Bytes|B))/i)
  const sizeStr = sizeMatch ? sizeMatch[1].toUpperCase() : '245 KB'

  if (isImg) {
    return `IMAGE · ${sizeStr}`
  }
  return `PDF · ${sizeStr}`
}

export const renderDocThumbIcon = (doc: ApplicationDocumentItem) => {
  const isImg = isImageDocument(doc)

  if (isImg) {
    return (
      <div className="app-tracker-doc-thumb-icon app-tracker-doc-thumb-icon--image" title="Image / Photograph">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#10b981" />
          <circle cx="8" cy="8" r="2.2" fill="#ffffff" />
          <path d="M4 18.5l5.5-6.5 3.5 4.5 3-3.5 4 5.5H4z" fill="#ffffff" />
        </svg>
      </div>
    )
  }

  return (
    <div className="app-tracker-doc-thumb-icon app-tracker-doc-thumb-icon--doc" title="Document / PDF">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M6 2C4.895 2 4 2.895 4 4v16c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V8l-6-6H6z"
          fill="#ef4444"
        />
        <path d="M14 2v6h6" fill="#fca5a5" />
        <rect x="7" y="12" width="7" height="2" rx="1" fill="#ffffff" />
        <rect x="7" y="16" width="10" height="2" rx="1" fill="#ffffff" />
      </svg>
    </div>
  )
}

export const ApplicationDocumentsTab: React.FC<ApplicationDocumentsTabProps> = ({
  documents,
  appliedDate,
  onPreviewDoc,
  onDownloadDoc,
  onUploadDoc,
}) => {
  // 1. Documents explicitly requested from the user to upload (Action Needed)
  const pendingDocs = documents.filter(
    (d) =>
      !isOfficialCertificateDoc(d) &&
      (d.status === 'pending' || d.status === 'requested' || d.status === 'rejected')
  )

  // 2. Official Authority-issued documents/certificates (e.g. GST Certificate REG-06)
  const certificateDocs = documents.filter((d) => isOfficialCertificateDoc(d))

  // 3. User-uploaded supporting documents
  const uploadedDocs = documents.filter(
    (d) =>
      !isOfficialCertificateDoc(d) &&
      d.status !== 'pending' &&
      d.status !== 'requested' &&
      d.status !== 'rejected'
  )

  return (
    <div className="app-tracker-web-tab-content">
      {/* 1. Official Government Issued Documents / Certificates Track */}
      {certificateDocs.length > 0 && (
        <div className="app-tracker-clean-card" style={{ borderLeft: '4px solid #2563eb', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 className="app-tracker-card-subtitle" style={{ color: '#1e40af', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Official Issued Certificates & Documents</span>
                <span
                  style={{
                    fontSize: '12px',
                    background: certificateDocs.some((d) => d.status === 'uploaded' || (d as any).isReady) ? '#dcfce7' : '#ffedd5',
                    color: certificateDocs.some((d) => d.status === 'uploaded' || (d as any).isReady) ? '#15803d' : '#c2410c',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  {certificateDocs.some((d) => d.status === 'uploaded' || (d as any).isReady) ? 'Ready for Download' : 'Under Verification'}
                </span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {certificateDocs.some((d) => d.status === 'uploaded' || (d as any).isReady)
                  ? 'Your GST certificate has been verified and approved by the manager. You can download the official Form GST REG-06 below.'
                  : 'Your GST certificate is currently under verification. Once approved by the manager, it will be available for download here.'}
              </p>
            </div>
          </div>

          <div className="app-tracker-docs-list">
            {certificateDocs.map((doc, idx) => {
              const isReady = doc.status === 'uploaded' || (doc as any).isReady === true
              return (
                <div key={doc.id || idx} className="app-tracker-doc-item">
                  <div className="app-tracker-doc-item-left">
                    <div
                      className="app-tracker-doc-thumb-icon"
                      style={{
                        color: isReady ? '#15803d' : '#ea580c',
                        background: isReady ? '#dcfce7' : '#ffedd5',
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div className="app-tracker-doc-details">
                      <h4 className="app-tracker-doc-item-title">{doc.name}</h4>
                      <span className="app-tracker-doc-item-meta">
                        {isReady
                          ? 'Official Government Copy · Form GST REG-06 · Ready for Download'
                          : 'Under Verification · Document will be ready upon manager approval'}
                      </span>
                      <span className="app-tracker-doc-item-date" style={{ color: isReady ? '#15803d' : '#ea580c' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                          <circle cx="12" cy="12" r="10" />
                          {isReady ? <polyline points="9 12 11 14 15 10" /> : <polyline points="12 6 12 12 16 14" />}
                        </svg>
                        {isReady ? 'Approved & Ready' : 'Under Verification'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isReady ? (
                      <>
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
                        <button
                          type="button"
                          className="app-tracker-doc-view-btn"
                          style={{
                            background: '#ff7a00',
                            color: '#ffffff',
                            borderColor: '#ea580c',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(255, 122, 0, 0.25)',
                          }}
                          onClick={() => (onDownloadDoc ? onDownloadDoc(doc) : onPreviewDoc(doc))}
                          title={`Download ${doc.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #fdba74',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Under Verification</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. CA / Manager Requested Documents (Action Required) */}
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
                  {renderDocThumbIcon(doc)}
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
                  {renderDocThumbIcon(doc)}
                  <div className="app-tracker-doc-details">
                    <h4 className="app-tracker-doc-item-title">{doc.name}</h4>
                    <span className="app-tracker-doc-item-meta">{formatDocumentMeta(doc)}</span>
                    <span className="app-tracker-doc-item-date">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatApplicationDateTime(doc.date || appliedDate)}
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
