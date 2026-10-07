import React from 'react'
import type {
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  IncomeCorrectionOriginals,
} from '@modules/itr/types/revisedItr.types'
import { RevisionAmountCard } from '../RevisionAmountCard'
import '../Step3CorrectionBase.css'

interface OtherCorrectionStep3Props {
  otherReasonText?: string
  incomeCorrections: IncomeCorrectionState
  deductionCorrections: DeductionCorrectionState
  bankCorrections: BankCorrectionState
  originalAmounts: IncomeCorrectionOriginals
  salaryError?: string | null
  taxableError?: string | null
  bankAccountError?: string | null
  ifscError?: string | null
  onChange: (field: keyof IncomeCorrectionState, val: string) => void
  onDeductionChange: (field: keyof DeductionCorrectionState, val: string) => void
  onBankChange: (field: keyof BankCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const OtherCorrectionStep3: React.FC<OtherCorrectionStep3Props> = ({
  otherReasonText,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
  originalAmounts,
  salaryError,
  taxableError,
  bankAccountError,
  ifscError,
  onChange,
  onDeductionChange,
  onBankChange,
  onKeyDown,
}) => {
  return (
    <div className="step3-update-income-details">
      {/* Title & Subtitle */}
      <div className="step3-title-wrap">
        <h2 className="step3-main-heading">Update only what changed</h2>
        <p className="step3-sub-heading">Edit only the figures that need correcting.</p>
      </div>

      {/* Reason Pill */}
      <div className="step3-other-reason-pill">
        <span className="other-reason-prefix">Reason:</span> {otherReasonText || 'Other'}
      </div>

      {/* Cards List */}
      <div className="step3-cards-list">
        {/* 1. Income Correction */}
        <h3 className="step3-category-title">Income Correction</h3>

        <RevisionAmountCard
          id="salary-income"
          title="Salary / Business income"
          isRequired={true}
          originalAmount={originalAmounts.salaryOriginal}
          revisedValue={incomeCorrections.salaryIncome}
          placeholder="Enter revised income"
          error={salaryError}
          onChange={(val) => onChange('salaryIncome', val)}
          onKeyDown={onKeyDown}
        />

        <RevisionAmountCard
          id="other-income"
          title="Other income"
          isRequired={false}
          originalAmount={originalAmounts.otherOriginal}
          revisedValue={incomeCorrections.otherIncome}
          placeholder="Enter revised income"
          onChange={(val) => onChange('otherIncome', val)}
          onKeyDown={onKeyDown}
        />

        {/* 2. Deduction Correction */}
        <h3 className="step3-category-title step3-section-spacing">Deduction Correction</h3>

        <RevisionAmountCard
          id="section-80c"
          title="80C deduction"
          isRequired={false}
          originalAmount={0}
          revisedValue={deductionCorrections.section80c}
          placeholder="Enter amount"
          onChange={(val) => onDeductionChange('section80c', val)}
          onKeyDown={onKeyDown}
        />

        <RevisionAmountCard
          id="section-80d"
          title="80D deduction"
          isRequired={false}
          originalAmount={0}
          revisedValue={deductionCorrections.section80d}
          placeholder="Enter amount"
          onChange={(val) => onDeductionChange('section80d', val)}
          onKeyDown={onKeyDown}
        />

        <RevisionAmountCard
          id="home-loan-interest"
          title="Home loan interest"
          isRequired={false}
          originalAmount={0}
          revisedValue={deductionCorrections.homeLoanInterest}
          placeholder="Enter amount"
          onChange={(val) => onDeductionChange('homeLoanInterest', val)}
          onKeyDown={onKeyDown}
        />

        {/* 3. Bank Details Correction */}
        <h3 className="step3-category-title step3-section-spacing">Bank Details Correction</h3>

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

        {/* Taxable income */}
        <RevisionAmountCard
          id="taxable-income"
          title="Taxable income"
          isRequired={true}
          originalAmount={originalAmounts.taxableOriginal}
          revisedValue={incomeCorrections.taxableIncome}
          placeholder="Enter taxable income"
          error={taxableError}
          onChange={(val) => onChange('taxableIncome', val)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}
