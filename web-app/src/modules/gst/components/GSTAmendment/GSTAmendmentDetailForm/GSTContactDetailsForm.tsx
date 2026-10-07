import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useEffect, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTContactDetailsForm.css'

interface GSTContactDetailsFormProps {
  currentDetails?: {
    mobile: string
    email: string
  }
  initialContactDetails?: Record<string, string>
  initialFile?: File | null
  initialFileName?: string
  initialFileSize?: string
  isSubmitting?: boolean
  isEditMode?: boolean
  onBack: () => void
  onSaveDraft?: (data?: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    contactDetails?: Record<string, string>
  }) => void
  onSubmit: (payload: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    contactDetails?: Record<string, string>
  }) => void
  onChange?: (data: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    contactDetails?: Record<string, string>
  }) => void
}

export const GSTContactDetailsForm: React.FC<GSTContactDetailsFormProps> = ({
  currentDetails: _currentDetailsProp,
  initialContactDetails,
  initialFile,
  initialFileName,
  initialFileSize,
  isSubmitting = false,
  isEditMode = false,
  onBack,
  onSubmit,
  onSaveDraft,
  onChange: _onChange,
}) => {
  const [mobileNumber, setMobileNumber] = useState(
    initialContactDetails?.mobile?.replace(/^\+91\s*/, '') || ''
  )
  const [emailAddress, setEmailAddress] = useState(initialContactDetails?.email || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialContactDetails) {
      if (initialContactDetails.mobile !== undefined) {
        setMobileNumber(initialContactDetails.mobile.replace(/^\+91\s*/, ''))
      }
      if (initialContactDetails.email !== undefined) {
        setEmailAddress(initialContactDetails.email)
      }
    }
  }, [initialContactDetails])

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
    setErrors((prev) => ({ ...prev, file: '' }))
  }

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    const newErrors = collectGstErrors({
      mobileNumber: rules.mobile(mobileNumber),
      emailAddress: rules.email(emailAddress),
    })

    if (!selectedFile && !effectiveFileName) {
      newErrors.file = GST_FILE_MESSAGES.proofRequired
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedMobile = `+91 ${mobileNumber.trim()}`
    const formattedEmail = emailAddress.trim()
    const formattedNewValue = `${formattedMobile} · ${formattedEmail}`

    setErrors({})
    onSubmit({
      newValue: formattedNewValue,
      file: selectedFile,
      fileName: effectiveFileName,
      fileSizeText: initialFileSize,
      contactDetails: {
        mobile: formattedMobile,
        email: formattedEmail,
      },
    })
  }

  return (
    <div className="gst-amend-detail-container gst-amend-contact-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Contact Details</h1>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>

        {/* Card 2: New details */}
        <div className="gst-amend-card-box">
          <h3 className="gst-amend-card-box__title">New details</h3>
          <div className="gst-amend-form-row">
            {/* New Mobile Number */}
            <div className="gst-amend-field-group">
              <label htmlFor="new-mobile-input" className="gst-amend-field-label">
                New Mobile Number <span className="gst-amend-star">*</span>
              </label>
              <div className="gst-amend-contact-input-wrapper">
                <span className="gst-amend-contact-prefix">+91</span>
                <input
                  id="new-mobile-input"
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(gstInput.mobile(e.target.value))
                    if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: '' }))
                  }}
                  className={`gst-amend-contact-input ${errors.mobileNumber ? 'has-error' : ''}`}
                />
              </div>
              {errors.mobileNumber && <span className="gst-amend-error-msg">{errors.mobileNumber}</span>}
            </div>

            {/* New Email Address */}
            <div className="gst-amend-field-group">
              <label htmlFor="new-email-input" className="gst-amend-field-label">
                New Email Address <span className="gst-amend-star">*</span>
              </label>
              <div className="gst-amend-contact-input-wrapper">
                <div className="gst-amend-contact-email-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  id="new-email-input"
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(gstInput.email(e.target.value))
                    if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: '' }))
                  }}
                  className={`gst-amend-contact-input gst-amend-contact-input--email ${errors.emailAddress ? 'has-error' : ''}`}
                />
              </div>
              {errors.emailAddress && <span className="gst-amend-error-msg">{errors.emailAddress}</span>}
            </div>
          </div>
        </div>

        {/* Section 3: Supporting proof */}
        <GSTProofUpload
          selectedFile={selectedFile}
          existingFileName={!selectedFile ? effectiveFileName : undefined}
          existingFileSize={initialFileSize}
          error={errors.file}
          onFileSelect={handleFileChange}
          onRemoveFile={() => {
            setSelectedFile(null)
            setRemovedInitialFile(true)
          }}
        />

        {/* Bottom Actions Row (Left: Back, Right: Review Changes) */}
        <div className="gst-amend-detail-actions-row">
          <button type="button" onClick={onBack} className="gst-amend-back-pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="form-actions-group">
            {onSaveDraft && (
              <SaveDraftButton
                onClick={() => {
                  const formattedMobile = `+91 ${mobileNumber.trim()}`
                  const formattedEmail = emailAddress.trim()
                  const formattedNewValue = `${formattedMobile} · ${formattedEmail}`
                  onSaveDraft({
                    newValue: formattedNewValue,
                    file: selectedFile,
                    fileName: effectiveFileName,
                    fileSizeText: initialFileSize,
                    contactDetails: {
                      mobile: formattedMobile,
                      email: formattedEmail,
                    },
                  })
                }}
              />
            )}
            {isEditMode ? (
              <UpdateAndReviewButton
                type="submit"
                isSubmitting={isSubmitting}
              />
            ) : (
              <button type="submit" disabled={isSubmitting} className="gst-amend-submit-orange-btn">
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

export default GSTContactDetailsForm
