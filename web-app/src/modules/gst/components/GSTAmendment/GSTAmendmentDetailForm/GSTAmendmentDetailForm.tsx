import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import React, { useState, useEffect, type FormEvent } from 'react'
import { detectGstFieldKind, gstRuleForField } from '@modules/gst/validation/gstFieldRules'
import { gstInputForKind } from '@modules/gst/utils/gstInputFormatters'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTAmendmentDetailForm.css'

interface GSTAmendmentDetailFormProps {
  title?: string
  currentValue?: string
  inputLabel?: string
  placeholder?: string
  proofs?: string[]
  initialValue?: string
  initialFile?: File | null
  initialFileName?: string
  initialFileSize?: string
  isSubmitting?: boolean
  isEditMode?: boolean
  onBack: () => void
  onSaveDraft?: (data?: { newValue: string; file: File | null; fileName?: string; fileSizeText?: string }) => void
  onSubmit: (payload: { newValue: string; file: File | null; fileName?: string; fileSizeText?: string }) => void
  onChange?: (data: { newValue: string; file: File | null; fileName?: string; fileSizeText?: string }) => void
}

export const GSTAmendmentDetailForm: React.FC<GSTAmendmentDetailFormProps> = ({
  title,
  currentValue: _currentValue,
  inputLabel,
  placeholder,
  proofs: _proofs,
  initialValue,
  initialFile,
  initialFileName,
  initialFileSize,
  isSubmitting = false,
  isEditMode = false,
  onBack,
  onSubmit,
  onSaveDraft,
  onChange,
}) => {
  const [newValue, setNewValue] = useState<string>(initialValue || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [errors, setErrors] = useState<{ newValue?: string; file?: string }>({})

  useEffect(() => {
    if (initialValue !== undefined) setNewValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (initialFile !== undefined) {
      setSelectedFile(initialFile)
      if (initialFile) setRemovedInitialFile(false)
    }
  }, [initialFile])

  const effectiveFileName = !removedInitialFile ? (selectedFile?.name || initialFileName) : selectedFile?.name

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setRemovedInitialFile(false)
    setErrors((prev) => ({ ...prev, file: undefined }))
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setRemovedInitialFile(true)
  }

  // Validation and input filtering chosen from what the field asks for (label first, then placeholder)
  const fieldKind = detectGstFieldKind(inputLabel, placeholder)
  const filterInput = gstInputForKind(fieldKind)
  const validateField = (value: string) => gstRuleForField(inputLabel, placeholder)(value)

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    const newErrors: { newValue?: string; file?: string } = {}

    const fieldError = validateField(newValue)
    if (fieldError) {
      newErrors.newValue = fieldError
    }

    if (!selectedFile && !effectiveFileName) {
      newErrors.file = GST_FILE_MESSAGES.proofRequired
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit({
      newValue: newValue.trim(),
      file: selectedFile,
      fileName: effectiveFileName,
      fileSizeText: initialFileSize,
    })
  }

  return (
    <div className="gst-amend-detail-container">
      {/* Main Page Title Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">{title}</h1>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
        {/* Form Container */}
        <div className="gst-amend-detail-grid">
          <main className="gst-amend-detail-main">
            {/* New details */}
            <div className="gst-amend-card-box">
              <h3 className="gst-amend-card-box__title">New details</h3>
              <div className="gst-amend-field-group">
                <label htmlFor="new-detail-input" className="gst-amend-field-label">
                  {inputLabel} <span className="gst-amend-star">*</span>
                </label>
                <input
                  id="new-detail-input"
                  type="text"
                  placeholder={placeholder}
                  value={newValue}
                  onChange={(e) => {
                    const val = filterInput(e.target.value)
                    setNewValue(val)
                    if (errors.newValue) setErrors((prev) => ({ ...prev, newValue: undefined }))
                    onChange?.({
                      newValue: val,
                      file: selectedFile,
                      fileName: effectiveFileName,
                      fileSizeText: initialFileSize,
                    })
                  }}
                  className={`gst-amend-text-input ${errors.newValue ? 'has-error' : ''}`}
                />
                {errors.newValue && (
                  <span className="gst-amend-error-msg">{errors.newValue}</span>
                )}
              </div>
            </div>

            {/* Supporting proof */}
            <GSTProofUpload
              selectedFile={selectedFile}
              existingFileName={!selectedFile ? effectiveFileName : undefined}
              existingFileSize={initialFileSize}
              error={errors.file}
              onFileSelect={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />
          </main>
        </div>

        {/* Bottom Actions Row */}
        <div className="gst-amend-detail-actions-row">
          <button
            type="button"
            onClick={onBack}
            className="gst-amend-back-pill-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="form-actions-group">
            {onSaveDraft && (
              <SaveDraftButton
                onClick={() =>
                  onSaveDraft({
                    newValue: newValue.trim(),
                    file: selectedFile,
                    fileName: effectiveFileName,
                    fileSizeText: initialFileSize,
                  })
                }
              />
            )}
            {isEditMode ? (
              <UpdateAndReviewButton
                type="submit"
                isSubmitting={isSubmitting}
              />
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="gst-amend-submit-orange-btn"
              >
                {isSubmitting ? 'Submitting...' : 'Review Changes'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default GSTAmendmentDetailForm
