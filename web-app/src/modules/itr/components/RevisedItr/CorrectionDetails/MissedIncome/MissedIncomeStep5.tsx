import React from 'react'
import type {
  OriginalReturnDetails,
  IncomeCorrectionState,
  DocumentTypeId,
  UploadedDocument,
} from '../../../../types/revisedItr.types'
import { Step5ReviewBase } from '../../ReviewSummary'

interface MissedIncomeStep5Props {
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  incomeCorrections: IncomeCorrectionState
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

export const MissedIncomeStep5: React.FC<MissedIncomeStep5Props> = ({
  ackNumber,
  selectedAy,
  returnDetails,
  incomeCorrections,
  uploadedDocuments,
  onEditStep,
}) => {
  const originalGross = returnDetails?.salaryOriginal || 812400
  const originalTaxable = returnDetails?.taxableOriginal || 492400
  const originalDeductions = Math.max(0, originalGross - originalTaxable)

  const userSalaryEntered = incomeCorrections.salaryIncome.trim() !== ''
  const userOtherEntered = (incomeCorrections.otherIncome ?? '').trim() !== ''
  const userTaxableEntered = (incomeCorrections.taxableIncome ?? '').trim() !== ''

  const revisedGross = (userSalaryEntered || userOtherEntered)
    ? (userSalaryEntered ? Number(incomeCorrections.salaryIncome) : originalGross) +
      (userOtherEntered ? Number(incomeCorrections.otherIncome) : 0)
    : 868900

  const revisedTaxable = userTaxableEntered
    ? Number(incomeCorrections.taxableIncome)
    : (userSalaryEntered || userOtherEntered)
    ? Math.max(0, revisedGross - originalDeductions)
    : 548900

  const revisedDeductions = revisedTaxable <= revisedGross
    ? Math.max(0, revisedGross - revisedTaxable)
    : 0

  const formatInr = (num: number) => '₹' + num.toLocaleString('en-IN')

  return (
    <Step5ReviewBase
      ackNumber={ackNumber}
      selectedAy={selectedAy}
      returnDetails={returnDetails}
      uploadedDocuments={uploadedDocuments}
      revisedGross={revisedGross}
      revisedTaxable={revisedTaxable}
      revisedDeductions={revisedDeductions}
      onEditStep={onEditStep}
    >
      <div className="summary-row">
        <span className="row-key">Revision Reason</span>
        <span className="row-val">Missed Income</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Salary / Business</span>
        <span className="row-val">{formatInr(revisedGross)}</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Taxable Income</span>
        <span className="row-val">{formatInr(revisedTaxable)}</span>
      </div>
    </Step5ReviewBase>
  )
}
