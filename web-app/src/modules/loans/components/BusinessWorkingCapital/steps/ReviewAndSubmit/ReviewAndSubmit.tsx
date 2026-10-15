import React from 'react'
import { Banknote, Building2, Check, CheckCircle2, Circle, Hand, Pencil, ShieldCheck, User } from 'lucide-react'
import { maskAadhaar } from '@shared/utils'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import type {
  BusinessWorkingCapitalFormData,
  LoanAddress,
  SelectOption,
  VerifiedCustomerDetails,
} from '@modules/loans/types/businessWorkingCapital.types'
import {
  BUSINESS_ACTIVITY_OPTIONS,
  CONSTITUTION_OPTIONS,
  FACILITY_OPTIONS,
  LOAN_PURPOSE_OPTIONS,
} from '../BusinessProfile/businessProfile.constants'
import { getBwcDocumentList } from '../Documents/documents.constants'
import './ReviewAndSubmit.css'

const labelOf = (options: SelectOption[], value: string) => options.find((o) => o.value === value)?.label || value || '—'

const formatAddress = (a: LoanAddress) =>
  [a.houseBuilding, a.streetLocality, a.city, a.state, a.pincode].map((part) => part.trim()).filter(Boolean).join(', ') ||
  '—'

/** yyyy-mm-dd → dd-mm-yyyy */
const formatDate = (value: string) => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return iso ? `${iso[3]}-${iso[2]}-${iso[1]}` : value || '—'
}

const formatAmount = (value: string) => (value ? `₹${toAmount(value).toLocaleString('en-IN')}` : '—')

interface ReviewRow {
  label: string
  value: React.ReactNode
  highlight?: boolean
}

interface ReviewCardProps {
  testId: string
  icon: React.ReactNode
  title: string
  subtitle: string
  editLabel: string
  onEdit: () => void
  rows?: ReviewRow[]
  children?: React.ReactNode
}

const ReviewCard: React.FC<ReviewCardProps> = ({ testId, icon, title, subtitle, editLabel, onEdit, rows, children }) => (
  <section className="bwc-card bwc-review-card" data-testid={testId}>
    <div className="bwc-review-card__header">
      <span className="bwc-card__icon bwc-card__icon--navy">{icon}</span>
      <div className="bwc-review-card__heading">
        <h2 className="bwc-review-card__title">{title}</h2>
        <p className="bwc-review-card__subtitle">{subtitle}</p>
      </div>
      <button type="button" className="bwc-review-card__edit" onClick={onEdit} aria-label={editLabel}>
        <Pencil size={16} aria-hidden="true" />
        Edit
      </button>
    </div>
    {rows && (
      <dl className="bwc-review-card__rows">
        {rows.map((row) => (
          <div key={row.label} className="bwc-review-card__row">
            <dt>{row.label}</dt>
            <dd className={row.highlight ? 'bwc-review-card__value--highlight' : undefined}>{row.value}</dd>
          </div>
        ))}
      </dl>
    )}
    {children}
  </section>
)

export interface ReviewAndSubmitProps {
  data: BusinessWorkingCapitalFormData
  customer: VerifiedCustomerDetails
  onChange: (fields: Partial<BusinessWorkingCapitalFormData>) => void
  onNavigateToStep: (step: number) => void
  errors?: Record<string, string>
}

