import React from 'react'
import {
  Car,
  Check,
  Edit2,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { VehicleLoanData } from '@modules/loans/types/vehicleLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import {
  getVehicleLoanDocumentSections,
} from '../../vehicleLoan.constants'
import { loadVerifiedCustomer } from '../KycVerification/loadVerifiedCustomer'
import './ReviewAndDeclaration.css'

export interface ReviewAndDeclarationProps {
  data: VehicleLoanData
  customer?: VerifiedCustomerDetails
  onChange: (fields: Partial<VehicleLoanData>) => void
  onNavigateToStep: (stepNumber: number) => void
  errors?: Record<string, string>
}

/** Formats numeric string or number into Indian currency, e.g. '500000' -> '₹5,00,000' */
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

export const ReviewAndDeclaration: React.FC<ReviewAndDeclarationProps> = ({
  data,
  customer: providedCustomer,
  onChange,
  onNavigateToStep,
  errors = {},
}) => {
  const customer = providedCustomer || loadVerifiedCustomer()

  const currentAddrParts = [
    data.currentAddress?.houseBuilding,
    data.currentAddress?.streetLocality,
    data.currentAddress?.city,
    data.currentAddress?.state,
    data.currentAddress?.pincode,
  ].filter(Boolean)
  const currentAddressText = currentAddrParts.length > 0 ? currentAddrParts.join(', ') : '—'

  const permanentAddressText =
    data.permanentSameAsCurrent === 'yes'
      ? 'Same as current address'
      : [
          data.permanentAddress?.houseBuilding,
          data.permanentAddress?.streetLocality,
          data.permanentAddress?.city,
          data.permanentAddress?.state,
          data.permanentAddress?.pincode,
        ]
          .filter(Boolean)
          .join(', ') || '—'

  const aadhaarDigits = (customer.aadhaar || '').replace(/\D/g, '')
  const aadhaarDisplay =
    aadhaarDigits.length >= 4 ? `XXXX XXXX ${aadhaarDigits.slice(-4)}` : '—'

  // Dynamic documents based on vehicleCondition
  const { requiredDocs, optionalDocs } = getVehicleLoanDocumentSections(data.vehicleCondition)
  const uploadedDocs = data.uploadedDocs || {}

  const uploadedRequiredCount = requiredDocs.filter((doc) => Boolean(uploadedDocs[doc.id])).length
  const totalRequiredCount = requiredDocs.length
  const allDocs = [...requiredDocs, ...optionalDocs]

  return (
    <div className="veh-step veh-review-step" data-testid="veh-step-review">
      {/* 1. Applicant Details */}
      <section className="veh-card" data-testid="review-card-applicant">
        <div className="veh-review-card__header">
          <div className="veh-review-card__header-group">
            <span className="veh-card__icon veh-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="veh-review-card__header-text">
              <h2 className="veh-card__title">Applicant Details</h2>
              <span className="veh-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="veh-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="veh-review-rows">
          <div className="veh-review-row">
            <span className="veh-review-label">Full Name</span>
            <span className="veh-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Mobile Number</span>
            <span className="veh-review-value">
              {customer.mobile ? `+91 ${customer.mobile}` : '—'}
            </span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Email</span>
            <span className="veh-review-value">{customer.email || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">PAN</span>
            <span className="veh-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Aadhaar</span>
            <span className="veh-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Date of Birth</span>
            <span className="veh-review-value">{formatDisplayDate(customer.dob)}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Current Address</span>
            <span className="veh-review-value">{currentAddressText}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Permanent Address</span>
            <span className="veh-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. Vehicle & Loan Details */}
      <section
        className="veh-card"
        data-testid="review-card-vehicle-loan"
      >
        <div className="veh-review-card__header">
          <div className="veh-review-card__header-group">
            <span className="veh-card__icon veh-card__icon--navy">
              <Car size={20} aria-hidden="true" />
            </span>
            <div className="veh-review-card__header-text">
              <h2 className="veh-card__title">Vehicle & Loan Details</h2>
              <span className="veh-card__subtitle">Vehicle selection and financing requirement</span>
            </div>
          </div>
          <button
            type="button"
            className="veh-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Vehicle & Loan Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="veh-review-rows">
          <div className="veh-review-row">
            <span className="veh-review-label">Requested Loan Amount</span>
            <span className="veh-review-value veh-review-value--amount">
              {formatIndianCurrency(data.requestedLoanAmount || data.loanAmount)}
            </span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Vehicle Condition</span>
            <span className="veh-review-value">{data.vehicleCondition || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Vehicle Category</span>
            <span className="veh-review-value">{data.vehicleCategory || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Vehicle Make / Brand</span>
            <span className="veh-review-value">
              {data.vehicleMakeBrand || data.vehicleBrand || '—'}
            </span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Vehicle Model</span>
            <span className="veh-review-value">
              {data.vehicleModel || data.vehicleMakeModel || '—'}
            </span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Approximate Vehicle Price</span>
            <span className="veh-review-value veh-review-value--amount">
              {formatIndianCurrency(data.approximateVehiclePrice || data.onRoadPrice)}
            </span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Dealer Selected?</span>
            <span className="veh-review-value">{data.dealerSelected || '—'}</span>
          </div>
          {data.dealerSelected === 'Yes' && (
            <div className="veh-review-row">
              <span className="veh-review-label">Dealer Name</span>
              <span className="veh-review-value">{data.dealerName || '—'}</span>
            </div>
          )}
          <div className="veh-review-row">
            <span className="veh-review-label">Purchase Timeline</span>
            <span className="veh-review-value">{data.purchaseTimeline || '—'}</span>
          </div>
          <div className="veh-review-row">
            <span className="veh-review-label">Registration State</span>
            <span className="veh-review-value">{data.registrationState || '—'}</span>
          </div>
        </div>
      </section>

      {/* 4. Documents */}
      <section className="veh-card" data-testid="review-card-documents">
        <div className="veh-review-card__header">
          <div className="veh-review-card__header-group">
            <span className="veh-card__icon veh-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="veh-review-card__header-text">
              <h2 className="veh-card__title">Documents</h2>
              <span className="veh-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="veh-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="veh-uploaded-docs-list">
          {allDocs.map((doc) => {
            const uploaded = uploadedDocs[doc.id]
            return (
              <div key={doc.id} className="veh-review-doc-row">
                <div className="veh-review-doc-left">
                  {uploaded ? (
                    <span className="veh-review-doc-check" aria-hidden="true">
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
                        fontWeight: 700,
                      }}
                      aria-hidden="true"
                    >
                      !
                    </span>
                  ) : (
                    <span className="veh-review-doc-circle" aria-hidden="true" />
                  )}
                  <span>{doc.title}</span>
                </div>
                <span className="veh-review-doc-status">
                  {uploaded ? 'Uploaded' : doc.isRequired ? 'Missing' : 'Optional'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Applicant Declaration */}
      <section className="veh-consent-card" data-testid="review-card-declaration">
        <label className="veh-consent-label" htmlFor="veh-review-terms">
          <input
            id="veh-review-terms"
            type="checkbox"
            className="veh-consent-checkbox"
            checked={Boolean(data.termsAccepted)}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          />
          <div className="veh-consent-body">
            <span className="veh-consent-title">Applicant Declaration</span>
            <p className="veh-consent-text">
              I confirm that the information provided in this application is accurate and complete.
            </p>
          </div>
        </label>

        <div className="veh-consent-security">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Agent Review • Verified Lending Partners • Zero Upfront Charges</span>
        </div>

        {errors.termsAccepted && (
          <p className="veh-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndDeclaration
