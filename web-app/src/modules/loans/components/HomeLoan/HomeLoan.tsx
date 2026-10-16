import React, { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import type { HomeLoanData } from '@modules/loans/types/homeLoan.types'
import { homeLoanValidation } from '@modules/loans/validation/homeLoanValidation'
import {
  HOME_LOAN_FORM_STEP_COUNT,
  HOME_LOAN_RESUME_ROUTE,
  HOME_LOAN_STEPS,
  HOME_LOAN_SUCCESS,
  HOME_LOAN_TITLE,
  HOME_LOAN_TYPE,
  INITIAL_HOME_LOAN_DATA,
} from './homeLoan.constants'
import {
  KycVerification,
  HomeLoanRequirement,
  Documents,
  ReviewAndSubmit,
  ApplicationSubmitted,
  loadVerifiedCustomer,
} from './steps'
import './hlForm.css'
import './HomeLoan.css'

export const HomeLoan: React.FC = () => {
  const customer = useMemo(loadVerifiedCustomer, [])

  const flow = useLoanStepFlow<HomeLoanData>({
    loanType: HOME_LOAN_TYPE,
    loanTitle: HOME_LOAN_TITLE,
    initialValues: INITIAL_HOME_LOAN_DATA,
    application: {
      serviceTitle: HOME_LOAN_TITLE,
      totalSteps: HOME_LOAN_FORM_STEP_COUNT,
      stepLabels: HOME_LOAN_STEPS.slice(0, HOME_LOAN_FORM_STEP_COUNT).map((s) => s.title ?? ''),
      resumeRoute: HOME_LOAN_RESUME_ROUTE,
    },
    validators: [
      homeLoanValidation.validateStep1,
      homeLoanValidation.validateStep2,
      homeLoanValidation.validateStep3,
      homeLoanValidation.validateStep4,
    ],
    buildSubmission: (data) => ({
      title: 'Home Loan Application',
      category: 'Capital & Financing',
      requestedAmount: toAmount(data.requestedLoanAmount || data.loanAmount),
      tenureMonths: 240,
      details: { ...data },
    }),
  })

  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp) {
    return (
      <div className="home-loan-page" data-testid="home-loan-page">
        <FlowStepper steps={HOME_LOAN_STEPS} currentStep={HOME_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={HOME_LOAN_TITLE}
          requestedAmount={formData.requestedLoanAmount || ''}
          submittedAt={submittedApp.createdAt}
          onTrackApplication={flow.handleTrackStatus}
        />
      </div>
    )
  }

  return (
    <div className="home-loan-page" data-testid="home-loan-page">
      <h1 className="home-loan-page__title">{HOME_LOAN_TITLE}</h1>

      <FlowStepper steps={HOME_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

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
        <HomeLoanRequirement
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

      <LoanStepFlowFooter
        flow={flow}
        {...HOME_LOAN_SUCCESS}
        testIdPrefix="home"
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue'}
        securityNote={
          flow.isLastStep ? (
            <div className="hl-submit-security" data-testid="hl-submit-security">
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

export default HomeLoan
