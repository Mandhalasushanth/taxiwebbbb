import React from 'react'
import {
  Check,
  Edit2,
  FileText,
  Home,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { HomeLoanData } from '@modules/loans/types/homeLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import {
  getHomeLoanDocumentSections,
  HOME_LOAN_TITLE,
} from '../../homeLoan.constants'
import { loadVerifiedCustomer } from '../KycVerification/loadVerifiedCustomer'
import './ReviewAndSubmit.css'

export interface ReviewAndSubmitProps {
  data?: HomeLoanData
  formData?: HomeLoanData
  customer?: VerifiedCustomerDetails
  onChange?: (fields: Partial<HomeLoanData>) => void
  updateFormData?: (fields: Partial<HomeLoanData>) => void
  onNavigateToStep: (stepNumber: number) => void
  errors?: Record<string, string>
}

/** Formats a numeric string or number into standard Indian currency, e.g. '2500000' → '₹25,00,000' */
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
  const effectiveData = data || formData || ({} as HomeLoanData)
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

  const { requiredDocs, optionalDocs } = getHomeLoanDocumentSections()
  const uploadedDocs = effectiveData.uploadedDocs || {}

  const uploadedRequiredCount = requiredDocs.filter((doc) => Boolean(uploadedDocs[doc.id])).length
  const totalRequiredCount = requiredDocs.length

  const allDocs = [...requiredDocs, ...optionalDocs]

  return (
    <div className="hl-step" data-testid="hl-step-review">
      {/* 1. Applicant Details */}
      <section className="hl-card" data-testid="review-card-applicant">
        <div className="hl-review-card__header">
          <div className="hl-review-card__header-group">
            <span className="hl-card__icon hl-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="hl-review-card__header-text">
              <h2 className="hl-card__title">Applicant Details</h2>
              <span className="hl-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="hl-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="hl-review-rows">
          <div className="hl-review-row">
            <span className="hl-review-label">Full Name</span>
            <span className="hl-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Mobile Number</span>
            <span className="hl-review-value">
              {customer.mobile ? `+91 ${customer.mobile}` : '—'}
            </span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Email</span>
            <span className="hl-review-value">{customer.email || '—'}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">PAN</span>
            <span className="hl-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Aadhaar</span>
            <span className="hl-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Date of Birth</span>
            <span className="hl-review-value">{formatDisplayDate(customer.dob)}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Current Address</span>
            <span className="hl-review-value">{currentAddressText}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Permanent Address</span>
            <span className="hl-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. Home Loan Requirement */}
      <section className="hl-card" data-testid="review-card-requirement">
        <div className="hl-review-card__header">
          <div className="hl-review-card__header-group">
            <span className="hl-card__icon hl-card__icon--navy">
              <Home size={20} aria-hidden="true" />
            </span>
            <div className="hl-review-card__header-text">
              <h2 className="hl-card__title">Home Loan Requirement</h2>
              <span className="hl-card__subtitle">Financing purpose, property status and valuation</span>
            </div>
          </div>
          <button
            type="button"
            className="hl-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Home Loan Requirement"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="hl-review-rows">
          <div className="hl-review-row">
            <span className="hl-review-label">Loan Type</span>
            <span className="hl-review-value">{HOME_LOAN_TITLE}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Requested Loan Amount</span>
            <span className="hl-review-value">
              {formatIndianCurrency(effectiveData.requestedLoanAmount || effectiveData.loanAmount)}
            </span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Purpose of Loan</span>
            <span className="hl-review-value">{effectiveData.loanPurpose || effectiveData.propertyIntent || '—'}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Property Status</span>
            <span className="hl-review-value">{effectiveData.propertyStatus || effectiveData.propertyStage || '—'}</span>
          </div>
          <div className="hl-review-row">
            <span className="hl-review-label">Approximate Property Value</span>
            <span className="hl-review-value">
              {formatIndianCurrency(effectiveData.approximatePropertyValue || effectiveData.estimatedPropertyCost)}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Documents */}
      <section className="hl-card" data-testid="review-card-documents">
        <div className="hl-review-card__header">
          <div className="hl-review-card__header-group">
            <span className="hl-card__icon hl-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="hl-review-card__header-text">
              <h2 className="hl-card__title">Documents</h2>
              <span className="hl-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="hl-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="hl-uploaded-docs-list">
          {allDocs.map((doc) => {
            const uploaded = uploadedDocs[doc.id]
            return (
              <div key={doc.id} className="hl-review-doc-row">
                <div className="hl-review-doc-left">
                  {uploaded ? (
                    <span className="hl-review-doc-check" aria-hidden="true">
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
                    <span className="hl-review-doc-circle" aria-hidden="true" />
                  )}
                  <span>{doc.title}</span>
                </div>
                <span className="hl-review-doc-status">
                  {uploaded ? 'Uploaded' : doc.isRequired ? 'Missing' : 'Optional'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Applicant Declaration */}
      <section className="hl-consent-card" data-testid="review-card-declaration">
        <label className="hl-consent-label" htmlFor="hl-review-terms">
          <input
            id="hl-review-terms"
            type="checkbox"
            className="hl-consent-checkbox"
            checked={Boolean(effectiveData.termsAccepted)}
            onChange={(e) => handleUpdate({ termsAccepted: e.target.checked })}
          />
          <div className="hl-consent-body">
            <span className="hl-consent-title">Applicant Declaration</span>
            <p className="hl-consent-text">
              I confirm that the information provided in this application is accurate and complete.
            </p>
          </div>
        </label>

        <div className="hl-consent-security">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Agent Review • Verified Lending Partners • Zero Upfront Charges</span>
        </div>

        {errors.termsAccepted && (
          <p className="hl-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndSubmit
