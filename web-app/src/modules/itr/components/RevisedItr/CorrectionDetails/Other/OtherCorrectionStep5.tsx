import React from 'react'
import type {
  OriginalReturnDetails,
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  DocumentTypeId,
  UploadedDocument,
} from '@modules/itr/types/revisedItr.types'
import { Step5ReviewBase } from '../../ReviewSummary'

interface OtherCorrectionStep5Props {
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  incomeCorrections: IncomeCorrectionState
  deductionCorrections?: DeductionCorrectionState
  bankCorrections?: BankCorrectionState
  otherReasonText?: string
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

export const OtherCorrectionStep5: React.FC<OtherCorrectionStep5Props> = ({
  ackNumber,
  selectedAy,
  returnDetails,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
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

  const entered80c = Number(deductionCorrections?.section80c || 0)
  const entered80d = Number(deductionCorrections?.section80d || 0)
  const enteredHome = Number(deductionCorrections?.homeLoanInterest || 0)
  const sumEnteredDeductions = entered80c + entered80d + enteredHome

  const revisedDeductions = sumEnteredDeductions > 0
    ? sumEnteredDeductions
    : revisedTaxable <= revisedGross
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
        <span className="row-val">Other Correction</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Salary / Business</span>
        <span className="row-val">{formatInr(revisedGross)}</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Taxable Income</span>
        <span className="row-val">{formatInr(revisedTaxable)}</span>
      </div>
      {bankCorrections?.accountNumber && (
        <>
          <div className="summary-row">
            <span className="row-key">Revised Bank</span>
            <span className="row-val">{bankCorrections.accountNumber}</span>
          </div>
          <div className="summary-row">
            <span className="row-key">Revised IFSC</span>
            <span className="row-val font-mono">{bankCorrections.ifsc || '—'}</span>
          </div>
        </>
      )}
    </Step5ReviewBase>
  )
}
