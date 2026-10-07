import React from 'react'
import { StepActionBar, UploadDocument } from '@shared/components'
import { viewItrDocument } from '../../../shared'
import {
  type UploadedDocInfo,
  type ChecklistDocConfig,
  REQUIRED_DOCS,
  RECOMMENDED_DOCS,
  ALL_DOCS,
} from '../itrFiling.constants'
import { ItrStepHeaderStepper } from '../ItrStepHeaderStepper'
import './ItrStepDocumentsView.css'

export type { UploadedDocInfo }

/* ==========================================================================
   1. Document Item Row
   ========================================================================== */
interface ItrDocItemRowProps {
  doc: ChecklistDocConfig
  uploaded?: UploadedDocInfo
  onUploadDoc: (docId: string, doc: UploadedDocInfo) => void
  onRemoveDoc: (docId: string) => void
}

const ItrDocItemRow: React.FC<ItrDocItemRowProps> = ({
  doc,
  uploaded,
  onUploadDoc,
  onRemoveDoc,
}) => (
  <UploadDocument
    id={doc.id}
    title={doc.title.replace(/\s*\*+$/, '')}
    subtitle={doc.desc}
    isRequired={Boolean(doc.isMandatory)}
    icon={<doc.Icon />}
    iconBg="#eff6ff"
    iconColor="#2563eb"
    accept=".pdf,.jpg,.jpeg,.png"
    isUploaded={Boolean(uploaded)}
    fileName={uploaded?.fileName}
    fileSize={uploaded?.fileSize}
    file={uploaded?.file}
    onView={(d) => {
      viewItrDocument({
        id: d.id,
        title: d.title,
        fileName: d.fileName || uploaded?.fileName,
        file: d.file || uploaded?.file,
      })
    }}
    onUpload={(id, file) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      onUploadDoc(id, {
        id,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file,
      })
    }}
    onRemove={(id) => onRemoveDoc(id)}
  />
)

/* ==========================================================================
   2. Main Step 4 View
   ========================================================================== */
export interface ItrStepDocumentsViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  uploadedDocs: Record<string, UploadedDocInfo>
  onUploadDoc: (docId: string, doc: UploadedDocInfo) => void
  onRemoveDoc: (docId: string) => void
}

export const ItrStepDocumentsView: React.FC<ItrStepDocumentsViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  uploadedDocs,
  onUploadDoc,
  onRemoveDoc,
}) => {
  const totalPossible = ALL_DOCS.length
  const uploadedCount = Object.keys(uploadedDocs).length
  const readyPercent = Math.round((uploadedCount / totalPossible) * 100)

  const isStep4Valid = REQUIRED_DOCS.every(
    (doc) => !doc.isMandatory || Boolean(uploadedDocs[doc.id])
  )

  return (
    <div className="itr-step-view-container">

      {/* 5-Step Progress Stepper */}
      <ItrStepHeaderStepper currentStepId={4} />

      {/* Status & Shield Card */}
      <div className="itr-step-card">
        <div className="itr-docs-status-bar">
          <span className="itr-docs-count-text">
            Documents Uploaded: {uploadedCount} of {totalPossible}
          </span>
          <span className="itr-badge-ready">{readyPercent}% Ready</span>
        </div>

        <div className="itr-docs-shield-card">
          <div className="itr-docs-shield-icon" aria-hidden="true">🛡️</div>
          <div className="itr-docs-shield-content">
            <h3 className="itr-docs-shield-title">Document Checklist</h3>
            <p className="itr-docs-shield-sub">
              Upload applicable documents for CA review. PAN and Aadhaar identity are pre-verified from your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="itr-step-card">
        <div className="itr-docs-section-title-wrap">
          <h3 className="itr-docs-section-title">Required Documents</h3>
          <span className="itr-badge-mandatory">Mandatory ({REQUIRED_DOCS.length})</span>
        </div>
        <div className="itr-docs-list">
          {REQUIRED_DOCS.map((doc) => (
            <ItrDocItemRow
              key={doc.id}
              doc={doc}
              uploaded={uploadedDocs[doc.id]}
              onUploadDoc={onUploadDoc}
              onRemoveDoc={onRemoveDoc}
            />
          ))}
        </div>
      </div>

      {/* Recommended Documents */}
      <div className="itr-step-card">
        <div className="itr-docs-section-title-wrap">
          <h3 className="itr-docs-section-title">Recommended Documents</h3>
          <span className="itr-badge-recommended">Recommended ({RECOMMENDED_DOCS.length})</span>
        </div>
        <div className="itr-docs-list">
          {RECOMMENDED_DOCS.map((doc) => (
            <ItrDocItemRow
              key={doc.id}
              doc={doc}
              uploaded={uploadedDocs[doc.id]}
              onUploadDoc={onUploadDoc}
              onRemoveDoc={onRemoveDoc}
            />
          ))}
        </div>
      </div>

      <StepActionBar
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isStep4Valid}
      />
    </div>
  )
}

export default ItrStepDocumentsView
