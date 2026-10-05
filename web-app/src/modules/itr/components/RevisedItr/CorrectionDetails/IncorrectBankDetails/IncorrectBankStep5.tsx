import React from 'react'
import type {
  OriginalReturnDetails,
  BankCorrectionState,
  DocumentTypeId,
  UploadedDocument,
} from '../../../../types/revisedItr.types'
import { Step5ReviewBase } from '../../ReviewSummary'

interface IncorrectBankStep5Props {
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  bankCorrections: BankCorrectionState
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

export const IncorrectBankStep5: React.FC<IncorrectBankStep5Props> = ({
  ackNumber,
  selectedAy,
  returnDetails,
  bankCorrections,
  uploadedDocuments,
  onEditStep,
}) => {
  const originalGross = returnDetails?.salaryOriginal || 812400
  const originalTaxable = returnDetails?.taxableOriginal || 492400
  const originalDeductions = Math.max(0, originalGross - originalTaxable)

  return (
    <Step5ReviewBase
      ackNumber={ackNumber}
      selectedAy={selectedAy}
      returnDetails={returnDetails}
      uploadedDocuments={uploadedDocuments}
      revisedGross={originalGross}
      revisedTaxable={originalTaxable}
      revisedDeductions={originalDeductions}
      onEditStep={onEditStep}
    >
      <div className="summary-row">
        <span className="row-key">Revision Reason</span>
        <span className="row-val">Incorrect Bank Details</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised Bank</span>
        <span className="row-val">{bankCorrections.accountNumber || '—'}</span>
      </div>
      <div className="summary-row">
        <span className="row-key">Revised IFSC</span>
        <span className="row-val font-mono">{bankCorrections.ifsc || '—'}</span>
      </div>
    </Step5ReviewBase>
  )
}
