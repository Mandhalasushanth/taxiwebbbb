import React from 'react'
import { StepActionBar } from '@shared/components'
import { ServiceDraftModal } from '@shared/saveDraft'
import { LoanSubmitSuccessModal } from '../LoanSubmitSuccessModal/LoanSubmitSuccessModal'
import type { LoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'

export interface LoanStepFlowFooterProps<T extends object> {
  flow: LoanStepFlow<T>
  /** Name used in the draft dialog, e.g. "Home Loan Application" */
  serviceTitle: string
  successTitle: string
  successMessage: string
  /** Prefix for the action bar test ids, e.g. "personal" → "personal-step-continue-btn" */
  testIdPrefix?: string
  nextDisabled?: boolean
  /** Replaces the standard success modal (e.g. Project Finance has its own) */
  successModal?: React.ReactNode
}

/** Bottom action bar, save-draft dialog and submit-success modal shared by all loan flows */
export function LoanStepFlowFooter<T extends object>({
  flow,
  serviceTitle,
  successTitle,
  successMessage,
  testIdPrefix,
  nextDisabled = false,
  successModal,
}: LoanStepFlowFooterProps<T>) {
  const prefix = testIdPrefix ? `${testIdPrefix}-` : ''

  return (
    <>
      <StepActionBar
        showBack={true}
        onBack={flow.handleBack}
        onNext={flow.handleNext}
        onSaveDraft={() => flow.setIsDraftModalOpen(true)}
        saveDraftLabel="Save Draft & Exit"
        nextLabel="Continue"
        isEditMode={flow.isEditMode}
        isSubmitting={flow.isSubmitting}
        nextDisabled={flow.isSubmitting || nextDisabled}
        nextTestId={flow.isLastStep ? `${prefix}submit-application-btn` : `${prefix}step-continue-btn`}
        nextAriaLabel={flow.isLastStep ? 'Submit Application' : undefined}
      />

      <ServiceDraftModal draft={flow} serviceTitle={serviceTitle} />

      {successModal ?? (
        <LoanSubmitSuccessModal
          isOpen={Boolean(flow.submittedApp)}
          title={successTitle}
          referenceNumber={flow.referenceNumber}
          message={successMessage}
          onDone={flow.handleSuccessDone}
          onTrackStatus={flow.handleTrackStatus}
        />
      )}
    </>
  )
}

export default LoanStepFlowFooter
