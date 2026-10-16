import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { routePaths } from '@core/config'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { msmeLoanValidation as v } from '@modules/loans/validation/msmeLoanValidation'
import type { MsmeLoanData } from '@modules/loans/types/msmeLoan.types'
import {
  MSME_LOAN_FORM_STEP_COUNT,
  MSME_LOAN_RESUME_ROUTE,
  MSME_LOAN_STEPS,
  MSME_LOAN_SUCCESS,
  MSME_LOAN_TITLE,
  MSME_LOAN_TYPE,
  INITIAL_MSME_LOAN_DATA,
} from './msmeLoan.constants'
import {
  KycVerification,
  loadVerifiedCustomer,
  MsmeAndBusinessDetails,
  Documents,
  ReviewAndSubmit,
  ApplicationSubmitted,
} from './steps'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import './msmeForm.css'
import './MsmeLoan.css'

/**
 * MSME Loan: Complete 5-step application flow matching user designs
 * Step 1: KYC Verification
 * Step 2: MSME & Business Details
 * Step 3: Documents
 * Step 4: Review & Submit
 * Step 5: Application Submitted
 */
export const MsmeLoan: React.FC = () => {
  const navigate = useNavigate()
  const customer = useMemo(loadVerifiedCustomer, [])

  const flow = useLoanStepFlow<MsmeLoanData>({
    loanType: MSME_LOAN_TYPE,
    loanTitle: MSME_LOAN_TITLE,
    initialValues: INITIAL_MSME_LOAN_DATA,
    application: {
      serviceTitle: MSME_LOAN_TITLE,
      totalSteps: MSME_LOAN_FORM_STEP_COUNT,
      stepLabels: MSME_LOAN_STEPS.slice(0, MSME_LOAN_FORM_STEP_COUNT).map((step) => step.title ?? ''),
      resumeRoute: MSME_LOAN_RESUME_ROUTE,
    },
    validators: [v.validateStep1, v.validateStep2, v.validateStep3, v.validateStep4],
    buildSubmission: (data) => ({
      title: 'MSME Loan Application',
      category: 'Business & MSME Finance',
      requestedAmount: toAmount(data.requestedLoanAmount || data.loanAmount || '0'),
      tenureMonths: 12,
      details: { ...data },
    }),
  })

  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  const hasRequiredDocs = Boolean(
    formData.uploadedDocs?.udyam_certificate ||
    formData.uploadedDocs?.udyamCertificate ||
    formData.uploadedDocs?.udyam_reg_certificate
  )

  const isNextDisabled =
    (currentStep === 3 && !hasRequiredDocs) ||
    (flow.isLastStep && !formData.termsAccepted)

  if (submittedApp || currentStep > MSME_LOAN_FORM_STEP_COUNT) {
    return (
      <div className="msme-loan-page" data-testid="msme-loan-page">
        <FlowStepper steps={MSME_LOAN_STEPS} currentStep={MSME_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={MSME_LOAN_TITLE}
          annualTurnover={formData.annualTurnover}
          requestedAmount={formData.requestedLoanAmount || formData.loanAmount}
          submittedAt={submittedApp?.createdAt}
          onTrackApplication={flow.handleTrackStatus}
          onGoToDashboard={() => {
            flow.markSubmitted()
            safeNavigateTo(navigate, routePaths.dashboard)
          }}
          onGoHome={() => {
            flow.markSubmitted()
            safeNavigateTo(navigate, routePaths.dashboard)
          }}
          onContactSupport={() => {
            flow.markSubmitted()
            safeNavigateTo(navigate, routePaths.support)
          }}
        />
      </div>
    )
  }

  return (
    <div className="msme-loan-page" data-testid="msme-loan-page">
      <h1 className="msme-page__title">{MSME_LOAN_TITLE}</h1>

      <FlowStepper steps={MSME_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

      <LoanStepErrorBanner message={flow.stepError} />

      {currentStep === 1 && (
        <KycVerification
          data={formData}
          customer={customer}
          onChange={handleFieldChange}
          errors={fieldErrors}
        />
      )}

      {currentStep === 2 && (
        <MsmeAndBusinessDetails
          data={formData}
          onChange={handleFieldChange}
          errors={fieldErrors}
        />
      )}

      {currentStep === 3 && (
        <Documents
          data={formData}
          onChange={handleFieldChange}
          errors={fieldErrors}
        />
      )}

      {currentStep === 4 && (
        <ReviewAndSubmit
          data={formData}
          customer={customer}
          onChange={handleFieldChange}
          onNavigateToStep={flow.navigateToStep}
          errors={fieldErrors}
        />
      )}

      <LoanStepFlowFooter<MsmeLoanData>
        flow={flow}
        serviceTitle={MSME_LOAN_SUCCESS.serviceTitle}
        successTitle={MSME_LOAN_SUCCESS.successTitle}
        successMessage={MSME_LOAN_SUCCESS.successMessage}
        testIdPrefix="msme"
        nextDisabled={isNextDisabled}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue →'}
        securityNote={
          flow.isLastStep ? (
            <div className="msme-submit-security" data-testid="msme-submit-security">
              <Lock size={14} aria-hidden="true" />
              <span>Your information is secure and encrypted</span>
            </div>
          ) : undefined
        }
        successModal={<></>}
      />
    </div>
  )
}

export default MsmeLoan

