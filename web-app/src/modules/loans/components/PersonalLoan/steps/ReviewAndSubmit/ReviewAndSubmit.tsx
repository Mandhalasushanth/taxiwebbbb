import React from 'react'
import {
  Banknote,
  Briefcase,
  Check,
  Edit2,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { PersonalLoanFormData } from '@modules/loans/types/personalLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import {
  getPersonalLoanDocumentSections,
  PERSONAL_LOAN_TITLE,
} from '../../personalLoan.constants'
import './ReviewAndSubmit.css'

export interface ReviewAndSubmitProps {
  data: PersonalLoanFormData
  customer: VerifiedCustomerDetails
  onChange: (fields: Partial<PersonalLoanFormData>) => void
  onNavigateToStep: (stepNumber: number) => void
  errors?: Record<string, string>
}

/** Formats a numeric string or number into standard Indian currency, e.g. '59668' → '₹59,668' */
const formatIndianCurrency = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === '') return '—'
  const digits = String(val).replace(/\D/g, '')
  return digits ? `₹${Number(digits).toLocaleString('en-IN')}` : '—'
}

/** Converts ISO yyyy-mm-dd to dd-mm-yyyy or leaves dd-mm-yyyy intact */
const formatDisplayDate = (val: string | undefined): string => {
  if (!val) return '—'
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val)
  return isoMatch ? `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}` : val
}

