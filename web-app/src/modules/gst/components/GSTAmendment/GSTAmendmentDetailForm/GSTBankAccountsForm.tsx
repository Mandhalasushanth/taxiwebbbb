import { GSTSaveDraftButton } from '@modules/gst/shared/GSTSaveDraftButton'
import { GST_FILE_MESSAGES, gstFileSizeError } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, type ChangeEvent, type FormEvent, useMemo } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { getCurrentBankDetails } from '@modules/gst/services/gstProfileDetails'
import { lookupSampleBankByIfsc } from '@shared/services'
import { ConfirmAccountNumberInput } from '@shared/components'
import GSTAmendmentProofUpload from './GSTAmendmentProofUpload'
import './GSTBankAccountsForm.css'

interface GSTBankAccountsFormProps {
  currentDetails?: {
    bankName: string
    accountNumber: string
    ifscCode: string
    accountType: string
  }
  isSubmitting?: boolean
  onBack: () => void
  onSaveDraft?: () => void
  onSubmit: (payload: { newValue: string; file: File | null; bankDetails?: Record<string, string> }) => void
}

const ACCOUNT_TYPES = ['Current', 'Savings', 'Overdraft', 'Cash Credit']

export const GSTBankAccountsForm: React.FC<GSTBankAccountsFormProps> = ({
  currentDetails: currentDetailsProp,
  isSubmitting = false,
  onBack,
  onSubmit,
  onSaveDraft,
}) => {
  const currentDetails = useMemo(() => currentDetailsProp ?? getCurrentBankDetails(), [currentDetailsProp])
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountType, setAccountType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const sizeError = gstFileSizeError(file)
      if (sizeError) {
        setErrors((prev) => ({ ...prev, file: sizeError }))
        return
      }
      setSelectedFile(file)
      setErrors((prev) => ({ ...prev, file: '' }))
    }
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
    if (!selectedFile) newErrors.file = GST_FILE_MESSAGES.proofRequired

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
      bankDetails: bankDetailsData,
    })
  }

  return (
    <div className="gst-amend-detail-container gst-amend-bank-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">Bank Accounts</h1>
        <p className="gst-amend-detail-subtitle">Current details are read-only</p>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
        {/* Card 1: Currently registered (read-only) */}
        <div className="gst-amend-card-box">
          <h3 className="gst-amend-card-box__title">Currently registered (read-only)</h3>
          <div className="gst-amend-bank-readonly-grid">
            <div className="gst-amend-bank-readonly-col">
              <span className="gst-amend-readonly-label">Bank Name</span>
              <span className="gst-amend-readonly-value">{currentDetails.bankName}</span>
            </div>
            <div className="gst-amend-bank-readonly-col">
              <span className="gst-amend-readonly-label">IFSC Code</span>
              <span className="gst-amend-readonly-value">{currentDetails.ifscCode}</span>
            </div>
            <div className="gst-amend-bank-readonly-col">
              <span className="gst-amend-readonly-label">Account Number</span>
              <span className="gst-amend-readonly-value">{currentDetails.accountNumber}</span>
            </div>
            <div className="gst-amend-bank-readonly-col">
              <span className="gst-amend-readonly-label">Account Type</span>
              <span className="gst-amend-readonly-value">{currentDetails.accountType}</span>
            </div>
          </div>
        </div>

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

        {/* Card 3: Supporting proof with embedded orange Accepted proofs banner */}
        <div className="gst-amend-bank-proof-wrapper">
          <GSTAmendmentProofUpload
            selectedFile={selectedFile}
            error={errors.file}
            onFileChange={handleFileChange}
            onRemoveFile={(e) => {
              e.stopPropagation()
              setSelectedFile(null)
            }}
          />

          {/* Embedded Orange Accepted Proofs Banner inside Card 3 */}
          <div className="gst-amend-bank-accepted-proofs-banner">
            <div className="gst-amend-bank-banner-header">
              <div className="gst-amend-bank-banner-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <span className="gst-amend-bank-banner-title">Accepted proofs</span>
            </div>
            <p className="gst-amend-bank-banner-desc">
              Bank Statement, First Page of Passbook, Cancelled Cheque, Recent Bank Account Statement (last 3 months), Bank Account Certificate issued by Bank, Letter from Bank confirming account details
            </p>
          </div>
        </div>

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

          <div className="gst-actions-group">
            {onSaveDraft && <GSTSaveDraftButton onClick={onSaveDraft} />}
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
          </div>
        </div>
      </form>
    </div>
  )
}

export default GSTBankAccountsForm
