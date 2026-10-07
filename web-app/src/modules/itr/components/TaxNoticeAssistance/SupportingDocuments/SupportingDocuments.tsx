import { formatUploadSize } from '@shared/upload'
import React, { useRef, useState } from 'react'
import { StepActionBar } from '@shared/components'
import { viewUploadedDocument } from '@shared/upload'
import {
  type NoticeFormData,
  SUPPORTING_DOCUMENT_LIST,
} from '@modules/itr/types/taxNoticeAssistance.types'
import { SupportingDocRow } from './SupportingDocRow'
import './SupportingDocuments.css'

export interface SupportingDocumentsProps {
  formData: NoticeFormData
  onChange: (patch: Partial<NoticeFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraftAndExit: () => void
}

export const SupportingDocuments: React.FC<SupportingDocumentsProps> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveDraftAndExit,
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Initialize uploaded docs map from formData
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; fileSize: string; fileUrl?: string; file?: File }>>(() => {
    const initial: Record<string, { fileName: string; fileSize: string; fileUrl?: string; file?: File }> = {
      ...(formData.supportingDocuments || {}),
    }
    // Pre-populate tax-notice if uploaded in step 2
    if (formData.documentFileName && !initial['tax-notice']) {
      initial['tax-notice'] = {
        fileName: formData.documentFileName,
        fileSize: formData.documentFileSize || '2.4 MB',
        file: formData.documentFile || undefined,
        fileUrl: formData.documentFile ? URL.createObjectURL(formData.documentFile) : undefined,
      }
    }
    return initial
  })

  const [remarks, setRemarks] = useState(formData.remarks || '')

  const handleFileUpload = (docId: string, file: File) => {
    const formattedSize = formatUploadSize(file.size)

    const fileUrl = URL.createObjectURL(file)
    const updated = {
      ...uploadedDocs,
      [docId]: {
        fileName: file.name,
        fileSize: formattedSize,
        fileUrl,
        file,
      },
    }
    setUploadedDocs(updated)
    onChange({ supportingDocuments: updated })
  }

  const handleRemoveDocument = (docId: string) => {
    const updated = { ...uploadedDocs }
    delete updated[docId]
    setUploadedDocs(updated)
    onChange({ supportingDocuments: updated })
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId]!.value = ''
    }
  }

  const handleViewDocument = (docId: string) => {
    const doc = uploadedDocs[docId]
    const docMeta = SUPPORTING_DOCUMENT_LIST.find((d) => d.id === docId)
    viewUploadedDocument({
      id: docId,
      title: docMeta?.title || doc?.fileName || 'Supporting Document',
      fileName: doc?.fileName,
      file: doc?.file,
      fileUrl: doc?.fileUrl,
    })
  }

  const handleReplaceDocument = (docId: string) => {
    fileInputRefs.current[docId]?.click()
  }

  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 500)
    setRemarks(val)
    onChange({ remarks: val })
  }

  const uploadedCount = Object.keys(uploadedDocs).length
  const totalCount = SUPPORTING_DOCUMENT_LIST.length
  const progressPercent = Math.min(100, Math.round((uploadedCount / totalCount) * 100))

  const requiredDocs = SUPPORTING_DOCUMENT_LIST.filter((d) => d.required)
  const missingRequiredDocs = requiredDocs.filter((d) => !uploadedDocs[d.id])
  const canProceed = missingRequiredDocs.length === 0

  const handleNextClick = () => {
    if (!canProceed) return
    onNext()
  }

  return (
    <div className="supporting-docs-container">
      {/* Header Introduction */}
      <div className="notice-form__intro">
        <h2 className="notice-form__heading">Upload Supporting Documents</h2>
        <p className="notice-form__subheading">
          Upload the documents relevant to this notice. This enables our Tax Executive to verify figures and formulate your legal response.
        </p>
      </div>

      {/* Tracker Counter Bar */}
      <div className="supporting-docs-tracker">
        <div className="supporting-docs-tracker__header">
          <span>{uploadedCount} of {totalCount} documents uploaded</span>
          <span className="supporting-docs-tracker__count">{progressPercent}%</span>
        </div>
        <div className="supporting-docs-tracker__bar-track">
          <div
            className="supporting-docs-tracker__bar-fill"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Responsive 2-Column Grid of Document Items */}
      <div className="supporting-docs-list">
        {SUPPORTING_DOCUMENT_LIST.map((doc) => {
          const isUploaded = !!uploadedDocs[doc.id]
          const uploadInfo = uploadedDocs[doc.id]

          return (
            <SupportingDocRow
              key={doc.id}
              doc={doc}
              isUploaded={isUploaded}
              uploadInfo={uploadInfo}
              fileInputRef={(el) => {
                fileInputRefs.current[doc.id] = el
              }}
              onFileUpload={(file) => handleFileUpload(doc.id, file)}
              onView={() => handleViewDocument(doc.id)}
              onReplace={() => handleReplaceDocument(doc.id)}
              onRemove={() => handleRemoveDocument(doc.id)}
            />
          )
        })}
      </div>

      {/* Remarks / Special Instructions (Optional) */}
      <div className="supporting-docs-remarks">
        <label htmlFor="notice-remarks" className="supporting-docs-remarks__label">
          Remarks / Special Instructions (Optional)
        </label>
        <div className="supporting-docs-remarks__box">
          <textarea
            id="notice-remarks"
            className="supporting-docs-remarks__textarea"
            rows={3}
            placeholder="Add any additional context, transaction details, or explanation for our Tax Executive..."
            value={remarks}
            onChange={handleRemarksChange}
          />
          <span className="supporting-docs-remarks__counter">
            {remarks.length}/500
          </span>
        </div>
      </div>

      {/* Warning banner when required documents are missing */}
      {missingRequiredDocs.length > 0 && (
        <div className="supporting-docs-warning" role="alert">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Please upload all mandatory documents (*) to proceed ({missingRequiredDocs.length} remaining).
          </span>
        </div>
      )}

      {/* Bottom Step Action Bar */}
      <StepActionBar
        onBack={onBack}
        onSaveDraft={onSaveDraftAndExit}
        onNext={handleNextClick}
        backLabel="Back"
        nextLabel="Continue"
        nextAriaLabel="Submit Documents & Review Response"
        nextDisabled={!canProceed}
      />
    </div>
  )
}

export default SupportingDocuments
