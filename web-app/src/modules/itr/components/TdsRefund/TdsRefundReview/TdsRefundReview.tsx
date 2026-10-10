import React from 'react'
import { StepActionBar } from '@shared/components'
import { TdsIcons, type TdsTaxpayerProfile } from '@modules/itr/utils/tdsRefund.constants'
import type { TdsBankDetails, TdsIncomeTaxData } from '../TdsRefundCustomerIncome'
import type { TdsBusinessDetails } from '@modules/itr/types/tdsRefund.types'
import { maskAadhaar } from '@shared/utils/formatUtils'
import { TdsRefundProgressTracker } from '../TdsRefundOverview'
import { TdsEstimatedComputationCard, TdsReviewDocumentsCard } from './TdsReviewEstimateCards'
import './TdsRefundReview.css'

const REVIEW_SIDEBAR_CHECKLIST = [
  { text: 'Step 1: Application Details', status: 'done', icon: '✓' },
  { text: 'Step 2: Review & Estimate', status: 'active', icon: '●', isStrong: true },
  { text: 'Step 3: Payment', status: 'pending', icon: '○' },
  { text: 'Step 4: Direct Bank Credit', status: 'pending', icon: '○' },
]

export const TdsRefundReviewSidebar: React.FC = () => (
  <aside className="tds-review-sidebar">
    <div className="tds-sidebar-card">
      <div className="tds-sidebar-progress-badge">Stage 3 in Progress</div>
      <h4 className="tds-sidebar-card-title">Review &amp; Estimate</h4>
      <p className="tds-sidebar-card-desc">Please thoroughly verify all your pre-filled and declared details before advancing to CA verification and refund filing.</p>
      <div className="tds-sidebar-checklist">
        {REVIEW_SIDEBAR_CHECKLIST.map((item) => (
          <div key={item.text} className="tds-sidebar-check-item">
            <span className={`tds-sidebar-check-icon tds-sidebar-check-icon--${item.status}`}>{item.icon}</span>
            {item.isStrong ? <strong className="tds-sidebar-check-item-strong">{item.text}</strong> : <span>{item.text}</span>}
          </div>
        ))}
      </div>
    </div>

    <div className="tds-sidebar-card tds-sidebar-card--navy">
      <div className="tds-sidebar-card-header"><TdsIcons.Shield className="tds-sidebar-header-icon" /><h4 className="tds-sidebar-card-title">Chartered Accountant Review</h4></div>
      <p className="tds-sidebar-card-desc">A senior licensed Chartered Accountant will cross-examine your 26AS, AIS, and TIS before submitting to the IT Department.</p>
    </div>

    <div className="tds-sidebar-card">
      <div className="tds-sidebar-card-header"><TdsIcons.Lock className="tds-sidebar-header-icon tds-sidebar-header-icon--secure" /><h4 className="tds-sidebar-card-title">Bank-Grade 256-Bit Security</h4></div>
      <p className="tds-sidebar-card-desc">Your financial and personal details are encrypted and securely submitted through authorized ITD e-filing gateways.</p>
    </div>
  </aside>
)

export interface TdsRefundReviewProps {
  onBack: () => void
  onEditStep1: () => void
  onNext: () => void
  onSaveDraft?: () => void
  profile?: TdsTaxpayerProfile
  bankDetails?: TdsBankDetails
  businessDetails?: TdsBusinessDetails
  taxData?: TdsIncomeTaxData
}

const EditButton: React.FC<{ onClick: () => void; testId: string }> = ({ onClick, testId }) => (
  <button type="button" className="tds-review-edit-btn" onClick={onClick} data-testid={testId}><TdsIcons.Edit />Edit</button>
)

export const TdsRefundReview: React.FC<TdsRefundReviewProps> = ({
  onBack, onEditStep1, onNext, onSaveDraft, profile, bankDetails, businessDetails, taxData,
}) => {
  const isReviewValid = Boolean(
    bankDetails?.accountHolder?.trim() && bankDetails?.accountNumber?.trim() && bankDetails?.ifsc?.trim()
  )

  const formattedMobile = profile?.mobile ? (profile.mobile.startsWith('+91') ? profile.mobile : `+91 ${profile.mobile}`) : '—'
  const formattedAcct = bankDetails?.accountNumber ? `••••${bankDetails.accountNumber.slice(-4)}${bankDetails.accountType ? ` (${bankDetails.accountType})` : ''}` : '—'

  const reviewSections = [
    {
      testId: 'tds-review-personal', title: 'Personal Details', Icon: TdsIcons.User, editTestId: 'edit-personal-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Full Name', value: profile?.fullName || profile?.name || '—' },
        { label: 'PAN', value: profile?.pan || '—', isMono: true },
        { label: 'Mobile Number', value: formattedMobile },
        { label: 'Email Address', value: profile?.email || '—' },
        { label: 'Address', value: profile?.address || '—' },
      ],
    },
    {
      testId: 'tds-review-business', title: 'Business Details', Icon: TdsIcons.Briefcase, editTestId: 'edit-business-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Legal Name', value: businessDetails?.legalName || '—' },
        { label: 'Business PAN', value: businessDetails?.pan || '—', isMono: true },
        { label: 'Aadhaar', value: maskAadhaar(businessDetails?.aadhaar) },
        { label: 'Mobile Number', value: businessDetails?.mobile ? `+91 ${businessDetails.mobile}` : '—' },
      ],
    },
    {
      testId: 'tds-review-bank', title: 'Bank Details', Icon: TdsIcons.Building, editTestId: 'edit-bank-btn', onEdit: onEditStep1,
      rows: [
        { label: 'Bank Name', value: bankDetails?.bankName || '—' },
        { label: 'Branch', value: bankDetails?.branch || '—' },
        { label: 'Account Number', value: formattedAcct },
        { label: 'IFSC Code', value: bankDetails?.ifsc || '—', isMono: true },
      ],
    },
  ]

  return (
    <div className="tds-review-page" data-testid="tds-refund-review-page">
      <div className="tds-review-stepper-wrap"><TdsRefundProgressTracker currentStep={2} /></div>
      <div className="tds-review-layout">
        <main className="tds-review-main">
          {reviewSections.map((section) => (
            <section key={section.testId} className="tds-review-card" data-testid={section.testId}>
              <div className="tds-review-card-header">
                <div className="tds-review-title-wrap"><section.Icon className="tds-review-icon" /><h3 className="tds-review-title">{section.title}</h3></div>
                <EditButton onClick={section.onEdit} testId={section.editTestId} />
              </div>
              <div className="tds-review-rows">
                {section.rows.map((row) => (
                  <div key={row.label} className="tds-review-row"><span className="tds-review-label">{row.label}</span><span className={`tds-review-value ${'isMono' in row && row.isMono ? 'tds-review-value--mono' : ''}`}>{row.value}</span></div>
                ))}
              </div>
            </section>
          ))}

          <TdsReviewDocumentsCard businessDetails={businessDetails} onEdit={onEditStep1} />
          <TdsEstimatedComputationCard taxData={taxData} />
        </main>
      </div>
      <StepActionBar onBack={onBack} onNext={onNext} onSaveDraft={onSaveDraft} nextLabel="Proceed to Payment" nextDisabled={!isReviewValid} backTestId="tds-step3-back-btn" nextTestId="tds-proceed-payment-btn" />
    </div>
  )
}

export default TdsRefundReview
