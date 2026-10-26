import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES, formatGstFileSize } from '@modules/gst/utils/gstFile'
import React, { useState, type FormEvent } from 'react'
import { detectGstFieldKind, gstRuleForField } from '@modules/gst/validation/gstFieldRules'
import { gstInputForKind } from '@modules/gst/utils/gstInputFormatters'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTAmendmentDetailForm.css'

interface GSTAmendmentDetailFormProps {
  title?: string
  subtitle?: string
  currentValue?: string
  currentLabel?: string
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
  subtitle = 'Core field amendment',
  currentValue,
  currentLabel = 'Legal Name',
  inputLabel,
  placeholder,
  proofs,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)
  if (prevInitialValue !== initialValue) {
    setPrevInitialValue(initialValue)
    if (initialValue !== undefined) setNewValue(initialValue)
  }

  const [prevInitialFile, setPrevInitialFile] = useState(initialFile)
  if (prevInitialFile !== initialFile) {
    setPrevInitialFile(initialFile)
    if (initialFile !== undefined) {
      setSelectedFile(initialFile)
      if (initialFile) setRemovedInitialFile(false)
    }
  }

  const effectiveFileName = !removedInitialFile ? (selectedFile?.name || initialFileName) : selectedFile?.name

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setRemovedInitialFile(false)
    setErrors((prev) => ({ ...prev, file: undefined }))
    onChange?.({
      newValue,
      file,
      fileName: file.name,
      fileSizeText: formatGstFileSize(file.size),
    })
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setRemovedInitialFile(true)
    onChange?.({
      newValue,
      file: null,
      fileName: undefined,
      fileSizeText: undefined,
    })
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

  const handleBackClick = () => {
    const hasEnteredData = Boolean(newValue.trim() || selectedFile || effectiveFileName)
    if (hasEnteredData && onSaveDraft) {
      onSaveDraft({
        newValue: newValue.trim(),
        file: selectedFile,
        fileName: effectiveFileName,
        fileSizeText: initialFileSize,
      })
    } else {
      onBack()
    }
  }

  return (
    <div className="gst-amend-detail-container">
      {/* Main Page Title Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">{title}</h1>
        <p className="gst-amend-detail-subtitle">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
        {/* Form Container */}
        <div className="gst-amend-detail-grid">
          <main className="gst-amend-detail-main">
            {/* Card 1: Currently Registered on Portal */}
            <div className="gst-amend-card-box">
              <div className="gst-amend-card-box__header-flex">
                <div className="gst-amend-card-header-icon-box gst-amend-card-header-icon-box--building">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <path d="M9 22v-4h6v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="gst-amend-card-box__title">Currently Registered on Portal</h3>
                  <p className="gst-amend-card-box__subtitle">Read-only baseline from GST profile</p>
                </div>
              </div>
              <div className="gst-amend-readonly-box">
                <span className="gst-amend-readonly-label">{currentLabel}</span>
                <span className="gst-amend-readonly-value">
                  {currentValue && currentValue !== '—' && currentValue !== 'None on record' ? currentValue : '-'}
                </span>
              </div>
            </div>

            {/* Card 2: Amended details */}
            <div className="gst-amend-card-box">
              <div className="gst-amend-card-box__header-flex">
                <div className="gst-amend-card-header-icon-box gst-amend-card-header-icon-box--edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="gst-amend-card-box__title">Amended details</h3>
                  <p className="gst-amend-card-box__subtitle">Enter revised information for verification</p>
                </div>
              </div>
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
            <div className="gst-amend-section-heading">Supporting Proof</div>
            <GSTProofUpload
              selectedFile={selectedFile}
              existingFileName={!selectedFile ? effectiveFileName : undefined}
              existingFileSize={initialFileSize}
              error={errors.file}
              onFileSelect={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            {/* Accepted proofs */}
            {proofs && proofs.length > 0 && (
              <div className="gst-amend-accepted-proofs-card">
                <div className="gst-amend-accepted-proofs-header">
                  <div className="gst-amend-accepted-proofs-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <span className="gst-amend-accepted-proofs-title">Accepted proofs</span>
                </div>
                <ul className="gst-amend-accepted-proofs-list">
                  {(isExpanded ? proofs : proofs.slice(0, 3)).map((proof, idx) => (
                    <li key={idx} className="gst-amend-accepted-proofs-item">
                      • {proof}
                    </li>
                  ))}
                </ul>
                {proofs.length > 3 && (
                  <button
                    type="button"
                    className="gst-amend-view-more-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <>
                        View Less{' '}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </>
                    ) : (
                      <>
                        View More{' '}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Bottom Actions Row */}
        <div className="gst-amend-detail-actions-row">
          <button
            type="button"
            onClick={handleBackClick}
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
                {isSubmitting ? 'Submitting...' : 'Continue'}
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
