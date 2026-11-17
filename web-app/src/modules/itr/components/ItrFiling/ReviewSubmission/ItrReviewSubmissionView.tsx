import React, { useState, useMemo, useEffect } from 'react'
import { useAuthStore } from '@store/index'
import {
  getStoredTaxpayerProfile,
  ItrFilingHeaderStepper,
  ITR_REVIEW_EDIT_STEPS,
  getItrChecklistSections,
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
  type PreviousItrInfo,
  type ItrCategoryId,
  formatIndianCurrency,
} from '../itrFiling.constants'
import { determineApplicableItrForm } from '../IncomeSources/ItrApplicableReturnFormCard'
import { calculateItrTax } from '../itrTaxCalculator'
import { ItrReviewEstimatedTaxCard } from './ItrReviewEstimatedTaxCard'
import { ItrDeclarationCard } from './ItrDeclarationCard'
import { SaveDraftButton } from '@shared/saveDraft'
import './ItrReviewSubmissionView.css'

export interface ItrReviewSubmissionViewProps {
  onBack: () => void
  /** "Edit" on a review section: opens that step in edit mode, optionally scrolling to section */
  onEditStep?: (step: number, sectionId?: string) => void
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
  selectedCategoryId?: ItrCategoryId | null
  selectedRegime?: 'new' | 'old' | ''
  deductions?: DeductionsData
  previousItr?: PreviousItrInfo
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
  filingType,
  selectedBank,
  salaryDetails,
  housePropertyDetails,
  businessDetails,
  capitalGainsDetails,
  otherSourcesDetails,
  selectedSources = [],
  selectedCategoryId,
  selectedRegime,
  deductions,
  previousItr,
  uploadedDocs,
  isSubmitting = false,
}) => {
  const [isDeclared, setIsDeclared] = useState(false)
  const [showError, setShowError] = useState(false)

  const authUser = useAuthStore((state) => state.user)
  const profile = getStoredTaxpayerProfile(authUser)

  const taxResult = useMemo(
    () =>
      calculateItrTax({
        selectedSources,
        salaryDetails,
        housePropertyDetails,
        businessDetails,
        capitalGainsDetails,
        otherSourcesDetails,
        selectedRegime,
        deductions,
      }),
    [
      selectedSources,
      salaryDetails,
      housePropertyDetails,
      businessDetails,
      capitalGainsDetails,
      otherSourcesDetails,
      selectedRegime,
      deductions,
    ]
  )

  const { requiredDocs } = useMemo(
    () => getItrChecklistSections({ selectedSources, selectedCategoryId }),
    [selectedSources, selectedCategoryId]
  )

  const missingRequiredDocs = useMemo(
    () => requiredDocs.filter((doc) => Boolean(doc.isMandatory) && !uploadedDocs[doc.id]),
    [requiredDocs, uploadedDocs]
  )

  const missingDocsCount = missingRequiredDocs.length
  const hasMissingDocs = missingDocsCount > 0

  const formInfo = determineApplicableItrForm({
    selectedSources,
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    residentialStatus,
  })

  const handleEdit = (step: number, sectionId?: string) => {
    if (onEditStep) {
      onEditStep(step, sectionId)
    } else {
      onBack()
    }
  }

  const handleSubmit = () => {
    if (hasMissingDocs) {
      setShowError(true)
      try {
        const attentionEl = document.querySelector('.itr-attention-banner')
        if (attentionEl && typeof attentionEl.scrollIntoView === 'function') {
          attentionEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } catch {
        // ignore
      }
      return
    }
    if (!isDeclared) {
      setShowError(true)
      return
    }
    onSubmit()
  }

  useEffect(() => {
    const handleAttempt = () => {
      if (!isDeclared || hasMissingDocs) setShowError(true)
    }
    window.addEventListener('step-action-bar:submit-attempt', handleAttempt)
    return () => window.removeEventListener('step-action-bar:submit-attempt', handleAttempt)
  }, [isDeclared, hasMissingDocs])

  // Residential Status Label Formatting
  const RESIDENTIAL_STATUS_LABELS: Record<string, string> = {
    resident: 'Resident',
    nri: 'Non-Resident',
    'non-resident': 'Non-Resident',
    rnor: 'Resident but Not Ordinarily Resident',
  }

  const formatResidentialStatus = (status: string): string => {
    if (!status) return 'Resident'
    const lower = status.toLowerCase()
    return RESIDENTIAL_STATUS_LABELS[lower] || status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Return Type Formatting
  const formatReturnType = (type?: FilingTypeOption): string => {
    if (type === 'revised') return 'Revised Return (139(5))'
    if (type === 'belated') return 'Belated Return (139(4))'
    return 'Original Return (139(1))'
  }

  // Bank Info Formatting
  const bankLast4 = selectedBank?.accountNumber
    ? selectedBank.accountNumber.replace(/\D/g, '').slice(-4)
    : '8558'
  const bankName = selectedBank?.bankName || 'State Bank of India'
  const bankIfsc = selectedBank?.ifsc || (selectedBank as unknown as { ifscCode?: string })?.ifscCode || 'SBIN0000123'

  // Declared Income Items
  interface DeclaredIncomeItem {
    id: string
    title: string
    subtitle: string
    amount: string
    elementId: string
    details?: Array<{ label: string; value: string }>
  }

  const parseNumericAmount = (val: string | undefined | null): number => {
    if (!val) return 0
    const cleaned = String(val).replace(/[^0-9]/g, '')
    const num = Number(cleaned)
    return isNaN(num) ? 0 : num
  }

  const incomeItems: DeclaredIncomeItem[] = []

  if (selectedSources.includes('salary')) {
    const grossAmt = parseNumericAmount(salaryDetails?.grossSalary)
    const exemptAmt = parseNumericAmount(salaryDetails?.exemptAllowances)
    const tdsAmt = parseNumericAmount(salaryDetails?.tdsDeducted)
    incomeItems.push({
      id: 'salary',
      title: 'Salary Income',
      subtitle: `${salaryDetails?.employerName || 'Employer'} · TDS: ${formatIndianCurrency(tdsAmt)}`,
      amount: formatIndianCurrency(grossAmt),
      elementId: 'itr-salary-income',
      details: [
        { label: 'Employer Name', value: salaryDetails?.employerName || '—' },
        { label: 'Gross Salary', value: formatIndianCurrency(grossAmt) },
        { label: 'Exempt Allowances (u/s 10)', value: formatIndianCurrency(exemptAmt) },
        { label: 'TDS Deducted', value: formatIndianCurrency(tdsAmt) },
      ],
    })
  }

  if (selectedSources.includes('house_property')) {
    const isLetOut = housePropertyDetails?.propertyType === 'let_out'
    const rentAmt = parseNumericAmount(housePropertyDetails?.annualRentReceived)
    const interestAmt = parseNumericAmount(housePropertyDetails?.homeLoanInterest)
    const municipalTaxes = parseNumericAmount(
      housePropertyDetails?.municipalTaxPaid || (housePropertyDetails as any)?.municipalTaxesPaid
    )
    incomeItems.push({
      id: 'house_property',
      title: 'House Property',
      subtitle: isLetOut
        ? `Let-Out · Rent: ${formatIndianCurrency(rentAmt)}`
        : `Self-Occupied · Interest Paid: ${formatIndianCurrency(interestAmt)}`,
      amount: formatIndianCurrency(isLetOut ? rentAmt : interestAmt),
      elementId: 'itr-house-property',
      details: [
        { label: 'Property Type', value: isLetOut ? 'Let-Out Property' : 'Self-Occupied Property' },
        ...(isLetOut
          ? [
              { label: 'Annual Rent Received', value: formatIndianCurrency(rentAmt) },
              { label: 'Municipal Taxes Paid', value: formatIndianCurrency(municipalTaxes) },
            ]
          : []),
        { label: 'Home Loan Interest (Sec 24b)', value: formatIndianCurrency(interestAmt) },
      ],
    })
  }

  if (selectedSources.includes('business')) {
    const turnover = parseNumericAmount(businessDetails?.grossTurnover)
    const profit = parseNumericAmount(businessDetails?.declaredNetProfit)
    const method = businessDetails?.reportingMethod ? `Method: ${businessDetails.reportingMethod}` : 'Business'
    const marginPct = turnover > 0 ? `${((profit / turnover) * 100).toFixed(1)}%` : '—'
    incomeItems.push({
      id: 'business',
      title: 'Business / Profession',
      subtitle: `${method} · Net Profit: ${formatIndianCurrency(profit)}`,
      amount: formatIndianCurrency(profit > 0 ? profit : turnover),
      elementId: 'itr-business-income',
      details: [
        { label: 'Reporting Method', value: businessDetails?.reportingMethod || '44AD / Presumptive' },
        { label: 'Gross Turnover / Receipts', value: formatIndianCurrency(turnover) },
        { label: 'Declared Net Profit', value: formatIndianCurrency(profit) },
        { label: 'Net Profit Margin', value: marginPct },
      ],
    })
  }

  if (selectedSources.includes('capital_gains')) {
    const stcg = parseNumericAmount(capitalGainsDetails?.stcg)
    const ltcg = parseNumericAmount(capitalGainsDetails?.ltcg)
    const assetTypes = capitalGainsDetails?.assetTypes && capitalGainsDetails.assetTypes.length > 0
      ? capitalGainsDetails.assetTypes.map(t => t.replace('_', ' ').toUpperCase()).join(', ')
      : 'Equity & Mutual Funds'
    incomeItems.push({
      id: 'capital_gains',
      title: 'Capital Gains',
      subtitle: `STCG: ${formatIndianCurrency(stcg)} · LTCG: ${formatIndianCurrency(ltcg)}`,
      amount: formatIndianCurrency(stcg + ltcg),
      elementId: 'itr-capital-gains',
      details: [
        { label: 'Asset Types Traded', value: assetTypes },
        { label: 'Short-Term Capital Gains (STCG)', value: formatIndianCurrency(stcg) },
        { label: 'Long-Term Capital Gains (LTCG)', value: formatIndianCurrency(ltcg) },
      ],
    })
  }

  if (selectedSources.includes('other_sources')) {
    const savings = parseNumericAmount(otherSourcesDetails?.savingsInterest || otherSourcesDetails?.interestIncome)
    const fd = parseNumericAmount(otherSourcesDetails?.fdInterest)
    const dividend = parseNumericAmount(otherSourcesDetails?.dividendIncome)
    const pension = parseNumericAmount(otherSourcesDetails?.familyPension)
    const other = parseNumericAmount(otherSourcesDetails?.otherMiscellaneous || otherSourcesDetails?.otherIncome)
    const total = savings + fd + dividend + pension + other
    incomeItems.push({
      id: 'other_sources',
      title: 'Other Sources',
      subtitle: 'Interest & Dividend Income',
      amount: formatIndianCurrency(total),
      elementId: 'itr-other-sources',
      details: [
        { label: 'Savings Account Interest', value: formatIndianCurrency(savings) },
        { label: 'Fixed Deposit (FD) Interest', value: formatIndianCurrency(fd) },
        { label: 'Dividend Income', value: formatIndianCurrency(dividend) },
        { label: 'Family Pension', value: formatIndianCurrency(pension) },
        { label: 'Other Miscellaneous Income', value: formatIndianCurrency(other) },
      ],
    })
  }

  const docCount = Object.keys(uploadedDocs).length

  return (
    <div className="itr-step-view-container itr-step-review">
      {/* Header Stepper */}
      <div className="itr-review-header-wrapper">
        <ItrFilingHeaderStepper currentStepId={4} />
      </div>

      {/* 1. Review Your ITR Application Banner */}
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
            Review your declared income, refund bank account, and documents before submitting for CA review.
          </div>
        </div>
      </div>

      {/* 2. Before we continue: Pending Items Attention Banner */}
      {hasMissingDocs && (
        <div className="itr-attention-banner" role="alert" data-testid="itr-review-attention-banner">
          <div className="itr-attention-banner__header">
            <div className="itr-attention-banner__icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <circle cx="12" cy="12" r="11" fill="#b45309" />
                <line x1="12" y1="7.5" x2="12" y2="12.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1.25" fill="#ffffff" />
              </svg>
            </div>
            <h3 className="itr-attention-banner__title">
              Before we continue: {missingDocsCount} {missingDocsCount === 1 ? 'items require' : 'items require'} your attention
            </h3>
          </div>
          <p className="itr-attention-banner__subtitle">
            Finsolz identified the following pending items for your return. Please review or confirm them prior to submission.
          </p>
          <div className="itr-attention-banner__item">
            <div className="itr-attention-banner__item-left">
              <span className="itr-attention-banner__item-x" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#ef4444" />
                  <path d="m15 9-6 6m0-6 6 6" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="itr-attention-banner__item-text">
                {missingDocsCount} required {missingDocsCount === 1 ? 'documents' : 'documents'} missing
              </span>
            </div>
            <button
              type="button"
              className="itr-attention-banner__upload-btn"
              data-testid="review-upload-required-docs-btn"
              onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.documents, 'itr-documents-checklist')}
              aria-label="Upload required documents"
            >
              <span>Upload</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 3. Responsive 2x2 Grid (Desktop) / 1-Column Stack (Mobile) */}
      <div className="itr-rv2-cards-grid">
        {/* Card 1: Filing & Taxpayer Details */}
        <div className="itr-step-card itr-rv2-card itr-rv2-card--filing">
          <div className="itr-rv2-section-header-row">
            <h3 className="itr-rv2-section-title">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
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
              onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.taxpayer, 'itr-filing-options')}
              aria-label="Edit Filing & Taxpayer Details"
            >
              Edit
            </button>
          </div>

          <div className="itr-rv2-details-rows">
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Assessment Year</span>
              <span className="itr-rv2-detail-row__val">{assessmentYear || 'AY 2025-2026'}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Return Type</span>
              <span className="itr-rv2-detail-row__val">{formatReturnType(filingType)}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Applicable Form</span>
              <span className="itr-rv2-detail-row__val">{formInfo.form}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Tax Regime</span>
              <span className="itr-rv2-detail-row__val">
                {selectedRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime (Default)'}
              </span>
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
              <span className="itr-rv2-detail-row__label">Aadhaar Number</span>
              <span className="itr-rv2-detail-row__val">
                {profile.aadhaarNumber
                  ? profile.aadhaarNumber.length >= 12
                    ? `•••• •••• ${profile.aadhaarNumber.slice(-4)}`
                    : profile.aadhaarNumber
                  : '—'}
              </span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Date of Birth</span>
              <span className="itr-rv2-detail-row__val">{profile.dob || '—'}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Mobile Number</span>
              <span className="itr-rv2-detail-row__val">{profile.mobileNumber || '—'}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Email Address</span>
              <span className="itr-rv2-detail-row__val">{profile.emailAddress || '—'}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Residential Status</span>
              <span className="itr-rv2-detail-row__val">{formatResidentialStatus(residentialStatus)}</span>
            </div>
            <div className="itr-rv2-detail-row itr-rv2-detail-row--full-width">
              <span className="itr-rv2-detail-row__label">Registered Address</span>
              <span className="itr-rv2-detail-row__val">{profile.registeredAddress || '—'}</span>
            </div>
            {previousItr && (
              <>
                <div className="itr-rv2-detail-row">
                  <span className="itr-rv2-detail-row__label">Previous Year Return</span>
                  <span className="itr-rv2-detail-row__val">
                    {(previousItr.hasPreviousReturn ?? (previousItr as any).filedPreviousYear)
                      ? 'Filed'
                      : 'Not Filed'}
                  </span>
                </div>
                {(previousItr.hasPreviousReturn ?? (previousItr as any).filedPreviousYear) && (
                  <>
                    <div className="itr-rv2-detail-row">
                      <span className="itr-rv2-detail-row__label">Previous Ack No.</span>
                      <span className="itr-rv2-detail-row__val">
                        {previousItr.ackNumber || (previousItr as any).acknowledgementNumber || '—'}
                      </span>
                    </div>
                    <div className="itr-rv2-detail-row">
                      <span className="itr-rv2-detail-row__label">Filing Date</span>
                      <span className="itr-rv2-detail-row__val">{previousItr.filingDate || '—'}</span>
                    </div>
                    <div className="itr-rv2-detail-row">
                      <span className="itr-rv2-detail-row__label">Carry Forward Loss</span>
                      <span className="itr-rv2-detail-row__val">
                        {previousItr.lossAmount || (previousItr as any).carryForwardLoss
                          ? formatIndianCurrency(
                              parseNumericAmount(
                                previousItr.lossAmount || (previousItr as any).carryForwardLoss
                              )
                            )
                          : '₹0'}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Card 2: Declared Income Breakdown */}
        <div className="itr-step-card itr-rv2-card itr-rv2-card--income">
          <div className="itr-rv2-section-header-row">
            <h3 className="itr-rv2-section-title">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
              </svg>
              <span>Declared Income Breakdown</span>
            </h3>
            <button
              type="button"
              className="itr-rv2-edit-btn"
              onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.income, 'itr-income-sources')}
              aria-label="Edit Summary & Declared Income Breakdown"
            >
              Edit
            </button>
          </div>

          {incomeItems.length === 0 ? (
            <div className="itr-rv2-no-docs-box">
              No income sources declared yet
            </div>
          ) : (
            <div className="itr-rv2-income-items-list">
              {incomeItems.map((item) => (
                <div key={item.id} className="itr-rv2-income-source-card">
                  <div className="itr-rv2-income-source-top">
                    <div className="itr-rv2-income-source-left">
                      <div className="itr-rv2-income-source-title">{item.title}</div>
                      <div className="itr-rv2-income-source-sub">{item.subtitle}</div>
                    </div>
                    <div className="itr-rv2-income-source-right">
                      <div className="itr-rv2-income-source-amount">{item.amount}</div>
                      <div className="itr-rv2-income-badge-row">
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
                          <span>Declared</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.details && item.details.length > 0 && (
                    <div className="itr-rv2-income-sub-details">
                      {item.details.map((sub, sIdx) => (
                        <div key={sIdx} className="itr-rv2-income-sub-row">
                          <span className="itr-rv2-income-sub-label">{sub.label}</span>
                          <span className="itr-rv2-income-sub-val">{sub.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Estimated Tax & Calculation Breakdown */}
        <ItrReviewEstimatedTaxCard
          selectedRegime={selectedRegime || 'new'}
          taxResult={taxResult}
          onEdit={() => handleEdit(ITR_REVIEW_EDIT_STEPS.income, 'itr-income-sources')}
        />

        {/* Card 4: Refund Bank Account */}
        <div className="itr-step-card itr-rv2-card itr-rv2-card--bank">
          <div className="itr-rv2-section-header-row">
            <h3 className="itr-rv2-section-title">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>Refund Bank Account</span>
            </h3>
            <button
              type="button"
              className="itr-rv2-edit-btn"
              onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.taxpayer, 'itr-refund-bank-section')}
              aria-label="Edit Refund Bank Account"
            >
              Edit
            </button>
          </div>

          <div className="itr-rv2-details-rows">
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Bank Name</span>
              <span className="itr-rv2-detail-row__val">{bankName}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Account Number</span>
              <span className="itr-rv2-detail-row__val">···· {bankLast4}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">IFSC Code</span>
              <span className="itr-rv2-detail-row__val">{bankIfsc}</span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Account Type</span>
              <span className="itr-rv2-detail-row__val">
                {selectedBank?.accountType
                  ? selectedBank.accountType.charAt(0).toUpperCase() + selectedBank.accountType.slice(1)
                  : 'Savings Account'}
              </span>
            </div>
            <div className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">Account Status</span>
              <span className="itr-rv2-detail-row__val">
                {selectedBank?.isPreValidated ?? (selectedBank as any)?.isVerified ? 'Pre-validated' : 'Active'}
              </span>
            </div>
          </div>

          <div className="itr-rv2-bank-badge-container">
            <div className="itr-rv2-bank-pill-badge">
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Primary Account for Income Tax Refund</span>
            </div>
          </div>
        </div>

        {/* Card 4: Uploaded Documents */}
        <div className="itr-step-card itr-rv2-card itr-rv2-card--docs">
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
              onClick={() => handleEdit(ITR_REVIEW_EDIT_STEPS.documents, 'itr-documents-checklist')}
              aria-label="Edit Uploaded Documents"
            >
              Edit
            </button>
          </div>

          {docCount === 0 ? (
            <div className="itr-rv2-no-docs-box">
              No documents uploaded yet
            </div>
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

      {/* 6. Checkbox Declaration (Full Width) */}
      <ItrDeclarationCard
        isDeclared={isDeclared}
        showError={showError}
        onChange={(declared) => {
          setIsDeclared(declared)
          if (declared) setShowError(false)
        }}
      />

      {/* 7. Action Footer Bar (matching GST module: Save Draft & Submit grouped on right) */}
      <div className="itr-rv2-footer-action-bar">
        <div className="form-actions-group">
          {onSaveDraft && <SaveDraftButton onClick={onSaveDraft} />}

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
    </div>
  )
}

export default ItrReviewSubmissionView
