import React, { useState } from 'react'
import {
  BankCardIcon,
  PlusCircleIcon,
  type FilingBankAccount,
} from '../itrFiling.constants'
import { isValidIfsc } from '@shared/utils/validationUtils'
import './ItrRefundBankSection.css'

export interface ItrRefundBankSectionProps {
  bankAccounts: FilingBankAccount[]
  onBankAccountsChange: (accounts: FilingBankAccount[]) => void
  selectedBankId: string
  onSelectedBankIdChange: (id: string) => void
  error?: string | null
}

export const ItrRefundBankSection: React.FC<ItrRefundBankSectionProps> = ({
  bankAccounts,
  onBankAccountsChange,
  selectedBankId,
  onSelectedBankIdChange,
  error,
}) => {
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [newIfsc, setNewIfsc] = useState('')
  const [bankFormError, setBankFormError] = useState<string | null>(null)

  const handleBankSelect = (id: string) => {
    onSelectedBankIdChange(id)
  }

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBankName.trim()) {
      setBankFormError('Bank name is required')
      return
    }
    if (!newAccountNumber.trim()) {
      setBankFormError('Bank account number is required')
      return
    }
    if (newAccountNumber.length < 9 || newAccountNumber.length > 18) {
      setBankFormError('Enter a valid bank account number')
      return
    }
    if (!newIfsc.trim()) {
      setBankFormError('IFSC code is required')
      return
    }
    if (!isValidIfsc(newIfsc)) {
      setBankFormError('Enter a valid IFSC code')
      return
    }

    const maskedAcc = `•••• •••• ${newAccountNumber.slice(-4)}`
    const createdBank: FilingBankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      accountNumber: maskedAcc,
      ifsc: newIfsc.trim().toUpperCase(),
      isPrimary: bankAccounts.length === 0,
      isPreValidated: true,
    }

    const updatedList = [...bankAccounts, createdBank]
    onBankAccountsChange(updatedList)
    onSelectedBankIdChange(createdBank.id)

    // Reset form
    setNewBankName('')
    setNewAccountNumber('')
    setNewIfsc('')
    setBankFormError(null)
    setIsAddingBank(false)
  }

  return (
    <section className={`itr-info-card ${error ? 'itr-info-card--error' : ''}`} aria-labelledby="bank-account-heading">
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
        <div className="itr-bank-empty-box">
          No bank accounts added yet. Please add a bank account for refund credit.
        </div>
      ) : (
        <div className="itr-bank-accounts-grid">
          {bankAccounts.map((acc) => {
            const isChecked = selectedBankId === acc.id
            return (
              <label
                key={acc.id}
                className={`itr-bank-account-card ${isChecked ? 'itr-bank-account-card--selected' : ''}`}
              >
                <div className="itr-bank-card-top">
                  <div className="itr-bank-card-header">
                    <span className={`itr-custom-radio ${isChecked ? 'itr-custom-radio--checked' : ''}`} />
                    <div className="itr-bank-title-box">
                      <strong className="itr-bank-name">{acc.bankName}</strong>
                      {acc.accountType && (
                        <span className="itr-bank-type">{acc.accountType.toUpperCase()} ACCOUNT</span>
                      )}
                    </div>
                  </div>
                  {acc.isPreValidated && (
                    <span className="itr-bank-badge-validated">✓ Pre-Validated for Refund</span>
                  )}
                </div>

                <div className="itr-bank-card-details">
                  <div className="itr-bank-field">
                    <span className="itr-bank-field-label">Account Number</span>
                    <strong className="itr-bank-field-val itr-mono">{acc.accountNumber}</strong>
                  </div>
                  <div className="itr-bank-field">
                    <span className="itr-bank-field-label">IFSC Code</span>
                    <strong className="itr-bank-field-val itr-mono">{acc.ifsc}</strong>
                  </div>
                </div>

                <input
                  type="radio"
                  name="selectedBank"
                  value={acc.id}
                  checked={isChecked}
                  onChange={() => handleBankSelect(acc.id)}
                  className="itr-sr-only"
                />
              </label>
            )
          })}
        </div>
      )}

      {/* Add Bank Account Accordion / Form */}
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
        <form className="itr-add-bank-form" onSubmit={handleSaveBank}>
          <h3 className="itr-add-bank-title">Refund Bank Account</h3>

          {bankFormError && (
            <div className="itr-bank-form-error" role="alert">
              {bankFormError}
            </div>
          )}

          <div className="itr-bank-inputs-grid">
            <div className="itr-input-group">
              <label htmlFor="new-bank-name" className="itr-input-label">
                Bank Name *
              </label>
              <input
                id="new-bank-name"
                type="text"
                className="itr-text-input"
                placeholder="Enter bank name"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
              />
            </div>

            <div className="itr-input-group">
              <label htmlFor="new-account-number" className="itr-input-label">
                Account Number *
              </label>
              <input
                id="new-account-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={18}
                className="itr-text-input itr-mono"
                placeholder="Enter your bank account number"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))}
              />
            </div>

            <div className="itr-input-group itr-input-group--full">
              <label htmlFor="new-ifsc" className="itr-input-label">
                IFSC Code *
              </label>
              <input
                id="new-ifsc"
                type="text"
                className="itr-text-input itr-mono"
                placeholder="Enter your IFSC code"
                maxLength={11}
                value={newIfsc}
                onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="itr-add-bank-actions">
            <button type="submit" className="itr-btn-save-bank">
              Save Bank Account
            </button>
            <button
              type="button"
              className="itr-btn-cancel-bank"
              onClick={() => {
                setIsAddingBank(false)
                setBankFormError(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && (
        <div className="itr-field-error" role="alert">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}
