import React from 'react'
import { useAuthStore } from '@store/index'
import type { PropertyLoanData } from '@modules/loans/types/propertyLoan.types'
import { formatCurrencyString } from '@modules/loans/utils/loanInputFormatters'
import './Review.css'

export interface PropertyLoanReviewProps {
  data: PropertyLoanData
  onChange: (fields: Partial<PropertyLoanData>) => void
  onNavigateToStep: (step: number) => void
  errors?: Record<string, string>
}

const DOCUMENT_TITLES: Record<string, string> = {
  pan_card: 'PAN Card',
  aadhaar_card: 'Aadhaar Card',
  gst_certificate: 'GST Certificate (REG-06)',
  gst_returns: 'GST Returns (12 Months)',
  business_itr: 'Business ITR (Last 2-3 Years)',
  audited_balance_sheet: 'Audited Balance Sheet',
  profit_loss_statement: 'Profit & Loss Statement',
  bank_statement: 'Current Account Bank Statements',
  business_reg_proof: 'Business Registration Proof',
  kyc_directors: 'KYC of Directors / Partners',
  udyam_certificate: 'Udyam Registration Certificate',
  existing_loan_sanction: 'Existing Loan Sanction Letters',
}

export const Review: React.FC<PropertyLoanReviewProps> = ({
  data,
  onChange,
  onNavigateToStep,
  errors = {},
}) => {
  const user = useAuthStore((s) => s.user)
  const uploadedDocs = data.uploadedDocs || {}
  const uploadedKeys = Object.keys(uploadedDocs)

  // Format tenure as e.g. "60 Months (5 Years)"
  const tenureYearsNum = Number(data.tenureYears || 0)
  const tenureFormatted = tenureYearsNum > 0
    ? `${tenureYearsNum * 12} Months (${tenureYearsNum} Years)`
    : '—'

  // Format requested amount and market valuation
  const formattedAmount = data.requiredAmount ? `₹${formatCurrencyString(String(data.requiredAmount))}` : '—'
  const formattedValuation = data.estimatedMarketValue ? `₹${formatCurrencyString(String(data.estimatedMarketValue))}` : '—'
  const formattedInflows = data.annualIncome ? `₹${formatCurrencyString(String(data.annualIncome))}` : '—'

  const displayDocKeys = uploadedKeys

  const renderApplicantCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Applicant Information</h3>
        <span className="property-review-verified-badge">
          <svg viewBox="0 0 20 20" fill="#16a34a" width="16" height="16" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Verified Profile</span>
        </span>
      </div>

      <div className="property-review-rows">
        <div className="property-review-row">
          <span className="property-review-row__label">Applicant Name</span>
          <span className="property-review-row__value property-review-row__value--bold">
            {data.personalFullName || data.titleHolderName || user?.fullName || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Mobile</span>
          <span className="property-review-row__value">
            {data.personalMobile || data.titleHolderMobile || user?.mobile || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">PAN</span>
          <span className="property-review-row__value">
            {data.personalPan || data.titleHolderPan || user?.pan || '—'}
          </span>
        </div>
      </div>
    </div>
  )

  const renderLoanRequirementCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Loan Requirement</h3>
        <button
          type="button"
          className="property-review-card__edit-btn"
          onClick={() => onNavigateToStep(1)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span>Edit</span>
        </button>
      </div>

      <div className="property-review-rows">
        <div className="property-review-row">
          <span className="property-review-row__label">Requested Amount</span>
          <span className="property-review-row__value property-review-row__value--amount">
            {formattedAmount}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Loan Purpose</span>
          <span className="property-review-row__value">
            {data.loanPurpose || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Tenure</span>
          <span className="property-review-row__value">
            {tenureFormatted}
          </span>
        </div>
      </div>
    </div>
  )

  const renderPropertyAssetCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Property &amp; Asset Details</h3>
        <button
          type="button"
          className="property-review-card__edit-btn"
          onClick={() => onNavigateToStep(3)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span>Edit</span>
        </button>
      </div>

      <div className="property-review-rows">
        <div className="property-review-row">
          <span className="property-review-row__label">Property Type</span>
          <span className="property-review-row__value">
            {data.propertyType || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Ownership</span>
          <span className="property-review-row__value">
            {data.ownershipType === 'joint' ? 'Joint Ownership' : data.ownershipType === 'sole' ? 'Sole Ownership' : '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Market Valuation</span>
          <span className="property-review-row__value property-review-row__value--amount">
            {formattedValuation}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Location</span>
          <span className="property-review-row__value">
            {data.propertyAddress || data.propertyCity || '—'}
          </span>
        </div>
      </div>
    </div>
  )

  const renderEntityProfileCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Entity &amp; Commercial Profile</h3>
        <button
          type="button"
          className="property-review-card__edit-btn"
          onClick={() => onNavigateToStep(2)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span>Edit</span>
        </button>
      </div>

      <div className="property-review-rows">
        <div className="property-review-row">
          <span className="property-review-row__label">Entity Name</span>
          <span className="property-review-row__value">
            {data.employerName || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Annual Inflows</span>
          <span className="property-review-row__value">
            {formattedInflows}
          </span>
        </div>
      </div>
    </div>
  )

  const renderDisbursementBankCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Disbursement Bank Account</h3>
        <button
          type="button"
          className="property-review-card__edit-btn"
          onClick={() => onNavigateToStep(2)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span>Edit</span>
        </button>
      </div>

      <div className="property-review-rows">
        <div className="property-review-row">
          <span className="property-review-row__label">Bank</span>
          <span className="property-review-row__value">
            {data.bankName || '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">Account Number</span>
          <span className="property-review-row__value">
            {data.accountNumber ? `•••• ${String(data.accountNumber).slice(-4)}` : '—'}
          </span>
        </div>
        <div className="property-review-row">
          <span className="property-review-row__label">IFSC Code</span>
          <span className="property-review-row__value">
            {data.ifscCode || '—'}
          </span>
        </div>
      </div>
    </div>
  )

  const renderUploadedRecordsCard = () => (
    <div className="property-review-card">
      <div className="property-review-card__header">
        <h3 className="property-review-card__title">Uploaded Records</h3>
        <button
          type="button"
          className="property-review-card__edit-btn"
          onClick={() => onNavigateToStep(5)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <span>Manage</span>
        </button>
      </div>

      <div className="property-review-doc-pills-wrap">
        {displayDocKeys.length > 0 ? (
          displayDocKeys.map((key) => {
            const label = DOCUMENT_TITLES[key] || (uploadedDocs[key] as { name?: string })?.name || key
            return (
              <span key={key} className="property-review-doc-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" width="14" height="14" aria-hidden="true" className="property-review-doc-pill__icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>{label}</span>
              </span>
            )
          })
        ) : (
          <span className="property-review-docs-empty">
            No documents uploaded yet.
          </span>
        )}
      </div>
    </div>
  )

  const renderDeclarationCard = () => (
    <div className="property-review-declaration-card">
      <label className="property-review-declaration-label">
        <input
          type="checkbox"
          className="property-review-checkbox"
          checked={Boolean(data.declarationAgreed)}
          onChange={(e) => onChange({ declarationAgreed: e.target.checked })}
        />
        <span className="property-review-declaration-text">
          I authorize TaxEdge to conduct technical valuation, legal search title inquiry, and share financial dossiers with partnered banks &amp; NBFCs for Property Loan underwriting.
        </span>
      </label>
      {errors.declarationAgreed && (
        <span className="property-error-text" role="alert">{errors.declarationAgreed}</span>
      )}
    </div>
  )

  return (
    <div className="property-loan-step property-review-step" data-testid="step-property-review">
      <div className="property-review-header">
        <h2 className="property-review-header__title">Mortgage Application Dossier Review</h2>
        <p className="property-review-header__subtitle">
          Double-check your loan against property terms, title details, and financial papers.
        </p>
      </div>

      <div className="property-review-cards-list">
        {renderApplicantCard()}
        {renderLoanRequirementCard()}
        {renderPropertyAssetCard()}
        {renderEntityProfileCard()}
        {renderDisbursementBankCard()}
        {renderUploadedRecordsCard()}
        {renderDeclarationCard()}
      </div>
    </div>
  )
}

export default Review
