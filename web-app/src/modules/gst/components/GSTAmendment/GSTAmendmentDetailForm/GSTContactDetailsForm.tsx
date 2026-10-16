import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useEffect, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTContactDetailsForm.css'
import './GSTAmendmentDetailForm.css'

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

  const handleBackClick = () => {
    const hasData = Boolean(mobileNumber.trim() || emailAddress.trim() || selectedFile || effectiveFileName)
    if (hasData && onSaveDraft) {
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
    } else {
      onBack()
    }
  }

  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const proofs = [
    'Official government/business registration document showing the updated contact details',
    'Official government correspondence showing the updated contact details',
    'Other supporting document showing the updated contact details',
    'Board Resolution / Authorization for contact update',
    'Utility Bill in the name of the entity / authorized person',
    'Other official document evidencing the contact detail change',
  ]

  return (
    <div className="gst-amend-detail-container gst-amend-contact-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Contact Details</h1>
        <p className="gst-amend-detail-subtitle">Non-core field amendment</p>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
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
          <div className="gst-amend-readonly-multiline-list">
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">Registered Mobile</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.mobile && _currentDetailsProp.mobile !== '—' ? _currentDetailsProp.mobile : '-'}
              </span>
            </div>
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">Registered Email</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.email && _currentDetailsProp.email !== '—' ? _currentDetailsProp.email : '-'}
              </span>
            </div>
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

          {/* New Primary Contact Mobile */}
          <div className="gst-amend-field-group">
            <label htmlFor="new-mobile-input" className="gst-amend-field-label">
              New Primary Contact Mobile <span className="gst-amend-star">*</span>
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

          {/* New Primary Contact Email */}
          <div className="gst-amend-field-group">
            <label htmlFor="new-email-input" className="gst-amend-field-label">
              New Primary Contact Email <span className="gst-amend-star">*</span>
            </label>
            <input
              id="new-email-input"
              type="email"
              placeholder="Enter email address"
              value={emailAddress}
              onChange={(e) => {
                setEmailAddress(gstInput.email(e.target.value))
                if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: '' }))
              }}
              className={`gst-amend-text-input ${errors.emailAddress ? 'has-error' : ''}`}
            />
            {errors.emailAddress && <span className="gst-amend-error-msg">{errors.emailAddress}</span>}
          </div>
        </div>

        {/* Section 3: Supporting proof */}
        <div className="gst-amend-section-heading">Supporting Proof</div>
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

        {/* Accepted proofs card */}
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

        {/* Bottom Actions Row (Left: Back, Right: Review Changes) */}
        <div className="gst-amend-detail-actions-row">
          <button type="button" onClick={handleBackClick} className="gst-amend-back-pill-btn">
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

export default GSTContactDetailsForm
