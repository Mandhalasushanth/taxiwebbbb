import React from 'react'
import type {
  UploadedDocInfo,
  AssessmentYearOption,
  ResidentialStatusOption,
  FilingTypeOption,
  FilingBankAccount,
  SalaryDetails,
  HousePropertyDetails,
  BusinessDetails,
  CapitalGainsDetails,
  OtherSourcesDetails,
} from '../itrFiling.constants'
import { parseAmount } from '../itrTaxCalculator'

export interface ItrReviewLeftColumnProps {
  profile: {
    fullName: string
    panNumber: string
  }
  selectedBank?: FilingBankAccount
  assessmentYear: AssessmentYearOption
  applicableForm: string
  residentialStatus: ResidentialStatusOption
  filingType: FilingTypeOption
  uploadedDocs: Record<string, UploadedDocInfo>
  salaryDetails?: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  selectedSources?: string[]
  tdsCredits?: number
  onEdit: () => void
}

export const ItrReviewLeftColumn: React.FC<ItrReviewLeftColumnProps> = ({
  profile,
  selectedBank,
  assessmentYear,
  applicableForm,
  residentialStatus,
  filingType,
  uploadedDocs,
  salaryDetails,
  housePropertyDetails,
  businessDetails,
  capitalGainsDetails,
  otherSourcesDetails,
  selectedSources = [],
  tdsCredits,
  onEdit,
}) => {
  const docCount = Object.keys(uploadedDocs).length

  // Parse salary figures
  const salaryGross = parseAmount(salaryDetails?.grossSalary)
  const salaryTds = parseAmount(salaryDetails?.tdsDeducted)
  const employerName = salaryDetails?.employerName?.trim() || 'Declared Employer'

  // Total TDS credits
  const totalTdsCredits =
    tdsCredits !== undefined && tdsCredits > 0
      ? tdsCredits
      : salaryTds

  // Determine which income rows are active
  const hasSalary =
    selectedSources.includes('salary') ||
    salaryGross > 0 ||
    Boolean(salaryDetails?.employerName?.trim())

  const bizTurnover = parseAmount(businessDetails?.grossTurnover)
  const bizProfit = parseAmount(businessDetails?.declaredNetProfit)
  const hasBusiness =
    selectedSources.includes('business') ||
    bizTurnover > 0 ||
    bizProfit > 0

  const rentReceived = parseAmount(housePropertyDetails?.annualRentReceived)
  const homeLoanInt = parseAmount(housePropertyDetails?.homeLoanInterest)
  const hasHouseProperty =
    selectedSources.includes('house_property') ||
    rentReceived > 0 ||
    homeLoanInt > 0

  const cgTotal =
    parseAmount(capitalGainsDetails?.stcg) + parseAmount(capitalGainsDetails?.ltcg)
  const hasCapitalGains =
    selectedSources.includes('capital_gains') ||
    cgTotal > 0 ||
    Boolean(capitalGainsDetails?.assetTypes && capitalGainsDetails.assetTypes.length > 0)

  const otherTotal =
    parseAmount(otherSourcesDetails?.interestIncome) +
    parseAmount(otherSourcesDetails?.dividendIncome) +
    parseAmount(otherSourcesDetails?.otherIncome)
  const hasOtherSources =
    selectedSources.includes('other_sources') ||
    otherTotal > 0

  const hasTds = totalTdsCredits > 0 || hasSalary

  // Mask bank account number safely with 4 bullets
  const bankLast4 = selectedBank?.accountNumber
    ? selectedBank.accountNumber.replace(/\D/g, '').slice(-4)
    : '8828'
  const bankDisplay = selectedBank?.bankName
    ? `${selectedBank.bankName} (•••• ${bankLast4})`
    : `Primary Bank Account (•••• ${bankLast4})`

  return (
    <div className="itr-rv2-left-col">
      {/* Summary & Declared Income */}
      <div className="itr-step-card">
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
          Summary &amp; Declared Income
        </h3>

        {/* 1. Taxpayer Identity Row */}
        <div className="itr-rv2-identity-row">
          <div className="itr-rv2-identity-info">
            <div className="itr-rv2-identity-label">Taxpayer Identity</div>
            <div className="itr-rv2-identity-val">
              PAN: {profile.panNumber} &bull; Name: {profile.fullName}
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
            Profile Verified
          </span>
        </div>

        {/* 2. Refund Bank Row */}
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
            Selected
          </span>
        </div>

        {/* 3. Salary Income Row */}
        {hasSalary && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">Salary Income</div>
              <div className="itr-rv2-identity-val">
                {employerName}
                {salaryTds > 0 ? ` (TDS: ₹${salaryTds.toLocaleString('en-IN')})` : ''}
              </div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                ₹ {salaryGross.toLocaleString('en-IN')}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--blue itr-rv2-badge--rect">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                Declared
              </span>
            </div>
          </div>
        )}

        {/* 4. Business Income Row */}
        {hasBusiness && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">Business &amp; Profession Income</div>
              <div className="itr-rv2-identity-val">
                {businessDetails?.reportingMethod === '44ADA'
                  ? 'Section 44ADA (Professional)'
                  : businessDetails?.reportingMethod === 'regular'
                  ? 'Regular Books'
                  : 'Section 44AD (Presumptive)'}
                {bizTurnover > 0
                  ? ` (Turnover: ₹${bizTurnover.toLocaleString('en-IN')})`
                  : ''}
              </div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                ₹ {bizProfit.toLocaleString('en-IN')}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--blue itr-rv2-badge--rect">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                Declared
              </span>
            </div>
          </div>
        )}

        {/* 5. House Property Income Row */}
        {hasHouseProperty && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">House Property Income</div>
              <div className="itr-rv2-identity-val">
                {housePropertyDetails?.propertyType === 'self_occupied'
                  ? 'Self-Occupied (Home Loan Interest Loss)'
                  : `Let-Out Property (Rent: ₹${rentReceived.toLocaleString('en-IN')})`}
              </div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                {housePropertyDetails?.propertyType === 'self_occupied'
                  ? `-₹ ${Math.min(homeLoanInt, 200000).toLocaleString('en-IN')}`
                  : `₹ ${rentReceived.toLocaleString('en-IN')}`}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--blue itr-rv2-badge--rect">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                Declared
              </span>
            </div>
          </div>
        )}

        {/* 6. Capital Gains Row */}
        {hasCapitalGains && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">Capital Gains Income</div>
              <div className="itr-rv2-identity-val">Short-Term &amp; Long-Term Capital Gains</div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                ₹ {cgTotal.toLocaleString('en-IN')}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--blue itr-rv2-badge--rect">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                Declared
              </span>
            </div>
          </div>
        )}

        {/* 7. Other Sources Row */}
        {hasOtherSources && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">Other Sources Income</div>
              <div className="itr-rv2-identity-val">Interest, Dividend &amp; Other Income</div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                ₹ {otherTotal.toLocaleString('en-IN')}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--blue itr-rv2-badge--rect">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                Declared
              </span>
            </div>
          </div>
        )}

        {/* 8. Taxes Deducted (TDS Credits) Row */}
        {hasTds && (
          <div className="itr-rv2-identity-row">
            <div className="itr-rv2-identity-info">
              <div className="itr-rv2-identity-label">Taxes Deducted (TDS Credits)</div>
              <div className="itr-rv2-identity-val">Form 26AS / Employer TDS credits</div>
            </div>
            <div className="itr-rv2-amount-badge-col">
              <span className="itr-rv2-row-amount">
                ₹ {totalTdsCredits.toLocaleString('en-IN')}
              </span>
              <span className="itr-rv2-badge itr-rv2-badge--green itr-rv2-badge--rect">
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
                Tax Credit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filing & Taxpayer Details */}
      <div className="itr-step-card">
        <div className="itr-rv2-section-header-row">
          <h3 className="itr-rv2-section-title">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Filing &amp; Taxpayer Details
          </h3>
          <button type="button" className="itr-rv2-edit-btn" onClick={onEdit}>
            Edit
          </button>
        </div>
        <div className="itr-rv2-details-rows">
          {[
            { label: 'Assessment Year', value: assessmentYear },
            { label: 'Applicable Return Form', value: applicableForm },
            { label: 'Full Name', value: profile.fullName },
            { label: 'PAN Number', value: profile.panNumber },
            {
              label: 'Residential Status',
              value:
                residentialStatus.charAt(0).toUpperCase() +
                residentialStatus.slice(1),
            },
            {
              label: 'Filing Type',
              value:
                filingType.charAt(0).toUpperCase() +
                filingType.slice(1) +
                ' Return',
            },
          ].map((row) => (
            <div key={row.label} className="itr-rv2-detail-row">
              <span className="itr-rv2-detail-row__label">{row.label}</span>
              <span className="itr-rv2-detail-row__val">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="itr-step-card">
        <div className="itr-rv2-section-header-row">
          <h3 className="itr-rv2-section-title">
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Uploaded Documents ({docCount})
          </h3>
          <button type="button" className="itr-rv2-edit-btn" onClick={onEdit}>
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
                <span className="itr-rv2-doc-check">
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
  )
}
