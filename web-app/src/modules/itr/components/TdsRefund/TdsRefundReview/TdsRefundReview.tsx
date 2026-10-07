import React from 'react'
import { StepActionBar } from '@shared/components'
import { TDS_DOCUMENTS, TdsIcons, type TdsTaxpayerProfile } from '@modules/itr/utils/tdsRefund.constants'
import type { TdsBankDetails, TdsIncomeTaxData } from '../TdsRefundCustomerIncome'
import type { UploadedFileMeta } from '../TdsRefundDocuments'
import { TdsRefundProgressTracker } from '../TdsRefundOverview'
import './TdsRefundReview.css'

const REVIEW_SIDEBAR_CHECKLIST = [
  { text: 'Step 1: Customer & Income Details', status: 'done', icon: '✓' },
  { text: 'Step 2: Upload Documents', status: 'done', icon: '✓' },
  { text: 'Step 3: Review & Estimate', status: 'active', icon: '●', isStrong: true },
  { text: 'Step 4: Payment', status: 'pending', icon: '○' },
  { text: 'Step 5: Direct Bank Credit', status: 'pending', icon: '○' },
]

export const TdsRefundReviewSidebar: React.FC = () => (
  <aside className="tds-review-sidebar">
    <div className="tds-sidebar-card">
      <div className="tds-sidebar-progress-badge">Stage 3 in Progress</div>
      <h4 className="tds-sidebar-card-title">Review &amp; Estimate</h4>
      <p className="tds-sidebar-card-desc">Please thoroughly verify all your pre-filled and declared details before advancing to CA verification and refund filing.</p>
      <div className="tds-sidebar-checklist">
        {REVIEW_SIDEBAR_CHECKLIST.map((item) => (
          <div key={item.text} className="tds-sidebar-check-item">
            <span className={`tds-sidebar-check-icon tds-sidebar-check-icon--${item.status}`}>{item.icon}</span>
            {item.isStrong ? <strong className="tds-sidebar-check-item-strong">{item.text}</strong> : <span>{item.text}</span>}
          </div>
        ))}
      </div>
    </div>

    <div className="tds-sidebar-card tds-sidebar-card--navy">
      <div className="tds-sidebar-card-header"><TdsIcons.Shield className="tds-sidebar-header-icon" /><h4 className="tds-sidebar-card-title">Chartered Accountant Review</h4></div>
      <p className="tds-sidebar-card-desc">A senior licensed Chartered Accountant will cross-examine your 26AS, AIS, and TIS before submitting to the IT Department.</p>
    </div>

    <div className="tds-sidebar-card">
      <div className="tds-sidebar-card-header"><TdsIcons.Lock className="tds-sidebar-header-icon tds-sidebar-header-icon--secure" /><h4 className="tds-sidebar-card-title">Bank-Grade 256-Bit Security</h4></div>
      <p className="tds-sidebar-card-desc">Your financial and personal details are encrypted and securely submitted through authorized ITD e-filing gateways.</p>
    </div>
  </aside>
)

export interface TdsRefundComputationCardProps {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  tdsDeducted: number
  tcsCollected: number
  advanceAndSelfTax: number
  totalTaxCredits: number
  estimatedRefund: number
}

