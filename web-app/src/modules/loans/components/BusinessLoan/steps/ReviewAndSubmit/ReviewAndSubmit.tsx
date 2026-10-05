import React from 'react'
import {
  FileText,
  User,
  CheckCircle,
  Wallet,
  Building2,
  Landmark,
  FileCheck,
} from 'lucide-react'
import type { ReviewAndSubmitProps } from '@modules/loans/types/businessLoan.types'
import { ReviewSectionCard } from './ReviewSectionCard'
import './ReviewAndSubmit.css'

const PURPOSE_MAP: Record<string, string> = {
  'working-capital': 'Working Capital & Inventory',
  'expansion': 'Business Expansion',
  'equipment': 'Machinery & Equipment',
  'debt-consolidation': 'Debt Consolidation',
  'infrastructure': 'Premises & Infrastructure',
}

const DOC_LABELS: Record<string, string> = {
  panCard: 'PAN Card',
  aadhaarCard: 'Aadhaar Card',
  directorsKyc: 'KYC of Directors / Partners',
  businessAddressProof: 'Business Address Proof',
  bankStatements: 'Current Account Bank Statements',
  gstCertificate: 'GST Certificate (REG-06)',
  gstReturns: 'GST Returns (12 Months)',
  businessItr: 'Business ITR (Last 2-3 Years)',
  auditedBalanceSheet: 'Audited Balance Sheet',
  profitAndLossStatement: 'Profit & Loss Statement',
  cashFlowStatement: 'Cash Flow Statement',
  udyamRegistrationCert: 'Udyam Registration Certificate',
  businessRegistrationProof: 'Business Registration Proof',
  businessExpansionDoc: 'Business Expansion Document',
}

function formatIndianCurrency(val?: string): string {
  const digits = val ? val.replace(/\D/g, '') : ''
  return !val || !digits ? '—' : `₹${Number(digits).toLocaleString('en-IN')}`
}

function maskAccountNumber(acc?: string): string {
  const clean = acc ? acc.trim() : ''
  return !clean ? '—' : clean.length <= 4 ? clean : `XXXXXX${clean.slice(-4)}`
}

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="review-row">
    <span className="review-label">{label}</span>
    <span className="review-colon">:</span>
    <span className="review-value">{value}</span>
  </div>
)

const DocumentPill: React.FC<{ label: string }> = ({ label }) => (
  <span className="review-doc-pill">
    <FileText
      size={14}
      className="review-doc-pill__icon"
      aria-hidden="true"
    />
    <span className="review-doc-pill__text">{label}</span>
  </span>
)

