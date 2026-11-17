import React from 'react'
import { StepActionBar, FlowStepper } from '@shared/components'
import { ServiceDraftModal } from '@shared/saveDraft'
import { useRevisedItr } from '../../hooks/useRevisedItr'
import { FindOriginalReturn } from './FindOriginalReturn'
import { ReasonForRevision } from './ReasonForRevision'
import { RevisionCorrectionDetails } from './CorrectionDetails'
import { RevisionDocumentUpload } from './DocumentUpload'
import { RevisionReviewSummary } from './ReviewSummary'
import { RevisionApplicationReceived } from './ApplicationReceived'
import './RevisedItr.css'

const REVISED_ITR_STEPS = [
  { stepNumber: 1, title: 'Original Return', shortLabel: 'Original Return' },
  { stepNumber: 2, title: 'Reason for Revision', shortLabel: 'Reason' },
  { stepNumber: 3, title: 'Correction Details', shortLabel: 'Corrections' },
  { stepNumber: 4, title: 'Supporting Documents', shortLabel: 'Documents' },
  { stepNumber: 5, title: 'Review Revision', shortLabel: 'Review' },
]

export const RevisedItr: React.FC = () => {
  const flow = useRevisedItr()
  const {
    step,
    isSubmitted,
    applicationId,
    ackNumber,
    selectedAy,
    isDropdownOpen,
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
    handleAckBlur,
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
    handleDownloadReceipt,
    editStep,
    isEditMode,
    openModal,
    isDeclared,
    declarationError,
    handleToggleDeclaration,
  } = flow

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
        ackError={errors.ackError}
        ayError={errors.ayError}
        dropdownRef={dropdownRef}
        onAckChange={handleAckChange}
        onAckBlur={handleAckBlur}
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
        onEditStep={editStep}
        isDeclared={isDeclared}
        declarationError={declarationError}
        onToggleDeclaration={handleToggleDeclaration}
      />
    ),
  }

  const renderActiveContent = () => {
    try {
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
          <FlowStepper
            steps={REVISED_ITR_STEPS}
            currentStep={step}
            ariaLabel="Revised ITR filing steps"
          />
          {renderStepFn()}
          <StepActionBar
            showBack={true}
            isReview={step === 5}
            onBack={handleBack}
            onNext={handleContinue}
            onSaveDraft={openModal}
            backLabel="Back"
            nextLabel={step === 5 ? 'Submit Application' : 'Continue'}
            isEditMode={isEditMode}
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
      <ServiceDraftModal draft={flow} serviceTitle="Revised ITR Filing" />
    </div>
  )
}

export default RevisedItr
