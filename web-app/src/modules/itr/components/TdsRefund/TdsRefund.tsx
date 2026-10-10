import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config/routePaths'
import { PaymentCheckout } from '@shared/components'
import { ServiceDraftModal } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import { TdsRefundOverview, TdsRefundProgressTracker } from './TdsRefundOverview'
import { TdsRefundCustomerIncome } from './TdsRefundCustomerIncome'
import { TdsRefundReview } from './TdsRefundReview'
import { TdsRefundStatus } from './TdsRefundStatus'
import { useTdsRefundFlow } from '../../hooks/useTdsRefundFlow'
import './TdsRefund.css'

const REVIEW_STEP = 2

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
    businessDetails,
    setBusinessDetails,
    taxData,
    setTaxData,
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
        onNext={nextOrReview(() => setCurrentStep(REVIEW_STEP))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        currentStep={1}
        initialProfile={profile}
        onProfileChange={setProfile}
        initialBankDetails={bankDetails}
        onBankChange={setBankDetails}
        initialBusinessDetails={businessDetails}
        onBusinessChange={setBusinessDetails}
        initialTaxData={taxData}
        onTaxChange={setTaxData}
      />
    ),
    2: () => (
      <TdsRefundReview
        onBack={() => setCurrentStep(1)}
        onEditStep1={() => reviewEdit.startEdit(() => setCurrentStep(1))}
        onNext={() => setCurrentStep(3)}
        onSaveDraft={openModal}
        profile={profile}
        bankDetails={bankDetails}
        businessDetails={businessDetails}
        taxData={taxData}
      />
    ),
    3: () => (
      <div className="tds-payment-page" data-testid="tds-refund-payment-page">
        <div className="tds-payment-stepper-wrap">
          <TdsRefundProgressTracker currentStep={3} />
        </div>
        <PaymentCheckout
          amount={5899}
          serviceTitle="TDS Refund CA E-filing"
          applicationRef={tdsRef}
          applicantName={profile.fullName || profile.name || user?.fullName || 'Taxpayer'}
          onBack={() => setCurrentStep(REVIEW_STEP)}
          onSuccess={handleFinishSubmission}
        />
      </div>
    ),
    4: () => (
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
