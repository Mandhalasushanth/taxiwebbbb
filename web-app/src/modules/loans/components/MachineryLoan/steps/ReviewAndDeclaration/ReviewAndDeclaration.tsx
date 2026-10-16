import React from 'react'
import {
  Check,
  Edit2,
  FileText,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react'
import type { MachineryLoanData } from '@modules/loans/types/machineryLoan.types'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { getMachineryLoanDocumentSections } from '../../machineryLoan.constants'
import { loadVerifiedCustomer } from '../KycVerification/loadVerifiedCustomer'

export interface ReviewAndDeclarationProps {
  data: MachineryLoanData
  customer?: VerifiedCustomerDetails
  onChange: (fields: Partial<MachineryLoanData>) => void
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

  const { requiredDocs } = getMachineryLoanDocumentSections(data.machineryCondition)
  const uploadedDocs = data.uploadedDocs || {}
  const isDocUploaded = (docId: string) =>
    Boolean(
      uploadedDocs[docId] ||
      (docId === 'machinery_purchase_doc' && (uploadedDocs.machinery_quotation || uploadedDocs.purchase_document || uploadedDocs.quotation)) ||
      (docId === 'machinery_quotation' && (uploadedDocs.machinery_purchase_doc || uploadedDocs.proforma_invoice || uploadedDocs.machinery_invoice || uploadedDocs.quotation))
    )
  const uploadedRequiredCount = requiredDocs.filter((doc) => isDocUploaded(doc.id)).length
  const totalRequiredCount = requiredDocs.length

  return (
    <div className="mach-step mach-review-step" data-testid="mach-step-review">
      {/* 1. Applicant Details */}
      <section className="mach-card" data-testid="review-card-applicant">
        <div className="mach-review-card__header">
          <div className="mach-review-card__header-group">
            <span className="mach-card__icon mach-card__icon--navy">
              <User size={20} aria-hidden="true" />
            </span>
            <div className="mach-review-card__header-text">
              <h2 className="mach-card__title">Applicant Details</h2>
              <span className="mach-card__subtitle">Name, contact, PAN, Aadhaar and address</span>
            </div>
          </div>
          <button
            type="button"
            className="mach-edit-btn"
            onClick={() => onNavigateToStep(1)}
            aria-label="Edit Applicant Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="mach-review-rows">
          <div className="mach-review-row">
            <span className="mach-review-label">Full Name</span>
            <span className="mach-review-value">{customer.fullName || '—'}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Mobile Number</span>
            <span className="mach-review-value">
              {customer.mobile
                ? customer.mobile.startsWith('+91')
                  ? customer.mobile
                  : `+91 ${customer.mobile}`
                : '—'}
            </span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Email</span>
            <span className="mach-review-value">{customer.email || '—'}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">PAN</span>
            <span className="mach-review-value">{customer.pan || '—'}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Aadhaar</span>
            <span className="mach-review-value">{aadhaarDisplay}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Date of Birth</span>
            <span className="mach-review-value">{formatDisplayDate(customer.dob)}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Current Address</span>
            <span className="mach-review-value">{currentAddressText}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Permanent Address</span>
            <span className="mach-review-value">{permanentAddressText}</span>
          </div>
        </div>
      </section>

      {/* 2. Machinery & Loan Details */}
      <section className="mach-card" data-testid="review-card-machinery-loan">
        <div className="mach-review-card__header">
          <div className="mach-review-card__header-group">
            <span className="mach-card__icon mach-card__icon--navy">
              <Wrench size={20} aria-hidden="true" />
            </span>
            <div className="mach-review-card__header-text">
              <h2 className="mach-card__title">Machinery & Loan Details</h2>
              <span className="mach-card__subtitle">Machinery selection and financing requirement</span>
            </div>
          </div>
          <button
            type="button"
            className="mach-edit-btn"
            onClick={() => onNavigateToStep(2)}
            aria-label="Edit Machinery & Loan Details"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="mach-review-rows">
          <div className="mach-review-row">
            <span className="mach-review-label">Requested Loan Amount</span>
            <span className="mach-review-value mach-review-value--amount">
              {formatIndianCurrency(data.requestedLoanAmount || data.loanAmount)}
            </span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Machinery Type</span>
            <span className="mach-review-value">{data.machineryType || '—'}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Machinery Name / Description</span>
            <span className="mach-review-value">
              {data.machineryNameDescription || data.machineryName || '—'}
            </span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Machinery Condition</span>
            <span className="mach-review-value">{data.machineryCondition || '—'}</span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Purchase Type</span>
            <span className="mach-review-value">
              {data.machineryPurchaseType || data.purchaseType || '—'}
            </span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Approximate Machinery Cost</span>
            <span className="mach-review-value mach-review-value--amount">
              {formatIndianCurrency(data.approximateMachineryCost || data.machineryCost)}
            </span>
          </div>
          <div className="mach-review-row">
            <span className="mach-review-label">Dealer / Supplier Name</span>
            <span className="mach-review-value">
              {data.dealerSupplierName || data.dealerName || '—'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Documents */}
      <section className="mach-card" data-testid="review-card-documents">
        <div className="mach-review-card__header">
          <div className="mach-review-card__header-group">
            <span className="mach-card__icon mach-card__icon--navy">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div className="mach-review-card__header-text">
              <h2 className="mach-card__title">Documents</h2>
              <span className="mach-card__subtitle">
                {uploadedRequiredCount} of {totalRequiredCount} required documents uploaded
              </span>
            </div>
          </div>
          <button
            type="button"
            className="mach-edit-btn"
            onClick={() => onNavigateToStep(3)}
            aria-label="Edit Documents"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>

        <div className="mach-uploaded-docs-list">
          {requiredDocs.map((doc) => {
            const uploaded = isDocUploaded(doc.id)
            return (
              <div key={doc.id} className="mach-review-doc-row">
                <div className="mach-review-doc-left">
                  {uploaded ? (
                    <span className="mach-review-doc-check" aria-hidden="true">
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
                        fontWeight: 700,
                      }}
                      aria-hidden="true"
                    >
                      !
                    </span>
                  )}
                  <span>{doc.title}</span>
                </div>
                <span className="mach-review-doc-status">
                  {uploaded ? 'Uploaded' : 'Missing'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Applicant Declaration */}
      <section className="mach-consent-card" data-testid="review-card-declaration">
        <label className="mach-consent-label" htmlFor="mach-review-terms">
          <input
            id="mach-review-terms"
            type="checkbox"
            className="mach-consent-checkbox"
            checked={Boolean(data.termsAccepted)}
            onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          />
          <div className="mach-consent-body">
            <span className="mach-consent-title">Applicant Declaration</span>
            <p className="mach-consent-text">
              I confirm that the information provided in this application is accurate and complete.
            </p>
          </div>
        </label>

        <div className="mach-consent-security">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Agent Review • Verified Lending Partners • Zero Upfront Charges</span>
        </div>

        {errors.termsAccepted && (
          <p className="mach-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndDeclaration
