import React from 'react'
import { StepActionBar, DocumentSection, UploadDocument } from '@shared/components'
import { viewItrDocument } from '../../../shared'
import {
  type UploadedDocInfo,
  type ChecklistDocConfig,
  REQUIRED_DOCS,
  RECOMMENDED_DOCS,
  ALL_DOCS,
  ItrFilingHeaderStepper,
} from '../itrFiling.constants'
import './ItrDocumentsChecklistView.css'

export type { UploadedDocInfo }

export interface ItrDocumentsChecklistViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  /** Opened with "Edit" from the review: the main button reads "Update & Review" */
  isEditMode?: boolean
  uploadedDocs: Record<string, UploadedDocInfo>
  onUploadDoc: (docId: string, doc: UploadedDocInfo) => void
  onRemoveDoc: (docId: string) => void
}

export const ItrDocumentsChecklistView: React.FC<ItrDocumentsChecklistViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  isEditMode = false,
  uploadedDocs,
  onUploadDoc,
  onRemoveDoc,
}) => {
  const totalPossible = ALL_DOCS.length
  const uploadedCount = Object.keys(uploadedDocs).length
  const readyPercent = Math.round((uploadedCount / totalPossible) * 100)

  const handleFileUpload = (docId: string, file: File) => {
    try {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      onUploadDoc(docId, {
        id: docId,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file,
      })
    } catch {
      // Fallback
    }
  }

  const isDocumentsValid = REQUIRED_DOCS.every(
    (doc) => !doc.isMandatory || Boolean(uploadedDocs[doc.id])
  )

  const renderDocCard = (doc: ChecklistDocConfig) => {
    const uploaded = uploadedDocs[doc.id]
    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title.replace(/\s*\*+$/, '')}
        subtitle={doc.desc}
        isRequired={Boolean(doc.isMandatory)}
        icon={<doc.Icon />}
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
        onUpload={(id, file) => handleFileUpload(id, file)}
        onRemove={(id) => onRemoveDoc(id)}
      />
    )
  }

  const renderStatusAndShieldCard = () => (
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
  )

  return (
    <div className="itr-step-view-container">
      <ItrFilingHeaderStepper currentStepId={4} />
      {renderStatusAndShieldCard()}
      <DocumentSection
        title="Required Documents"
        badgeLabel={`Mandatory (${REQUIRED_DOCS.length})`}
        badgeType="mandatory"
        variant="card"
      >
        {REQUIRED_DOCS.map(renderDocCard)}
      </DocumentSection>
      <DocumentSection
        title="Recommended Documents"
        badgeLabel={`Recommended (${RECOMMENDED_DOCS.length})`}
        badgeType="recommended"
        variant="card"
      >
        {RECOMMENDED_DOCS.map(renderDocCard)}
      </DocumentSection>
      <StepActionBar
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isEditMode={isEditMode}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isDocumentsValid}
      />
    </div>
  )
}

export default ItrDocumentsChecklistView
