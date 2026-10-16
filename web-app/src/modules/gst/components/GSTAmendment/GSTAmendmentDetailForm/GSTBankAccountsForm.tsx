import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useEffect, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { lookupSampleBankByIfsc } from '@shared/services'
import { ConfirmAccountNumberInput } from '@shared/components'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import './GSTBankAccountsForm.css'

interface GSTBankAccountsFormProps {
  currentDetails?: {
    bankName: string
    accountNumber: string
    ifscCode: string
    accountType: string
  }
  initialBankDetails?: Record<string, string>
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
    bankDetails?: Record<string, string>
  }) => void
  onSubmit: (payload: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    bankDetails?: Record<string, string>
  }) => void
  onChange?: (data: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    bankDetails?: Record<string, string>
  }) => void
}

const ACCOUNT_TYPES = ['Current', 'Savings', 'Overdraft', 'Cash Credit']

export const GSTBankAccountsForm: React.FC<GSTBankAccountsFormProps> = ({
  currentDetails: _currentDetailsProp,
  initialBankDetails,
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
  const [bankName, setBankName] = useState(initialBankDetails?.bankName || '')
  const [accountNumber, setAccountNumber] = useState(initialBankDetails?.accountNumber || '')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(initialBankDetails?.accountNumber || '')
  const [ifscCode, setIfscCode] = useState(initialBankDetails?.ifscCode || '')
  const [accountType, setAccountType] = useState(initialBankDetails?.accountType || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialBankDetails) {
      if (initialBankDetails.bankName !== undefined) setBankName(initialBankDetails.bankName)
      if (initialBankDetails.accountNumber !== undefined) {
        setAccountNumber(initialBankDetails.accountNumber)
        setConfirmAccountNumber(initialBankDetails.accountNumber)
      }
      if (initialBankDetails.ifscCode !== undefined) setIfscCode(initialBankDetails.ifscCode)
      if (initialBankDetails.accountType !== undefined) setAccountType(initialBankDetails.accountType)
    }
  }, [initialBankDetails])

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
      bankName: rules.bankName(bankName),
      accountNumber: rules.accountNumber(accountNumber),
      confirmAccountNumber: rules.confirmAccountNumber(accountNumber, confirmAccountNumber),
      ifscCode: rules.ifsc(ifscCode),
    })
    if (!accountType) newErrors.accountType = 'Please select account type.'
    if (!selectedFile && !effectiveFileName) newErrors.file = GST_FILE_MESSAGES.proofRequired

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedNewValue = `${bankName.trim()} · A/C ${accountNumber.trim()} · ${ifscCode.toUpperCase().trim()} (${accountType})`
    const bankDetailsData = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.toUpperCase().trim(),
      accountType,
    }

    setErrors({})
    onSubmit({
      newValue: formattedNewValue,
      file: selectedFile,
      fileName: effectiveFileName,
      fileSizeText: initialFileSize,
      bankDetails: bankDetailsData,
    })
  }

  const handleBackClick = () => {
    const hasEnteredData = Boolean(
      bankName.trim() ||
      accountNumber.trim() ||
      confirmAccountNumber.trim() ||
      ifscCode.trim() ||
      accountType ||
      selectedFile ||
      effectiveFileName
    )
    if (hasEnteredData && onSaveDraft) {
      const formattedNewValue = `${bankName.trim()} · A/C ${accountNumber.trim()} · ${ifscCode.toUpperCase().trim()} (${accountType})`
      onSaveDraft({
        newValue: formattedNewValue,
        file: selectedFile,
        fileName: effectiveFileName,
        fileSizeText: initialFileSize,
        bankDetails: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.toUpperCase().trim(),
          accountType,
        },
      })
    } else {
      onBack()
    }
  }

  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const proofs = [
    'Bank Statement',
    'First Page of Passbook',
    'Cancelled Cheque',
    'Recent Bank Account Statement (last 3 months)',
    'Bank Account Certificate Issued by Bank',
    'Letter from Bank confirming account details',
  ]

  return (
    <div className="gst-amend-detail-container gst-amend-bank-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Bank Accounts</h1>
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
              <span className="gst-amend-readonly-label">Bank Name</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.bankName && _currentDetailsProp.bankName !== '—' ? _currentDetailsProp.bankName : '-'}
              </span>
            </div>
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">Account Number</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.accountNumber && _currentDetailsProp.accountNumber !== '—' ? _currentDetailsProp.accountNumber : '-'}
              </span>
            </div>
            <div className="gst-amend-readonly-row">
              <span className="gst-amend-readonly-label">IFSC Code</span>
              <span className="gst-amend-readonly-value">
                {_currentDetailsProp?.ifscCode && _currentDetailsProp.ifscCode !== '—' ? _currentDetailsProp.ifscCode : '-'}
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

          {/* Field 1: New Bank Name */}
          <div className="gst-amend-field-group">
            <label htmlFor="bank-name-input" className="gst-amend-field-label">
              New Bank Name <span className="gst-amend-star">*</span>
            </label>
            <input
              id="bank-name-input"
              type="text"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => {
                setBankName(gstInput.letters(e.target.value))
                if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: '' }))
              }}
              className={`gst-amend-text-input ${errors.bankName ? 'has-error' : ''}`}
            />
            {errors.bankName && <span className="gst-amend-error-msg">{errors.bankName}</span>}
          </div>

          {/* Field 2: New Bank Account Number */}
          <div className="gst-amend-field-group">
            <label htmlFor="account-no-input" className="gst-amend-field-label">
              New Bank Account Number <span className="gst-amend-star">*</span>
            </label>
            <input
              id="account-no-input"
              type="text"
              placeholder="Enter bank account number"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(gstInput.accountNumber(e.target.value))
                if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: '' }))
              }}
              className={`gst-amend-text-input ${errors.accountNumber ? 'has-error' : ''}`}
            />
            {errors.accountNumber && <span className="gst-amend-error-msg">{errors.accountNumber}</span>}
          </div>

          {/* Field 3: Confirm Bank Account Number */}
          <div className="gst-amend-field-group">
            <label htmlFor="confirm-account-no-input" className="gst-amend-field-label">
              Confirm Bank Account Number <span className="gst-amend-star">*</span>
            </label>
            <ConfirmAccountNumberInput
              id="confirm-account-no-input"
              name="confirmAccountNumber"
              placeholder="Re-enter bank account number"
              value={confirmAccountNumber}
              onChange={(val) => {
                setConfirmAccountNumber(val)
                if (errors.confirmAccountNumber) setErrors((prev) => ({ ...prev, confirmAccountNumber: '' }))
              }}
              className={`gst-amend-text-input ${errors.confirmAccountNumber ? 'has-error' : ''}`}
              hasError={Boolean(errors.confirmAccountNumber)}
              error={errors.confirmAccountNumber}
            />
          </div>

          {/* Field 4: IFSC Code */}
          <div className="gst-amend-field-group">
            <label htmlFor="ifsc-code-input" className="gst-amend-field-label">
              IFSC Code <span className="gst-amend-star">*</span>
            </label>
            <input
              id="ifsc-code-input"
              type="text"
              placeholder="Enter IFSC code"
              value={ifscCode}
              onChange={(e) => {
                const cleaned = gstInput.ifsc(e.target.value)
                setIfscCode(cleaned)
                if (errors.ifscCode) setErrors((prev) => ({ ...prev, ifscCode: '' }))
                if (cleaned.length >= 4) {
                  const match = lookupSampleBankByIfsc(cleaned)
                  if (match) {
                    setBankName(match.bankName)
                    if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: '' }))
                  }
                }
              }}
              className={`gst-amend-text-input ${errors.ifscCode ? 'has-error' : ''}`}
            />
            {errors.ifscCode && <span className="gst-amend-error-msg">{errors.ifscCode}</span>}
          </div>

          {/* Field 5: Account Type */}
          <div className="gst-amend-field-group">
            <label htmlFor="account-type-select" className="gst-amend-field-label">
              Account Type <span className="gst-amend-star">*</span>
            </label>
            <div className="gst-amend-select-wrapper">
              <select
                id="account-type-select"
                value={accountType}
                onChange={(e) => {
                  setAccountType(e.target.value)
                  if (errors.accountType) setErrors((prev) => ({ ...prev, accountType: '' }))
                }}
                className={`gst-amend-select-input ${errors.accountType ? 'has-error' : ''}`}
              >
                <option value="">Select Account Type</option>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <span className="gst-amend-select-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.accountType && <span className="gst-amend-error-msg">{errors.accountType}</span>}
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

        {/* Bottom Action Row (Left: Back, Right: Review Changes) */}
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
                onClick={() => {
                  const formattedNewValue = `${bankName.trim()} · A/C ${accountNumber.trim()} · ${ifscCode.toUpperCase().trim()} (${accountType})`
                  onSaveDraft({
                    newValue: formattedNewValue,
                    file: selectedFile,
                    fileName: effectiveFileName,
                    fileSizeText: initialFileSize,
                    bankDetails: {
                      bankName: bankName.trim(),
                      accountNumber: accountNumber.trim(),
                      ifscCode: ifscCode.toUpperCase().trim(),
                      accountType,
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

export default GSTBankAccountsForm
