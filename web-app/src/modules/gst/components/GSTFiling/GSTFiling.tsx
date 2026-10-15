import { routePaths } from '@core/config'
import { ServiceDraftModal } from '@shared/saveDraft'
import { GSTFilingPeriod } from './GSTFilingPeriod/GSTFilingPeriod'
import { GSTFilingDocuments } from './GSTFilingDocuments/GSTFilingDocuments'
import { GSTFilingReview } from './GSTFilingReview/GSTFilingReview'
import { GSTFilingSuccess } from './GSTFilingSuccess/GSTFilingSuccess'
import { GSTFilingReceipt } from './GSTFilingReceipt/GSTFilingReceipt'
import { useGSTFilingFlow } from '@modules/gst/hooks/useGSTFilingFlow'
import './GSTFiling.css'

export const GSTFiling = () => {
  const flow = useGSTFilingFlow()
  const {
    navigate,
    currentStep,
    goToStep,
    setFilingData,
    filingData,
    paymentResult,
    uploadedFiles,
    notApplicableDocs,
    openModal,
    handleStepClick,
    handleStep1Continue,
    handleStep1Back,
    handleStep2Back,
    handleStep2Next,
    handleStep3Approve,
    handleFileUpload,
    handleFileRemove,
    handleToggleNotApplicable,
    isEditMode,
    startEditingFromReview,
  } = flow

  return (
    <div className="gst-filing-page">
      {/* Step 1: Period Selection */}
      {currentStep === 1 && (
        <GSTFilingPeriod
          initialData={filingData}
          isEditMode={isEditMode}
          onStepClick={handleStepClick}
          onContinue={handleStep1Continue}
          onCancel={handleStep1Back}
          onSaveDraft={openModal}
          onDraftChange={setFilingData}
        />
      )}

      {/* Step 2: Upload Documents & Checklist */}
      {currentStep === 2 && (
        <GSTFilingDocuments
          selectedMonth={filingData.selectedMonth}
          baseFee={filingData.baseFee}
          returnType={filingData.returnType}
          frequency={filingData.frequency}
          uploadedFiles={uploadedFiles}
          notApplicableDocs={notApplicableDocs}
          isEditMode={isEditMode}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          onToggleNotApplicable={handleToggleNotApplicable}
          onStepClick={handleStepClick}
          onSaveDraft={openModal}
          onBack={handleStep2Back}
          onNext={handleStep2Next}
        />
      )}

      {/* Step 3: Review & Tax Figures */}
      {currentStep === 3 && (
        <GSTFilingReview
          selectedMonth={filingData.selectedMonth}
          baseFee={filingData.baseFee}
          filingData={filingData}
          uploadedFiles={uploadedFiles}
          notApplicableDocs={notApplicableDocs}
          onStepClick={handleStepClick}
          onSaveDraft={openModal}
          onEditFilingDetails={() => startEditingFromReview(1)}
          onEditTaxComputation={() => startEditingFromReview(1)}
          onEditDocuments={() => startEditingFromReview(2)}
          onBack={() => goToStep(2)}
          onRequestChange={() => goToStep(2)}
          onApprove={handleStep3Approve}
        />
      )}

      {/* Step 4: Success Screen / Application Status */}
      {currentStep === 4 && (
        <GSTFilingSuccess
          details={paymentResult}
          businessName={filingData.businessName}
          onBack={() => goToStep(3)}
          onViewReceipt={() => goToStep(5)}
          onTrackApplication={() => navigate(routePaths.applications)}
          onBackToDashboard={() => navigate(routePaths.dashboard)}
          onContactSupport={() => navigate(routePaths.support)}
        />
      )}

      {/* Step 5: Receipt Screen */}
      {currentStep === 5 && (
        <GSTFilingReceipt
          details={paymentResult}
          onBack={() => goToStep(4)}
        />
      )}

      <ServiceDraftModal draft={flow} serviceTitle="GST Filing" />
    </div>
  )
}

export default GSTFiling
