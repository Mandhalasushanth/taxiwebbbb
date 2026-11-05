import { formatUploadSize, viewUploadedDocument } from '@shared/upload'
import React, { useMemo } from 'react'
import { StepActionBar, DocumentSection, UploadDocument } from '@shared/components'
import {
  type UploadedDocInfo,
  type ChecklistDocConfig,
  type ItrCategoryId,
  getItrChecklistSections,
  ItrFilingHeaderStepper,
} from '../itrFiling.constants'

export type { UploadedDocInfo }

export interface ItrDocumentsChecklistViewProps {
  onBack?: () => void
  onNext?: () => void
  onContinue?: () => void
  onSaveDraft?: () => void
  /** Opened with "Edit" from the review: the main button reads "Update & Review" */
  isEditMode?: boolean
  uploadedDocs: Record<string, UploadedDocInfo>
  onUploadDoc: (docId: string, doc: UploadedDocInfo) => void
  onRemoveDoc: (docId: string) => void
  selectedSources?: string[]
  selectedCategoryId?: ItrCategoryId | null
}

export const ItrDocumentsChecklistView: React.FC<ItrDocumentsChecklistViewProps> = ({
  onBack = () => {},
  onNext,
  onContinue,
  onSaveDraft,
  isEditMode = false,
  uploadedDocs,
  onUploadDoc,
  onRemoveDoc,
  selectedSources = [],
  selectedCategoryId,
}) => {
  const handleProceed = onNext || onContinue || (() => {})

  const { requiredDocs, recommendedDocs, optionalDocs } = useMemo(
    () => getItrChecklistSections({ selectedSources, selectedCategoryId }),
    [selectedSources, selectedCategoryId]
  )

  const handleFileUpload = (docId: string, file: File) => {
    try {
      onUploadDoc(docId, {
        id: docId,
        fileName: file.name,
        fileSize: formatUploadSize(file.size),
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file,
      })
    } catch {
      // Fallback
    }
  }

  const isDocumentsValid = requiredDocs.every(
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
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.fileName}
        fileSize={uploaded?.fileSize}
        file={uploaded?.file}
        onView={(d) => {
          viewUploadedDocument({
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

  return (
    <div className="itr-step-view-container itr-docs-step" id="itr-documents-checklist" data-section="documents">
      <ItrFilingHeaderStepper currentStepId={3} />

      {requiredDocs.length > 0 && (
        <DocumentSection
          title="Required Documents"
          badgeLabel={`Mandatory (${requiredDocs.length})`}
          badgeType="mandatory"
          variant="card"
        >
          {requiredDocs.map(renderDocCard)}
        </DocumentSection>
      )}

      {recommendedDocs.length > 0 && (
        <DocumentSection
          title="Recommended Documents"
          badgeLabel={`Recommended (${recommendedDocs.length})`}
          badgeType="recommended"
          variant="card"
        >
          {recommendedDocs.map(renderDocCard)}
        </DocumentSection>
      )}

      {optionalDocs.length > 0 && (
        <DocumentSection
          title="Only If Applicable"
          badgeLabel={`Optional (${optionalDocs.length})`}
          badgeType="optional"
          variant="card"
        >
          {optionalDocs.map(renderDocCard)}
        </DocumentSection>
      )}

      <StepActionBar
        onBack={onBack}
        onNext={handleProceed}
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