export const TdsRefundComputationCard: React.FC<TdsRefundComputationCardProps> = ({
  grossIncome, totalDeductions, taxableIncome, tdsDeducted, tcsCollected, advanceAndSelfTax, totalTaxCredits, estimatedRefund,
}) => {
  return (
    <section className="tds-review-card" data-testid="tds-review-computation">
      <div className="tds-review-card-header">
        <div className="tds-review-title-wrap"><TdsIcons.Calculator className="tds-review-icon" /><h3 className="tds-review-title">Estimated Tax Computation</h3></div>
        <span className="tds-computation-prelim-badge">Preliminary</span>
      </div>
      <div className="tds-review-rows">
        <div className="tds-review-row"><span className="tds-review-label">Gross Total Income</span><span className="tds-review-value">₹{grossIncome.toLocaleString('en-IN')}</span></div>
        <div className="tds-review-row"><span className="tds-review-label">Less: Eligible Deductions</span><span className="tds-review-value tds-review-value--deduction">- ₹{totalDeductions.toLocaleString('en-IN')}</span></div>
        <div className="tds-review-row tds-review-row--bold-line"><span className="tds-review-label tds-review-label--bold">Taxable Income</span><span className="tds-review-value tds-review-value--bold">₹{taxableIncome.toLocaleString('en-IN')}</span></div>
        <div className="tds-review-row"><span className="tds-review-label">Estimated Tax Liability (incl. 4% Cess)</span><span className="tds-review-value">₹0</span></div>
        <div className="tds-computation-divider" />
        <div className="tds-computation-subhead">TAX CREDITS &amp; PREPAID TAXES</div>
        <div className="tds-review-row"><span className="tds-review-label">Total TDS Deducted</span><span className="tds-review-value">₹{tdsDeducted.toLocaleString('en-IN')}</span></div>
        <div className="tds-review-row"><span className="tds-review-label">Total TCS Collected</span><span className="tds-review-value">₹{tcsCollected.toLocaleString('en-IN')}</span></div>
        <div className="tds-review-row"><span className="tds-review-label">Advance &amp; Self Assessment Tax</span><span className="tds-review-value">₹{advanceAndSelfTax.toLocaleString('en-IN')}</span></div>
        <div className="tds-computation-divider" />
        <div className="tds-computation-total-row"><span>Total Tax Credits / Claim</span><span className="tds-computation-credits-val">₹{totalTaxCredits.toLocaleString('en-IN')}</span></div>
      </div>
      <div className="tds-refund-box" data-testid="tds-refund-amount-box"><span className="tds-refund-box-label">Estimated Refund</span><span className="tds-refund-box-amount">₹{estimatedRefund.toLocaleString('en-IN')}</span></div>
      <div className="tds-disclaimer-box"><TdsIcons.InfoCircle className="tds-disclaimer-icon" /><span>Preliminary estimate based on the information provided. Final refund/tax payable will be determined after CA verification, ITR filing and Income Tax Department processing.</span></div>
    </section>
  )
}

export interface TdsRefundReviewProps {
  onBack: () => void
  onEditStep1: () => void
  onEditStep2: () => void
  onNext: () => void
  onSaveDraft?: () => void
  profile?: TdsTaxpayerProfile
  bankDetails?: TdsBankDetails
  taxData?: TdsIncomeTaxData
  uploads?: Record<string, UploadedFileMeta>
}

const EditButton: React.FC<{ onClick: () => void; testId: string }> = ({ onClick, testId }) => (
  <button type="button" className="tds-review-edit-btn" onClick={onClick} data-testid={testId}><TdsIcons.Edit />Edit</button>
)

const REGIME_LABELS: Record<string, string> = { old: 'Old Regime', new: 'New Regime' }

