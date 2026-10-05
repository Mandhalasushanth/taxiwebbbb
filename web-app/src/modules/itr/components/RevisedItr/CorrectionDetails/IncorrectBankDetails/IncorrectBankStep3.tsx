import React from 'react'
import type { BankCorrectionState } from '../../../../types/revisedItr.types'
import '../Step3CorrectionBase.css'

interface IncorrectBankStep3Props {
  bankCorrections: BankCorrectionState
  bankAccountError?: string | null
  ifscError?: string | null
  onBankChange: (field: keyof BankCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const IncorrectBankStep3: React.FC<IncorrectBankStep3Props> = ({
  bankCorrections,
  bankAccountError,
  ifscError,
  onBankChange,
  onKeyDown,
}) => {
  return (
    <div className="step3-update-income-details">
      <div className="step3-title-wrap">
        <h2 className="step3-main-heading">Update only what changed</h2>
        <p className="step3-sub-heading">Edit only the figures that need correcting.</p>
      </div>

      <h3 className="step3-category-title">Bank Details Correction</h3>

      <div className="step3-cards-list">
        <div className="bank-correction-card">
          <label className="bank-correction-label" htmlFor="bank-account-number">
            Bank account for refund <span className="required-star">*</span>
          </label>
          <input
            id="bank-account-number"
            type="text"
            inputMode="numeric"
            placeholder="Enter bank account number"
            className={`bank-correction-input ${bankAccountError ? 'input-error' : ''}`}
            value={bankCorrections.accountNumber}
            onChange={(e) => onBankChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
            onKeyDown={onKeyDown}
          />
          {bankAccountError && <span className="correction-field-error">{bankAccountError}</span>}
        </div>

        <div className="bank-correction-card">
          <label className="bank-correction-label" htmlFor="bank-ifsc-code">
            IFSC <span className="required-star">*</span>
          </label>
          <input
            id="bank-ifsc-code"
            type="text"
            placeholder="Enter 11-digit IFSC"
            className={`bank-correction-input bank-correction-input--uppercase ${ifscError ? 'input-error' : ''}`}
            value={bankCorrections.ifsc}
            maxLength={11}
            onChange={(e) => onBankChange('ifsc', e.target.value.toUpperCase())}
          />
          {ifscError && <span className="correction-field-error">{ifscError}</span>}
        </div>
      </div>
    </div>
  )
}
