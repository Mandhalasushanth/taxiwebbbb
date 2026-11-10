import React, { useState } from 'react'
import {
  BankCardIcon,
  PlusCircleIcon,
  type FilingBankAccount,
} from '../itrFiling.constants'
import { isValidIfsc, validateBankName, validateBranch } from '@shared/utils/validationUtils'
import './ItrRefundBankSection.css'

export interface ItrRefundBankSectionProps {
  bankAccounts: FilingBankAccount[]
  onBankAccountsChange: (accounts: FilingBankAccount[]) => void
  selectedBankId: string
  onSelectedBankIdChange: (id: string) => void
  error?: string | null
}

interface BankFieldErrors {
  bankName?: string
  branch?: string
  ifsc?: string
  accountNumber?: string
}

const GreenCheckCircleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#10b981" />
    <path d="m8.5 12 2.5 2.5 5-5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const CheckBadgeCircleIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="#15803d" />
    <path d="M5 8.2l2 2 4-4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const PencilIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

const CloseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export const ItrRefundBankSection: React.FC<ItrRefundBankSectionProps> = ({
  bankAccounts,
  onBankAccountsChange,
  selectedBankId,
  onSelectedBankIdChange,
  error,
}) => {
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [editingBankId, setEditingBankId] = useState<string | null>(null)
  const [newBankName, setNewBankName] = useState('')
  const [newBranch, setNewBranch] = useState('')
  const [newIfsc, setNewIfsc] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<BankFieldErrors>({})
  const [isIfscValid, setIsIfscValid] = useState(false)

  const handleBankSelect = (id: string) => {
    onSelectedBankIdChange(id)
  }

  const handleEditBank = (acc: FilingBankAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setNewBankName(acc.bankName)
    setNewBranch(acc.branch || '')
    setNewIfsc(acc.ifsc)
    const fullAcc =
      acc.rawAccountNumber ||
      acc.fullAccountNumber ||
      (acc.accountNumber.includes('•') ? '' : acc.accountNumber.replace(/\D/g, '')) ||
      acc.accountNumber.replace(/\D/g, '')
    setNewAccountNumber(fullAcc)
    setIsIfscValid(isValidIfsc(acc.ifsc))
    setEditingBankId(acc.id)
    setIsAddingBank(true)
  }

  const handleBankNameChange = (val: string) => {
    const cleaned = val
      .replace(/[^A-Za-z\s.&'-]/g, '')
      .replace(/^[ \s.&'-]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/([.&'-])\1+/g, '$1')
      .replace(/[.&'-]\s*[.&'-]+/g, (m) => m[0])
      .slice(0, 100)
    setNewBankName(cleaned)
    setFieldErrors((prev) => ({ ...prev, bankName: undefined }))
  }

  const handleBranchChange = (val: string) => {
    const cleaned = val
      .replace(/[^A-Za-z0-9\s.,\/-]/g, '')
      .replace(/^[ \s.,\/-]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/([.,\/-])\1+/g, '$1')
      .replace(/[.,\/-]\s*[.,\/-]+/g, (m) => m[0])
      .slice(0, 60)
    setNewBranch(cleaned)
    setFieldErrors((prev) => ({ ...prev, branch: undefined }))
  }

  const handleIfscChange = (val: string) => {
    const raw = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
    setNewIfsc(raw)
    setFieldErrors((prev) => ({ ...prev, ifsc: undefined }))

    if (raw.length === 11 && isValidIfsc(raw)) {
      setIsIfscValid(true)
    } else {
      setIsIfscValid(false)
    }
  }

  const handleAccountNumberChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 18)
    setNewAccountNumber(numeric)
    setFieldErrors((prev) => ({ ...prev, accountNumber: undefined }))
  }

  const resetForm = () => {
    setNewBankName('')
    setNewBranch('')
    setNewIfsc('')
    setNewAccountNumber('')
    setIsIfscValid(false)
    setFieldErrors({})
    setEditingBankId(null)
    setIsAddingBank(false)
  }

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: BankFieldErrors = {}

    if (!newBankName.trim()) {
      errors.bankName = 'Bank name is required'
    } else {
      const bankErr = validateBankName(newBankName)
      if (bankErr) errors.bankName = bankErr
    }

    if (newBranch.trim()) {
      const branchErr = validateBranch(newBranch, { required: false })
      if (branchErr) errors.branch = branchErr
    }

    const cleanIfsc = newIfsc.trim().toUpperCase()
    if (!cleanIfsc) {
      errors.ifsc = 'IFSC code is required'
    } else if (!isValidIfsc(cleanIfsc)) {
      errors.ifsc = 'Please enter a valid 11-digit IFSC code (e.g. SBIN0001234)'
    }

    const cleanAcc = newAccountNumber.trim()
    if (!cleanAcc) {
      errors.accountNumber = 'Bank account number is required'
    } else if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      errors.accountNumber = 'Enter a valid 9 to 18 digit bank account number'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const maskedAcc = `•••• •••• ${cleanAcc.slice(-4)}`

    if (editingBankId) {
      const updatedList = bankAccounts.map((b) => {
        if (b.id !== editingBankId) return b
        return {
          ...b,
          bankName: newBankName.trim(),
          branch: newBranch.trim() || undefined,
          accountNumber: maskedAcc,
          rawAccountNumber: cleanAcc,
          fullAccountNumber: cleanAcc,
          ifsc: cleanIfsc,
          isPreValidated: true,
        }
      })
      onBankAccountsChange(updatedList)
      resetForm()
      return
    }

    const createdBank: FilingBankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      branch: newBranch.trim() || undefined,
      accountNumber: maskedAcc,
      rawAccountNumber: cleanAcc,
      fullAccountNumber: cleanAcc,
      ifsc: cleanIfsc,
      accountType: 'savings',
      isPrimary: bankAccounts.length === 0,
      isPreValidated: true,
    }

    const updatedList = [...bankAccounts, createdBank]
    onBankAccountsChange(updatedList)
    onSelectedBankIdChange(createdBank.id)
    resetForm()
  }

  return (
    <section
      className={`itr-info-card ${error ? 'itr-info-card--error' : ''}`}
      id="itr-refund-bank-section"
      data-section="bank"
      aria-labelledby="bank-account-heading"
    >
      <div className="itr-info-card__title-row">
        <div className="itr-info-card__icon-wrap">
          <BankCardIcon size={20} />
        </div>
        <h2 id="bank-account-heading" className="itr-info-card__title">
          Refund Bank Account
        </h2>
      </div>

      <p className="itr-info-card__desc">
        Select the bank account to receive direct tax refund credit from the Income Tax Department.
      </p>

      {bankAccounts.length === 0 ? (
        !isAddingBank && (
          <div className="itr-bank-empty-box">
            No bank accounts added yet. Please add a bank account for refund credit.
          </div>
        )
      ) : !editingBankId ? (
        <div className="itr-bank-accounts-grid">
          {bankAccounts.map((acc) => {
            const isChecked = selectedBankId === acc.id
            return (
              <div
                key={acc.id}
                className={`itr-bank-account-card ${isChecked ? 'itr-bank-account-card--selected' : ''}`}
                onClick={() => handleBankSelect(acc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleBankSelect(acc.id)
                  }
                }}
              >
                <div className="itr-bank-card-main-row">
                  <span className={`itr-custom-radio ${isChecked ? 'itr-custom-radio--checked' : ''}`} />

                  <div className="itr-bank-card-content">
                    <div className="itr-bank-card-title-row">
                      <strong className="itr-bank-name">{acc.bankName}</strong>
                      <span className="itr-bank-badge-pill itr-bank-badge-validated">
                        <CheckBadgeCircleIcon size={14} />
                        <span>Validated</span>
                      </span>
                    </div>

                    <div className="itr-bank-account-number itr-mono">
                      {acc.accountNumber}
                    </div>

                    <div className="itr-bank-ifsc-row">
                      IFSC: {acc.ifsc}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="itr-bank-edit-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditBank(acc, e)
                    }}
                    aria-label={`Edit ${acc.bankName} details`}
                    title="Edit Bank Details"
                  >
                    <PencilIcon size={18} />
                  </button>
                </div>

                <input
                  type="radio"
                  name="selectedBank"
                  value={acc.id}
                  checked={isChecked}
                  onChange={() => handleBankSelect(acc.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="itr-sr-only"
                />
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Add Bank Account Form */}
      {!isAddingBank ? (
        <div className="itr-add-bank-row">
          <button
            type="button"
            className="itr-btn-add-bank"
            onClick={() => setIsAddingBank(true)}
          >
            <PlusCircleIcon size={18} />
            <span>Add Another Bank Account</span>
          </button>
        </div>
      ) : (
        <form className="itr-add-bank-form" onSubmit={handleSaveBank} noValidate>
          <div className="itr-add-bank-header">
            <div className="itr-add-bank-header-title-row">
              <BankCardIcon size={20} className="itr-add-bank-header-icon" />
              <h3 className="itr-add-bank-title">{editingBankId ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
            </div>
            <button
              type="button"
              className="itr-add-bank-close-btn"
              onClick={resetForm}
              aria-label="Close add bank account form"
              title="Close"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <p className="itr-add-bank-subtitle">
            Enter bank details for receiving your direct income tax refund from CPC Bengaluru.
          </p>

          <div className="itr-bank-inputs-column">
            {/* 1. Bank Name */}
            <div className="itr-input-group">
              <label htmlFor="new-bank-name" className="itr-input-label">
                <span>Bank Name</span>
                <span className="itr-req-star">*</span>
              </label>
              <input
                id="new-bank-name"
                type="text"
                className={`itr-text-input ${fieldErrors.bankName ? 'itr-text-input--error' : ''}`}
                placeholder="e.g. State Bank of India or HDFC Bank"
                value={newBankName}
                onChange={(e) => handleBankNameChange(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.bankName)}
                aria-describedby={fieldErrors.bankName ? 'new-bank-name-error' : undefined}
              />
              {fieldErrors.bankName && (
                <span id="new-bank-name-error" className="itr-field-error-text" role="alert">
                  {fieldErrors.bankName}
                </span>
              )}
            </div>

            {/* 2. Branch Name (Optional) */}
            <div className="itr-input-group">
              <label htmlFor="new-branch-name" className="itr-input-label">
                <span>Branch Name (Optional)</span>
              </label>
              <input
                id="new-branch-name"
                type="text"
                className={`itr-text-input ${fieldErrors.branch ? 'itr-text-input--error' : ''}`}
                placeholder="e.g. Indiranagar Branch"
                value={newBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.branch)}
                aria-describedby={fieldErrors.branch ? 'new-branch-name-error' : undefined}
              />
              {fieldErrors.branch && (
                <span id="new-branch-name-error" className="itr-field-error-text" role="alert">
                  {fieldErrors.branch}
                </span>
              )}
            </div>

            {/* 3. IFSC Code */}
            <div className="itr-input-group">
              <label htmlFor="new-ifsc" className="itr-input-label">
                <span>IFSC Code</span>
                <span className="itr-req-star">*</span>
              </label>
              <div className="itr-input-wrap">
                <input
                  id="new-ifsc"
                  type="text"
                  className={`itr-text-input itr-mono ${fieldErrors.ifsc ? 'itr-text-input--error' : ''} ${isIfscValid && !fieldErrors.ifsc ? 'itr-text-input--valid' : ''}`}
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  value={newIfsc}
                  onChange={(e) => handleIfscChange(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.ifsc)}
                  aria-describedby={fieldErrors.ifsc ? 'new-ifsc-error' : undefined}
                />
                {isIfscValid && !fieldErrors.ifsc && (
                  <span className="itr-input-icon-valid" aria-label="Valid IFSC">
                    <GreenCheckCircleIcon size={20} />
                  </span>
                )}
              </div>
              {fieldErrors.ifsc && (
                <span id="new-ifsc-error" className="itr-field-error-text" role="alert">
                  {fieldErrors.ifsc}
                </span>
              )}
            </div>

            {/* 4. Account Number */}
            <div className="itr-input-group">
              <label htmlFor="new-account-number" className="itr-input-label">
                <span>Account Number</span>
                <span className="itr-req-star">*</span>
              </label>
              <input
                id="new-account-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={18}
                className={`itr-text-input itr-mono ${fieldErrors.accountNumber ? 'itr-text-input--error' : ''}`}
                placeholder="Enter 9 to 18 digit account number"
                value={newAccountNumber}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.accountNumber)}
                aria-describedby={fieldErrors.accountNumber ? 'new-acc-error' : undefined}
              />
              {fieldErrors.accountNumber && (
                <span id="new-acc-error" className="itr-field-error-text" role="alert">
                  {fieldErrors.accountNumber}
                </span>
              )}
            </div>
          </div>

          <div className="itr-add-bank-actions">
            <button type="submit" className="itr-btn-save-validate">
              Save & Validate Account
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="itr-field-error" role="alert">
          <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}

export default ItrRefundBankSection
