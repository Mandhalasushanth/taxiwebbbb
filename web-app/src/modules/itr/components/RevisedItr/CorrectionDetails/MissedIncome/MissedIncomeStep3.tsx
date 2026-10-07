import React from 'react'
import type {
  IncomeCorrectionState,
  IncomeCorrectionOriginals,
} from '@modules/itr/types/revisedItr.types'
import { RevisionAmountCard } from '../RevisionAmountCard'
import '../Step3CorrectionBase.css'

interface MissedIncomeStep3Props {
  incomeCorrections: IncomeCorrectionState
  originalAmounts: IncomeCorrectionOriginals
  salaryError?: string | null
  taxableError?: string | null
  onChange: (field: keyof IncomeCorrectionState, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const MissedIncomeStep3: React.FC<MissedIncomeStep3Props> = ({
  incomeCorrections,
  originalAmounts,
  salaryError,
  taxableError,
  onChange,
  onKeyDown,
}) => {
  return (
    <div className="step3-update-income-details">
      <div className="step3-title-wrap">
        <h2 className="step3-main-heading">Update only what changed</h2>
        <p className="step3-sub-heading">Edit only the figures that need correcting.</p>
      </div>

      <h3 className="step3-category-title">Income Correction</h3>

      <div className="step3-cards-list">
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
