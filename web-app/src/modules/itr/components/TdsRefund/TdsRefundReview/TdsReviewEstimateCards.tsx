import React from 'react'
import { TdsIcons } from '@modules/itr/utils/tdsRefund.constants'
import { computeNewRegimeTax, computeOldRegimeTax } from '@modules/itr/components/ItrFiling/itrTaxCalculator'
import type { TdsBusinessDetails, TdsIncomeTaxData, UploadedFileMeta } from '@modules/itr/types/tdsRefund.types'

const CESS_RATE = 0.04

const DOCUMENT_LABELS: Record<'panDoc' | 'aadhaarDoc', string> = {
  panDoc: 'Business PAN',
  aadhaarDoc: 'Aadhaar Card',
}

const toAmount = (val?: string): number => Number((val || '').replace(/[^0-9.]/g, '')) || 0
const inr = (val: number): string => `₹${Math.round(val).toLocaleString('en-IN')}`

export interface TdsEstimate {
  grossIncome: number
  deductions: number
  taxableIncome: number
  taxLiability: number
  tdsDeducted: number
  totalCredits: number
  /** Positive: refund due. Negative: additional tax payable. */
  balance: number
}

/** Preliminary refund estimate from the income / tax data held in the TDS Refund flow. */
export const computeTdsEstimate = (taxData?: TdsIncomeTaxData): TdsEstimate => {
  const grossIncome = toAmount(taxData?.salaryIncome) + toAmount(taxData?.otherIncome) + toAmount(taxData?.interestIncome)
  const isOldRegime = taxData?.taxRegime === 'old'
  const deductions = isOldRegime ? toAmount(taxData?.deduction80C) + toAmount(taxData?.deduction80D) : 0
  const taxableIncome = Math.max(0, grossIncome - deductions)
  const slabTax = isOldRegime ? computeOldRegimeTax(taxableIncome) : computeNewRegimeTax(taxableIncome)
  const taxLiability = Math.round(slabTax * (1 + CESS_RATE))
  const tdsDeducted = toAmount(taxData?.totalTdsDeducted)
  const totalCredits = tdsDeducted + toAmount(taxData?.tcsAmount) + toAmount(taxData?.advanceTax) + toAmount(taxData?.selfAssessmentTax)
  return { grossIncome, deductions, taxableIncome, taxLiability, tdsDeducted, totalCredits, balance: totalCredits - taxLiability }
}

const EditButton: React.FC<{ onClick: () => void; testId: string }> = ({ onClick, testId }) => (
  <button type="button" className="tds-review-edit-btn" onClick={onClick} data-testid={testId}><TdsIcons.Edit />Edit</button>
)

export interface TdsReviewDocumentsCardProps {
  businessDetails?: TdsBusinessDetails
  onEdit: () => void
}

/** Documents attached on the Application Details step (Business PAN / Aadhaar uploads). */
export const TdsReviewDocumentsCard: React.FC<TdsReviewDocumentsCardProps> = ({ businessDetails, onEdit }) => {
  const docs = (Object.keys(DOCUMENT_LABELS) as Array<keyof typeof DOCUMENT_LABELS>)
    .map((key) => ({ key, label: DOCUMENT_LABELS[key], meta: businessDetails?.[key] as UploadedFileMeta | undefined }))
    .filter((doc) => Boolean(doc.meta))

  return (
    <section className="tds-review-card" data-testid="tds-review-documents">
      <div className="tds-review-card-header">
        <div className="tds-review-title-wrap"><TdsIcons.FileText className="tds-review-icon" /><h3 className="tds-review-title">Documents ({docs.length})</h3></div>
        <EditButton onClick={onEdit} testId="edit-documents-btn" />
      </div>
      {docs.length > 0 ? (
        <div className="tds-review-docs-pills">
          {docs.map((doc) => (
            <span key={doc.key} className="tds-review-doc-pill" title={doc.meta?.name}>
              <span className="tds-review-doc-pill-check" aria-hidden="true">✓</span>
              <span>{doc.label}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="tds-review-empty-text">No documents uploaded yet</p>
      )}
    </section>
  )
}

const Row: React.FC<{ label: string; value: string; tone?: 'deduction' | 'bold' }> = ({ label, value, tone }) => (
  <div className={`tds-review-row ${tone === 'bold' ? 'tds-review-row--bold-line' : ''}`}>
    <span className={`tds-review-label ${tone === 'bold' ? 'tds-review-label--bold' : ''}`}>{label}</span>
    <span className={`tds-review-value ${tone ? `tds-review-value--${tone}` : ''}`}>{value}</span>
  </div>
)

/** Estimated Tax Computation with the refund due (green) or additional tax payable (red). */
export const TdsEstimatedComputationCard: React.FC<{ taxData?: TdsIncomeTaxData }> = ({ taxData }) => {
  const est = computeTdsEstimate(taxData)
  const isRefund = est.balance > 0

  return (
    <section className="tds-review-card" data-testid="tds-review-computation">
      <div className="tds-review-card-header">
        <div className="tds-review-title-wrap"><TdsIcons.Calculator className="tds-review-icon" /><h3 className="tds-review-title">Estimated Tax Computation</h3></div>
        <span className="tds-computation-prelim-badge">Preliminary</span>
      </div>
      <div className="tds-review-rows">
        <Row label="Gross Total Income" value={inr(est.grossIncome)} />
        <Row label="Less: Eligible Deductions" value={`- ${inr(est.deductions)}`} tone="deduction" />
        <Row label="Taxable Income" value={inr(est.taxableIncome)} tone="bold" />
        <Row label="Estimated Tax Liability (incl. 4% Cess)" value={inr(est.taxLiability)} />
        <div className="tds-computation-divider" />
        <div className="tds-computation-subhead">TAX CREDITS &amp; PREPAID TAXES</div>
        <Row label="TDS Deducted" value={inr(est.tdsDeducted)} />
        <div className="tds-computation-total-row"><span>Total Eligible Tax Credits</span><span className="tds-computation-credits-val">{inr(est.totalCredits)}</span></div>
      </div>
      <div className={`tds-refund-box ${isRefund ? '' : 'tds-refund-box--payable'}`} data-testid="tds-refund-amount-box">
        <span className="tds-refund-box-label">{isRefund ? 'Estimated Refund' : 'Estimated Additional Tax Payable'}</span>
        <span className="tds-refund-box-amount">{inr(Math.abs(est.balance))}</span>
      </div>
      <div className="tds-disclaimer-box">
        <TdsIcons.InfoCircle className="tds-disclaimer-icon" />
        <span>Preliminary estimate based on the information provided. Final refund/tax payable will be determined after CA verification, ITR filing and Income Tax Department processing.</span>
      </div>
    </section>
  )
}
