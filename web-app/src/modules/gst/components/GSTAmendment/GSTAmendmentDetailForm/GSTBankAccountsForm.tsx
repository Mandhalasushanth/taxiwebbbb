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

  return (
    <div className="gst-amend-detail-container gst-amend-bank-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Bank Accounts</h1>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>

        {/* Card 2: New details */}
        <div className="gst-amend-card-box">
          <h3 className="gst-amend-card-box__title">New details</h3>

          {/* Row 1: Bank Name & Account Number */}
          <div className="gst-amend-form-row">
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

            <div className="gst-amend-field-group">
              <label htmlFor="account-no-input" className="gst-amend-field-label">
                New Account Number <span className="gst-amend-star">*</span>
              </label>
              <input
                id="account-no-input"
                type="text"
                placeholder="Enter your bank account number"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(gstInput.accountNumber(e.target.value))
                  if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: '' }))
                }}
                className={`gst-amend-text-input ${errors.accountNumber ? 'has-error' : ''}`}
              />
              {errors.accountNumber && <span className="gst-amend-error-msg">{errors.accountNumber}</span>}
            </div>
          </div>

          {/* Row 2: Confirm Account Number & IFSC Code */}
          <div className="gst-amend-form-row">
            <div className="gst-amend-field-group">
              <label htmlFor="confirm-account-no-input" className="gst-amend-field-label">
                Confirm Account Number <span className="gst-amend-star">*</span>
              </label>
              <ConfirmAccountNumberInput
                id="confirm-account-no-input"
                name="confirmAccountNumber"
                placeholder="Enter your bank account number"
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

            <div className="gst-amend-field-group">
              <label htmlFor="ifsc-code-input" className="gst-amend-field-label">
                New IFSC Code <span className="gst-amend-star">*</span>
              </label>
              <input
                id="ifsc-code-input"
                type="text"
                placeholder="Enter your IFSC code"
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
          </div>

          {/* Row 3: Account Type */}
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
                <option value="">Select an option</option>
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

        {/* Bottom Action Row (Left: Back, Right: Review Changes) */}
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

export default GSTBankAccountsForm
