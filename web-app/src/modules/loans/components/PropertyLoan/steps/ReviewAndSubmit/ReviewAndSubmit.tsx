import React from 'react'
import {
  Banknote,
  Check,
  Edit2,
  FileText,
  Home,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { PropertyLoanData } from '@modules/loans/types/propertyLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import {
  getPropertyLoanDocumentSections,
  PROPERTY_LOAN_TITLE,
} from '../../propertyLoan.constants'
import { loadVerifiedCustomer } from '../KycVerification/loadVerifiedCustomer'
import './ReviewAndSubmit.css'

export interface ReviewAndSubmitProps {
  data?: PropertyLoanData
  formData?: PropertyLoanData
  customer?: VerifiedCustomerDetails
  onChange?: (fields: Partial<PropertyLoanData>) => void
  updateFormData?: (fields: Partial<PropertyLoanData>) => void
  onNavigateToStep: (stepNumber: number) => void
  errors?: Record<string, string>
}

/** Formats a numeric string or number into standard Indian currency, e.g. '6569958' → '₹65,69,958' */
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
  formData,
  customer: providedCustomer,
  onChange,
  updateFormData,
  onNavigateToStep,
  errors = {},
}) => {
  const effectiveData = data || formData || ({} as PropertyLoanData)
  const handleUpdate = onChange || updateFormData || (() => {})
  const customer = providedCustomer || loadVerifiedCustomer()

  const currentAddrParts = [
    effectiveData.currentAddress?.houseBuilding,
    effectiveData.currentAddress?.streetLocality,
    effectiveData.currentAddress?.city,
    effectiveData.currentAddress?.state,
    effectiveData.currentAddress?.pincode,
  ].filter(Boolean)
  const currentAddressText = currentAddrParts.length > 0 ? currentAddrParts.join(', ') : '—'

  const permanentAddressText =
    effectiveData.permanentSameAsCurrent === 'yes'
      ? 'Same as current address'
      : [
          effectiveData.permanentAddress?.houseBuilding,
          effectiveData.permanentAddress?.streetLocality,
          effectiveData.permanentAddress?.city,
          effectiveData.permanentAddress?.state,
          effectiveData.permanentAddress?.pincode,
        ]
          .filter(Boolean)
          .join(', ') || '—'

  const aadhaarDigits = (customer.aadhaar || '').replace(/\D/g, '')
  const aadhaarDisplay =
    aadhaarDigits.length >= 4 ? `XXXX XXXX ${aadhaarDigits.slice(-4)}` : '—'

  const { requiredDocs, optionalDocs } = getPropertyLoanDocumentSections()
  const uploadedDocs = effectiveData.uploadedDocs || {}

  const uploadedRequiredCount = requiredDocs.filter((doc) => Boolean(uploadedDocs[doc.id])).length
  const totalRequiredCount = requiredDocs.length

  const allDocs = [...requiredDocs, ...optionalDocs]
  const isConstruction =
    Boolean(effectiveData.loanPurpose?.includes('Construction')) || Boolean(effectiveData.constructionStage)

  return (
    <div className="prop-step" data-testid="prop-step-review">
      {/* 1. Applicant Details */}
      <section className="prop-card" data-testid="review-card-applicant">
        <div className="prop-review-card__header">
          <div className="prop-review-card__header-group">
            <span className="prop-card__icon prop-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="prop-review-card__header-text">
              <h2 className="prop-card__title">Applicant Details</h2>
              <span className="prop-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="prop-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="prop-review-rows">
          <div className="prop-review-row">
            <span className="prop-review-label">Full Name</span>
            <span className="prop-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Mobile Number</span>
            <span className="prop-review-value">
              {customer.mobile ? `+91 ${customer.mobile}` : '—'}
            </span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Email</span>
            <span className="prop-review-value">{customer.email || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">PAN</span>
            <span className="prop-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Aadhaar</span>
            <span className="prop-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Date of Birth</span>
            <span className="prop-review-value">{formatDisplayDate(customer.dob)}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Current Address</span>
            <span className="prop-review-value">{currentAddressText}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Permanent Address</span>
            <span className="prop-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. Loan Requirement */}
      <section className="prop-card" data-testid="review-card-requirement">
        <div className="prop-review-card__header">
          <div className="prop-review-card__header-group">
            <span className="prop-card__icon prop-card__icon--navy">
              <Banknote size={20} aria-hidden="true" />
            </span>
            <div className="prop-review-card__header-text">
              <h2 className="prop-card__title">Loan Requirement</h2>
              <span className="prop-card__subtitle">Requested financing and purpose</span>
            </div>
          </div>
          <button
            type="button"
            className="prop-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Loan Requirement"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="prop-review-rows">
          <div className="prop-review-row">
            <span className="prop-review-label">Loan Type</span>
            <span className="prop-review-value">{PROPERTY_LOAN_TITLE}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Requested Loan Amount</span>
            <span className="prop-review-value">
              {formatIndianCurrency(effectiveData.requestedLoanAmount || effectiveData.requiredAmount)}
            </span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Purpose</span>
            <span className="prop-review-value">{effectiveData.loanPurpose || '—'}</span>
          </div>
          {isConstruction && (
            <div className="prop-review-row">
              <span className="prop-review-label">Construction Stage</span>
              <span className="prop-review-value">
                {effectiveData.constructionStage || effectiveData.constructionStatus || 'Planning Stage'}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Property Details */}
      <section className="prop-card" data-testid="review-card-property">
        <div className="prop-review-card__header">
          <div className="prop-review-card__header-group">
            <span className="prop-card__icon prop-card__icon--orange">
              <Home size={20} aria-hidden="true" />
            </span>
            <div className="prop-review-card__header-text">
              <h2 className="prop-card__title">Property Details</h2>
              <span className="prop-card__subtitle">Type, location and ownership</span>
            </div>
          </div>
          <button
            type="button"
            className="prop-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Property Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="prop-review-rows">
          <div className="prop-review-row">
            <span className="prop-review-label">Property Type</span>
            <span className="prop-review-value">{effectiveData.propertyType || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">City</span>
            <span className="prop-review-value">{effectiveData.city || effectiveData.propertyCity || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">State</span>
            <span className="prop-review-value">{effectiveData.state || effectiveData.propertyState || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">PIN Code</span>
            <span className="prop-review-value">{effectiveData.pincode || effectiveData.propertyPincode || '—'}</span>
          </div>
          <div className="prop-review-row">
            <span className="prop-review-label">Ownership</span>
            <span className="prop-review-value">{effectiveData.propertyOwnership || '—'}</span>
          </div>
        </div>
      </section>

      {/* 4. Documents */}
      <section className="prop-card" data-testid="review-card-documents">
        <div className="prop-review-card__header">
          <div className="prop-review-card__header-group">
            <span className="prop-card__icon prop-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="prop-review-card__header-text">
              <h2 className="prop-card__title">Documents</h2>
              <span className="prop-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="prop-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="prop-uploaded-docs-list">
          {allDocs.map((doc) => {
            const uploaded = uploadedDocs[doc.id]
            return (
              <div key={doc.id} className="prop-review-doc-row">
                <div className="prop-review-doc-left">
                  {uploaded ? (
                    <span className="prop-review-doc-check" aria-hidden="true">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : doc.isRequired ? (
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
                  ) : (
                    <span className="prop-review-doc-circle" aria-hidden="true" />
                  )}
                  <span>{doc.title}</span>
                </div>
                <span className="prop-review-doc-status">
                  {uploaded ? 'Uploaded' : doc.isRequired ? 'Missing' : 'Optional'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Applicant Declaration */}
      <section className="prop-consent-card" data-testid="review-card-declaration">
        <label className="prop-consent-label" htmlFor="prop-review-terms">
          <input
            id="prop-review-terms"
            type="checkbox"
            className="prop-consent-checkbox"
            checked={Boolean(effectiveData.termsAccepted)}
            onChange={(e) => handleUpdate({ termsAccepted: e.target.checked })}
          />
          <div className="prop-consent-body">
            <span className="prop-consent-title">Applicant Declaration</span>
            <p className="prop-consent-text">
              I confirm that the information provided in this application is accurate and complete.
            </p>
          </div>
        </label>

        <div className="prop-consent-security">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Agent Review • Verified Lending Partners • Zero Upfront Charges</span>
        </div>

        {errors.termsAccepted && (
          <p className="prop-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndSubmit
