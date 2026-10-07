import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { StepActionBar, UploadDocument } from '@shared/components'
import { viewItrDocument } from '../../../shared'
import { TDS_DOCUMENTS, DocIcons, TdsIcons, type TdsDocumentConfig } from '../../../utils/tdsRefund.constants'
import { TdsRefundProgressTracker } from '../TdsRefundOverview'
import './TdsRefundDocuments.css'

import type { UploadedFileMeta } from '../../../types/tdsRefund.types'
export type { UploadedFileMeta }

const VERIFICATION_CHECKLIST = [
  '256-bit Bank Grade Security',
  'Reconciliation with 26AS & AIS',
  'Next: Senior CA Review & Filing',
]

const DOCUMENT_GUIDELINES = [
  'Supported: PDF, JPG, PNG (up to 25MB).',
  'Password-protected PDFs accepted (standard ITD format).',
  'Form 16 & AIS can be downloaded from ITD portal.',
  'Clear scans prevent verification delays.',
]

export const TdsRefundDocumentsSidebar: React.FC = () => (
  <aside className="tds-docs-sidebar" aria-label="Document verification and guidelines">
    <div className="tds-progression-card">
      <span className="tds-progression-badge">Stage 2 in Progress</span>
      <h3 className="tds-progression-title">Document Verification</h3>
      <p className="tds-progression-desc">
        Uploaded files are securely scanned and matched with ITD records for refund accuracy.
      </p>

      <div className="tds-progression-checklist">
        {VERIFICATION_CHECKLIST.map((item) => (
          <div key={item} className="tds-progression-item">
            <TdsIcons.Checkmark />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="tds-progression-security">
        <div className="tds-prog-sec-row">
          <TdsIcons.Shield />
          <span>ISO 27001 Certified Vault</span>
        </div>
        <div className="tds-prog-sec-row">
          <TdsIcons.Zap />
          <span>Instant CA validation upon filing</span>
        </div>
      </div>
    </div>

    <div className="tds-sidebar-card tds-sidebar-trust-card">
      <div className="tds-trust-icon-box">
        <TdsIcons.Shield />
      </div>
      <div>
        <h4 className="tds-trust-title">Dedicated Tax Expert Review</h4>
        <p className="tds-trust-desc">
          A Senior Chartered Accountant checks all deductions and validates proofs before ITD submission.
        </p>
      </div>
    </div>

    <div className="tds-sidebar-card tds-sidebar-tip-card">
      <h4 className="tds-tip-title">Document Guidelines</h4>
      <ul className="tds-tip-list">
        {DOCUMENT_GUIDELINES.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  </aside>
)

export interface TdsRefundDocumentsProps {
  onBack: () => void
  onNext?: () => void
  onSaveDraft?: () => void
  initialUploads?: Record<string, UploadedFileMeta>
  onUploadsChange?: (uploads: Record<string, UploadedFileMeta>) => void
}

const formatFileSize = (bytes: number): string =>
  bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

export const TdsRefundDocuments: React.FC<TdsRefundDocumentsProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  initialUploads,
  onUploadsChange,
}) => {
  const [uploads, setUploads] = useState<Record<string, UploadedFileMeta>>(initialUploads || {})
  const [showWarning, setShowWarning] = useState(false)

  const totalCount = TDS_DOCUMENTS.length
  const uploadedCount = Math.min(totalCount, Object.keys(uploads).length)
  const percent = Math.round((uploadedCount / totalCount) * 100)

  const requiredDocs = TDS_DOCUMENTS.filter((doc) => doc.required)
  const missingDocs = requiredDocs.filter((doc) => !uploads[doc.id])
  const isDocumentsValid = missingDocs.length === 0

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const newUploads = {
        ...uploads,
        [docId]: { name: file.name, size: formatFileSize(file.size), file },
      }
      setUploads(newUploads)
      onUploadsChange?.(newUploads)

      const remainingMissing = requiredDocs.filter((doc) => doc.id !== docId && !newUploads[doc.id])
      if (remainingMissing.length === 0) {
        setShowWarning(false)
      }
    } catch {
      // Safe fallback
    }
  }

  const handleRemove = (docId: string) => {
    try {
      const updated = { ...uploads }
      delete updated[docId]
      setUploads(updated)
      onUploadsChange?.(updated)
    } catch {
      // Safe fallback
    }
  }

  const handleContinue = () => {
    if (missingDocs.length > 0) {
      setShowWarning(true)
      setTimeout(() => {
        const warningEl = document.querySelector('.tds-docs-warning-banner')
        if (warningEl) {
          warningEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          const firstMissing = document.querySelector('.loan-doc-item--error')
          firstMissing?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }
    setShowWarning(false)
    onNext?.()
  }

  const handleContinueRef = React.useRef(handleContinue)
  React.useEffect(() => {
    handleContinueRef.current = handleContinue
  })

  React.useEffect(() => {
    const handleAttempt = () => {
      handleContinueRef.current()
    }
    window.addEventListener('step-action-bar:submit-attempt', handleAttempt)
    return () => window.removeEventListener('step-action-bar:submit-attempt', handleAttempt)
  }, [])

  const renderProgressCard = () => (
    <div className="tds-docs-progress-card">
      <div className="tds-docs-progress-labels">
        <span className="tds-docs-progress-count">
          <strong>{uploadedCount}</strong> of <strong>{totalCount}</strong> documents uploaded
        </span>
        <span className="tds-docs-progress-percent">{percent}% Completed</span>
      </div>
      <div className="tds-docs-progress-bar-track">
        <div className={`tds-docs-progress-bar-fill tds-docs-progress-bar-fill--${uploadedCount}`} />
      </div>
    </div>
  )

  const renderDocumentCard = (doc: TdsDocumentConfig) => {
    const uploaded = uploads[doc.id]
    const IconComp = DocIcons[doc.id] || DocIcons.pan
    const isMissing = showWarning && Boolean(doc.required) && !uploaded

    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title}
        subtitle={doc.subtitle}
        isRequired={Boolean(doc.required)}
        icon={<IconComp />}
        iconBg="#eff6ff"
        iconColor="#2563eb"
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.name}
        fileSize={uploaded?.size}
        file={uploaded?.file}
        accept=".pdf,.jpg,.jpeg,.png"
        className={isMissing ? 'loan-doc-item--error' : ''}
        badge={
          isMissing ? (
            <span className="tds-doc-error-badge">Upload Required</span>
          ) : undefined
        }
        onView={(d) => {
          viewItrDocument({
            id: d.id,
            title: d.title,
            fileName: d.fileName || uploaded?.name,
            file: d.file || uploaded?.file,
          })
        }}
        onUpload={(id, file) => {
          handleFileChange(id, {
            target: { files: [file] },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }}
        onRemove={(id) => handleRemove(id)}
      />
    )
  }

  return (
    <div className="tds-docs-page">
      <div className="tds-docs-stepper-wrap">
        <TdsRefundProgressTracker currentStep={2} />
      </div>
      <div className="tds-docs-layout">
        <main className="tds-docs-main">
          {renderProgressCard()}

          {showWarning && missingDocs.length > 0 && (
            <div className="tds-docs-warning-banner" role="alert" data-testid="tds-docs-warning-banner">
              <div className="tds-docs-warning-icon-wrap" aria-hidden="true">
                <AlertCircle className="tds-docs-warning-icon" size={18} />
              </div>
              <div className="tds-docs-warning-body">
                <strong className="tds-docs-warning-title">Required Documents Missing</strong>
                <p className="tds-docs-warning-text">
                  Please upload all required documents marked with an asterisk (*) to continue:
                  {' '}
                  <span className="tds-docs-warning-missing-list">
                    {missingDocs.map((d) => d.title).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="tds-docs-list">
            {TDS_DOCUMENTS.map(renderDocumentCard)}
          </div>
        </main>
      </div>
      <StepActionBar
        onBack={onBack}
        onNext={handleContinue}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
        nextDisabled={!isDocumentsValid}
        nextTestId="tds-docs-proceed-btn"
      />
    </div>
  )
}

export default TdsRefundDocuments
