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
import { calculateTaxLiability, REQUIRED_DOCS_MAP } from '@modules/itr/validation/revisedItrValidation'
import { formatIndianCurrency } from '@modules/itr'
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
  onEditStep: (step: 1 | 2 | 3 | 4 | 5, sectionId?: string) => void
  isDeclared?: boolean
  declarationError?: string | null
  onToggleDeclaration?: (declared: boolean) => void
}

const REASON_TITLES: Record<RevisionReasonKey, string> = {
  missed_income: 'Missed Income',
  wrong_deduction: 'Wrong Deduction',
  incorrect_bank: 'Incorrect Bank Details',
  other: 'Other',
}

const DOC_LABEL_MAP: Record<DocumentTypeId, string> = {
  pan: 'PAN Card',
  aadhaar: 'Aadhaar Card',
  form16: 'Form 16 / Form 16A',
  ais_tis: 'AIS / TIS Statement',
  bank_statement: 'Bank Statement',
  investment_proof: 'Investment Proofs',
}

const formatInr = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '—'
  return formatIndianCurrency(val, '₹', '—')
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
  bankCorrections: BankCorrectionState,
  otherReasonText?: string
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
    const user80c = (deductionCorrections.section80c ?? '').trim() !== ''
    const user80d = (deductionCorrections.section80d ?? '').trim() !== ''
    const userHomeLoan = (deductionCorrections.homeLoanInterest ?? '').trim() !== ''
    const userTaxableEntered = (deductionCorrections.taxableIncome ?? '').trim() !== ''

    const revisedTaxable = userTaxableEntered ? Number(deductionCorrections.taxableIncome) : originalTaxable
    const revisedDeductions = sumEnteredDeductions > 0 ? sumEnteredDeductions : Math.max(0, originalGross - revisedTaxable)

    const rows: Array<{ label: string; value: string; isMono?: boolean }> = [
      { label: 'Revision Reason', value: 'Wrong Deduction' },
    ]
    if (user80c) {
      rows.push({ label: 'Revised 80C Deduction', value: formatInr(deductionCorrections.section80c) })
    }
    if (user80d) {
      rows.push({ label: 'Revised 80D Deduction', value: formatInr(deductionCorrections.section80d) })
    }
    if (userHomeLoan) {
      rows.push({ label: 'Revised Home Loan Interest', value: formatInr(deductionCorrections.homeLoanInterest) })
    }
    rows.push(
      { label: 'Revised Total Deductions', value: formatInr(revisedDeductions) },
      { label: 'Revised Taxable Income', value: formatInr(revisedTaxable) }
    )

    return {
      revisedGross: originalGross,
      revisedTaxable,
      revisedDeductions,
      changeRows: rows,
    }
  }

  if (selectedReason === 'incorrect_bank') {
    return {
      revisedGross: originalGross,
      revisedTaxable: originalTaxable,
      revisedDeductions: originalDeductions,
      changeRows: [
        { label: 'Revision Reason', value: 'Incorrect Bank Details' },
        { label: 'Revised Bank Account', value: bankCorrections.accountNumber || '—', isMono: true },
        { label: 'Revised IFSC', value: bankCorrections.ifsc || '—', isMono: true },
      ],
    }
  }

  if (selectedReason === 'other') {
    const userSalaryEntered = incomeCorrections.salaryIncome.trim() !== ''
    const userOtherEntered = (incomeCorrections.otherIncome ?? '').trim() !== ''
    const enteredTaxable = (incomeCorrections.taxableIncome ?? '').trim() || (deductionCorrections.taxableIncome ?? '').trim()
    const user80c = (deductionCorrections.section80c ?? '').trim() !== ''
    const user80d = (deductionCorrections.section80d ?? '').trim() !== ''
    const userHomeLoan = (deductionCorrections.homeLoanInterest ?? '').trim() !== ''
    const userBankEntered = Boolean(bankCorrections.accountNumber?.trim() || bankCorrections.ifsc?.trim())

    const revisedSalary = userSalaryEntered ? Number(incomeCorrections.salaryIncome) : originalGross
    const revisedOther = userOtherEntered ? Number(incomeCorrections.otherIncome) : 0
    const revisedGross = userSalaryEntered || userOtherEntered ? revisedSalary + revisedOther : originalGross
    const revisedTaxable = enteredTaxable ? Number(enteredTaxable) : originalTaxable
    const revisedDeductions = sumEnteredDeductions > 0 ? sumEnteredDeductions : Math.max(0, revisedGross - revisedTaxable)

    const rows: Array<{ label: string; value: string; isMono?: boolean }> = [
      { label: 'Revision Reason', value: 'Other Correction' },
    ]
    if (userSalaryEntered) {
      rows.push({ label: 'Revised Salary / Business', value: formatInr(revisedSalary) })
    }
    if (userOtherEntered) {
      rows.push({ label: 'Revised Other Income', value: formatInr(revisedOther) })
    }
    if (userSalaryEntered || userOtherEntered) {
      rows.push({ label: 'Revised Gross Total Income', value: formatInr(revisedGross) })
    }
    if (user80c) {
      rows.push({ label: 'Revised 80C Deduction', value: formatInr(deductionCorrections.section80c) })
    }
    if (user80d) {
      rows.push({ label: 'Revised 80D Deduction', value: formatInr(deductionCorrections.section80d) })
    }
    if (userHomeLoan) {
      rows.push({ label: 'Revised Home Loan Interest', value: formatInr(deductionCorrections.homeLoanInterest) })
    }
    if (sumEnteredDeductions > 0) {
      rows.push({ label: 'Revised Total Deductions', value: formatInr(revisedDeductions) })
    }
    if (enteredTaxable) {
      rows.push({ label: 'Revised Taxable Income', value: formatInr(revisedTaxable) })
    }
    if (userBankEntered) {
      rows.push(
        { label: 'Revised Bank Account', value: bankCorrections.accountNumber || '—', isMono: true },
        { label: 'Revised IFSC', value: bankCorrections.ifsc || '—', isMono: true }
      )
    }
    if (rows.length === 1) {
      rows.push({ label: 'Details', value: otherReasonText || 'General revision details submitted' })
    }

    return { revisedGross, revisedTaxable, revisedDeductions, changeRows: rows }
  }

  // missed_income
  const userSalaryEntered = incomeCorrections.salaryIncome.trim() !== ''
  const userOtherEntered = (incomeCorrections.otherIncome ?? '').trim() !== ''
  const userTaxableEntered = (incomeCorrections.taxableIncome ?? '').trim() !== ''

  const revisedSalary = userSalaryEntered ? Number(incomeCorrections.salaryIncome) : originalGross
  const revisedOther = userOtherEntered ? Number(incomeCorrections.otherIncome) : 0
  const revisedGross = userSalaryEntered || userOtherEntered ? revisedSalary + revisedOther : 868900

  const revisedTaxable = userTaxableEntered
    ? Number(incomeCorrections.taxableIncome)
    : userSalaryEntered || userOtherEntered
      ? Math.max(0, revisedGross - originalDeductions)
      : 548900

  const revisedDeductions = Math.max(0, revisedGross - revisedTaxable)

  const rows: Array<{ label: string; value: string; isMono?: boolean }> = [
    { label: 'Revision Reason', value: 'Missed Income' },
    { label: 'Revised Salary / Business', value: formatInr(revisedSalary) },
  ]
  if (userOtherEntered) {
    rows.push({ label: 'Revised Other Income', value: formatInr(revisedOther) })
  }
  rows.push(
    { label: 'Revised Gross Total Income', value: formatInr(revisedGross) },
    { label: 'Revised Taxable Income', value: formatInr(revisedTaxable) }
  )

  return { revisedGross, revisedTaxable, revisedDeductions, changeRows: rows }
}

