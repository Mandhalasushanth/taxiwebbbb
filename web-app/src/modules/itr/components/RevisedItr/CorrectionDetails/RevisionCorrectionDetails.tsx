import React from 'react'
import type {
  RevisionReasonKey,
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  IncomeCorrectionOriginals,
} from '@modules/itr/types/revisedItr.types'
import { calculateIncomeChange } from '@modules/itr/validation/revisedItrValidation'
import './RevisionCorrectionDetails.css'

export interface RevisionAmountCardProps {
  id: string
  title: string
  isRequired?: boolean
  originalAmount: number
  revisedValue: string
  placeholder: string
  error?: string | null
  onChange: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const RevisionAmountCard: React.FC<RevisionAmountCardProps> = ({
  id,
  title,
  isRequired = false,
  originalAmount,
  revisedValue,
  placeholder,
  error,
  onChange,
  onKeyDown,
}) => {
  const { changeText, tone } = calculateIncomeChange(originalAmount, revisedValue)
  const formattedOriginal =
    originalAmount > 0 ? `₹ ${new Intl.NumberFormat('en-IN').format(originalAmount)}` : '₹'

  return (
    <div className="revision-amount-card">
      <div className="correction-card-header">
        <span className="correction-card-title">
          {title} {isRequired && <span className="required-star">*</span>}
        </span>
      </div>

      <div className="correction-original-row">
        <span className="original-label">Original</span>
        <span className="original-value">{formattedOriginal}</span>
      </div>

      <div className="correction-input-group">
        <label htmlFor={id} className="revised-label">Revised</label>
        <div className="input-field-wrap">
          <span className="input-currency-prefix">₹</span>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            className={`correction-input ${error ? 'input-error' : ''}`}
            value={revisedValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        {error && <span className="correction-field-error">{error}</span>}
      </div>

      <div className="correction-change-row">
        <span className="change-label">Change</span>
        <span className={`change-value ${tone}`}>{changeText}</span>
      </div>
    </div>
  )
}

export interface RevisionCorrectionDetailsProps {
  selectedReason: RevisionReasonKey | null
  otherReasonText?: string
  incomeCorrections: IncomeCorrectionState
  deductionCorrections: DeductionCorrectionState
  bankCorrections: BankCorrectionState
  originalAmounts: IncomeCorrectionOriginals
  salaryError?: string | null
  taxableError?: string | null
  bankAccountError?: string | null
  ifscError?: string | null
  onIncomeChange: (field: keyof IncomeCorrectionState, val: string) => void
  onDeductionChange: (field: keyof DeductionCorrectionState, val: string) => void
  onBankChange: (field: keyof BankCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const DEDUCTION_CARD_CONFIGS: Array<{ id: string; title: string; field: keyof DeductionCorrectionState }> = [
  { id: 'section-80c', title: '80C deduction', field: 'section80c' },
  { id: 'section-80d', title: '80D deduction', field: 'section80d' },
  { id: 'home-loan-interest', title: 'Home loan interest', field: 'homeLoanInterest' },
]

export const RevisionCorrectionDetails: React.FC<RevisionCorrectionDetailsProps> = ({
  selectedReason,
  otherReasonText,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
  originalAmounts,
  salaryError,
  taxableError,
  bankAccountError,
  ifscError,
  onIncomeChange,
  onDeductionChange,
  onBankChange,
  onKeyDown,
}) => {
  const renderIncomeCards = () => (
    <>
      <RevisionAmountCard
        id="salary-income"
        title="Salary / Business income"
        isRequired
        originalAmount={originalAmounts.salaryOriginal}
        revisedValue={incomeCorrections.salaryIncome}
        placeholder="Enter revised income"
        error={salaryError}
        onChange={(val) => onIncomeChange('salaryIncome', val)}
        onKeyDown={onKeyDown}
      />
      <RevisionAmountCard
        id="other-income"
        title="Other income"
        originalAmount={originalAmounts.otherOriginal}
        revisedValue={incomeCorrections.otherIncome}
        placeholder="Enter revised income"
        onChange={(val) => onIncomeChange('otherIncome', val)}
        onKeyDown={onKeyDown}
      />
    </>
  )

  const renderDeductionCards = () => (
    <>
      {DEDUCTION_CARD_CONFIGS.map((cfg) => (
        <RevisionAmountCard
          key={cfg.id}
          id={cfg.id}
          title={cfg.title}
          originalAmount={0}
          revisedValue={deductionCorrections[cfg.field]}
          placeholder="Enter amount"
          onChange={(val) => onDeductionChange(cfg.field, val)}
          onKeyDown={onKeyDown}
        />
      ))}
    </>
  )

  const renderBankCards = () => (
    <>
      <div className="bank-correction-card">
        <label className="bank-correction-label" htmlFor="bank-account-number">
          Bank account for refund <span className="required-star">*</span>
        </label>
        <input
          id="bank-account-number"
          type="text"
          inputMode="numeric"
          placeholder="Enter your bank account number"
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
          placeholder="Enter your IFSC code"
          className={`bank-correction-input bank-correction-input--uppercase ${ifscError ? 'input-error' : ''}`}
          value={bankCorrections.ifsc}
          maxLength={11}
          onChange={(e) => onBankChange('ifsc', e.target.value.toUpperCase())}
        />
        {ifscError && <span className="correction-field-error">{ifscError}</span>}
      </div>
    </>
  )

  const renderTaxableIncomeCard = (revisedValue: string, onChangeFn: (val: string) => void) => (
    <RevisionAmountCard
      id="taxable-income"
      title="Taxable income"
      isRequired
      originalAmount={originalAmounts.taxableOriginal}
      revisedValue={revisedValue}
      placeholder="Enter taxable income"
      error={taxableError}
      onChange={onChangeFn}
      onKeyDown={onKeyDown}
    />
  )

  const correctionViewByReason: Record<string, () => React.ReactNode> = {
    wrong_deduction: () => (
      <>
        <h3 className="step3-category-title">Deduction Correction</h3>
        <div className="step3-cards-list">
          {renderDeductionCards()}
          {renderTaxableIncomeCard(deductionCorrections.taxableIncome, (val) => onDeductionChange('taxableIncome', val))}
        </div>
      </>
    ),
    incorrect_bank: () => (
      <>
        <h3 className="step3-category-title">Bank Details Correction</h3>
        <div className="step3-cards-list">{renderBankCards()}</div>
      </>
    ),
    other: () => (
      <>
        <div className="step3-other-reason-pill">
          <span className="other-reason-prefix">Reason:</span> {otherReasonText || 'Other'}
        </div>
        <div className="step3-cards-list">
          <h3 className="step3-category-title">Income Correction</h3>
          {renderIncomeCards()}
          <h3 className="step3-category-title step3-section-spacing">Deduction Correction</h3>
          {renderDeductionCards()}
          <h3 className="step3-category-title step3-section-spacing">Bank Details Correction</h3>
          {renderBankCards()}
          {renderTaxableIncomeCard(incomeCorrections.taxableIncome, (val) => onIncomeChange('taxableIncome', val))}
        </div>
      </>
    ),
    missed_income: () => (
      <>
        <h3 className="step3-category-title">Income Correction</h3>
        <div className="step3-cards-list">
          {renderIncomeCards()}
          {renderTaxableIncomeCard(incomeCorrections.taxableIncome, (val) => onIncomeChange('taxableIncome', val))}
        </div>
      </>
    ),
  }

  const renderReasonSpecificContent = () => {
    try {
      const renderFn = correctionViewByReason[selectedReason || 'missed_income'] || correctionViewByReason.missed_income
      return renderFn()
    } catch {
      return correctionViewByReason.missed_income()
    }
  }

  return (
    <div className="step3-update-income-details">
      <div className="step3-title-wrap">
        <h2 className="step3-main-heading">Update only what changed</h2>
        <p className="step3-sub-heading">Edit only the figures that need correcting.</p>
      </div>
      {renderReasonSpecificContent()}
    </div>
  )
}
