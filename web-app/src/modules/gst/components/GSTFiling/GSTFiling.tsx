import { routePaths } from '@core/config'
import { GST_FEES, withPlatformGst } from '@modules/gst/constants/gstBusiness.constants'
import { DraftConfirmModal } from '@shared/components'
import { GSTFilingPeriod } from './GSTFilingPeriod/GSTFilingPeriod'
import { GSTFilingDocuments } from './GSTFilingDocuments/GSTFilingDocuments'
import { GSTFilingReview } from './GSTFilingReview/GSTFilingReview'
import { GSTFilingPayment } from './GSTFilingPayment/GSTFilingPayment'
import { GSTFilingSuccess } from './GSTFilingSuccess/GSTFilingSuccess'
import { GSTFilingReceipt } from './GSTFilingReceipt/GSTFilingReceipt'
import { useGSTFilingFlow } from '@modules/gst/hooks/useGSTFilingFlow'
import './GSTFiling.css'

export const GSTFiling = () => {
  const {
    navigate,
    currentStep,
    goToStep,
    setFilingData,
    filingData,
    filingRef,
    paymentResult,
    uploadedFiles,
    notApplicableDocs,
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
    handleStepClick,
    handleStep1Continue,
    handleStep1Back,
    handleStep2Next,
    handleStep3Approve,
    handleStep4Success,
    handleFileUpload,
    handleFileRemove,
    handleToggleNotApplicable,
    isEditMode,
    startEditingFromReview,
  } = useGSTFilingFlow()

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
          onBack={() => goToStep(1)}
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
          onEditFilingFee={() => startEditingFromReview(1)}
          onEditDocuments={() => startEditingFromReview(2)}
          onBack={() => goToStep(2)}
          onRequestChange={() => goToStep(2)}
          onApprove={handleStep3Approve}
        />
      )}

      {/* Step 4: Payment */}
      {currentStep === 4 && (
        <GSTFilingPayment
          amount={withPlatformGst(filingData.baseFee > 0 ? filingData.baseFee : GST_FEES.filingCombo).total}
          applicationRef={filingRef}
          serviceTitle={`GST Filing — ${filingData.selectedMonth || 'Return'}`}
          onStepClick={handleStepClick}
          onBack={() => goToStep(3)}
          onSuccess={handleStep4Success}
        />
      )}

      {/* Step 5: Success Screen */}
      {currentStep === 5 && (
        <GSTFilingSuccess
          details={paymentResult}
          businessName={filingData.businessName}
          onBack={() => goToStep(4)}
          onViewReceipt={() => goToStep(6)}
          onTrackApplication={() => navigate(routePaths.applications)}
          onBackToDashboard={() => navigate(routePaths.dashboard)}
          onContactSupport={() => navigate(routePaths.support)}
        />
      )}

      {/* Step 6: Receipt Screen */}
      {currentStep === 6 && (
        <GSTFilingReceipt
          details={paymentResult}
          onBack={() => goToStep(5)}
        />
      )}

      <DraftConfirmModal
        isOpen={isModalOpen}
        serviceTitle="GST Filing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </div>
  )
}

export default GSTFiling
