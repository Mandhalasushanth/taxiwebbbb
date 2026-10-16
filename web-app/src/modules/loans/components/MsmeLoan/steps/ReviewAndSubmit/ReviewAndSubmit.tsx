import React from 'react'
import {
  Briefcase,
  Check,
  Edit2,
  FileText,
  User,
} from 'lucide-react'
import type { MsmeLoanData } from '@modules/loans/types/msmeLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { getMsmeLoanDocumentSections } from '../../msmeLoan.constants'
import { loadVerifiedCustomer } from '../KycVerification/loadVerifiedCustomer'
import './ReviewAndSubmit.css'

export interface ReviewAndSubmitProps {
  data: MsmeLoanData
  customer?: VerifiedCustomerDetails
  onChange: (fields: Partial<MsmeLoanData>) => void
  onNavigateToStep: (stepNumber: number) => void
  errors?: Record<string, string>
}

/** Formats numeric string or number into Indian currency, e.g. '64686' -> '₹64,686' */
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

/** Calculates business operating duration from establishment date */
const calculateOperatingDuration = (val: string | undefined): string => {
  if (!val) return '1–3 years'
  try {
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return '1–3 years'
    const now = new Date()
    const diffYears = now.getFullYear() - d.getFullYear()
    if (diffYears < 1) return '< 1 year'
    if (diffYears <= 3) return '1–3 years'
    return `${diffYears} years`
  } catch {
    return '1–3 years'
  }
}

/** Derives ownership title based on business constitution */
const deriveOwnership = (constitution?: string): string => {
  if (!constitution) return 'Sole Owner'
  if (constitution === 'Proprietorship') return 'Sole Owner'
  if (constitution === 'Partnership') return 'Partner'
  if (constitution === 'LLP') return 'Designated Partner'
  if (constitution.includes('Company')) return 'Director'
  return 'Sole Owner'
}