export const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  data,
  applicant,
  onChange,
  onNavigateToStep,
  errors,
}) => {
  const uploadedDocEntries = Object.entries(DOC_LABELS).filter(
    ([key]) => Boolean(data.uploadedDocs?.[key as keyof typeof data.uploadedDocs])
  )
  const uploadedCount = uploadedDocEntries.length
  const countBadgeText = `${uploadedCount} of ${uploadedCount > 0 ? uploadedCount : 12} uploaded`

  const udyamDisplay =
    data.hasUdyam === 'yes'
      ? data.udyamRegistrationNumber
        ? `Yes (${data.udyamRegistrationNumber})`
        : 'Yes'
      : 'No'

  const renderHeaderBanner = () => (
    <div className="review-dossier-banner">
      <div className="review-dossier-banner__icon" aria-hidden="true">
        <FileText size={22} />
      </div>
      <div className="review-dossier-banner__content">
        <h2 className="review-dossier-banner__title">Application Dossier Review</h2>
        <p className="review-dossier-banner__subtitle">
          Please review all the details and uploaded documents before submitting to our lending partners.
        </p>
      </div>
    </div>
  )

  const renderApplicantCard = () => (
    <ReviewSectionCard
      title="Applicant Information"
      icon={<User size={20} aria-hidden="true" />}
      themeColor="blue"
      testId="applicant-info-card"
      badge={
        <div className="review-verified-badge">
          <CheckCircle
            size={16}
            className="review-verified-badge__icon"
            aria-hidden="true"
          />
          <span>Verified Profile</span>
        </div>
      }
    >
      <div className="review-grid">
        <div className="review-col">
          <ReviewRow label="Name" value={applicant.name || '—'} />
          <ReviewRow label="Mobile" value={applicant.mobile || '—'} />
          <ReviewRow label="Email" value={applicant.email || '—'} />
        </div>
        <div className="review-col">
          <ReviewRow label="PAN Number" value={applicant.pan || '—'} />
          <ReviewRow label="Aadhaar Number" value={applicant.aadhaar || '—'} />
        </div>
      </div>
    </ReviewSectionCard>
  )

  const renderLoanRequirementCard = () => (
    <ReviewSectionCard
      title="Loan Requirement"
      icon={<Wallet size={20} aria-hidden="true" />}
      themeColor="orange"
      onEdit={() => onNavigateToStep(1)}
      testId="loan-requirement-card"
    >
      <div className="review-grid">
        <div className="review-col">
          <ReviewRow label="Facility Type" value="Business Loan" />
          <ReviewRow label="Requested Amount" value={formatIndianCurrency(data.requiredLoanAmount)} />
          <ReviewRow label="Purpose" value={data.purposeOfLoan ? PURPOSE_MAP[data.purposeOfLoan] || data.purposeOfLoan : '—'} />
        </div>
        <div className="review-col">
          <ReviewRow label="Preferred Tenure" value={data.preferredTenureMonths ? `${data.preferredTenureMonths} Months` : '—'} />
          <ReviewRow label="Existing Loans" value={data.existingLoans === 'none' ? 'No' : 'Yes'} />
        </div>
      </div>
    </ReviewSectionCard>
  )

  const renderBusinessDetailsCard = () => (
    <ReviewSectionCard
      title="Business Details"
      icon={<Building2 size={20} aria-hidden="true" />}
      themeColor="purple"
      onEdit={() => onNavigateToStep(2)}
      testId="business-details-card"
    >
      <div className="review-grid">
        <div className="review-col">
          <ReviewRow label="Firm / Business Name" value={data.registeredBusinessName || '—'} />
          <ReviewRow label="Business Constitution" value={data.businessConstitution || '—'} />
          <ReviewRow label="Authorized Signatory" value={data.signatoryName || '—'} />
          <ReviewRow label="GSTIN" value={data.gstin || '—'} />
        </div>
        <div className="review-col">
          <ReviewRow label="Udyam Registration" value={udyamDisplay} />
          <ReviewRow label="Business Vintage" value={data.businessVintage ? `${data.businessVintage} Years` : '—'} />
          <ReviewRow label="Annual Turnover" value={formatIndianCurrency(data.annualTurnover)} />
          <ReviewRow label="Net Profit" value={formatIndianCurrency(data.annualNetProfit)} />
        </div>
      </div>
    </ReviewSectionCard>
  )

  const renderBankingTaxCard = () => (
    <ReviewSectionCard
      title="Banking & Tax Details"
      icon={<Landmark size={20} aria-hidden="true" />}
      themeColor="pink"
      onEdit={() => onNavigateToStep(3)}
      testId="banking-tax-details-card"
    >
      <div className="review-grid">
        <div className="review-col">
          <ReviewRow label="Bank" value={data.primaryOperatingBankName || '—'} />
          <ReviewRow label="Account Number" value={maskAccountNumber(data.currentAccountNumber)} />
        </div>
        <div className="review-col">
          <ReviewRow label="IFSC Code" value={data.bankIfscCode || '—'} />
          <ReviewRow
            label="ITR Filing"
            value={
              data.itrAcknowledgementNumber
                ? `Filed (${data.itrAcknowledgementNumber})`
                : 'Filed (Last 3 Years)'
            }
          />
        </div>
      </div>
    </ReviewSectionCard>
  )

  const renderUploadedDocsCard = () => (
    <ReviewSectionCard
      title="Uploaded Documents"
      icon={<FileCheck size={20} aria-hidden="true" />}
      themeColor="green"
      countBadge={countBadgeText}
      onEdit={() => onNavigateToStep(4)}
      editLabel="Manage"
      testId="uploaded-documents-card"
    >
      <div className="review-docs-container">
        {uploadedDocEntries.map(([key, label]) => (
          <DocumentPill key={key} label={label} />
        ))}
        {uploadedCount === 0 && (
          <span className="review-docs-empty">
            No documents uploaded yet. Click &quot;Manage&quot; to upload required documents.
          </span>
        )}
      </div>
    </ReviewSectionCard>
  )

  const renderAuthorizationSection = () => (
    <div className="review-auth-container">
      <label className="review-auth-label">
        <input
          type="checkbox"
          className="review-auth-checkbox"
          checked={Boolean(data.termsAccepted)}
          onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          data-testid="terms-accepted-checkbox"
        />
        <span className="review-auth-text">
          I hereby authorize TaxEdge and its lending partners to fetch my credit bureau report (CIBIL/Experian), verify submitted tax/bank statements, and represent my loan file before financial institutions.
        </span>
      </label>
      {errors?.termsAccepted && (
        <div className="review-auth-error" role="alert">
          {errors.termsAccepted}
        </div>
      )}
    </div>
  )

  return (
    <div className="review-and-submit" data-testid="review-and-submit-step">
      {/* 1. Header Banner */}
      {renderHeaderBanner()}

      {/* 2. Review Sections */}
      <div className="review-sections-list">
        {renderApplicantCard()}
        {renderLoanRequirementCard()}
        {renderBusinessDetailsCard()}
        {renderBankingTaxCard()}
        {renderUploadedDocsCard()}
      </div>

      {/* 3. Authorization Checkbox */}
      {renderAuthorizationSection()}
    </div>
  )
}

export default ReviewAndSubmit
