import React from 'react'
import type {
  RevisionReasonKey,
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  IncomeCorrectionOriginals,
} from '@modules/itr/types/revisedItr.types'
import { CaretInput, FieldInfoTooltip } from '@shared/components'
import { Banknote, FileText, Building2 } from 'lucide-react'
import './RevisionCorrectionDetails.css'

export { RevisionAmountCard } from './RevisionAmountCard'

export interface RevisionCorrectionDetailsProps {
  selectedReason: RevisionReasonKey | null
  otherReasonText?: string
  incomeCorrections: IncomeCorrectionState
  deductionCorrections: DeductionCorrectionState
  bankCorrections: BankCorrectionState
  originalAmounts?: IncomeCorrectionOriginals
  salaryError?: string | null
  taxableError?: string | null
  bankAccountError?: string | null
  ifscError?: string | null
  onIncomeChange: (field: keyof IncomeCorrectionState, val: string) => void
  onDeductionChange: (field: keyof DeductionCorrectionState, val: string) => void
  onBankChange: (field: keyof BankCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const RevisionCorrectionDetails: React.FC<RevisionCorrectionDetailsProps> = ({
  selectedReason,
  otherReasonText,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
  salaryError,
  taxableError,
  bankAccountError,
  ifscError,
  onIncomeChange,
  onDeductionChange,
  onBankChange,
  onKeyDown,
}) => {
  const renderIncomeCard = () => (
    <div className="step3-section-card" id="revised-step3-income-card">
      <div className="step3-card-header">
        <div className="step3-card-title-row">
          <Banknote size={20} className="step3-card-icon" aria-hidden="true" />
          <h3 className="step3-card-title">Income Correction</h3>
          <FieldInfoTooltip
            title="Income Correction Information"
            description="Update the corrected income amounts for this assessment year."
          />
        </div>
        <p className="step3-card-desc">
          Update the corrected income amounts for this assessment year.
        </p>
      </div>

      <div className="step3-card-body">
        {/* Salary / Business Income * */}
        <div className="step3-form-field">
          <label htmlFor="salary-income" className="field-label">
            Salary / Business Income <span className="required-star">*</span>
          </label>
          <CaretInput
            id="salary-income"
            type="text"
            inputMode="numeric"
            placeholder="Enter revised income"
            className={`step3-text-input ${salaryError ? 'input-error' : ''}`}
            value={incomeCorrections.salaryIncome}
            onChange={(e) => onIncomeChange('salaryIncome', e.target.value)}
            onKeyDown={onKeyDown}
          />
          {salaryError && <span className="field-error-text">{salaryError}</span>}
        </div>

        {/* Taxable Income * */}
        <div className="step3-form-field">
          <label htmlFor="taxable-income" className="field-label">
            Taxable Income <span className="required-star">*</span>
          </label>
          <CaretInput
            id="taxable-income"
            type="text"
            inputMode="numeric"
            placeholder="Enter taxable income"
            className={`step3-text-input ${taxableError ? 'input-error' : ''}`}
            value={incomeCorrections.taxableIncome}
            onChange={(e) => onIncomeChange('taxableIncome', e.target.value)}
            onKeyDown={onKeyDown}
          />
          {taxableError && <span className="field-error-text">{taxableError}</span>}
        </div>

        {/* Other Income */}
        <div className="step3-form-field">
          <label htmlFor="other-income" className="field-label">
            Other Income
          </label>
          <p className="field-helper-text">
            Includes interest from savings/FD, dividend income, capital gains, gifts, or freelance income.
          </p>
          <CaretInput
            id="other-income"
            type="text"
            inputMode="numeric"
            placeholder="Enter revised other income"
            className="step3-text-input"
            value={incomeCorrections.otherIncome}
            onChange={(e) => onIncomeChange('otherIncome', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  )

  const renderDeductionCard = () => (
    <div className="step3-section-card" id="revised-step3-deduction-card">
      <div className="step3-card-header">
        <div className="step3-card-title-row">
          <FileText size={20} className="step3-card-icon" aria-hidden="true" />
          <h3 className="step3-card-title">Deduction Correction</h3>
          <FieldInfoTooltip
            title="Deduction Correction Information"
            description="Enter the revised eligible deduction amounts under Chapter VI-A and Section 24."
          />
        </div>
        <p className="step3-card-desc">
          Enter the revised eligible deduction amounts under Chapter VI-A and Section 24.
        </p>
      </div>

      <div className="step3-card-body">
        {/* 80C deduction */}
        <div className="step3-form-field">
          <div className="field-label-row">
            <label htmlFor="section-80c" className="field-label">
              80C deduction
            </label>
            <FieldInfoTooltip
              title="80C Deduction Information"
              description="Deductions eligible under Section 80C up to ₹1,50,000 (PPF, ELSS, EPF, Life Insurance, etc.)."
            />
          </div>
          <CaretInput
            id="section-80c"
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            className="step3-text-input"
            value={deductionCorrections.section80c}
            onChange={(e) => onDeductionChange('section80c', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* 80D deduction */}
        <div className="step3-form-field">
          <div className="field-label-row">
            <label htmlFor="section-80d" className="field-label">
              80D deduction
            </label>
            <FieldInfoTooltip
              title="80D Deduction Information"
              description="Deductions for medical insurance premiums paid for self, family, and senior citizen parents under Section 80D."
            />
          </div>
          <CaretInput
            id="section-80d"
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            className="step3-text-input"
            value={deductionCorrections.section80d}
            onChange={(e) => onDeductionChange('section80d', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Home loan interest */}
        <div className="step3-form-field">
          <div className="field-label-row">
            <label htmlFor="home-loan-interest" className="field-label">
              Home loan interest
            </label>
            <FieldInfoTooltip
              title="Home Loan Interest Information"
              description="Interest paid on housing loan for self-occupied or let-out property under Section 24(b)."
            />
          </div>
          <CaretInput
            id="home-loan-interest"
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            className="step3-text-input"
            value={deductionCorrections.homeLoanInterest}
            onChange={(e) => onDeductionChange('homeLoanInterest', e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Taxable Income * */}
        <div className="step3-form-field">
          <label htmlFor="taxable-income-deduction" className="field-label">
            Taxable Income <span className="required-star">*</span>
          </label>
          <CaretInput
            id="taxable-income-deduction"
            type="text"
            inputMode="numeric"
            placeholder="Enter taxable income"
            className={`step3-text-input ${taxableError ? 'input-error' : ''}`}
            value={deductionCorrections.taxableIncome}
            onChange={(e) => onDeductionChange('taxableIncome', e.target.value)}
            onKeyDown={onKeyDown}
          />
          {taxableError && <span className="field-error-text">{taxableError}</span>}
        </div>
      </div>
    </div>
  )

  const renderBankCard = () => (
    <div className="step3-section-card" id="revised-step3-bank-card">
      <div className="step3-card-header">
        <div className="step3-card-title-row">
          <Building2 size={20} className="step3-card-icon" aria-hidden="true" />
          <h3 className="step3-card-title">Bank Details Correction</h3>
          <FieldInfoTooltip
            title="Bank Details Correction Information"
            description="Provide the correct bank account details to receive your income tax refund."
          />
        </div>
        <p className="step3-card-desc">
          Provide the correct bank account details to receive your income tax refund.
        </p>
      </div>

      <div className="step3-card-body">
        {/* Bank account for refund * */}
        <div className="step3-form-field">
          <label htmlFor="bank-account-number" className="field-label">
            Bank account for refund <span className="required-star">*</span>
          </label>
          <CaretInput
            id="bank-account-number"
            type="text"
            inputMode="numeric"
            placeholder="Enter bank account number"
            className={`step3-text-input ${bankAccountError ? 'input-error' : ''}`}
            value={bankCorrections.accountNumber}
            maxLength={20}
            onChange={(e) => onBankChange('accountNumber', e.target.value)}
            onKeyDown={onKeyDown}
          />
          {bankAccountError && <span className="field-error-text">{bankAccountError}</span>}
        </div>

        {/* IFSC * */}
        <div className="step3-form-field">
          <label htmlFor="bank-ifsc-code" className="field-label">
            IFSC <span className="required-star">*</span>
          </label>
          <CaretInput
            id="bank-ifsc-code"
            type="text"
            placeholder="Enter 11-digit IFSC"
            className={`step3-text-input step3-input-uppercase ${ifscError ? 'input-error' : ''}`}
            value={bankCorrections.ifsc}
            maxLength={11}
            onChange={(e) => onBankChange('ifsc', e.target.value)}
            onKeyDown={onKeyDown}
          />
          {ifscError && <span className="field-error-text">{ifscError}</span>}
        </div>
      </div>
    </div>
  )

  const correctionViewByReason: Record<string, () => React.ReactNode> = {
    wrong_deduction: renderDeductionCard,
    incorrect_bank: renderBankCard,
    missed_income: renderIncomeCard,
    other: () => (
      <>
        <div className="step3-other-reason-pill">
          <span className="other-reason-prefix">Reason:</span> {otherReasonText || 'Other'}
        </div>
        <div className="step3-all-cards-wrap">
          {renderIncomeCard()}
          {renderDeductionCard()}
          {renderBankCard()}
        </div>
      </>
    ),
  }

  const renderReasonSpecificContent = () => {
    try {
      const renderFn =
        correctionViewByReason[selectedReason || 'missed_income'] ||
        correctionViewByReason.missed_income
      return renderFn()
    } catch {
      return correctionViewByReason.missed_income()
    }
  }

  return (
    <div
      className="step3-update-income-details"
      id="revised-step3-changes"
      data-section="revised-step3-changes"
    >
      <div className="step3-page-header">
        <h2 className="step3-heading">Update Revised Details</h2>
        <p className="step3-subheading">
          Enter the updated figures that require correction in your return.
        </p>
      </div>

      {renderReasonSpecificContent()}
    </div>
  )
}
