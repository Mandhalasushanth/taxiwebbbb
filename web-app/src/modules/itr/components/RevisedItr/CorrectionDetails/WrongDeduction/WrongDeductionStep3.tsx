import React from 'react'
import type {
  DeductionCorrectionState,
  IncomeCorrectionOriginals,
} from '../../../../types/revisedItr.types'
import { RevisionAmountCard } from '../RevisionAmountCard'
import '../Step3CorrectionBase.css'

interface WrongDeductionStep3Props {
  deductionCorrections: DeductionCorrectionState
  originalAmounts: IncomeCorrectionOriginals
  taxableError?: string | null
  onDeductionChange: (field: keyof DeductionCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const WrongDeductionStep3: React.FC<WrongDeductionStep3Props> = ({
  deductionCorrections,
  originalAmounts,
  taxableError,
  onDeductionChange,
  onKeyDown,
}) => {
  return (
    <div className="step3-update-income-details">
      <div className="step3-title-wrap">
        <h2 className="step3-main-heading">Update only what changed</h2>
        <p className="step3-sub-heading">Edit only the figures that need correcting.</p>
      </div>

      <h3 className="step3-category-title">Deduction Correction</h3>

      <div className="step3-cards-list">
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

        <RevisionAmountCard
          id="taxable-income"
          title="Taxable income"
          isRequired={true}
          originalAmount={originalAmounts.taxableOriginal}
          revisedValue={deductionCorrections.taxableIncome}
          placeholder="Enter taxable income"
          error={taxableError}
          onChange={(val) => onDeductionChange('taxableIncome', val)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}
