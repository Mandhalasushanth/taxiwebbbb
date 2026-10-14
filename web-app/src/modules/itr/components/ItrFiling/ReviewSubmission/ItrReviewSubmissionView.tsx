import React, { useState } from 'react'
import { useAuthStore } from '@store/index'
import {
  getStoredTaxpayerProfile,
  CalculatorIcon,
  ItrFilingHeaderStepper,
  ITR_REVIEW_EDIT_STEPS,
  type SalaryDetails,
  type HousePropertyDetails,
  type BusinessDetails,
  type CapitalGainsDetails,
  type OtherSourcesDetails,
  type DeductionsData,
  type UploadedDocInfo,
  type AssessmentYearOption,
  type ResidentialStatusOption,
  type FilingTypeOption,
  type FilingBankAccount,
} from '../itrFiling.constants'
import { calculateItrTax, formatINR } from '../itrTaxCalculator'
import { determineApplicableItrForm } from '../IncomeSources/ItrApplicableReturnFormCard'
import './ItrReviewSubmissionView.css'

export interface ItrReviewSubmissionViewProps {
  onBack: () => void
  /** "Edit" on a review section: opens that step in edit mode */
  onEditStep?: (step: number) => void
  onSubmit: () => void
  onSaveDraft?: () => void
  assessmentYear: AssessmentYearOption
  residentialStatus: ResidentialStatusOption
  filingType: FilingTypeOption
  selectedBank?: FilingBankAccount
  salaryDetails: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  selectedSources?: string[]
  selectedRegime: 'new' | 'old' | ''
  deductions: DeductionsData
  uploadedDocs: Record<string, UploadedDocInfo>
  isSubmitting?: boolean
}

