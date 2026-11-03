import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import { lookupSampleBankByIfsc } from '@shared/services'
import { ConfirmAccountNumberInput, CaretInput } from '@shared/components'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import { useAmendmentFileState } from '../hooks/useAmendmentFileState'
import { GSTCurrentPortalCard } from './GSTCurrentPortalCard'
import { GSTAmendmentActionBar } from './GSTAmendmentActionBar'
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
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleFileChange = (file: File) => {
    onFileChange(file)
    setErrors((prev) => ({ ...prev, file: '' }))
  }

  const [prevBankDetails, setPrevBankDetails] = useState(initialBankDetails)
  if (prevBankDetails !== initialBankDetails) {
    setPrevBankDetails(initialBankDetails)
    if (initialBankDetails) {
      if (initialBankDetails.bankName !== undefined) setBankName(initialBankDetails.bankName)
      if (initialBankDetails.accountNumber !== undefined) {
        setAccountNumber(initialBankDetails.accountNumber)
        setConfirmAccountNumber(initialBankDetails.accountNumber)
      }
      if (initialBankDetails.ifscCode !== undefined) setIfscCode(initialBankDetails.ifscCode)
      if (initialBankDetails.accountType !== undefined) setAccountType(initialBankDetails.accountType)
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
        <GSTCurrentPortalCard
          rows={[
            {
              label: 'Bank Name',
              value: _currentDetailsProp?.bankName && _currentDetailsProp.bankName !== '—' ? _currentDetailsProp.bankName : '-',
            },
            {
              label: 'Account Number',
              value: _currentDetailsProp?.accountNumber && _currentDetailsProp.accountNumber !== '—' ? _currentDetailsProp.accountNumber : '-',
            },
            {
              label: 'IFSC Code',
              value: _currentDetailsProp?.ifscCode && _currentDetailsProp.ifscCode !== '—' ? _currentDetailsProp.ifscCode : '-',
            },
          ]}
        />

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
                const val = gstInput.letters(e.target.value)
                setBankName(val)
                if (errors.bankName) {
                  const err = rules.bankName(val)
                  setErrors((prev) => ({ ...prev, bankName: err || '' }))
                }
              }}
              onBlur={() => {
                const err = rules.bankName(bankName)
                setErrors((prev) => ({ ...prev, bankName: err || '' }))
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
                const val = gstInput.accountNumber(e.target.value)
                setAccountNumber(val)
                if (errors.accountNumber) {
                  const err = rules.accountNumber(val)
                  setErrors((prev) => ({ ...prev, accountNumber: err || '' }))
                }
                if (confirmAccountNumber && errors.confirmAccountNumber) {
                  const cErr = rules.confirmAccountNumber(val, confirmAccountNumber)
                  setErrors((prev) => ({ ...prev, confirmAccountNumber: cErr || '' }))
                }
              }}
              onBlur={() => {
                const err = rules.accountNumber(accountNumber)
                setErrors((prev) => ({ ...prev, accountNumber: err || '' }))
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
                if (errors.confirmAccountNumber) {
                  const err = rules.confirmAccountNumber(accountNumber, val)
                  setErrors((prev) => ({ ...prev, confirmAccountNumber: err || '' }))
                }
              }}
              onBlur={() => {
                const err = rules.confirmAccountNumber(accountNumber, confirmAccountNumber)
                setErrors((prev) => ({ ...prev, confirmAccountNumber: err || '' }))
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
            <CaretInput
              id="ifsc-code-input"
              type="text"
              placeholder="Enter IFSC code"
              value={ifscCode}
              onChange={(e) => {
                const cleaned = gstInput.ifsc(e.target.value)
                setIfscCode(cleaned)
                if (errors.ifscCode) {
                  const err = rules.ifsc(cleaned)
                  setErrors((prev) => ({ ...prev, ifscCode: err || '' }))
                }
                if (cleaned.length >= 4) {
                  const match = lookupSampleBankByIfsc(cleaned)
                  if (match) {
                    setBankName(match.bankName)
                    if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: '' }))
                  }
                }
              }}
              onBlur={() => {
                const err = rules.ifsc(ifscCode)
                setErrors((prev) => ({ ...prev, ifscCode: err || '' }))
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
                  const val = e.target.value
                  setAccountType(val)
                  if (errors.accountType) setErrors((prev) => ({ ...prev, accountType: val ? '' : 'Please select account type.' }))
                }}
                onBlur={() => {
                  setErrors((prev) => ({ ...prev, accountType: accountType ? '' : 'Please select account type.' }))
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
        <div id="gst-amend-proof">
          <div className="gst-amend-section-heading">Supporting Proof</div>
          <GSTProofUpload
            selectedFile={selectedFile}
            existingFileName={!selectedFile ? effectiveFileName : undefined}
            existingFileSize={initialFileSize}
            error={errors.file}
            onFileSelect={handleFileChange}
            onRemoveFile={handleFileRemove}
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

        {/* Bottom Action Row (Left: Back, Right: Review Changes) */}
        <GSTAmendmentActionBar
          onBack={handleBackClick}
          onSaveDraft={
            onSaveDraft
              ? () => {
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

export default GSTBankAccountsForm