export const TdsRefundReview: React.FC<TdsRefundReviewProps> = ({
  onBack, onEditStep1, onEditStep2, onNext, onSaveDraft, profile, bankDetails, taxData, uploads,
}) => {
  const totalTdsDeductedNum = Number(taxData?.totalTdsDeducted || 0)
  const tcsAmountNum = Number(taxData?.tcsAmount || 0)
  const advanceTaxNum = Number(taxData?.advanceTax || 0)
  const selfTaxNum = Number(taxData?.selfAssessmentTax || 0)
  const advanceAndSelfTax = advanceTaxNum + selfTaxNum
  const totalTaxCredits = totalTdsDeductedNum + tcsAmountNum + advanceAndSelfTax
  const grossIncomeNum = Number(taxData?.salaryIncome || 0) + Number(taxData?.otherIncome || 0) + Number(taxData?.interestIncome || 0)
  const totalDeductionsNum = Number(taxData?.deduction80C || 0) + Number(taxData?.deduction80D || 0)
  const taxableIncome = Math.max(0, grossIncomeNum - totalDeductionsNum)

  const isReviewValid = Boolean(
    bankDetails?.accountHolder?.trim() && bankDetails?.accountNumber?.trim() && bankDetails?.ifsc?.trim() && totalTdsDeductedNum > 0
  )

  const formattedMobile = profile?.mobile ? (profile.mobile.startsWith('+91') ? profile.mobile : `+91 ${profile.mobile}`) : '—'
  const formattedAcct = bankDetails?.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}${bankDetails.accountType ? ` (${bankDetails.accountType})` : ''}` : '—'

  const reviewSections = [
    {
      testId: 'tds-review-personal', title: 'Personal Details', Icon: TdsIcons.User, editTestId: 'edit-personal-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Full Name', value: profile?.fullName || profile?.name || '—' },
        { label: 'PAN', value: profile?.pan || '—', isMono: true },
        { label: 'Mobile Number', value: formattedMobile },
        { label: 'Email Address', value: profile?.email || '—' },
        { label: 'Address', value: profile?.address || '—' },
      ],
    },
    {
      testId: 'tds-review-income', title: 'Income Details', Icon: TdsIcons.CreditCard, editTestId: 'edit-income-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Tax Regime', value: (taxData?.taxRegime && REGIME_LABELS[taxData.taxRegime]) || 'Not Selected' },
        { label: 'Gross Salary', value: `₹${Number(taxData?.salaryIncome || 0).toLocaleString('en-IN')}` },
        { label: 'Other & Interest Income', value: `₹${(Number(taxData?.otherIncome || 0) + Number(taxData?.interestIncome || 0)).toLocaleString('en-IN')}` },
      ],
    },
    {
      testId: 'tds-review-tds', title: 'TDS Details', Icon: TdsIcons.Rupee, editTestId: 'edit-tds-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Total TDS Deducted', value: `₹${totalTdsDeductedNum.toLocaleString('en-IN')}` },
        { label: 'Total TCS Collected', value: `₹${tcsAmountNum.toLocaleString('en-IN')}` },
        { label: 'Advance Tax Paid', value: `₹${advanceTaxNum.toLocaleString('en-IN')}` },
        { label: 'Self Assessment Tax', value: `₹${selfTaxNum.toLocaleString('en-IN')}` },
      ],
    },
    {
      testId: 'tds-review-deductions', title: 'Deductions', Icon: TdsIcons.Wallet || TdsIcons.Briefcase, editTestId: 'edit-deductions-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Section 80C', value: `₹${Number(taxData?.deduction80C || 0).toLocaleString('en-IN')}` },
        { label: 'Section 80D', value: `₹${Number(taxData?.deduction80D || 0).toLocaleString('en-IN')}` },
      ],
    },
    {
      testId: 'tds-review-bank', title: 'Bank Details', Icon: TdsIcons.Building, editTestId: 'edit-bank-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Bank Name', value: bankDetails?.bankName || '—' },
        { label: 'Branch', value: bankDetails?.branch || '—' },
        { label: 'Account Number', value: formattedAcct },
        { label: 'IFSC Code', value: bankDetails?.ifsc || '—', isMono: true },
      ],
    },
  ]

  const entries = uploads ? Object.entries(uploads) : []

  return (
    <div className="tds-review-page" data-testid="tds-refund-review-page">
      <div className="tds-review-stepper-wrap"><TdsRefundProgressTracker currentStep={3} /></div>
      <div className="tds-review-layout">
        <main className="tds-review-main">
          {reviewSections.map((section) => (
            <section key={section.testId} className="tds-review-card" data-testid={section.testId}>
              <div className="tds-review-card-header">
                <div className="tds-review-title-wrap"><section.Icon className="tds-review-icon" /><h3 className="tds-review-title">{section.title}</h3></div>
                <EditButton onClick={section.onEdit} testId={section.editTestId} />
              </div>
              <div className="tds-review-rows">
                {section.rows.map((row) => (
                  <div key={row.label} className="tds-review-row"><span className="tds-review-label">{row.label}</span><span className={`tds-review-value ${'isMono' in row && row.isMono ? 'tds-review-value--mono' : ''}`}>{row.value}</span></div>
                ))}
              </div>
            </section>
          ))}

          <section className="tds-review-card" data-testid="tds-review-documents">
            <div className="tds-review-card-header">
              <div className="tds-review-title-wrap"><TdsIcons.FileText className="tds-review-icon" /><h3 className="tds-review-title">Documents ({entries.length})</h3></div>
              <EditButton onClick={onEditStep2} testId="edit-documents-btn" />
            </div>
            {entries.length > 0 ? (
              <div className="tds-review-docs-pills">
                {entries.map(([docId, meta]) => {
                  const docConfig = TDS_DOCUMENTS.find((d) => d.id === docId)
                  const label = docConfig?.title || meta.name || docId
                  return (
                    <span key={docId} className="tds-review-doc-pill">
                      <span className="tds-review-doc-pill-check" aria-hidden="true">✓</span>
                      <span>{label}</span>
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="tds-review-empty-text">No documents uploaded yet</p>
            )}
          </section>

          <TdsRefundComputationCard
            grossIncome={grossIncomeNum} totalDeductions={totalDeductionsNum} taxableIncome={taxableIncome}
            tdsDeducted={totalTdsDeductedNum} tcsCollected={tcsAmountNum} advanceAndSelfTax={advanceAndSelfTax}
            totalTaxCredits={totalTaxCredits} estimatedRefund={totalTaxCredits}
          />
        </main>
      </div>
      <StepActionBar onBack={onBack} onNext={onNext} onSaveDraft={onSaveDraft} nextLabel="Continue" nextDisabled={!isReviewValid} backTestId="tds-step3-back-btn" nextTestId="tds-proceed-payment-btn" />
    </div>
  )
}

export default TdsRefundReview