export const ItrReviewSubmissionView: React.FC<ItrReviewSubmissionViewProps> = ({
  onBack,
  onEditStep,
  onSubmit,
  onSaveDraft,
  assessmentYear,
  residentialStatus,
  selectedBank,
  salaryDetails,
  housePropertyDetails,
  businessDetails,
  capitalGainsDetails,
  otherSourcesDetails,
  selectedSources = [],
  selectedRegime,
  deductions,
  uploadedDocs,
  isSubmitting = false,
}) => {
  const [isDeclared, setIsDeclared] = useState(false)
  const [showError, setShowError] = useState(false)

  const authUser = useAuthStore((state) => state.user)
  const profile = getStoredTaxpayerProfile(authUser)

  const formInfo = determineApplicableItrForm({
    selectedSources,
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    residentialStatus,
  })

  const taxResult = calculateItrTax({
    selectedSources,
    selectedRegime: selectedRegime || 'new',
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    deductions,
  })

  const handleEdit = (step: number) => {
    if (onEditStep) {
      onEditStep(step)
    } else {
      onBack()
    }
  }

  const handleSubmit = () => {
    if (!isDeclared) {
      setShowError(true)
      return
    }
    onSubmit()
  }

  React.useEffect(() => {
    const handleAttempt = () => {
      if (!isDeclared) setShowError(true)
    }
    window.addEventListener('step-action-bar:submit-attempt', handleAttempt)
    return () => window.removeEventListener('step-action-bar:submit-attempt', handleAttempt)
  }, [isDeclared])

  // Bank display formatting
  const bankLast4 = selectedBank?.accountNumber
    ? selectedBank.accountNumber.replace(/\D/g, '').slice(-4)
    : '7673'
  const bankName = selectedBank?.bankName || 'Bsbsbs'
  const bankDisplay = `${bankName} (···· ${bankLast4})`

  // Format residential status
  const formatResidentialStatus = (status: string): string => {
    if (!status) return 'Resident'
    const lower = status.toLowerCase()
    if (lower === 'resident') return 'Resident'
    if (lower === 'nri' || lower === 'non-resident') return 'Non-Resident'
    if (lower === 'rnor') return 'Resident but Not Ordinarily Resident'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const docCount = Object.keys(uploadedDocs).length

  return (
    <div className="itr-step-view-container itr-step-review">
      {/* Header Stepper + Top Draft action */}
      <div className="itr-review-header-wrapper">
        <ItrFilingHeaderStepper currentStepId={4} />
        {onSaveDraft && (
          <button
            type="button"
            className="itr-review-top-draft-btn"
            onClick={onSaveDraft}
            aria-label="Save draft"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Draft</span>
          </button>
        )}
      </div>

      {/* 1. Review Your ITR Application Banner (Full Width) */}
      <div className="itr-rv2-alert">
        <div className="itr-rv2-alert__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div className="itr-rv2-alert__content">
          <div className="itr-rv2-alert__title">Review Your ITR Application</div>
          <div className="itr-rv2-alert__desc">
            Review your declared income, deductions, and tax summary before submitting for CA review.
          </div>
        </div>
      </div>

      {/* Desktop 2-Column / Mobile Responsive Grid */}
      <div className="itr-rv2-desktop-grid">
        {/* Left Column (Desktop) */}
        <div className="itr-rv2-left-col">
          {/* 2. Summary & Declared Income */}
          <div className="itr-step-card itr-rv2-card-summary">
            <div className="itr-rv2-section-header-row">
              <h3 className="itr-rv2-section-title">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Summary &amp; Declared Income</span>
              </h3>
              <button
                type="button"
                className="itr-rv2-edit-btn"
                onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.income)}
              >
                Edit
              </button>
            </div>

            {/* Inner Box for Taxpayer Identity & Refund Bank Account (matches reference) */}
            <div className="itr-rv2-identity-box">
              <div className="itr-rv2-identity-row">
                <div className="itr-rv2-identity-info">
                  <div className="itr-rv2-identity-label">Taxpayer Identity</div>
                  <div className="itr-rv2-identity-val">
                    PAN: {profile.panNumber || '—'} &bull; Name: {profile.fullName || '—'}
                  </div>
                </div>
                <span className="itr-rv2-badge itr-rv2-badge--green">
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Profile Verified</span>
                </span>
              </div>

              <div className="itr-rv2-identity-row">
                <div className="itr-rv2-identity-info">
                  <div className="itr-rv2-identity-label">Refund Bank Account</div>
                  <div className="itr-rv2-identity-val">{bankDisplay}</div>
                </div>
                <span className="itr-rv2-badge itr-rv2-badge--green">
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Selected</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4. Filing & Taxpayer Details */}
          <div className="itr-step-card itr-rv2-card-filing">
            <div className="itr-rv2-section-header-row">
              <h3 className="itr-rv2-section-title">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Filing &amp; Taxpayer Details</span>
              </h3>
              <button
                type="button"
                className="itr-rv2-edit-btn"
                onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.taxpayer)}
              >
                Edit
              </button>
            </div>
            <div className="itr-rv2-details-rows">
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">Assessment Year</span>
                <span className="itr-rv2-detail-row__val">{assessmentYear || 'AY 2026-2027'}</span>
              </div>
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">Applicable Return Form</span>
                <span className="itr-rv2-detail-row__val">{formInfo.form}</span>
              </div>
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">Full Name</span>
                <span className="itr-rv2-detail-row__val">{profile.fullName || '—'}</span>
              </div>
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">PAN Number</span>
                <span className="itr-rv2-detail-row__val">{profile.panNumber || '—'}</span>
              </div>
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">Residential Status</span>
                <span className="itr-rv2-detail-row__val">{formatResidentialStatus(residentialStatus)}</span>
              </div>
              <div className="itr-rv2-detail-row">
                <span className="itr-rv2-detail-row__label">Primary Bank Account</span>
                <span className="itr-rv2-detail-row__val">{bankDisplay}</span>
              </div>
            </div>
          </div>

          {/* 5. Uploaded Documents */}
          <div className="itr-step-card itr-rv2-card-docs">
            <div className="itr-rv2-section-header-row">
              <h3 className="itr-rv2-section-title">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                <span>Uploaded Documents ({docCount})</span>
              </h3>
              <button
                type="button"
                className="itr-rv2-edit-btn"
                onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.documents)}
              >
                Edit
              </button>
            </div>
            {docCount === 0 ? (
              <p className="itr-rv2-no-docs">
                No documents uploaded. Your CA will request them separately.
              </p>
            ) : (
              <div className="itr-rv2-doc-list">
                {Object.entries(uploadedDocs).map(([id, doc]) => (
                  <div key={id} className="itr-rv2-doc-row">
                    <span className="itr-rv2-doc-check" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <div className="itr-rv2-doc-info">
                      <span className="itr-rv2-doc-name">{doc.fileName}</span>
                      <span className="itr-rv2-doc-meta">
                        {doc.fileSize} &middot; {doc.uploadedAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Desktop) */}
        <div className="itr-rv2-right-col">
          {/* 3. Estimated Tax Summary */}
          <div className="itr-step-card itr-rv2-tax-card itr-rv2-card-tax">
            <div className="itr-rv2-tax-card__header">
              <div className="itr-rv2-tax-card__title-row">
                <span className="itr-rv2-tax-icon" aria-hidden="true">
                  <CalculatorIcon size={18} />
                </span>
                <h3 className="itr-rv2-tax-card__title">Estimated Tax Summary</h3>
              </div>
              <span className="itr-rv2-regime-badge">
                {selectedRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}
              </span>
            </div>

            <div className="itr-rv2-tax-rows">
              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">1. Gross Total Income</span>
                <span className="itr-rv2-tax-row__val">{formatINR(taxResult.grossTotalIncome)}</span>
              </div>
              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">2. Less: Standard Deduction</span>
                <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
                  &minus; {formatINR(taxResult.stdDeduction)}
                </span>
              </div>
              {selectedRegime === 'old' && taxResult.totalChapterVIDeductions > 0 && (
                <div className="itr-rv2-tax-row">
                  <span className="itr-rv2-tax-row__label">3. Less: Chapter VI-A Deductions</span>
                  <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
                    &minus; {formatINR(taxResult.totalChapterVIDeductions)}
                  </span>
                </div>
              )}

              <div className="itr-rv2-tax-row itr-rv2-tax-row--bold">
                <span>Net Taxable Income</span>
                <span>{formatINR(taxResult.netTaxableIncome)}</span>
              </div>

              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">Gross Income Tax (per Slabs)</span>
                <span className="itr-rv2-tax-row__val">{formatINR(taxResult.grossTax)}</span>
              </div>
              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">Health &amp; Education Cess (4%)</span>
                <span className="itr-rv2-tax-row__val">{formatINR(taxResult.cess)}</span>
              </div>
              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">Total Tax Liability</span>
                <span className="itr-rv2-tax-row__val">{formatINR(taxResult.totalTaxLiability)}</span>
              </div>
              <div className="itr-rv2-tax-row">
                <span className="itr-rv2-tax-row__label">Less: Taxes Already Paid (TDS Credits)</span>
                <span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">
                  &minus; {formatINR(taxResult.tdsCredits)}
                </span>
              </div>
            </div>

            {/* Net Tax Payable / Refund Due box (matches reference screenshot) */}
            <div className={`itr-rv2-net-tax-box ${taxResult.refundDue > 0 ? 'itr-rv2-net-tax-box--refund' : ''}`}>
              <div className="itr-rv2-net-tax-label">
                <span className="itr-rv2-net-tax-title">
                  {taxResult.refundDue > 0 ? 'Refund Due' : 'Net Tax Payable'}
                </span>
                <span className="itr-rv2-net-tax-sub">
                  {taxResult.refundDue > 0 ? 'Expected refund after e-filing' : 'Payable before return filing'}
                </span>
              </div>
              <div className="itr-rv2-net-tax-amount">
                {taxResult.refundDue > 0 ? `+ ${formatINR(taxResult.refundDue)}` : formatINR(taxResult.netTaxPayable)}
              </div>
            </div>

            {/* CA Review Info Note (matches reference screenshot) */}
            <div className="itr-rv2-info-note">
              <span className="itr-rv2-info-note__circle" aria-hidden="true">i</span>
              <p className="itr-rv2-info-note__text">
                This is an initial estimation based on your declared figures. Your assigned CA will thoroughly review your documents, verify TDS credits with the Income Tax Department, and prepare the final return for your confirmation before e-filing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Checkbox Declaration (Full Width) */}
      <div className={`itr-step-card itr-rv2-declaration-card ${showError && !isDeclared ? 'itr-info-card--error' : ''}`}>
        <label className="itr-rv2-declaration-label">
          <input
            type="checkbox"
            checked={isDeclared}
            onChange={(e) => {
              setIsDeclared(e.target.checked)
              if (e.target.checked) setShowError(false)
            }}
            className="itr-rv2-declaration-check"
          />
          <span className="itr-rv2-declaration-text">
            I confirm that the income details, deductions, bank account, and documents provided are correct and complete to the best of my knowledge.
          </span>
        </label>
        {showError && !isDeclared && (
          <div className="itr-field-error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Please confirm the declaration before submitting for CA review.</span>
          </div>
        )}
      </div>

      {/* 7. Action Footer Bar: Left Back Button & Right Submit Button */}
      <div className="itr-rv2-footer-action-bar">
        <button
          type="button"
          className="itr-rv2-btn-back"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="itr-rv2-submit-btn"
          onClick={handleSubmit}
          disabled={!isDeclared || isSubmitting}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>{isSubmitting ? 'Submitting...' : 'Submit for CA Review'}</span>
        </button>
      </div>
    </div>
  )
}

export default ItrReviewSubmissionView