export const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  data,
  customer,
  onChange,
  onNavigateToStep,
  errors = {},
}) => {
  const isSalaried = data.employmentType === 'salaried'

  const currentAddrParts = [
    data.currentAddress.houseBuilding,
    data.currentAddress.streetLocality,
    data.currentAddress.city,
    data.currentAddress.state,
    data.currentAddress.pincode,
  ].filter(Boolean)
  const currentAddressText = currentAddrParts.length > 0 ? currentAddrParts.join(', ') : '—'

  const permanentAddressText =
    data.permanentSameAsCurrent === 'yes'
      ? 'Same as current address'
      : [
          data.permanentAddress.houseBuilding,
          data.permanentAddress.streetLocality,
          data.permanentAddress.city,
          data.permanentAddress.state,
          data.permanentAddress.pincode,
        ]
          .filter(Boolean)
          .join(', ') || '—'

  const aadhaarDisplay = customer.aadhaar
    ? customer.aadhaar.startsWith('XXXX')
      ? customer.aadhaar
      : `XXXX XXXX ${customer.aadhaar.slice(-4)}`
    : '—'

  const { requiredDocs, optionalDocs } = getPersonalLoanDocumentSections(data.employmentType)
  const uploadedDocs = data.uploadedDocs || {}

  const uploadedRequiredCount = requiredDocs.filter((doc) => Boolean(uploadedDocs[doc.id])).length
  const totalRequiredCount = requiredDocs.length

  // Show all required documents plus any optional documents that the applicant actually uploaded
  const documentsToDisplay = [
    ...requiredDocs,
    ...optionalDocs.filter((doc) => Boolean(uploadedDocs[doc.id])),
  ]

  return (
    <div className="pl-step" data-testid="pl-step-review">
      {/* 1. Applicant Details */}
      <section className="pl-card" data-testid="review-card-applicant">
        <div className="pl-review-card__header">
          <div className="pl-review-card__header-group">
            <span className="pl-card__icon pl-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="pl-review-card__header-text">
              <h2 className="pl-card__title">Applicant Details</h2>
              <span className="pl-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="pl-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="pl-review-rows">
          <div className="pl-review-row">
            <span className="pl-review-label">Full Name</span>
            <span className="pl-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Mobile Number</span>
            <span className="pl-review-value">
              {customer.mobile ? `+91 ${customer.mobile}` : '—'}
            </span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Email</span>
            <span className="pl-review-value">{customer.email || '—'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">PAN</span>
            <span className="pl-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Aadhaar</span>
            <span className="pl-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Date of Birth</span>
            <span className="pl-review-value">{formatDisplayDate(customer.dob)}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Current Address</span>
            <span className="pl-review-value">{currentAddressText}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Permanent Address</span>
            <span className="pl-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. Loan Requirements */}
      <section className="pl-card" data-testid="review-card-loan">
        <div className="pl-review-card__header">
          <div className="pl-review-card__header-group">
            <span className="pl-card__icon pl-card__icon--navy">
              <Banknote size={20} aria-hidden="true" />
            </span>
            <div className="pl-review-card__header-text">
              <h2 className="pl-card__title">Loan Requirements</h2>
              <span className="pl-card__subtitle">Requested financing and purpose</span>
            </div>
          </div>
          <button
            type="button"
            className="pl-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Loan Requirements"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="pl-review-rows">
          <div className="pl-review-row">
            <span className="pl-review-label">Loan Type</span>
            <span className="pl-review-value">{PERSONAL_LOAN_TITLE}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">Requested Loan Amount</span>
            <span className="pl-review-value">{formatIndianCurrency(data.requestedLoanAmount)}</span>
          </div>
        </div>
      </section>

      {/* 3. Employment & Income */}
      <section className="pl-card" data-testid="review-card-employment">
        <div className="pl-review-card__header">
          <div className="pl-review-card__header-group">
            <span className="pl-card__icon pl-card__icon--navy">
              {isSalaried ? (
                <Briefcase size={20} aria-hidden="true" />
              ) : (
                <User size={20} aria-hidden="true" />
              )}
            </span>
            <div className="pl-review-card__header-text">
              <h2 className="pl-card__title">Employment & Income</h2>
              <span className="pl-card__subtitle">
                {isSalaried
                  ? 'Salaried employment and compensation'
                  : 'Professional or business earnings'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="pl-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Employment Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="pl-review-rows">
          <div className="pl-review-row">
            <span className="pl-review-label">Employment Type</span>
            <span className="pl-review-value">{isSalaried ? 'Salaried' : 'Self Employed'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">
              {isSalaried ? 'Employer / Company' : 'Business / Profession'}
            </span>
            <span className="pl-review-value">{data.employerName || '—'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">
              {isSalaried ? 'Job Type' : 'Nature of Business'}
            </span>
            <span className="pl-review-value">{data.jobType || '—'}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">
              {isSalaried ? 'Monthly Net Salary' : 'Average Monthly Income'}
            </span>
            <span className="pl-review-value">{formatIndianCurrency(data.monthlySalary)}</span>
          </div>
          <div className="pl-review-row">
            <span className="pl-review-label">
              {isSalaried ? 'Work Experience' : 'Years in Business'}
            </span>
            <span className="pl-review-value">{data.workExperience || '—'}</span>
          </div>
          {isSalaried && (
            <div className="pl-review-row">
              <span className="pl-review-label">Salary Credit Method</span>
              <span className="pl-review-value">{data.salaryReceivedMode || '—'}</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. Documents */}
      <section className="pl-card" data-testid="review-card-documents">
        <div className="pl-review-card__header">
          <div className="pl-review-card__header-group">
            <span className="pl-card__icon pl-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="pl-review-card__header-text">
              <h2 className="pl-card__title">Documents</h2>
              <span className="pl-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="pl-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="pl-uploaded-docs-list">
          {documentsToDisplay.map((doc) => {
            const uploaded = uploadedDocs[doc.id]
            return (
              <div key={doc.id} className="pl-review-doc-row">
                <div className="pl-review-doc-left">
                  {uploaded ? (
                    <span className="pl-review-doc-check" aria-hidden="true">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#f87171',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 10,
                      }}
                      aria-hidden="true"
                    >
                      !
                    </span>
                  )}
                  <span>{doc.title}</span>
                </div>
                <span className="pl-review-doc-status">
                  {uploaded ? 'Uploaded' : 'Missing'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Applicant Declaration */}
      <section className="pl-consent-card" data-testid="review-card-declaration">
        <label className="pl-consent-label" htmlFor="pl-review-terms">
          <input
            id="pl-review-terms"
            type="checkbox"
            className="pl-consent-checkbox"
            checked={Boolean(data.termsAccepted)}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          />
          <div className="pl-consent-body">
            <span className="pl-consent-title">Applicant Declaration</span>
            <p className="pl-consent-text">
              I confirm that the information provided in this application is accurate and complete.
            </p>
          </div>
        </label>

        <div className="pl-consent-security">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Agent Review • Verified Lending Partners • Zero Upfront Charges</span>
        </div>

        {errors.termsAccepted && (
          <p className="pl-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndSubmit
