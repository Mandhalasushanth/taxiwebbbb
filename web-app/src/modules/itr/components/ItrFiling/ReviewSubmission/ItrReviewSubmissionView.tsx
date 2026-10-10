import React, { useState } from 'react'
import { StepActionBar } from '@shared/components'
import { useAuthStore } from '@store/index'
import {
  getStoredTaxpayerProfile, CalculatorIcon, ItrFilingHeaderStepper,
  type SalaryDetails, type HousePropertyDetails, type BusinessDetails, type CapitalGainsDetails,
  type OtherSourcesDetails, type DeductionsData, type UploadedDocInfo, type AssessmentYearOption,
  type ResidentialStatusOption, type FilingTypeOption, type FilingBankAccount,
} from '../itrFiling.constants'
import { calculateItrTax, formatINR } from '../itrTaxCalculator'
import './ItrReviewSubmissionView.css'

import { ItrReviewLeftColumn, type ItrReviewLeftColumnProps } from './ItrReviewLeftColumn'
export { ItrReviewLeftColumn }
export type { ItrReviewLeftColumnProps }

export interface ItrReviewTaxSummaryCardProps {
  selectedRegime: 'new' | 'old' | ''
  grossTotalIncome: number
  stdDeduction: number
  totalChapterVIDeductions: number
  netTaxableIncome: number
  grossTax: number
  cess: number
  totalTaxLiability: number
  tdsCredits: number
  netTaxPayable: number
  refundDue: number
}

