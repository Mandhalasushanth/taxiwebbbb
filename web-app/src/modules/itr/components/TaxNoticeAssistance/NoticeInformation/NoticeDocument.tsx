import React, { useRef, useState } from 'react'
import { StepActionBar, UploadDocument } from '@shared/components'
import type { NoticeFormData } from '../../../types/taxNoticeAssistance.types'
import './NoticeDocument.css'

export interface NoticeDocumentProps {
  formData: NoticeFormData
  onChange: (patch: Partial<NoticeFormData>) => void
  onBack: () => void
  onNext: () => void
  onSaveDraftAndExit: () => void
  isSubmitting?: boolean
}

export const NoticeDocument: React.FC<NoticeDocumentProps> = ({
  formData,
  onChange,
  onBack,
  onNext,
  onSaveDraftAndExit,
  isSubmitting = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.')
      return
    }

    setUploadError(null)
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    onChange({
      documentFile: file,
      documentFileName: file.name,
      documentFileSize: formattedSize,
    })
  }

  const handleRemoveFile = () => {
    onChange({
      documentFile: null,
      documentFileName: '',
      documentFileSize: '',
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const hasDocument = Boolean(formData.documentFileName || formData.documentFile)

  const handleNextClick = () => {
    if (!hasDocument) {
      setUploadError('Please upload your official Income Tax notice before continuing.')
      return
    }
    setUploadError(null)
    onNext()
  }

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Not Provided'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="notice-upload-container">
      {/* Heading Section */}
      <div className="notice-form__intro">
        <h2 className="notice-form__heading">Upload your Income Tax notice</h2>
        <p className="notice-form__subheading">
          Upload the official notice PDF or clear photograph. Our team will cross-verify the document details with your information.
        </p>
      </div>

      {/* 2-Column Grid for Web View */}
      <div className="notice-step2-grid">
        <div className="notice-step2-col notice-step2-col--left">
          {/* Upload Card */}
          <UploadDocument
            id="notice-doc"
            title="Notice Document"
            subtitle="PDF, JPG or PNG • Up to 10 MB"
            isRequired={true}
            isUploaded={Boolean(formData.documentFileName)}
            fileName={formData.documentFileName || undefined}
            fileSize={formData.documentFileSize || undefined}
            accept=".pdf,.jpg,.jpeg,.png"
            onUpload={(_, file) => {
              handleFileChange({
                target: { files: [file] },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }}
            onRemove={handleRemoveFile}
            className={uploadError ? 'loan-doc-item--error' : ''}
          />
          {uploadError && <span className="notice-upload-card__error">{uploadError}</span>}

          {/* Confidentiality Callout Box */}
          <div className="notice-trust-card">
            <div className="notice-trust-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <p className="notice-trust-card__text">
              Your notice is kept strictly confidential and processed by certified tax experts under end-to-end encryption.
            </p>
          </div>
        </div>

        <div className="notice-step2-col notice-step2-col--right">
          {/* Summary Box (Entered Notice Information) */}
          <div className="notice-summary-card">
            <h3 className="notice-summary-card__title">Entered Notice Information</h3>

            <div className="notice-summary-card__rows">
              <div className="notice-summary-card__row">
                <span className="notice-summary-card__label">PAN:</span>
                <span className="notice-summary-card__value notice-summary-card__value--bold">
                  {formData.pan || '—'}
                </span>
              </div>

              <div className="notice-summary-card__row">
                <span className="notice-summary-card__label">Assessment Year:</span>
                <span className="notice-summary-card__value">{formData.assessmentYear || '—'}</span>
              </div>

              <div className="notice-summary-card__row">
                <span className="notice-summary-card__label">Notice Type:</span>
                <span className="notice-summary-card__value notice-summary-card__value--wrap">
                  {formData.noticeType || '—'}
                </span>
              </div>

              <div className="notice-summary-card__row">
                <span className="notice-summary-card__label">Notice Date:</span>
                <span className="notice-summary-card__value">{formatDateDisplay(formData.noticeDate)}</span>
              </div>

              <div className="notice-summary-card__row">
                <span className="notice-summary-card__label">Response Due Date:</span>
                <span className="notice-summary-card__value notice-summary-card__value--highlight">
                  {formatDateDisplay(formData.responseDueDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Action Bar */}
      <StepActionBar
        onBack={onBack}
        onNext={handleNextClick}
        onSaveDraft={onSaveDraftAndExit}
        backLabel="Back"
        nextLabel="Continue"
        nextAriaLabel="Continue to staff review"
        nextDisabled={!hasDocument}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

// Backward compatibility export
export const NoticeStep2Upload = NoticeDocument
export default NoticeDocument
