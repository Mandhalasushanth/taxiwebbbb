import React from 'react'
import { authStorage } from '@core/auth'
import type {
  RevisionReasonKey,
  OriginalReturnDetails,
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  DocumentTypeId,
  UploadedDocument,
} from '@modules/itr/types/revisedItr.types'
import { calculateTaxLiability } from '@modules/itr/validation/revisedItrValidation'
import './RevisionReviewSummary.css'

export interface RevisionReviewSummaryProps {
  selectedReason: RevisionReasonKey | null
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  incomeCorrections: IncomeCorrectionState
  deductionCorrections: DeductionCorrectionState
  bankCorrections: BankCorrectionState
  otherReasonText?: string
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

const formatInr = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '—'
  const num = typeof val === 'string' ? Number(val.replace(/[^0-9.-]+/g, '')) : val
  return Number.isNaN(num) ? '—' : '₹' + num.toLocaleString('en-IN')
}

interface ComputedRevisionSummary {
  revisedGross: number
  revisedTaxable: number
  revisedDeductions: number
  changeRows: Array<{ label: string; value: string; isMono?: boolean }>
}

const computeRevisionFigures = (
  selectedReason: RevisionReasonKey | null,
  returnDetails: OriginalReturnDetails | null,
  incomeCorrections: IncomeCorrectionState,
  deductionCorrections: DeductionCorrectionState,
  bankCorrections: BankCorrectionState
): ComputedRevisionSummary => {
  const originalGross = Number(returnDetails?.salaryOriginal ?? 812400)
  const originalTaxable = Number(returnDetails?.taxableOriginal ?? 492400)
  const originalDeductions =
    returnDetails?.deductionsOriginal !== undefined
      ? Number(returnDetails.deductionsOriginal)
      : Math.max(0, originalGross - originalTaxable)

  const sumEnteredDeductions =
    Number(deductionCorrections?.section80c || 0) +
    Number(deductionCorrections?.section80d || 0) +
    Number(deductionCorrections?.homeLoanInterest || 0)

  if (selectedReason === 'wrong_deduction') {
    const userTaxableEntered = (deductionCorrections.taxableIncome ?? '').trim() !== ''
    const revisedTaxable = userTaxableEntered ? Number(deductionCorrections.taxableIncome) : originalTaxable
    const revisedDeductions = sumEnteredDeductions > 0 ? sumEnteredDeductions : Math.max(0, originalGross - revisedTaxable)

    return {
      revisedGross: originalGross,
      revisedTaxable,
      revisedDeductions,
      changeRows: [
        { label: 'Revision Reason', value: 'Wrong Deduction' },
        { label: 'Revised Salary / Business', value: '₹' },
        { label: 'Revised Taxable Income', value: formatInr(revisedTaxable) },
      ],
    }
  }

  if (selectedReason === 'incorrect_bank') {
    return {
      revisedGross: originalGross,
      revisedTaxable: originalTaxable,
      revisedDeductions: originalDeductions,
      changeRows: [
        { label: 'Revision Reason', value: 'Incorrect Bank Details' },
        { label: 'Revised Bank', value: bankCorrections.accountNumber || '—' },
        { label: 'Revised IFSC', value: bankCorrections.ifsc || '—', isMono: true },
      ],
    }
  }

  const userSalaryEntered = incomeCorrections.salaryIncome.trim() !== ''
  const userOtherEntered = (incomeCorrections.otherIncome ?? '').trim() !== ''
  const userTaxableEntered = (incomeCorrections.taxableIncome ?? '').trim() !== ''

  const revisedGross = userSalaryEntered || userOtherEntered
    ? (userSalaryEntered ? Number(incomeCorrections.salaryIncome) : originalGross) +
      (userOtherEntered ? Number(incomeCorrections.otherIncome) : 0)
    : 868900

  const revisedTaxable = userTaxableEntered
    ? Number(incomeCorrections.taxableIncome)
    : userSalaryEntered || userOtherEntered
      ? Math.max(0, revisedGross - originalDeductions)
      : 548900

  const revisedDeductions = selectedReason === 'other' && sumEnteredDeductions > 0
    ? sumEnteredDeductions
    : Math.max(0, revisedGross - revisedTaxable)

  const changeRows: Array<{ label: string; value: string; isMono?: boolean }> = [
    { label: 'Revision Reason', value: selectedReason === 'other' ? 'Other Correction' : 'Missed Income' },
    { label: 'Revised Salary / Business', value: formatInr(revisedGross) },
    { label: 'Revised Taxable Income', value: formatInr(revisedTaxable) },
  ]

  if (selectedReason === 'other' && bankCorrections?.accountNumber) {
    changeRows.push(
      { label: 'Revised Bank', value: bankCorrections.accountNumber },
      { label: 'Revised IFSC', value: bankCorrections.ifsc || '—', isMono: true }
    )
  }

  return { revisedGross, revisedTaxable, revisedDeductions, changeRows }
}