export const ItrReviewTaxSummaryCard: React.FC<ItrReviewTaxSummaryCardProps> = ({
  selectedRegime, grossTotalIncome, stdDeduction, totalChapterVIDeductions,
  netTaxableIncome, grossTax, cess, totalTaxLiability, tdsCredits, netTaxPayable, refundDue,
}) => (
  <div className="itr-rv2-right-col">
    <div className="itr-rv2-tax-card">
      <div className="itr-rv2-tax-card__header">
        <div className="itr-rv2-tax-card__title-row"><span className="itr-rv2-tax-icon"><CalculatorIcon size={18} /></span><h3 className="itr-rv2-tax-card__title">Estimated Tax Summary</h3></div>
        <span className="itr-rv2-regime-badge">{selectedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
      </div>

      <div className="itr-rv2-tax-rows">
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">1. Gross Total Income</span><span className="itr-rv2-tax-row__val">{formatINR(grossTotalIncome)}</span></div>
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">2. Less: Standard Deduction</span><span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(stdDeduction)}</span></div>
        {selectedRegime === 'old' && totalChapterVIDeductions > 0 && (
          <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">3. Less: Chapter VI-A Deductions</span><span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(totalChapterVIDeductions)}</span></div>
        )}
        {selectedRegime === 'new' && (
          <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label itr-rv2-tax-row__label--muted">3. Chapter VI-A Deductions</span><span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--muted">Not Applicable</span></div>
        )}
        <div className="itr-rv2-tax-row itr-rv2-tax-row--bold"><span>Net Taxable Income</span><span>{formatINR(netTaxableIncome)}</span></div>
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">Gross Income Tax (per Slabs)</span><span className="itr-rv2-tax-row__val">{formatINR(grossTax)}</span></div>
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">Health &amp; Education Cess (4%)</span><span className="itr-rv2-tax-row__val">{formatINR(cess)}</span></div>
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">Total Tax Liability</span><span className="itr-rv2-tax-row__val">{formatINR(totalTaxLiability)}</span></div>
        <div className="itr-rv2-tax-row"><span className="itr-rv2-tax-row__label">Less: Taxes Already Paid (TDS Credits)</span><span className="itr-rv2-tax-row__val itr-rv2-tax-row__val--neg">− {formatINR(tdsCredits)}</span></div>
      </div>

      <div className={`itr-rv2-net-tax-box ${refundDue > 0 ? 'itr-rv2-net-tax-box--refund' : ''}`}>
        <div className="itr-rv2-net-tax-label">
          <span className="itr-rv2-net-tax-title">{refundDue > 0 ? 'Refund Due' : 'Net Tax Payable'}</span>
          <span className="itr-rv2-net-tax-sub">{refundDue > 0 ? 'Expected refund after e-filing' : 'Payable before return filing'}</span>
        </div>
        <div className="itr-rv2-net-tax-amount">{refundDue > 0 ? `+ ${formatINR(refundDue)}` : formatINR(netTaxPayable)}</div>
      </div>

      <div className="itr-rv2-info-note"><span className="itr-rv2-info-note__icon">ℹ️</span><span>This is an initial estimation based on your declared figures. Your assigned CA will thoroughly review your documents, verify TDS credits with the Income Tax Department, and prepare the final return for your confirmation before e-filing.</span></div>
    </div>
  </div>
)

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

const resolveApplicableFormLabel = (selectedSources: string[], reportingMethod?: string): string => {
  try {
    if (selectedSources.includes('business')) return reportingMethod === 'regular' ? 'ITR-3 (Business & Profession)' : 'ITR-4 (Sugam Presumptive)'
    if (selectedSources.includes('capital_gains')) return 'ITR-2 (Capital Gains & Multiple)'
    return 'ITR-1 (Sahaj - Salaried)'
  } catch {
    return 'ITR-1 (Sahaj - Salaried)'
  }
}

export const ItrReviewSubmissionView: React.FC<ItrReviewSubmissionViewProps> = ({
  onBack, onEditStep, onSubmit, onSaveDraft, assessmentYear, residentialStatus, filingType, selectedBank,
  salaryDetails, housePropertyDetails, businessDetails, capitalGainsDetails, otherSourcesDetails,
  selectedSources = [], selectedRegime, deductions, uploadedDocs, isSubmitting = false,
}) => {
  const [isDeclared, setIsDeclared] = useState(false)
  const [showError, setShowError] = useState(false)
  const authUser = useAuthStore((state) => state.user)
  const profile = getStoredTaxpayerProfile(authUser)
  const applicableForm = resolveApplicableFormLabel(selectedSources, businessDetails?.reportingMethod)

  const taxResult = calculateItrTax({
    selectedSources, selectedRegime: selectedRegime || 'new', salaryDetails, housePropertyDetails,
    businessDetails, capitalGainsDetails, otherSourcesDetails, deductions,
  })

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

  return (
    <div className="itr-filing-step itr-step-review">
      <ItrFilingHeaderStepper currentStepId={4} />
      <div className="itr-rv2-grid">
        <ItrReviewLeftColumn
          profile={profile}
          selectedBank={selectedBank}
          assessmentYear={assessmentYear}
          applicableForm={applicableForm}
          residentialStatus={residentialStatus}
          filingType={filingType}
          uploadedDocs={uploadedDocs}
          salaryDetails={salaryDetails}
          housePropertyDetails={housePropertyDetails}
          businessDetails={businessDetails}
          capitalGainsDetails={capitalGainsDetails}
          otherSourcesDetails={otherSourcesDetails}
          selectedSources={selectedSources}
          tdsCredits={taxResult.tdsCredits}
          onEdit={onEditStep ?? (() => onBack())}
        />
        <ItrReviewTaxSummaryCard selectedRegime={selectedRegime} grossTotalIncome={taxResult.grossTotalIncome} stdDeduction={taxResult.stdDeduction} totalChapterVIDeductions={taxResult.totalChapterVIDeductions} netTaxableIncome={taxResult.netTaxableIncome} grossTax={taxResult.grossTax} cess={taxResult.cess} totalTaxLiability={taxResult.totalTaxLiability} tdsCredits={taxResult.tdsCredits} netTaxPayable={taxResult.netTaxPayable} refundDue={taxResult.refundDue} />
      </div>
      <div className={`itr-step-card itr-rv2-declaration-card ${showError && !isDeclared ? 'itr-info-card--error' : ''}`}>
        <label className="itr-rv2-declaration-label">
          <input type="checkbox" checked={isDeclared} onChange={(e) => { setIsDeclared(e.target.checked); if (e.target.checked) setShowError(false); }} className="itr-rv2-declaration-check" />
          <span className="itr-rv2-declaration-text">I hereby declare that the information provided is complete, true, and correct to the best of my knowledge. I authorise TaxEdge and its designated Chartered Accountants to prepare, review, and file my Income Tax Return for Assessment Year {assessmentYear || 'AY 2026-27'}.</span>
        </label>
        {showError && !isDeclared && (
          <div className="itr-field-error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Please check and accept the declaration to submit your ITR.</span>
          </div>
        )}
      </div>
      <StepActionBar
        onBack={onBack}
        onNext={handleSubmit}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
        nextDisabled={!isDeclared || isSubmitting}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default ItrReviewSubmissionView