/** Step 4: read-only summary of steps 1–3 with the applicant declaration */
export const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  data,
  customer,
  onChange,
  onNavigateToStep,
  errors = {},
}) => {
  const docs = getBwcDocumentList(data.financingFacility, data.gstRegistered === 'yes')
  const uploaded = data.uploadedDocs || {}
  const requiredDocs = docs.filter((doc) => doc.isRequired)
  const uploadedRequired = requiredDocs.filter((doc) => uploaded[doc.id]).length
  const facilityLabel = FACILITY_OPTIONS.find((f) => f.value === data.financingFacility)?.title ?? '—'

  const applicantRows: ReviewRow[] = [
    { label: 'Full Name', value: customer.fullName || '—' },
    { label: 'Mobile Number', value: customer.mobile ? `+91 ${customer.mobile}` : '—' },
    { label: 'Email', value: customer.email || '—' },
    { label: 'PAN', value: customer.pan || '—' },
    { label: 'Aadhaar', value: maskAadhaar(customer.aadhaar) },
    { label: 'Date of Birth', value: customer.dob || '—' },
    { label: 'Current Address', value: formatAddress(data.currentAddress) },
    {
      label: 'Permanent Address',
      value: data.permanentSameAsCurrent === 'yes' ? 'Same as current address' : formatAddress(data.permanentAddress),
    },
  ]

  const businessRows: ReviewRow[] = [
    { label: 'Business Name', value: data.businessName || '—' },
    { label: 'Constitution', value: labelOf(CONSTITUTION_OPTIONS, data.businessConstitution) },
    { label: 'Activity', value: labelOf(BUSINESS_ACTIVITY_OPTIONS, data.businessActivity) },
    { label: 'Established', value: formatDate(data.establishmentDate) },
    { label: 'Business Address', value: data.operatingAddress || '—' },
    { label: 'PIN Code', value: data.businessPincode || '—' },
    { label: 'GST', value: data.gstRegistered === 'yes' ? data.gstin.toUpperCase() : 'Not registered' },
    { label: 'Udyam / MSME', value: data.udyamNumber || 'Not provided' },
  ]

  const loanRows: ReviewRow[] = [
    { label: 'Loan Type', value: facilityLabel },
    { label: 'Requested Amount', value: formatAmount(data.loanAmount), highlight: true },
    { label: 'Purpose', value: labelOf(LOAN_PURPOSE_OPTIONS[data.financingFacility] ?? [], data.loanPurpose) },
    { label: 'Description', value: data.purposeDescription || '—' },
    { label: 'Avg Monthly Sales', value: formatAmount(data.avgMonthlySales) },
    { label: 'Avg Monthly Expenses', value: formatAmount(data.avgMonthlyExpenses) },
  ]

  return (
    <div className="bwc-step bwc-review" data-testid="bwc-step-review">
      <ReviewCard
        testId="review-applicant-card"
        icon={<User size={20} aria-hidden="true" />}
        title="Applicant Details"
        subtitle="Name, contact, PAN, Aadhaar and address"
        editLabel="Edit Applicant Details"
        onEdit={() => onNavigateToStep(1)}
        rows={applicantRows}
      />

      <ReviewCard
        testId="review-business-card"
        icon={<Building2 size={20} aria-hidden="true" />}
        title="Business Details"
        subtitle="Business profile and operational information"
        editLabel="Edit Business Details"
        onEdit={() => onNavigateToStep(2)}
        rows={businessRows}
      />

      <ReviewCard
        testId="review-loan-card"
        icon={<Banknote size={20} aria-hidden="true" />}
        title="Loan Details"
        subtitle="Loan type and financing requirements"
        editLabel="Edit Loan Details"
        onEdit={() => onNavigateToStep(2)}
        rows={loanRows}
      />

      <ReviewCard
        testId="review-documents-card"
        icon={<Hand size={20} aria-hidden="true" />}
        title="Documents"
        subtitle={`${uploadedRequired} of ${requiredDocs.length} required documents uploaded`}
        editLabel="Edit Documents"
        onEdit={() => onNavigateToStep(3)}
      >
        <ul className="bwc-review-docs">
          {docs.map((doc) => {
            const isUploaded = Boolean(uploaded[doc.id])
            return (
              <li key={doc.id} className={`bwc-review-docs__item${isUploaded ? '' : ' bwc-review-docs__item--pending'}`}>
                {isUploaded ? (
                  <CheckCircle2 className="bwc-review-docs__icon bwc-review-docs__icon--done" size={22} aria-hidden="true" />
                ) : (
                  <Circle className="bwc-review-docs__icon" size={22} aria-hidden="true" />
                )}
                <span className="bwc-review-docs__name">{doc.title}</span>
                <span className="bwc-review-docs__status">
                  {isUploaded ? 'Uploaded' : doc.isRequired ? 'Missing' : 'Optional'}
                </span>
              </li>
            )
          })}
        </ul>
      </ReviewCard>

      <section className={`bwc-card bwc-consent${errors.termsAccepted ? ' bwc-consent--error' : ''}`}>
        <label className="bwc-consent__label">
          <input
            type="checkbox"
            className="bwc-consent__input"
            data-testid="bwc-terms-checkbox"
            checked={data.termsAccepted}
            onChange={(event) => onChange({ termsAccepted: event.target.checked })}
            aria-describedby={errors.termsAccepted ? 'bwc-terms-error' : undefined}
          />
          <span className={`bwc-consent__box${data.termsAccepted ? ' bwc-consent__box--checked' : ''}`} aria-hidden="true">
            {data.termsAccepted && <Check size={16} />}
          </span>
          <span className="bwc-consent__text">
            <strong className="bwc-consent__title">Applicant Declaration</strong>
            I confirm that the information provided in this application is accurate and complete.
          </span>
        </label>
        <p className="bwc-consent__security">
          <ShieldCheck size={14} aria-hidden="true" />
          Agent Review • Verified Lending Partners • Zero Upfront Charges
        </p>
        {errors.termsAccepted && (
          <p id="bwc-terms-error" className="bwc-field__error" role="alert">
            {errors.termsAccepted}
          </p>
        )}
      </section>
    </div>
  )
}

export default ReviewAndSubmit
