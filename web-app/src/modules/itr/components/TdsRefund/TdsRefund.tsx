import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config/routePaths'
import { PaymentCheckout } from '@shared/components'
import { ServiceDraftModal } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import { TdsRefundOverview, TdsRefundProgressTracker } from './TdsRefundOverview'
import { TdsRefundCustomerIncome } from './TdsRefundCustomerIncome'
import { TdsRefundDocuments } from './TdsRefundDocuments'
import { TdsRefundReview } from './TdsRefundReview'
import { TdsRefundStatus } from './TdsRefundStatus'
import { useTdsRefundFlow } from '../../hooks/useTdsRefundFlow'
import './TdsRefund.css'

const REVIEW_STEP = 3

export const TdsRefund: React.FC = () => {
  const navigate = useNavigate()
  const flow = useTdsRefundFlow()
  const {
    user,
    tdsRef,
    currentStep,
    setCurrentStep,
    profile,
    setProfile,
    bankDetails,
    setBankDetails,
    taxData,
    setTaxData,
    uploads,
    setUploads,
    openModal,
    handleFinishSubmission,
    isDirty,
  } = flow

  // "Edit" from the review: the step shows "Update & Review" and Continue / Back return to the review
  const reviewEdit = useReviewEdit(() => setCurrentStep(REVIEW_STEP))
  const { isEditMode, nextOrReview, backOrReview } = reviewEdit

  const stageRenderers: Record<number, () => React.ReactNode> = {
    0: () => <TdsRefundOverview onStart={() => setCurrentStep(1)} />,
    1: () => (
      <TdsRefundCustomerIncome
        onBack={backOrReview(() => {
          if (isDirty) {
            openModal()
          } else {
            setCurrentStep(0)
          }
        })}
        onNext={nextOrReview(() => setCurrentStep(2))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        currentStep={1}
        initialProfile={profile}
        onProfileChange={setProfile}
        initialBankDetails={bankDetails}
        onBankChange={setBankDetails}
        initialTaxData={taxData}
        onTaxChange={setTaxData}
      />
    ),
    2: () => (
      <TdsRefundDocuments
        onBack={backOrReview(() => setCurrentStep(1))}
        onNext={nextOrReview(() => setCurrentStep(REVIEW_STEP))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        initialUploads={uploads}
        onUploadsChange={setUploads}
      />
    ),
    3: () => (
      <TdsRefundReview
        onBack={() => setCurrentStep(2)}
        onEditStep1={() => reviewEdit.startEdit(() => setCurrentStep(1))}
        onEditStep2={() => reviewEdit.startEdit(() => setCurrentStep(2))}
        onNext={() => setCurrentStep(4)}
        onSaveDraft={openModal}
        profile={profile}
        bankDetails={bankDetails}
        taxData={taxData}
        uploads={uploads}
      />
    ),
    4: () => (
      <div className="tds-payment-page" data-testid="tds-refund-payment-page">
        <div className="tds-payment-stepper-wrap">
          <TdsRefundProgressTracker currentStep={4} />
        </div>
        <PaymentCheckout
          amount={5899}
          serviceTitle="TDS Refund CA E-filing"
          applicationRef={tdsRef}
          applicantName={profile.fullName || profile.name || user?.fullName || 'Taxpayer'}
          onBack={() => setCurrentStep(3)}
          onSuccess={handleFinishSubmission}
        />
      </div>
    ),
    5: () => (
      <TdsRefundStatus
        applicationId={tdsRef}
        appliedDate={new Date().toISOString()}
        assessmentYear={(profile.assessmentYear || '2025-26').replace(/^AY\s*/i, '')}
        onBackToDashboard={() => navigate(routePaths.dashboard)}
      />
    ),
  }

  const renderCurrentStage = () => {
    try {
      const renderFn = stageRenderers[currentStep] || stageRenderers[0]
      return renderFn()
    } catch {
      return <TdsRefundOverview onStart={() => setCurrentStep(1)} />
    }
  }

  return (
    <>
      {renderCurrentStage()}
      <ServiceDraftModal draft={flow} serviceTitle="TDS refund" />
    </>
  )
}

export default TdsRefund
