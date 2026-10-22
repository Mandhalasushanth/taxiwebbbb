import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useRef, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTSignatoriesForm.css'
import './GSTAmendmentDetailForm.css'

interface GSTSignatoriesFormProps {
  currentDetails?: {
    name: string
    pan: string
    designation: string
    mobile: string
    email: string
  }
  initialSignatoryDetails?: Record<string, string>
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
    signatoryDetails?: Record<string, string>
  }) => void
  onSubmit: (payload: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    signatoryDetails?: Record<string, string>
  }) => void
  onChange?: (data: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    signatoryDetails?: Record<string, string>
  }) => void
}

export const GSTSignatoriesForm: React.FC<GSTSignatoriesFormProps> = ({
  currentDetails: _currentDetailsProp,
  initialSignatoryDetails,
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
  const [name, setName] = useState(initialSignatoryDetails?.name || '')
  const [designation, setDesignation] = useState(initialSignatoryDetails?.designation || '')
  const [pan, setPan] = useState(initialSignatoryDetails?.pan || '')
  const [mobile, setMobile] = useState(initialSignatoryDetails?.mobile || '')
  const [dob, setDob] = useState(initialSignatoryDetails?.dob || '')
  const [email, setEmail] = useState(initialSignatoryDetails?.email || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [prevSignatoryDetails, setPrevSignatoryDetails] = useState(initialSignatoryDetails)
  if (prevSignatoryDetails !== initialSignatoryDetails) {
    setPrevSignatoryDetails(initialSignatoryDetails)
    if (initialSignatoryDetails) {
      if (initialSignatoryDetails.name !== undefined) setName(initialSignatoryDetails.name)
      if (initialSignatoryDetails.designation !== undefined) setDesignation(initialSignatoryDetails.designation)
      if (initialSignatoryDetails.pan !== undefined) setPan(initialSignatoryDetails.pan)
      if (initialSignatoryDetails.mobile !== undefined) setMobile(initialSignatoryDetails.mobile)
      if (initialSignatoryDetails.dob !== undefined) setDob(initialSignatoryDetails.dob)
      if (initialSignatoryDetails.email !== undefined) setEmail(initialSignatoryDetails.email)
    }
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

  const dateRef = useRef<HTMLInputElement>(null)

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setRemovedInitialFile(false)
    setErrors((prev) => ({ ...prev, file: '' }))
  }

  const handleCalendarClick = () => {
    if (dateRef.current) {
      if (typeof dateRef.current.showPicker === 'function') dateRef.current.showPicker()
      else dateRef.current.focus()
    }
  }

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    const newErrors = collectGstErrors({
      name: rules.personName('Signatory name')(name),
      designation: rules.designation(designation),
      pan: rules.pan(pan),
      mobile: rules.mobile(mobile),
      dob: rules.signatoryDob(dob),
      email: rules.email(email),
    })
    if (!selectedFile && !effectiveFileName) newErrors.file = GST_FILE_MESSAGES.proofRequired

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedNewValue = `${name.trim()} (${designation.trim()}) · PAN: ${pan.toUpperCase().trim()}`
    const sigData = {
      name: name.trim(),
      designation: designation.trim(),
      pan: pan.toUpperCase().trim(),
      mobile: mobile.trim(),
      dob: dob.trim(),
      email: email.trim(),
    }
    setErrors({})
    onSubmit({
      newValue: formattedNewValue,
      file: selectedFile,
      fileName: effectiveFileName,
      fileSizeText: initialFileSize,
      signatoryDetails: sigData,
    })
  }

  const handleBackClick = () => {
    const hasData = Boolean(name.trim() || designation.trim() || pan.trim() || mobile.trim() || email.trim() || selectedFile || effectiveFileName)
    if (hasData && onSaveDraft) {
      onSaveDraft({
        newValue: `${name.trim()} (${designation.trim()}) · PAN: ${pan.toUpperCase().trim()}`,
        file: selectedFile,
        fileName: effectiveFileName,
        fileSizeText: initialFileSize,
        signatoryDetails: {
          name: name.trim(),
          designation: designation.trim(),
          pan: pan.toUpperCase().trim(),
          mobile: mobile.trim(),
          dob: dob.trim(),
          email: email.trim(),
        },
      })
    } else {
      onBack()
    }
  }

  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const proofs = [
    'Letter of Authorisation',
    'Board Resolution',
    'Managing Committee Resolution',
    'Acceptance Letter accompanying the Resolution',
    'Applicable official appointment / authorisation document',
    'Other official authorisation document applicable to the entity',
  ]

  return (
    <div className="gst-amend-detail-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Authorised Signatories</h1>
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
              <span className="gst-amend-readonly-label">Signatory Name</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.name && _currentDetailsProp.name !== '—' ? _currentDetailsProp.name : '-'}
              </span>
            </div>
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">Designation</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.designation && _currentDetailsProp.designation !== '—' ? _currentDetailsProp.designation : '-'}
              </span>
            </div>
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">Contact</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.mobile && _currentDetailsProp.mobile !== '—'
                  ? _currentDetailsProp.mobile
                  : (_currentDetailsProp?.email && _currentDetailsProp.email !== '—' ? _currentDetailsProp.email : '-')}
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

          {/* Field 1: Full Name of Signatory */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-name-input" className="gst-amend-field-label">
              Full Name of Signatory <span className="gst-amend-star">*</span>
            </label>
            <input
              id="sig-name-input"
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => {
                setName(gstInput.letters(e.target.value))
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              className={`gst-amend-text-input ${errors.name ? 'has-error' : ''}`}
            />
            {errors.name && <span className="gst-amend-error-msg">{errors.name}</span>}
          </div>

          {/* Field 2: PAN Number */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-pan-input" className="gst-amend-field-label">
              PAN Number <span className="gst-amend-star">*</span>
            </label>
            <input
              id="sig-pan-input"
              type="text"
              placeholder="Enter PAN number"
              value={pan}
              onChange={(e) => {
                setPan(gstInput.pan(e.target.value))
                if (errors.pan) setErrors((prev) => ({ ...prev, pan: '' }))
              }}
              className={`gst-amend-text-input ${errors.pan ? 'has-error' : ''}`}
            />
            {errors.pan && <span className="gst-amend-error-msg">{errors.pan}</span>}
          </div>

          {/* Field 3: Date of Birth (as on PAN) */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-dob-input" className="gst-amend-field-label">
              Date of Birth (as on PAN) <span className="gst-amend-star">*</span>
            </label>
            <div className={`gst-sig-dob-input-wrapper ${errors.dob ? 'has-error' : ''}`}>
              <div className="gst-sig-dob-calendar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <input
                ref={dateRef}
                id="sig-dob-input"
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value)
                  if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }))
                }}
                className="gst-sig-dob-native-input"
                placeholder="Select date of birth"
              />
              <span className="gst-sig-dob-chevron" onClick={handleCalendarClick} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.dob && <span className="gst-amend-error-msg">{errors.dob}</span>}
          </div>

          {/* Field 4: Designation / Status */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-designation-input" className="gst-amend-field-label">
              Designation / Status <span className="gst-amend-star">*</span>
            </label>
            <input
              id="sig-designation-input"
              type="text"
              placeholder="Enter designation"
              value={designation}
              onChange={(e) => {
                setDesignation(gstInput.designation(e.target.value))
                if (errors.designation) setErrors((prev) => ({ ...prev, designation: '' }))
              }}
              className={`gst-amend-text-input ${errors.designation ? 'has-error' : ''}`}
            />
            {errors.designation && <span className="gst-amend-error-msg">{errors.designation}</span>}
          </div>

          {/* Field 5: Mobile Number */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-mobile-input" className="gst-amend-field-label">
              Mobile Number <span className="gst-amend-star">*</span>
            </label>
            <div className="gst-amend-contact-input-wrapper">
              <span className="gst-amend-contact-prefix">+91</span>
              <input
                id="sig-mobile-input"
                type="text"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => {
                  setMobile(gstInput.mobile(e.target.value))
                  if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }))
                }}
                className={`gst-amend-contact-input ${errors.mobile ? 'has-error' : ''}`}
              />
            </div>
            {errors.mobile && <span className="gst-amend-error-msg">{errors.mobile}</span>}
          </div>

          {/* Field 6: Email Address */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-email-input" className="gst-amend-field-label">
              Email Address <span className="gst-amend-star">*</span>
            </label>
            <input
              id="sig-email-input"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => {
                setEmail(gstInput.email(e.target.value))
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              className={`gst-amend-text-input ${errors.email ? 'has-error' : ''}`}
            />
            {errors.email && <span className="gst-amend-error-msg">{errors.email}</span>}
          </div>
        </div>

        {/* Card 3: Supporting proof */}
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
                      const formattedNewValue = `${name.trim()} (${designation.trim()}) · PAN: ${pan.toUpperCase().trim()}`
                      onSaveDraft({
                        newValue: formattedNewValue,
                        file: selectedFile,
                        fileName: effectiveFileName,
                        fileSizeText: initialFileSize,
                        signatoryDetails: {
                          name: name.trim(),
                          designation: designation.trim(),
                          pan: pan.toUpperCase().trim(),
                          mobile: mobile.trim(),
                          dob: dob.trim(),
                          email: email.trim(),
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

export default GSTSignatoriesForm