export const RevisionReviewSummary: React.FC<RevisionReviewSummaryProps> = ({
  selectedReason,
  ackNumber,
  selectedAy,
  returnDetails,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
  uploadedDocuments,
  onEditStep,
}) => {
  const uploadedCount = Object.keys(uploadedDocuments).length
  const user = authStorage.getUser()

  const personalInfo = returnDetails?.personalInfo || {
    fullName: user?.fullName || 'Assessee',
    pan: user?.pan ? `XXXXX${user.pan.slice(-4)}` : '—',
    dob: user?.dob || '—',
    mobile: user?.mobile || '—',
    email: user?.email || '—',
    address: user?.addressLine1 ? `${user.addressLine1}, ${user.city || ''}` : '—',
  }

  const { revisedGross, revisedTaxable, revisedDeductions, changeRows } = computeRevisionFigures(
    selectedReason,
    returnDetails,
    incomeCorrections,
    deductionCorrections,
    bankCorrections
  )

  const originalGross = Number(returnDetails?.salaryOriginal ?? 812400)
  const originalTaxable = Number(returnDetails?.taxableOriginal ?? 492400)
  const originalDeductions =
    returnDetails?.deductionsOriginal !== undefined
      ? Number(returnDetails.deductionsOriginal)
      : Math.max(0, originalGross - originalTaxable)
  const originalTaxAndCess = calculateTaxLiability(originalTaxable)
  const revisedTaxAndCess = calculateTaxLiability(revisedTaxable)
  const originalTaxesPaid = Number(returnDetails?.taxesPaidOriginal ?? 31200)
  const revisedTaxesPaid = originalTaxesPaid
  const originalRefund = Math.max(0, originalTaxesPaid - originalTaxAndCess)
  const netBalance = revisedTaxesPaid - revisedTaxAndCess
  const isRefund = netBalance >= 0
  const refundDiff = netBalance - originalRefund

  const renderDiff = (diff: number) => {
    if (diff === 0) return <span>—</span>
    return <span className={diff > 0 ? 'diff-orange' : 'diff-red'}>{diff > 0 ? '+' : ''}{formatInr(diff)}</span>
  }

  const taxBreakdownBlocks = [
    { label: 'Gross total income', original: originalGross, revised: revisedGross, diff: revisedGross - originalGross },
    { label: 'Deductions', original: originalDeductions, revised: revisedDeductions, diff: revisedDeductions - originalDeductions },
    { label: 'Taxable income', original: originalTaxable, revised: revisedTaxable, diff: revisedTaxable - originalTaxable },
    { label: 'Tax + cess', original: originalTaxAndCess, revised: revisedTaxAndCess, diff: revisedTaxAndCess - originalTaxAndCess },
    { label: 'Taxes paid', original: originalTaxesPaid, revised: revisedTaxesPaid, diff: 0 },
  ]

  const renderCard = (
    title: string,
    ariaLabel: string,
    editStep: 1 | 2 | 3 | 4 | 5,
    rows: Array<{ label: string; value: string; isMono?: boolean; isAddress?: boolean; isStatus?: boolean }>
  ) => (
    <div className="step5-review-card">
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
        <button type="button" className="edit-pill-btn" onClick={() => onEditStep(editStep)} aria-label={ariaLabel}>
          Edit
        </button>
      </div>
      <div className="card-rows-list">
        {rows.map((row) => (
          <div key={row.label} className="summary-row">
            <span className="row-key">{row.label}</span>
            <span className={`row-val ${row.isMono ? 'font-mono' : ''} ${row.isAddress ? 'row-val-address' : ''} ${row.isStatus ? 'row-val-status' : ''}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="step5-review-revised-itr">
      <div className="step5-title-wrap">
        <h2 className="step5-main-heading">Review Revised ITR</h2>
        <p className="step5-sub-heading">Review your updated details before proceeding to payment.</p>
      </div>
      <div className="step5-content-grid">
        <div className="step5-col-left">
          {renderCard('Original Return', 'Edit Original Return', 1, [
            { label: 'Ack Number', value: ackNumber || '987654321012345', isMono: true },
            { label: 'Assessment Year', value: selectedAy || 'AY 2025-26' },
            { label: 'ITR Form', value: returnDetails?.itrForm || 'ITR-1' },
            { label: 'Gross Total Income', value: returnDetails?.grossTotalIncome || '₹8,12,400' },
          ])}
          {renderCard('Personal Information', 'Edit Personal Information', 1, [
            { label: 'Full Name', value: personalInfo.fullName },
            { label: 'PAN', value: personalInfo.pan, isMono: true },
            { label: 'Date of Birth', value: personalInfo.dob },
            { label: 'Mobile', value: personalInfo.mobile, isMono: true },
            { label: 'Email', value: personalInfo.email },
            { label: 'Address', value: personalInfo.address, isAddress: true },
          ])}
          {renderCard('Changes', 'Edit Changes', 3, changeRows)}
          {renderCard('Documents', 'Edit Uploaded Documents', 4, [
            { label: 'Uploaded Count', value: `${uploadedCount || 3} of 6 documents` },
            { label: 'Verification Status', value: 'Ready for CA Review', isStatus: true },
          ])}
        </div>
        <div className="step5-col-right">
          <div className="step5-tax-summary-card">
            <div className="card-header-row"><h3 className="card-title">Tax Summary</h3></div>
            <div className="tax-breakdown-list">
              {taxBreakdownBlocks.map((block) => (
                <div key={block.label} className="tax-item-block">
                  <span className="tax-item-label">{block.label}</span>
                  <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(block.original)}</span></div>
                  <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(block.revised)}</span></div>
                  <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(block.diff)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`step5-refund-highlight-card ${!isRefund ? 'tax-payable' : ''}`}>
        <div className="refund-card-top-content">
          <div className="refund-left-content">
            <div className="refund-badge-pill">
              <span className="refund-symbol-circle">₹</span>
              <span className="refund-badge-text">{isRefund ? 'Revised Refund' : 'Tax Payable'}</span>
            </div>
            <div className="refund-hero-amount">{formatInr(Math.abs(netBalance))}</div>
          </div>
          <div className="refund-stats-rows">
            <div className="refund-stat-row"><span className="refund-stat-label">Original Refund</span><span className="refund-stat-val">{formatInr(originalRefund)}</span></div>
            <div className="refund-stat-row"><span className="refund-stat-label">Change</span><span className="refund-stat-val">{refundDiff > 0 ? '+' : ''}{formatInr(refundDiff)}</span></div>
          </div>
        </div>
        <p className="refund-disclaimer-note">Preliminary calculation. Final result depends on the filed return and Income Tax Department processing.</p>
      </div>
    </div>
  )
}
