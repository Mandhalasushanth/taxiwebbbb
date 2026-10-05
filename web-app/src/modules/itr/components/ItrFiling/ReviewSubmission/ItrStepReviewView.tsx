import React, { useState } from 'react'
import { StepActionBar } from '@shared/components'
import { useAuthStore } from '@store/index'
import {
  getStoredTaxpayerProfile,
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
import { ItrStepHeaderStepper } from '../ItrStepHeaderStepper'
import { calculateItrTax } from '../itrTaxCalculator'
import { ItrReviewLeftColumn } from './ItrReviewLeftColumn'
import { ItrReviewTaxSummaryCard } from './ItrReviewTaxSummaryCard'
import './ItrStepReviewView.css'

export interface ItrStepReviewViewProps {
  onBack: () => void
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

export const ItrStepReviewView: React.FC<ItrStepReviewViewProps> = ({
  onBack,
  onSubmit,
  onSaveDraft,
  assessmentYear,
  residentialStatus,
  filingType,
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
  const authUser = useAuthStore((state) => state.user)
  const profile = getStoredTaxpayerProfile(authUser)

  // Compute applicable form
  const hasBusiness = selectedSources.includes('business')
  const hasCapitalGains = selectedSources.includes('capital_gains')
  const applicableForm = hasBusiness
    ? businessDetails?.reportingMethod === 'regular'
      ? 'ITR-3 (Business & Profession)'
      : 'ITR-4 (Sugam Presumptive)'
    : hasCapitalGains
    ? 'ITR-2 (Capital Gains & Multiple)'
    : 'ITR-1 (Sahaj - Salaried)'

  // Perform tax calculation
  const taxResult = calculateItrTax({
    selectedRegime: selectedRegime || 'new',
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    deductions,
  })

  return (
    <div className="itr-filing-step itr-step-review">
      {/* Header with Step Indicator */}
      <ItrStepHeaderStepper currentStepId={5} />

      {/* Review Two-Column Grid */}
      <div className="itr-rv2-grid">
        {/* Left Column: Summary, Filing Details, Docs */}
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
          onEdit={onBack}
        />

        {/* Right Column: Tax Calculation Summary & Trust Card */}
        <ItrReviewTaxSummaryCard
          selectedRegime={selectedRegime}
          grossTotalIncome={taxResult.grossTotalIncome}
          stdDeduction={taxResult.stdDeduction}
          totalChapterVIDeductions={taxResult.totalChapterVIDeductions}
          netTaxableIncome={taxResult.netTaxableIncome}
          grossTax={taxResult.grossTax}
          cess={taxResult.cess}
          totalTaxLiability={taxResult.totalTaxLiability}
          tdsCredits={taxResult.tdsCredits}
          netTaxPayable={taxResult.netTaxPayable}
          refundDue={taxResult.refundDue}
        />
      </div>

      {/* Self Declaration Checkbox */}
      <div className="itr-step-card itr-rv2-declaration-card">
        <label className="itr-rv2-declaration-label">
          <input
            type="checkbox"
            checked={isDeclared}
            onChange={(e) => setIsDeclared(e.target.checked)}
            className="itr-rv2-declaration-check"
          />
          <span className="itr-rv2-declaration-text">
            I hereby declare that the information provided is complete, true, and correct to the best of my knowledge. I authorise TaxEdge and its designated Chartered Accountants to prepare, review, and file my Income Tax Return for Assessment Year {assessmentYear || 'AY 2026-27'}.
          </span>
        </label>
      </div>

      {/* Step Action Bar */}
      <StepActionBar
        onBack={onBack}
        onNext={onSubmit}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
        nextDisabled={!isDeclared || isSubmitting}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
