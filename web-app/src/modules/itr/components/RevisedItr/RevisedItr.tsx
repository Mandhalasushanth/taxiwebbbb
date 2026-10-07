import React from 'react'
import { StepActionBar, PaymentCheckout, DraftConfirmModal } from '@shared/components'
import { useRevisedItr } from '../../hooks/useRevisedItr'
import { FindOriginalReturn } from './FindOriginalReturn'
import { ReasonForRevision } from './ReasonForRevision'
import { RevisionCorrectionDetails } from './CorrectionDetails'
import { RevisionDocumentUpload } from './DocumentUpload'
import { RevisionReviewSummary } from './ReviewSummary'
import { RevisionApplicationReceived } from './ApplicationReceived'
import './RevisedItr.css'

export const RevisedItr: React.FC = () => {
  const {
    step,
    showPayment,
    isSubmitted,
    applicationId,
    ackNumber,
    selectedAy,
    isDropdownOpen,
    isReturnFound,
    returnDetails,
    selectedReason,
    otherReasonText,
    incomeCorrections,
    deductionCorrections,
    bankCorrections,
    uploadedDocuments,
    isLoading,
    errors,
    dropdownRef,
    handleKeyDown,
    handleAckChange,
    handleSelectAy,
    handleToggleDropdown,
    handleSelectReason,
    handleOtherReasonChange,
    handleIncomeChange,
    handleDeductionChange,
    handleBankChange,
    handleFileUpload,
    handleFileRemove,
    handleBack,
    handleContinue,
    handlePaymentSuccess,
    handleDownloadReceipt,
    goToStep,
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = useRevisedItr()

  const originalAmounts = {
    salaryOriginal: returnDetails?.salaryOriginal ?? 812400,
    otherOriginal: returnDetails?.otherOriginal ?? 0,
    taxableOriginal: returnDetails?.taxableOriginal ?? 492400,
  }

  const stageRenderers: Record<number, () => React.ReactNode> = {
    1: () => (
      <FindOriginalReturn
        ackNumber={ackNumber}
        selectedAy={selectedAy}
        isDropdownOpen={isDropdownOpen}
        isReturnFound={isReturnFound}
        returnDetails={returnDetails}
        ackError={errors.ackError}
        ayError={errors.ayError}
        dropdownRef={dropdownRef}
        onAckChange={handleAckChange}
        onKeyDown={handleKeyDown}
        onToggleDropdown={handleToggleDropdown}
        onSelectAy={handleSelectAy}
      />
    ),
    2: () => (
      <ReasonForRevision
        selectedReason={selectedReason}
        otherReasonText={otherReasonText}
        reasonError={errors.reasonError}
        otherReasonError={errors.otherReasonError}
        onSelectReason={handleSelectReason}
        onOtherReasonChange={handleOtherReasonChange}
      />
    ),
    3: () => (
      <RevisionCorrectionDetails
        selectedReason={selectedReason}
        otherReasonText={otherReasonText}
        incomeCorrections={incomeCorrections}
        deductionCorrections={deductionCorrections}
        bankCorrections={bankCorrections}
        originalAmounts={originalAmounts}
        salaryError={errors.salaryIncomeError}
        taxableError={errors.taxableIncomeError}
        bankAccountError={errors.bankAccountError}
        ifscError={errors.ifscError}
        onIncomeChange={handleIncomeChange}
        onDeductionChange={handleDeductionChange}
        onBankChange={handleBankChange}
        onKeyDown={handleKeyDown}
      />
    ),
    4: () => (
      <RevisionDocumentUpload
        selectedReason={selectedReason}
        selectedAy={selectedAy}
        uploadedDocuments={uploadedDocuments}
        documentsError={errors.documentsError}
        onUpload={handleFileUpload}
        onRemove={handleFileRemove}
      />
    ),
    5: () => (
      <RevisionReviewSummary
        selectedReason={selectedReason}
        ackNumber={ackNumber}
        selectedAy={selectedAy}
        returnDetails={returnDetails}
        incomeCorrections={incomeCorrections}
        deductionCorrections={deductionCorrections}
        bankCorrections={bankCorrections}
        otherReasonText={otherReasonText}
        uploadedDocuments={uploadedDocuments}
        onEditStep={goToStep}
      />
    ),
  }

  const renderActiveContent = () => {
    try {
      if (showPayment) {
        return (
          <PaymentCheckout
            amount={999}
            serviceTitle="Revised ITR Filing Assistance"
            applicationRef={ackNumber || 'REV-ITR-2025'}
            applicantName={returnDetails?.personalInfo?.fullName || 'Assessee'}
            onBack={handleBack}
            onSuccess={handlePaymentSuccess}
          />
        )
      }
      if (isSubmitted) {
        return (
          <RevisionApplicationReceived
            applicationId={applicationId}
            selectedAy={selectedAy}
            returnDetails={returnDetails}
            uploadedDocuments={uploadedDocuments}
            onBack={handleBack}
            onDownloadReceipt={handleDownloadReceipt}
          />
        )
      }
      const renderStepFn = stageRenderers[step] || stageRenderers[1]
      return (
        <>
          {renderStepFn()}
          <StepActionBar
            onBack={handleBack}
            onNext={handleContinue}
            onSaveDraft={openModal}
            backLabel="Back"
            nextLabel="Continue"
            isSubmitting={isLoading}
          />
        </>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="revised-itr-page">
      <div className="revised-itr-content-area">{renderActiveContent()}</div>
      <DraftConfirmModal
        isOpen={isModalOpen}
        serviceTitle="Revised ITR Filing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </div>
  )
}

export default RevisedItr
