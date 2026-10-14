import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { StepActionBar } from '@shared/components'
import { getEntityStructureLabel } from '../../types/incorporation.types'
import { userStorage } from '@core/storage/userStorage'
import { useIncorporationFlow } from '../../hooks'
import './ReviewApplication.css'

const EditIcon: React.FC = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

const ReviewSection: React.FC<{
  title: string
  onEdit: () => void
  children: React.ReactNode
}> = ({ title, onEdit, children }) => (
  <section className="review-card">
    <div className="review-card__header">
      <h2 className="review-card__title">{title}</h2>
      <button type="button" className="review-card__edit-btn" onClick={onEdit}>
        <EditIcon />
        <span>Edit</span>
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
  const { formData, updateFormData, draft, reviewEdit } = useIncorporationFlow()

  /** "Edit" opens that step in edit mode; its "Update & Review" button returns here */
  const editStep = (route: string) => reviewEdit.startEdit(() => navigate(route))

  const companyType = formData.companyType || 'pvt_ltd'
  const entityTypeLabel = getEntityStructureLabel(companyType, { full: true })

  // 1. Company Type & Classification
  const categoryLabel = formData.companyDetails?.categoryOfCompany || '—'
  const subCategoryLabel = formData.companyDetails?.subCategoryOfCompany || '—'

  // 2. Business Activity & NIC
  const primaryActivity = formData.companyDetails?.primaryBusinessActivity || '—'
  const nicCode = formData.companyDetails?.nicCode || '—'
  const secondaryActivity = formData.companyDetails?.secondaryBusinessActivity || '—'

  // 3. Proposed Company Name
  const proposedFirstName = formData.companyDetails?.firstPreferredName || '—'

  // 4. Registered Office Details
  const regAddr = (formData.registeredOffice?.addressData || {}) as Record<string, any>
  const regAny = (formData.registeredOffice || {}) as Record<string, any>
  const addressLine = regAddr.addressLine1 || regAny.addressLine1 || '—'
  const city = regAddr.city || regAny.city || '—'
  const district = regAddr.district || regAny.district || '—'
  const state = regAddr.state || regAny.state || '—'
  const pinCode = regAddr.pincode || regAny.pincode || '—'
  const ownershipStatus = regAddr.ownershipStatus || regAny.premisesOwnership || '—'
  const companyEmail = regAddr.email || regAny.companyEmail || '—'
  const companyMobile = regAddr.mobile || regAny.mobile || regAny.companyMobile || '—'

  // 5. Promoter / Director Details
  const directors = formData.promoters || []

  // 6. Capital & Shareholding
  const cap = formData.capitalDetails || {}
  const authorisedCap = cap.authorisedCapital
    ? `₹${Number(cap.authorisedCapital).toLocaleString('en-IN')}`
    : '—'
  const subscribedCap = cap.subscribedCapital
    ? `₹${Number(cap.subscribedCapital).toLocaleString('en-IN')}`
    : '—'
  const totalShares = cap.totalShares
    ? Number(cap.totalShares).toLocaleString('en-IN')
    : '—'
  const faceValue = cap.faceValue ? `₹${cap.faceValue}` : '—'

  // 7. Documents & KYC Checklist
  const kyc = formData.documentsKyc || {}
  const findDocName = (sectionDocs?: any[], matchId?: string) => {
    if (!sectionDocs) return 'Not uploaded'
    const doc = sectionDocs.find(
      (d) =>
        d.id === matchId ||
        d.id?.toLowerCase().includes(matchId?.toLowerCase() || '') ||
        d.title?.toLowerCase().includes(matchId?.toLowerCase() || '')
    )
    if (doc?.isUploaded) {
      return doc.fileName || doc.file?.name || 'Uploaded'
    }
    return 'Not uploaded'
  }

  const promoterPanDoc = findDocName(kyc.promoterDocs, 'pan')
  const promoterIdDoc = findDocName(kyc.promoterDocs, 'identity') || findDocName(kyc.promoterDocs, 'address')
  const promoterPhotoDoc = findDocName(kyc.promoterDocs, 'photo')
  const officeAddressDoc = findDocName(kyc.officeDocs, 'office-address') || findDocName(kyc.officeDocs, 'address')
  const officeUtilityDoc = findDocName(kyc.officeDocs, 'office-utility') || findDocName(kyc.officeDocs, 'utility')
  const ownerNocDoc = findDocName(kyc.officeDocs, 'owner-noc') || findDocName(kyc.officeDocs, 'noc')

  const handleSubmitApplication = () => {
    const applicationId = `INC-${Math.floor(100000 + Math.random() * 900000)}`
    const submissionDate = new Date().toISOString().split('T')[0]
    updateFormData({
      paymentCompleted: true,
    })
    draft.clearDraft()

    const preferredName = (formData.companyDetails?.firstPreferredName || '').trim()
    const fullCompanyName = preferredName || entityTypeLabel

    try {
      userStorage.saveUserApplication({
        id: applicationId,
        code: applicationId,
        title: `${fullCompanyName} Incorporation`,
        meta: `${entityTypeLabel} · India`,
        statusLabel: 'Submitted',
        statusTone: 'info',
        progress: 25,
        icon: '🏢',
        to: routePaths.applicationTrack(applicationId),
      })
    } catch {
      // Storage fallback
    }

    navigate(routePaths.incorporation.submissionSuccess, {
      state: {
        ...formData,
        paymentCompleted: true,
        applicationId,
        submissionDate,
      },
    })
  }

  return (
    <div className="review-app-page">
      {/* Cards List */}
      <div className="review-app-list">
        {/* Section 1: Company Type & Classification */}
        <ReviewSection title="Company Type & Classification" onEdit={() => editStep(routePaths.incorporation.selectType)}>
          <ReviewRow label="Company Type" value={entityTypeLabel} />
          <ReviewRow label="Category of Company" value={categoryLabel} />
          <ReviewRow label="Sub-Category of Company" value={subCategoryLabel} />
        </ReviewSection>

        {/* Section 2: Business Activity & NIC */}
        <ReviewSection title="Business Activity & NIC" onEdit={() => editStep(routePaths.incorporation.companyDetails)}>
          <ReviewRow label="Primary Business Activity" value={primaryActivity} />
          <ReviewRow label="NIC 5-Digit Code" value={nicCode} />
          <ReviewRow label="Secondary Business Activity" value={secondaryActivity} />
        </ReviewSection>

        {/* Section 3: Proposed Company Name */}
        <ReviewSection title="Proposed Company Name" onEdit={() => editStep(routePaths.incorporation.companyDetails)}>
          <ReviewRow label="Proposed Company Name" value={proposedFirstName} />
          <ReviewRow label="Mandatory Suffix" value={entityTypeLabel} />
        </ReviewSection>

        {/* Section 4: Registered Office Details */}
        <ReviewSection title="Registered Office Details" onEdit={() => editStep(routePaths.incorporation.registeredOffice)}>
          <ReviewRow label="Building / Address Line" value={addressLine} />
          <ReviewRow label="City" value={city} />
          <ReviewRow label="District" value={district} />
          <ReviewRow label="State" value={state} />
          <ReviewRow label="PIN Code" value={pinCode} />
          <ReviewRow label="Premises Ownership Status" value={ownershipStatus} />
          <ReviewRow label="Company Email" value={companyEmail} />
          <ReviewRow label="Company Mobile" value={companyMobile} />
        </ReviewSection>

        {/* Section 5: Promoter / Director Details */}
        <ReviewSection title="Promoter / Director Details" onEdit={() => editStep(routePaths.incorporation.promoterDetails)}>
          {directors.length === 0 ? (
            <div className="review-row">
              <span className="review-row__label">Directors</span>
              <span className="review-row__value">No directors added</span>
            </div>
          ) : (
            directors.map((dir, idx) => (
              <React.Fragment key={dir.id || idx}>
                {directors.length > 1 && (
                  <div className="review-director-subheading">Director #{idx + 1}</div>
                )}
                <ReviewRow label="Full Name (as in PAN)" value={dir.fullName || '—'} />
                <ReviewRow label="PAN Number" value={dir.pan || '—'} />
                <ReviewRow label="Date of Birth" value={dir.dob || '—'} />
                <ReviewRow label="Designation" value={dir.designation || '—'} />
                <ReviewRow label="Email Address" value={dir.email || '—'} />
                <ReviewRow label="Mobile Number" value={dir.mobile || '—'} />
                <ReviewRow label="DIN (if allotted)" value={dir.din || 'Not allotted'} />
              </React.Fragment>
            ))
          )}
        </ReviewSection>

        {/* Section 6: Capital & Shareholding */}
        <ReviewSection title="Capital & Shareholding" onEdit={() => editStep(routePaths.incorporation.capitalDetails)}>
          <ReviewRow label="Authorised Capital" value={authorisedCap} />
          <ReviewRow label="Subscribed Capital" value={subscribedCap} />
          <ReviewRow label="Total Number of Shares" value={totalShares} />
          <ReviewRow label="Face Value per Share" value={faceValue} />
        </ReviewSection>

        {/* Section 7: Documents & KYC Checklist */}
        <ReviewSection title="Documents & KYC Checklist" onEdit={() => editStep(routePaths.incorporation.documentsKyc)}>
          <ReviewRow label="Promoter PAN Card" value={promoterPanDoc} />
          <ReviewRow label="Identity / Address Proof" value={promoterIdDoc} />
          <ReviewRow label="Passport Photo" value={promoterPhotoDoc} />
          <ReviewRow label="Office Address Proof" value={officeAddressDoc} />
          <ReviewRow label="Office Utility Bill" value={officeUtilityDoc} />
          <ReviewRow label="Owner NOC" value={ownerNocDoc} />
        </ReviewSection>
      </div>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => navigate(routePaths.incorporation.documentsKyc)}
        onNext={handleSubmitApplication}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Submit Application"
      />
    </div>
  )
}

export default ReviewApplication
