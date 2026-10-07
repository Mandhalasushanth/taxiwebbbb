import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { StepActionBar } from '@shared/components'
import { getEntityStructureLabel } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './ReviewApplication.css'

const ReviewSection: React.FC<{
  title: string
  onEdit: () => void
  children: React.ReactNode
}> = ({ title, onEdit, children }) => (
  <section className="review-card">
    <div className="review-card__header">
      <h2 className="review-card__title">{title}</h2>
      <button type="button" className="review-card__edit-btn" onClick={onEdit}>
        Edit
      </button>
    </div>
    <div className="review-card__body">{children}</div>
  </section>
)

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="review-row">
    <span className="review-row__label">{label}</span>
    <span className="review-row__value">{value}</span>
  </div>
)

export const ReviewApplication: React.FC = () => {
  const navigate = useNavigate()
  const { formData, draft, reviewEdit } = useIncorporationFlow()

  /** "Edit" opens that step in edit mode; its "Update & Review" button returns here */
  const editStep = (route: string) => reviewEdit.startEdit(() => navigate(route))

  const companyType = formData.companyType || 'pvt_ltd'
  const entityTypeLabel = getEntityStructureLabel(companyType, { full: true })


  const classCategory =
    formData.companyDetails?.classOfCompany && formData.companyDetails?.categoryOfCompany
      ? `${formData.companyDetails.classOfCompany} · ${formData.companyDetails.categoryOfCompany}`
      : 'Not specified'

  const primaryActivity =
    formData.companyDetails?.primaryBusinessActivity || 'Not specified'

  const nicCode = formData.companyDetails?.nicCode || 'Not specified'

  const firstPreferredName =
    formData.companyDetails?.firstPreferredName || 'Not specified'

  const secondPreferredName =
    formData.companyDetails?.secondPreferredName || 'Not specified'

  const addressData = formData.registeredOffice?.addressData

  const address = addressData
    ? `${addressData.addressLine1 || ''}${addressData.city ? `, ${addressData.city}` : ''}`
    : 'Not specified'

  const stateAndPin = addressData
    ? `${addressData.state || ''} ${addressData.pincode ? `- ${addressData.pincode}` : ''}`.trim() || 'Not specified'
    : 'Not specified'

  const isOpc = companyType === 'opc'
  const directors = formData.promoters || []
  const primaryDirectorName = directors[0]?.fullName || 'Not specified'

  const authorisedCap = formData.capitalDetails?.authorisedCapital
    ? `₹${Number(formData.capitalDetails.authorisedCapital).toLocaleString('en-IN')}`
    : 'Not specified'

  const getLinkedRegText = () => {
    if (formData.linkedRegistrations && Array.isArray(formData.linkedRegistrations)) {
      const regMap: Record<string, string> = {
        pan: 'PAN',
        tan: 'TAN',
        gstin: 'GST',
        esic: 'ESIC',
        epfo: 'EPFO',
        ptax: 'PROFESSIONAL TAX',
        'bank-acc': 'BANK ACCOUNT',
      }
      const checkedKeys = formData.linkedRegistrations
        .filter((r) => r.checked)
        .map((r) => regMap[r.id] || r.id.toUpperCase())
      if (checkedKeys.length > 0) return checkedKeys.join(', ')
    }
    return 'None selected'
  }

  return (
    <div className="review-app-page">
      {/* Progress Tracker */}
      <div className="review-app-stepbar">
        <span className="review-app-stepbar__badge">Step 8 of 11</span>
        <span className="review-app-stepbar__text">Review Application</span>
        <div className="review-app-stepbar__line">
          <div className="review-app-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <div className="review-app-header">
        <h1 className="review-app-header__title">Review Application</h1>
        <p className="review-app-header__subtitle">
          Review your application details thoroughly before proceeding to payment.
        </p>
      </div>

      {/* Cards List */}
      <div className="review-app-list">
        <ReviewSection title="Company Type & Classification" onEdit={() => editStep(routePaths.incorporation.selectType)}>
          <ReviewRow label="Entity Type" value={entityTypeLabel} />
          <ReviewRow label="Class / Category" value={classCategory} />
        </ReviewSection>

        <ReviewSection title="Business Activity & NIC" onEdit={() => editStep(routePaths.incorporation.companyDetails)}>
          <ReviewRow label="Primary Activity" value={primaryActivity} />
          <ReviewRow label="NIC Code" value={nicCode} />
        </ReviewSection>

        <ReviewSection title="Proposed Company Names" onEdit={() => editStep(routePaths.incorporation.companyDetails)}>
          <ReviewRow label="1st Preference" value={firstPreferredName} />
          <ReviewRow label="2nd Preference" value={secondPreferredName} />
        </ReviewSection>

        <ReviewSection title="Registered Office" onEdit={() => editStep(routePaths.incorporation.registeredOffice)}>
          <ReviewRow label="Address" value={address} />
          <ReviewRow label="State & PIN" value={stateAndPin} />
        </ReviewSection>

        <ReviewSection title="Promoters & Shareholding" onEdit={() => editStep(routePaths.incorporation.capitalDetails)}>
          {isOpc ? (
            <ReviewRow label={`1. ${primaryDirectorName}`} value="100% Shareholding" />
          ) : (
            directors.map((dir, idx) => (
              <ReviewRow
                key={dir.id || idx}
                label={`${idx + 1}. ${dir.fullName || `Director #${idx + 1}`}`}
                value={dir.shareholdingPercent || '50% Shareholding'}
              />
            ))
          )}
          <ReviewRow label="Authorised Capital" value={authorisedCap} />
        </ReviewSection>

        <ReviewSection title="Linked Registrations" onEdit={() => editStep(routePaths.incorporation.linkedRegistrations)}>
          <div className="review-linked-reg-text">{getLinkedRegText()}</div>
        </ReviewSection>
      </div>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => navigate(routePaths.incorporation.linkedRegistrations)}
        onNext={() => navigate(routePaths.incorporation.feesPayment)}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default ReviewApplication
