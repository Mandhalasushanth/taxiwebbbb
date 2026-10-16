import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { routePaths } from '@core/config'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import type { MachineryLoanData } from '@modules/loans/types/machineryLoan.types'
import { machineryLoanValidation } from '@modules/loans/validation/machineryLoanValidation'
import {
  MACHINERY_LOAN_TITLE,
  MACHINERY_LOAN_TYPE,
  MACHINERY_LOAN_STEPS,
  MACHINERY_LOAN_FORM_STEP_COUNT,
  MACHINERY_LOAN_RESUME_ROUTE,
  INITIAL_MACHINERY_LOAN_DATA,
} from './machineryLoan.constants'

import {
  KycVerification,
  loadVerifiedCustomer,
  MachineryAndLoanDetails,
  Documents,
  ReviewAndDeclaration,
  ApplicationSubmitted,
} from './steps'
import './machForm.css'
import './MachineryLoan.css'

export const MachineryLoan: React.FC = () => {
  const navigate = useNavigate()
  const customer = useMemo(loadVerifiedCustomer, [])

  const flow = useLoanStepFlow<MachineryLoanData>({
    loanType: MACHINERY_LOAN_TYPE,
    loanTitle: MACHINERY_LOAN_TITLE,
    initialValues: INITIAL_MACHINERY_LOAN_DATA,
    application: {
      serviceTitle: MACHINERY_LOAN_TITLE,
      totalSteps: MACHINERY_LOAN_FORM_STEP_COUNT,
      stepLabels: MACHINERY_LOAN_STEPS.slice(0, MACHINERY_LOAN_FORM_STEP_COUNT).map((s) => s.title ?? ''),
      resumeRoute: MACHINERY_LOAN_RESUME_ROUTE,
    },
    validators: [
      machineryLoanValidation.validateStep1,
      machineryLoanValidation.validateStep2,
      machineryLoanValidation.validateStep3,
      machineryLoanValidation.validateStep4,
    ],
    buildSubmission: (data) => ({
      title: 'Machinery Loan Application',
      category: 'Capital & Financing',
      requestedAmount: toAmount(data.requestedLoanAmount || data.loanAmount),
      tenureMonths: toAmount(data.repaymentTenure) || 36,
      details: { ...data },
    }),
  })
  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp || currentStep > MACHINERY_LOAN_FORM_STEP_COUNT) {
    return (
      <div className="machinery-loan-page" data-testid="machinery-loan-page">
        <FlowStepper steps={MACHINERY_LOAN_STEPS} currentStep={MACHINERY_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={MACHINERY_LOAN_TITLE}
          requestedAmount={formData.requestedLoanAmount || String(formData.loanAmount || '')}
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
    <div className="machinery-loan-page" data-testid="machinery-loan-page">
      <h1 className="machinery-loan-page__title">{MACHINERY_LOAN_TITLE}</h1>

      <FlowStepper steps={MACHINERY_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

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
        <MachineryAndLoanDetails
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
        <ReviewAndDeclaration
          data={formData}
          customer={customer}
          onChange={handleFieldChange}
          onNavigateToStep={flow.navigateToStep}
          errors={fieldErrors}
        />
      )}

      <LoanStepFlowFooter
        flow={flow}
        serviceTitle="Machinery Loan Application"
        successTitle="Machinery Loan Submitted"
        successMessage="Your Machinery Loan application has been successfully received. A TaxEdge Loan Advisor will review your equipment quotation and financial records and contact you shortly."
        testIdPrefix="machinery"
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue →'}
        securityNote={
          flow.isLastStep ? (
            <div className="mach-submit-security" data-testid="mach-submit-security">
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

export default MachineryLoan
