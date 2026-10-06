import { routePaths } from '@core/config'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'
import { DraftConfirmModal } from '@shared/components'
import { GSTStepBusiness } from './GSTStepBusiness/GSTStepBusiness'
import { GSTStepDocuments } from './GSTStepDocuments/GSTStepDocuments'
import { GSTStepReview } from './GSTStepReview/GSTStepReview'
import { GSTStepPayment } from './GSTStepPayment/GSTStepPayment'
import { GSTPaymentSuccess } from './GSTPaymentSuccess/GSTPaymentSuccess'
import { GSTRegistrationStepper } from '@modules/gst/shared/GSTRegistrationStepper/GSTRegistrationStepper'
import { useGstRegistrationState } from '@modules/gst/hooks/useGstRegistrationState'
import './GSTRegistration.css'

export const GSTRegistration = () => {
  const {
    currentStep,
    businessData,
    documents,
    paymentResult,
    applicationRef,
    isDraftModalOpen,
    openDraftModal,
    handleCancel,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
    handleBusinessChange,
    setDocuments,
    goToStep,
    isEditMode,
    startEditingFromReview,
    handleStep1Next,
    handleStep2Back,
    handleStep2Next,
    handleStep3Back,
    handleStep3Proceed,
    handleStep4Back,
    handlePaymentSuccess,
    navigate,
  } = useGstRegistrationState()

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 2:
        return 'Upload Documents'
      case 3:
        return 'Review Application'
      case 4:
        return 'Complete Payment'
      default:
        return 'GST Registration'
    }
  }

  const getHeaderSubtitle = () => {
    switch (currentStep) {
      case 2:
        return 'Please upload the required documents to continue your GST registration.'
      case 3:
        return 'Please review your details and documents before proceeding to payment.'
      case 4:
        return 'Choose your preferred payment method to complete your GST registration.'
      default:
        return 'Complete your GST registration in a few simple steps'
    }
  }

  return (
    <div className="gst-reg-page">
      {/* Top Header */}
      {currentStep <= 4 && (
        <div className="gst-reg-top-header">
          <div className="gst-reg-header-titles">
            <h1 className="gst-reg-title">{getHeaderTitle()}</h1>
            <p className="gst-reg-subtitle">{getHeaderSubtitle()}</p>
          </div>
        </div>
      )}

      {/* Stepper (Steps 1 to 4) */}
      {currentStep <= 4 && (
        <div className="gst-reg-stepper-container">
          <GSTRegistrationStepper
            currentStep={currentStep}
            onStepClick={(step) => goToStep(step)}
          />
        </div>
      )}

      {/* Steps 1 to 4 */}
      {currentStep <= 4 && (
        <div className="gst-reg-content-grid gst-reg-content-grid--full-width">
          <main className="gst-reg-main-content">
            {currentStep === 1 && (
              <GSTStepBusiness
                data={businessData}
                isEditMode={isEditMode}
                onChange={handleBusinessChange}
                onNext={handleStep1Next}
                onCancel={handleCancel}
                onSaveDraft={openDraftModal}
              />
            )}

            {currentStep === 2 && (
              <GSTStepDocuments
                initialDocuments={documents}
                isEditMode={isEditMode}
                onDocumentsChange={setDocuments}
                onBack={handleStep2Back}
                onNext={handleStep2Next}
                onSaveDraft={openDraftModal}
              />
            )}

            {currentStep === 3 && (
              <GSTStepReview
                businessData={businessData}
                documents={documents}
                onEdit={(section) => startEditingFromReview(section === 'documents' ? 2 : 1)}
                onBack={handleStep3Back}
                onProceed={handleStep3Proceed}
                onSaveDraft={openDraftModal}
              />
            )}

            {currentStep === 4 && (
              <GSTStepPayment
                amount={GST_FEES.registration}
                applicationRef={applicationRef}
                serviceTitle="GST Registration"
                applicantName={businessData.signatoryName || businessData.legalName || 'Applicant'}
                onBack={handleStep4Back}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </main>
        </div>
      )}

      {/* Step 5: Application Status (Post-Payment Complete Screen) */}
      {currentStep === 5 && paymentResult && (
        <GSTPaymentSuccess
          details={paymentResult}
          businessName={businessData.tradeName || businessData.legalName || 'Your Business'}
          onBackToDashboard={() => navigate(routePaths.dashboard)}
          onTrackApplications={() => navigate(routePaths.applications)}
          onContactSupport={() => navigate(routePaths.support)}
        />
      )}

      {/* Save Application Progress Confirmation Popup on Leaving */}
      <DraftConfirmModal
        isOpen={isDraftModalOpen}
        serviceTitle="GST registration"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </div>
  )
}

export default GSTRegistration
