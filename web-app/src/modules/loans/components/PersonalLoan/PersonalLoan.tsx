import React, { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { personalLoanValidation as v } from '@modules/loans/validation/personalLoanValidation'
import type { PersonalLoanFormData } from '@modules/loans/types/personalLoan.types'
import {
  PERSONAL_LOAN_FORM_STEP_COUNT,
  PERSONAL_LOAN_RESUME_ROUTE,
  PERSONAL_LOAN_STEPS,
  PERSONAL_LOAN_SUCCESS,
  PERSONAL_LOAN_TITLE,
  PERSONAL_LOAN_TYPE,
  INITIAL_PERSONAL_LOAN_DATA,
} from './personalLoan.constants'
import {
  KycVerification,
  EmploymentIncome,
  Documents,
  ReviewAndSubmit,
  ApplicationSubmitted,
  loadVerifiedCustomer,
} from './steps'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import './plForm.css'
import './PersonalLoan.css'

/**
 * Personal Loan: 5-step modernized flow
 * Step 1: KYC Verification (verified customer read-only identity, addresses, DPDP consent)
 * Step 2: Employment & Income
 * Step 3: Documents
 * Step 4: Review & Submit
 * Step 5: Submit / Application Received
 */
export const PersonalLoan: React.FC = () => {
  const customer = useMemo(() => loadVerifiedCustomer(), [])

  const flow = useLoanStepFlow<PersonalLoanFormData>({
    loanType: PERSONAL_LOAN_TYPE,
    loanTitle: PERSONAL_LOAN_TITLE,
    initialValues: INITIAL_PERSONAL_LOAN_DATA,
    application: {
      serviceTitle: PERSONAL_LOAN_TITLE,
      totalSteps: PERSONAL_LOAN_FORM_STEP_COUNT,
      stepLabels: PERSONAL_LOAN_STEPS.slice(0, PERSONAL_LOAN_FORM_STEP_COUNT).map((step) => step.title ?? ''),
      resumeRoute: PERSONAL_LOAN_RESUME_ROUTE,
    },
    validators: [v.validateStep1, v.validateStep2, v.validateStep3, v.validateStep4],
    buildSubmission: (data) => ({
      title: 'Personal Loan Application',
      category: 'Retail & Personal Finance',
      requestedAmount: toAmount(data.requestedLoanAmount),
      tenureMonths: 12,
      details: { ...data },
    }),
  })

  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp) {
    return (
      <div className="personal-loan-page" data-testid="personal-loan-page">
        <FlowStepper steps={PERSONAL_LOAN_STEPS} currentStep={PERSONAL_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={PERSONAL_LOAN_TITLE}
          requestedAmount={formData.requestedLoanAmount || ''}
          submittedAt={submittedApp.createdAt}
          onTrackApplication={flow.handleTrackStatus}
        />
      </div>
    )
  }

  return (
    <div className="personal-loan-page" data-testid="personal-loan-page">
      <h1 className="pl-page__title">{PERSONAL_LOAN_TITLE}</h1>

      <FlowStepper steps={PERSONAL_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

      <LoanStepErrorBanner message={flow.stepError} />

      {currentStep === 1 && (
        <KycVerification data={formData} customer={customer} onChange={handleFieldChange} errors={fieldErrors} />
      )}
      {currentStep === 2 && <EmploymentIncome data={formData} onChange={handleFieldChange} errors={fieldErrors} />}
      {currentStep === 3 && <Documents data={formData} onChange={handleFieldChange} errors={fieldErrors} />}
      {currentStep === 4 && (
        <ReviewAndSubmit
          data={formData}
          customer={customer}
          onChange={handleFieldChange}
          onNavigateToStep={flow.navigateToStep}
          errors={fieldErrors}
        />
      )}

      <LoanStepFlowFooter
        flow={flow}
        {...PERSONAL_LOAN_SUCCESS}
        testIdPrefix="personal"
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue'}
        securityNote={
          flow.isLastStep ? (
            <div className="pl-submit-security" data-testid="pl-submit-security">
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

export default PersonalLoan