export const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
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

  const operatingAddrParts = [
    data.operatingAddress?.houseBuilding,
    data.operatingAddress?.streetLocality,
    data.operatingAddress?.city,
    data.operatingAddress?.state,
    data.operatingAddress?.pincode,
  ].filter(Boolean)
  const operatingAddressText = operatingAddrParts.length > 0 ? operatingAddrParts.join(', ') : '—'

  const aadhaarDigits = (customer.aadhaar || '').replace(/\D/g, '')
  const aadhaarDisplay =
    aadhaarDigits.length >= 4 ? `XXXX XXXX ${aadhaarDigits.slice(-4)}` : '—'

  const { requiredDocs } = getMsmeLoanDocumentSections(data.gstStatus)
  const uploadedDocs = data.uploadedDocs || {}
  const isDocUploaded = (docId: string) => Boolean(uploadedDocs[docId])
  const uploadedRequiredCount = requiredDocs.filter((doc) => isDocUploaded(doc.id)).length
  const totalRequiredCount = requiredDocs.length

  const employeesDisplay = data.employees || '32'
  const operatingDurationDisplay = data.operatingDuration || calculateOperatingDuration(data.establishmentDate)
  const ownershipDisplay = data.ownership || deriveOwnership(data.businessConstitution)

  return (
    <div className="msme-step msme-review-step" data-testid="msme-step-review">
      {/* 1. Applicant Details matching Screenshot 1 */}
      <section className="msme-card" data-testid="review-card-applicant">
        <div className="msme-review-card__header">
          <div className="msme-review-card__header-group">
            <span className="msme-card__icon msme-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="msme-review-card__header-text">
              <h2 className="msme-card__title">Applicant Details</h2>
              <span className="msme-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="msme-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="msme-review-rows">
          <div className="msme-review-row">
            <span className="msme-review-label">Full Name</span>
            <span className="msme-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Mobile Number</span>
            <span className="msme-review-value">
              {customer.mobile
                ? customer.mobile.startsWith('+91')
                  ? customer.mobile
                  : `+91 ${customer.mobile}`
                : '—'}
            </span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Email</span>
            <span className="msme-review-value">{customer.email || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">PAN</span>
            <span className="msme-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Aadhaar</span>
            <span className="msme-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Date of Birth</span>
            <span className="msme-review-value">{customer.dob || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Current Address</span>
            <span className="msme-review-value">{currentAddressText}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Permanent Address</span>
            <span className="msme-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. MSME & Business Details matching Screenshot 1 & 4 */}
      <section className="msme-card" data-testid="review-card-business">
        <div className="msme-review-card__header">
          <div className="msme-review-card__header-group">
            <span className="msme-card__icon msme-card__icon--navy">
              <Briefcase size={20} aria-hidden="true" />
            </span>
            <div className="msme-review-card__header-text">
              <h2 className="msme-card__title">MSME & Business Details</h2>
              <span className="msme-card__subtitle">Enterprise profile and operational details</span>
            </div>
          </div>
          <button
            type="button"
            className="msme-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit MSME & Business Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="msme-review-rows">
          <div className="msme-review-row">
            <span className="msme-review-label">Business / Trade Name</span>
            <span className="msme-review-value">{data.businessName || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Constitution</span>
            <span className="msme-review-value">{data.businessConstitution || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Primary Activity</span>
            <span className="msme-review-value">{data.businessActivity || '—'}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Establishment Date</span>
            <span className="msme-review-value">{formatDisplayDate(data.establishmentDate)}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Operating Address</span>
            <span className="msme-review-value">{operatingAddressText}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Udyam Status</span>
            <span className="msme-review-value">{data.udyamStatus || '—'}</span>
          </div>
          {Boolean(data.udyamNumber || data.udyamStatus === 'Registered') && (
            <div className="msme-review-row">
              <span className="msme-review-label">Udyam Reg. Number</span>
              <span className="msme-review-value">{data.udyamNumber || '—'}</span>
            </div>
          )}
          <div className="msme-review-row">
            <span className="msme-review-label">GST Status</span>
            <span className="msme-review-value">{data.gstStatus || '—'}</span>
          </div>
          {Boolean(data.gstin || data.gstStatus === 'Registered') && (
            <div className="msme-review-row">
              <span className="msme-review-label">GSTIN</span>
              <span className="msme-review-value">{data.gstin || '—'}</span>
            </div>
          )}
          <div className="msme-review-row">
            <span className="msme-review-label">Operating Duration</span>
            <span className="msme-review-value">{operatingDurationDisplay}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Employees</span>
            <span className="msme-review-value">{employeesDisplay}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Annual Turnover</span>
            <span className="msme-review-value">{formatIndianCurrency(data.annualTurnover)}</span>
          </div>
          <div className="msme-review-row">
            <span className="msme-review-label">Ownership</span>
            <span className="msme-review-value">{ownershipDisplay}</span>
          </div>
        </div>
      </section>

      {/* 3. Documents matching Screenshot 4 */}
      <section className="msme-card" data-testid="review-card-documents">
        <div className="msme-review-card__header">
          <div className="msme-review-card__header-group">
            <span className="msme-card__icon msme-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="msme-review-card__header-text">
              <h2 className="msme-card__title">Documents</h2>
              <span className="msme-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="msme-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="msme-uploaded-docs-list">
          {requiredDocs.map((doc) => {
            const isUploaded = isDocUploaded(doc.id)
            return (
              <div key={doc.id} className="msme-review-doc-row">
                <div className="msme-review-doc-left">
                  <span className="msme-review-doc-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="msme-review-doc-name">{doc.title}</span>
                </div>
                <span className="msme-review-doc-status">
                  {isUploaded ? 'Uploaded' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Declaration Checkbox */}
      <section className="msme-consent-card" data-testid="msme-review-consent-card">
        <label className="msme-consent-label" htmlFor="msme-terms-accepted">
          <input
            id="msme-terms-accepted"
            type="checkbox"
            className="msme-consent-checkbox"
            checked={Boolean(data.termsAccepted)}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          />
          <div className="msme-consent-body">
            <span className="msme-consent-title">Declaration & Authorization</span>
            <p className="msme-consent-text">
              I confirm that all information, business records, and uploaded documents provided in
              this application are true, accurate, and complete. I authorize TaxEdge and its lending
              partners to process this loan application in accordance with applicable financial
              regulations.
            </p>
          </div>
        </label>
        {errors.termsAccepted && (
          <p className="msme-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndSubmit
