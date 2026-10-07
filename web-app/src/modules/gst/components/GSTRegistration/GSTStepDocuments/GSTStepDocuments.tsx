import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import type { FC } from 'react'
import type { GSTStepDocumentsProps, DocumentCategory } from '@modules/gst/types/gstDocuments.types'
import { useGstDocuments } from '@modules/gst/hooks/useGstDocuments'
import { GSTDocChecklistHeader } from './GSTDocChecklistHeader'
import { GSTDocCard } from './GSTDocCard'
import { GSTDocPreviewModal } from './GSTDocPreviewModal'
import { SecurityShieldIcon } from '@modules/gst/shared/GSTDocIcons/GSTDocIcons'
import { StepActionBar } from '@shared/components'
import { FileInput, PHOTO_UPLOAD_RULE } from '@shared/upload'
import './GSTStepDocuments.css'

export type { GSTStepDocumentsProps, UploadedDoc } from '@modules/gst/types/gstDocuments.types'

const SECTION_CONFIG: Array<{ key: DocumentCategory; title: string }> = [
  { key: 'identity', title: 'IDENTITY PROOF' },
  { key: 'business', title: 'BUSINESS PROOF' },
  { key: 'financial', title: 'FINANCIAL & SIGNATORY' },
]

export const GSTStepDocuments: FC<GSTStepDocumentsProps> = ({
  initialDocuments,
  isEditMode = false,
  onDocumentsChange,
  onBack,
  onNext,
  onSaveDraft,
}) => {
  const {
    groupedDocs,
    completedCount,
    totalCount,
    progressPercent,
    replacingDocId,
    previewDoc,
    validationError,
    uploadErrors,
    fileInputRef,
    cameraInputRef,
    handleTriggerUpload,
    handleTriggerCamera,
    handleFileSelected,
    handleUploadRejected,
    activeUploadRule,
    handleDirectUpload,
    handleDelete,
    handleStartReplace,
    handleCancelReplace,
    handleView,
    handleClosePreview,
    handleAddressProofTypeChange,
    handleProceed,
  } = useGstDocuments(initialDocuments, onDocumentsChange)

  return (
    <div className="gst-docs-page">
      {/* Hidden inputs for document file picker & mobile camera capture */}
      <FileInput
        ref={fileInputRef}
        hidden
        rule={activeUploadRule}
        onFileSelected={handleFileSelected}
        onFileError={(message) => handleUploadRejected(null, message)}
        aria-label="Upload document file"
      />
      <FileInput
        ref={cameraInputRef}
        hidden
        rule={PHOTO_UPLOAD_RULE}
        capture="environment"
        onFileSelected={handleFileSelected}
        onFileError={(message) => handleUploadRejected(null, message)}
        aria-label="Capture document via camera"
      />

      {/* Checklist Progress Header */}
      <GSTDocChecklistHeader
        completedCount={completedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
      />

      {/* Categorized Document Proof Sections */}
      {SECTION_CONFIG.map(({ key, title }) => (
        <section key={key} className="gst-docs-section">
          <h3 className="gst-docs-section-heading">{title}</h3>
          <div className="gst-docs-list">
            {groupedDocs[key].map((doc) => (
              <GSTDocCard
                key={doc.id}
                doc={doc}
                isReplacing={replacingDocId === doc.id}
                onTriggerCamera={handleTriggerCamera}
                onTriggerUpload={handleTriggerUpload}
                onDirectUpload={handleDirectUpload}
                onUploadError={handleUploadRejected}
                onStartReplace={handleStartReplace}
                onCancelReplace={handleCancelReplace}
                onDelete={handleDelete}
                onView={handleView}
                onAddressProofChange={handleAddressProofTypeChange}
                uploadError={uploadErrors[doc.id]}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Security and Compliance Banner */}
      <aside className="gst-docs-security-banner" aria-label="Security and Compliance">
        <div className="gst-docs-security-icon-circle" aria-hidden="true">
          <SecurityShieldIcon width={18} height={18} />
        </div>
        <p className="gst-docs-security-text">
          Your documents are encrypted and safely stored in compliance with GST data protection standards.
        </p>
      </aside>

      <GSTStepErrorBanner message={validationError} />

      {/* Step Navigation Bar */}
      <StepActionBar
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onNext={() => handleProceed(onNext)}
        isEditMode={isEditMode}
      />

      {/* Document Preview Modal */}
      <GSTDocPreviewModal previewDoc={previewDoc} onClose={handleClosePreview} />
    </div>
  )
}

export default GSTStepDocuments
