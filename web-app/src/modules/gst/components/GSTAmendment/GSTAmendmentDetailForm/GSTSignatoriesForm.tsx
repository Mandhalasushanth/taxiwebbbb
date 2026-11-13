import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useRef, type FormEvent } from 'react'
import { CaretInput } from '@shared/components'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import { useAmendmentFileState } from '../hooks/useAmendmentFileState'
import { GSTAmendmentActionBar } from './GSTAmendmentActionBar'
import { GSTCurrentPortalCard } from './GSTCurrentPortalCard'
import { DobDatePickerModal } from '@modules/authentication/components/DobDatePickerModal/DobDatePickerModal'
import { getTodayIso, formatDisplayDate, toIsoDate } from '@shared/utils'
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
  currentDetails,
  initialSignatoryDetails,
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
  const [name, setName] = useState(initialSignatoryDetails?.name || '')
  const [designation, setDesignation] = useState(initialSignatoryDetails?.designation || '')
  const [pan, setPan] = useState(initialSignatoryDetails?.pan || '')
  const [mobile, setMobile] = useState(
    initialSignatoryDetails?.mobile ? initialSignatoryDetails.mobile.replace(/^\+91\s*/, '') : ''
  )
  const [dob, setDob] = useState(
    initialSignatoryDetails?.dob ? formatDisplayDate(initialSignatoryDetails.dob, initialSignatoryDetails.dob) : ''
  )
  const [email, setEmail] = useState(initialSignatoryDetails?.email || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const {
    selectedFile,
    effectiveFileName,
    handleFileChange: onFileChange,
    handleFileRemove,
  } = useAmendmentFileState({
    initialFile,
    initialFileName,
    initialFileSize,
    onFileCleared: () => setErrors((prev) => ({ ...prev, file: '' })),
  })

  const notifyChange = (overrides?: Partial<{
    name: string
    designation: string
    pan: string
    mobile: string
    dob: string
    email: string
    file: File | null
    fileName?: string
  }>) => {
    if (!onChange) return
    const curName = overrides?.name !== undefined ? overrides.name : name
    const curDesignation = overrides?.designation !== undefined ? overrides.designation : designation
    const curPan = overrides?.pan !== undefined ? overrides.pan : pan
    const curMobile = overrides?.mobile !== undefined ? overrides.mobile : mobile
    const curDob = overrides?.dob !== undefined ? overrides.dob : dob
    const curEmail = overrides?.email !== undefined ? overrides.email : email
    const curFile = overrides?.file !== undefined ? overrides.file : selectedFile
    const curFileName = overrides?.fileName !== undefined ? overrides.fileName : effectiveFileName

    const formattedNewValue = `${curName.trim()} (${curDesignation.trim()}) · PAN: ${curPan.toUpperCase().trim()}`
    onChange({
      newValue: formattedNewValue,
      file: curFile,
      fileName: curFileName,
      fileSizeText: initialFileSize,
      signatoryDetails: {
        name: curName.trim(),
        designation: curDesignation.trim(),
        pan: curPan.toUpperCase().trim(),
        mobile: curMobile.trim(),
        dob: curDob.trim(),
        email: curEmail.trim(),
      },
    })
  }

  const handleFileChange = (file: File) => {
    onFileChange(file)
    setErrors((prev) => ({ ...prev, file: '' }))
    notifyChange({ file, fileName: file.name })
  }

  const handleCustomFileRemove = () => {
    handleFileRemove()
    notifyChange({ file: null, fileName: '' })
  }

  const [prevSignatoryDetails, setPrevSignatoryDetails] = useState(initialSignatoryDetails)
  if (prevSignatoryDetails !== initialSignatoryDetails) {
    setPrevSignatoryDetails(initialSignatoryDetails)
    if (initialSignatoryDetails) {
      if (initialSignatoryDetails.name !== undefined) setName(initialSignatoryDetails.name)
      if (initialSignatoryDetails.designation !== undefined) setDesignation(initialSignatoryDetails.designation)
      if (initialSignatoryDetails.pan !== undefined) setPan(initialSignatoryDetails.pan)
      if (initialSignatoryDetails.mobile !== undefined) {
        setMobile(initialSignatoryDetails.mobile.replace(/^\+91\s*/, ''))
      }
      if (initialSignatoryDetails.dob !== undefined) {
        setDob(formatDisplayDate(initialSignatoryDetails.dob, initialSignatoryDetails.dob))
      }
      if (initialSignatoryDetails.email !== undefined) setEmail(initialSignatoryDetails.email)
    }
  }

  const dateRef = useRef<HTMLInputElement>(null)

  const handleCalendarClick = () => {
    setIsCalendarOpen(true)
    if (dateRef.current?.showPicker) {
      try {
        dateRef.current.showPicker()
      } catch {
        // Fall back to modal
      }
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
      dob: formatDisplayDate(dob, dob.trim()),
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
    const hasData = Boolean(
      name.trim() ||
        designation.trim() ||
        pan.trim() ||
        mobile.trim() ||
        dob.trim() ||
        email.trim() ||
        selectedFile ||
        effectiveFileName
    )
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
          dob: formatDisplayDate(dob, dob.trim()),
          email: email.trim(),
        },
      })
    } else {
      onBack()
    }
  }

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
        {currentDetails && (
          <GSTCurrentPortalCard
            title="Currently Registered on Portal"
            subtitle="Read-only baseline from GST profile"
            rows={[
              { label: 'Signatory Name', value: currentDetails.name || '—' },
              { label: 'Signatory PAN', value: currentDetails.pan || '—' },
              { label: 'Designation', value: currentDetails.designation || '—' },
              { label: 'Mobile Number', value: currentDetails.mobile || '—' },
              { label: 'Email Address', value: currentDetails.email || '—' },
            ]}
          />
        )}

        {/* Card 2: Amended details */}
        <div className="gst-amend-card-box" id="gst-amend-details">
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
            <CaretInput
              id="sig-name-input"
              type="text"
              placeholder="Enter full name"
              maxLength={GST_MAX_LENGTH.name}
              value={name}
              onChange={(e) => {
                const val = gstInput.personName(e.target.value)
                setName(val)
                notifyChange({ name: val })
                if (errors.name) {
                  const err = rules.personName('Signatory name')(val)
                  setErrors((prev) => ({ ...prev, name: err || '' }))
                }
              }}
              onBlur={() => {
                const trimmedName = name.trim()
                setName(trimmedName)
                const err = rules.personName('Signatory name')(trimmedName)
                setErrors((prev) => ({ ...prev, name: err || '' }))
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
            <CaretInput
              id="sig-pan-input"
              type="text"
              placeholder="ABCPH5478H"
              maxLength={GST_MAX_LENGTH.pan}
              autoCapitalize="characters"
              value={pan}
              onChange={(e) => {
                const val = gstInput.pan(e.target.value)
                setPan(val)
                notifyChange({ pan: val })
                if (errors.pan) {
                  const err = rules.pan(val)
                  setErrors((prev) => ({ ...prev, pan: err || '' }))
                }
              }}
              onBlur={() => {
                const cleaned = pan.trim().toUpperCase()
                setPan(cleaned)
                const err = rules.pan(cleaned)
                setErrors((prev) => ({ ...prev, pan: err || '' }))
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
              <button
                type="button"
                className="gst-sig-dob-calendar-icon"
                onClick={handleCalendarClick}
                aria-label="Open calendar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              <CaretInput
                id="sig-dob-input"
                type="text"
                inputMode="numeric"
                placeholder="DD-MM-YYYY"
                maxLength={10}
                value={dob}
                onChange={(e) => {
                  const raw = e.target.value
                  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw)
                    ? formatDisplayDate(raw, raw)
                    : raw.replace(/[^0-9-]/g, '').slice(0, 10)
                  setDob(normalized)
                  notifyChange({ dob: normalized })
                  if (errors.dob) {
                    const err = rules.signatoryDob(normalized)
                    setErrors((prev) => ({ ...prev, dob: err || '' }))
                  }
                }}
                onBlur={() => {
                  const err = rules.signatoryDob(dob)
                  setErrors((prev) => ({ ...prev, dob: err || '' }))
                }}
                className="gst-sig-dob-native-input"
              />
              <input
                ref={dateRef}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                max={getTodayIso()}
                value={toIsoDate(dob)}
                onChange={(e) => {
                  const isoVal = e.target.value
                  if (!isoVal) return
                  const dmyVal = formatDisplayDate(isoVal, '')
                  setDob(dmyVal)
                  notifyChange({ dob: dmyVal })
                  const err = rules.signatoryDob(dmyVal)
                  setErrors((prev) => ({ ...prev, dob: err || '' }))
                }}
              />
              <button
                type="button"
                className="gst-sig-dob-chevron"
                onClick={handleCalendarClick}
                aria-label="Toggle calendar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            <DobDatePickerModal
              isOpen={isCalendarOpen}
              value={dob}
              onApply={(selectedDmy) => {
                setDob(selectedDmy)
                notifyChange({ dob: selectedDmy })
                setErrors((prev) => ({ ...prev, dob: rules.signatoryDob(selectedDmy) || '' }))
                setIsCalendarOpen(false)
              }}
              onClose={() => setIsCalendarOpen(false)}
              maxDate={new Date()}
              minDate={new Date(1900, 0, 1)}
            />
            {errors.dob && <span className="gst-amend-error-msg">{errors.dob}</span>}
          </div>

          {/* Field 4: Designation / Status */}
          <div className="gst-amend-field-group">
            <label htmlFor="sig-designation-input" className="gst-amend-field-label">
              Designation / Status <span className="gst-amend-star">*</span>
            </label>
            <CaretInput
              id="sig-designation-input"
              type="text"
              placeholder="Proprietor / Director / Partner"
              maxLength={60}
              value={designation}
              onChange={(e) => {
                const val = e.target.value
                setDesignation(val)
                notifyChange({ designation: val })
                const err = rules.designation(val)
                if (err && (/\d/.test(val) || errors.designation)) {
                  setErrors((prev) => ({ ...prev, designation: err }))
                } else if (!err && errors.designation) {
                  setErrors((prev) => {
                    const { designation: _, ...rest } = prev
                    return rest
                  })
                }
              }}
              onBlur={() => {
                const trimmed = designation.trim()
                setDesignation(trimmed)
                const err = rules.designation(trimmed)
                setErrors((prev) => {
                  const next = { ...prev }
                  if (err) next.designation = err
                  else delete next.designation
                  return next
                })
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
                inputMode="numeric"
                placeholder="Enter mobile number"
                maxLength={GST_MAX_LENGTH.mobile}
                value={mobile}
                onChange={(e) => {
                  const val = gstInput.mobile(e.target.value)
                  setMobile(val)
                  notifyChange({ mobile: val })
                  if (errors.mobile) {
                    const err = rules.mobile(val)
                    setErrors((prev) => ({ ...prev, mobile: err || '' }))
                  }
                }}
                onBlur={() => {
                  const err = rules.mobile(mobile)
                  setErrors((prev) => ({ ...prev, mobile: err || '' }))
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
              maxLength={GST_MAX_LENGTH.email}
              value={email}
              onChange={(e) => {
                const val = gstInput.email(e.target.value)
                setEmail(val)
                notifyChange({ email: val })
                if (errors.email) {
                  const err = rules.email(val)
                  setErrors((prev) => ({ ...prev, email: err || '' }))
                }
              }}
              onBlur={() => {
                const trimmed = email.trim()
                setEmail(trimmed)
                const err = rules.email(trimmed)
                setErrors((prev) => ({ ...prev, email: err || '' }))
              }}
              className={`gst-amend-text-input ${errors.email ? 'has-error' : ''}`}
            />
            {errors.email && <span className="gst-amend-error-msg">{errors.email}</span>}
          </div>
        </div>

        {/* Card 3: Supporting proof */}
        <div id="gst-amend-proof">
          <div className="gst-amend-section-heading">Supporting Proof</div>
          <GSTProofUpload
            selectedFile={selectedFile}
            existingFileName={!selectedFile ? effectiveFileName : undefined}
            existingFileSize={initialFileSize}
            error={errors.file}
            onFileSelect={handleFileChange}
            onRemoveFile={handleCustomFileRemove}
          />
        </div>

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
        <GSTAmendmentActionBar
          onBack={handleBackClick}
          onSaveDraft={
            onSaveDraft
              ? () => {
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
                      dob: formatDisplayDate(dob, dob.trim()),
                      email: email.trim(),
                    },
                  })
                }
              : undefined
          }
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  )
}

export default GSTSignatoriesForm
