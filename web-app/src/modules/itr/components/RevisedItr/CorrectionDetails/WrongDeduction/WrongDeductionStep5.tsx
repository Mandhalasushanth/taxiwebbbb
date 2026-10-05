import React from 'react'
import type {
  OriginalReturnDetails,
  DeductionCorrectionState,
  DocumentTypeId,
  UploadedDocument,
} from '../../../../types/revisedItr.types'
import { Step5ReviewBase } from '../../ReviewSummary'

interface WrongDeductionStep5Props {
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  deductionCorrections: DeductionCorrectionState
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

export const WrongDeductionStep5: React.FC<WrongDeductionStep5Props> = ({
  ackNumber,
  selectedAy,
  returnDetails,
  deductionCorrections,
  uploadedDocuments,
  onEditStep,
}) => {
  const originalGross = returnDetails?.salaryOriginal || 812400
  const originalTaxable = returnDetails?.taxableOriginal || 492400

  const userTaxableEntered = (deductionCorrections.taxableIncome ?? '').trim() !== ''
  const revisedTaxable = userTaxableEntered
    ? Number(deductionCorrections.taxableIncome)
    : originalTaxable

  const entered80c = Number(deductionCorrections.section80c || 0)
  const entered80d = Number(deductionCorrections.section80d || 0)
  const enteredHome = Number(deductionCorrections.homeLoanInterest || 0)
  const sumEnteredDeductions = entered80c + entered80d + enteredHome

  const revisedDeductions = sumEnteredDeductions > 0
    ? sumEnteredDeductions
    : revisedTaxable <= originalGross
    ? Math.max(0, originalGross - revisedTaxable)
    : 0

  const formatInr = (num: number) => '₹' + num.toLocaleString('en-IN')

  return (
    <Step5ReviewBase
      ackNumber={ackNumber}
      selectedAy={selectedAy}
      returnDetails={returnDetails}
      uploadedDocuments={uploadedDocuments}
      revisedGross={originalGross}
      revisedTaxable={revisedTaxable}
      revisedDeductions={revisedDeductions}
      onEditStep={onEditStep}
    >
      <div className="summary-row">
        <span className="row-key">Revision Reason</span>
        <span className="row-val">Wrong Deduction</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Salary / Business</span>
        <span className="row-val">₹</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Taxable Income</span>
        <span className="row-val">{formatInr(revisedTaxable)}</span>
      </div>
    </Step5ReviewBase>
  )
}