export const RevisionReviewSummary: React.FC<RevisionReviewSummaryProps> = ({
  selectedReason,
  ackNumber,
  selectedAy,
  returnDetails,
  incomeCorrections,
  deductionCorrections,
  bankCorrections,
  otherReasonText,
  uploadedDocuments,
  onEditStep,
  isDeclared = false,
  declarationError = null,
  onToggleDeclaration,
}) => {
  const reasonKey = selectedReason || 'missed_income'
  const requiredList = REQUIRED_DOCS_MAP[reasonKey] || REQUIRED_DOCS_MAP.missed_income
  const requiredCount = requiredList.length
  const uploadedDocIds = Object.keys(uploadedDocuments) as DocumentTypeId[]
  const uploadedCount = uploadedDocIds.length
  const requiredUploadedCount = requiredList.filter((item) => Boolean(uploadedDocuments[item.id])).length
  const isRequiredComplete = requiredUploadedCount >= requiredCount
  const uploadedNames = uploadedDocIds.map((id) => DOC_LABEL_MAP[id] || id).join(', ')

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
    bankCorrections,
    otherReasonText
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
    rows: Array<{ label: string; value: string; isMono?: boolean; isAddress?: boolean; isStatus?: boolean }>,
    sectionId?: string
  ) => (
    <div className="step5-review-card" id={`revised-review-${sectionId || editStep}`}>
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
        <button type="button" className="edit-pill-btn" onClick={() => onEditStep(editStep, sectionId)} aria-label={ariaLabel}>
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
        <p className="step5-sub-heading">Review your updated details before submitting your revised return.</p>
      </div>
      <div className="step5-content-grid">
        <div className="step5-col-left">
          {renderCard('Original Return', 'Edit Original Return', 1, [
            { label: 'Ack Number', value: ackNumber || 'Pending Submission', isMono: true },
            { label: 'Assessment Year', value: selectedAy || 'AY 2025-26' },
            { label: 'ITR Form', value: returnDetails?.itrForm || 'ITR-1' },
            { label: 'Gross Total Income', value: formatInr(returnDetails?.grossTotalIncome || 812400) },
          ], 'revised-step1-search')}
          {renderCard('Personal Information', 'Edit Personal Information', 1, [
            { label: 'Full Name', value: personalInfo.fullName },
            { label: 'PAN', value: personalInfo.pan, isMono: true },
            { label: 'Date of Birth', value: personalInfo.dob },
            { label: 'Mobile', value: personalInfo.mobile, isMono: true },
            { label: 'Email', value: personalInfo.email },
            { label: 'Address', value: personalInfo.address, isAddress: true },
          ], 'revised-step1-details')}
          {renderCard('Reason for Revision', 'Edit Reason for Revision', 2, [
            { label: 'Selected Reason', value: REASON_TITLES[selectedReason || 'missed_income'] || 'Missed Income' },
            ...(otherReasonText ? [{ label: 'Explanation', value: otherReasonText }] : []),
          ], 'revised-step2-reason')}
          {renderCard('Changes', 'Edit Changes', 3, changeRows, 'revised-step3-changes')}
          {renderCard('Documents', 'Edit Uploaded Documents', 4, [
            {
              label: 'Required Uploads',
              value: `${requiredUploadedCount} of ${requiredCount} completed (${uploadedCount} uploaded)`,
            },
            {
              label: 'Uploaded Documents',
              value: uploadedNames || 'None uploaded',
            },
            {
              label: 'Verification Status',
              value: isRequiredComplete ? 'Ready for CA Review' : 'Action Required',
              isStatus: true,
            },
          ], 'revised-step4-documents')}
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

      <div className={`step5-declaration-card ${declarationError && !isDeclared ? 'has-error' : ''}`}>
        <label className="step5-declaration-label">
          <input
            type="checkbox"
            checked={Boolean(isDeclared)}
            onChange={(e) => onToggleDeclaration?.(e.target.checked)}
            className="step5-declaration-check"
          />
          <span className="step5-declaration-text">
            I confirm that the income details, deductions, bank account, and documents provided for this revised return are correct and complete to the best of my knowledge.
          </span>
        </label>
        {declarationError && !isDeclared && (
          <div className="step5-declaration-error" role="alert">
            <span>{declarationError}</span>
          </div>
        )}
      </div>
    </div>
  )
}
