import { routePaths } from '@core/config'
import { ServiceDraftModal } from '@shared/saveDraft'
import { GSTStepBusiness } from './GSTStepBusiness/GSTStepBusiness'
import { GSTStepDocuments } from './GSTStepDocuments/GSTStepDocuments'
import { GSTStepReview } from './GSTStepReview/GSTStepReview'
import { GSTPaymentSuccess } from './GSTPaymentSuccess/GSTPaymentSuccess'
import { GSTRegistrationStepper } from '@modules/gst/shared/GSTRegistrationStepper/GSTRegistrationStepper'
import { useGstRegistrationState } from '@modules/gst/hooks/useGstRegistrationState'
import './GSTRegistration.css'

export const GSTRegistration = () => {
  const flow = useGstRegistrationState()
  const {
    currentStep,
    businessData,
    documents,
    paymentResult,
    applicationRef,
    openDraftModal,
    handleCancel,
    handleBusinessChange,
    setDocuments,
    goToStep,
    isEditMode,
    editSection,
    startEditingFromReview,
    handleStep1Next,
    handleStep2Back,
    handleStep2Next,
    handleStep3Back,
    handleStep3Proceed,
    navigate,
  } = flow

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 2:
        return 'Upload Documents'
      case 3:
        return 'Review Application'
      default:
        return 'GST Registration'
    }
  }

  const getHeaderSubtitle = () => {
    switch (currentStep) {
      case 2:
        return 'Please upload the required documents to continue your GST registration.'
      case 3:
        return 'Please review your details and documents before submitting your application.'
      default:
        return 'Complete your GST registration in a few simple steps'
    }
  }

  return (
    <div className="gst-reg-page">
      {/* Top Header */}
      {currentStep <= 3 && (
        <div className="gst-reg-top-header">
          <div className="gst-reg-header-titles">
            <h1 className="gst-reg-title">{getHeaderTitle()}</h1>
            <p className="gst-reg-subtitle">{getHeaderSubtitle()}</p>
          </div>
        </div>
      )}

      {/* Stepper (Steps 1 to 3) */}
      {currentStep <= 3 && (
        <div className="gst-reg-stepper-container">
          <GSTRegistrationStepper
            currentStep={currentStep}
            onStepClick={(step) => goToStep(step)}
          />
        </div>
      )}

      {/* Steps 1 to 3 */}
      {currentStep <= 3 && (
        <div className="gst-reg-content-grid gst-reg-content-grid--full-width">
          <main className="gst-reg-main-content">
            {currentStep === 1 && (
              <GSTStepBusiness
                data={businessData}
                isEditMode={isEditMode}
                focusSection={editSection}
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
                onEdit={(section) => startEditingFromReview(section === 'documents' ? 2 : 1, section ?? null)}
                onBack={handleStep3Back}
                onProceed={handleStep3Proceed}
                onSaveDraft={openDraftModal}
              />
            )}
          </main>
        </div>
      )}

      {/* Step 4: Application Status (Post-Submission Complete Screen) */}
      {currentStep === 4 && (
        <GSTPaymentSuccess
          details={
            paymentResult || {
              applicationRef,
              transactionId: applicationRef,
              receiptNumber: `TE/${new Date().getFullYear()}/REG-${applicationRef.slice(-6)}`,
              method: 'Direct Submission',
              dateText: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
              amount: 0,
              verified: true,
            }
          }
          businessName={businessData.tradeName || businessData.legalName || 'Your Business'}
          onBackToDashboard={() => navigate(routePaths.dashboard)}
          onTrackApplications={() => navigate(routePaths.applications)}
          onContactSupport={() => navigate(routePaths.support)}
        />
      )}

      {/* Save Application Progress Confirmation Popup on Leaving */}
      <ServiceDraftModal draft={flow} serviceTitle="GST registration" />
    </div>
  )
}

export default GSTRegistration
