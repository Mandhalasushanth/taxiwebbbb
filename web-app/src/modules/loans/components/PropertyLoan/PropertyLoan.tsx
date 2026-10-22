import React, { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import type { PropertyLoanData } from '@modules/loans/types/propertyLoan.types'
import { propertyLoanValidation } from '@modules/loans/validation/propertyLoanValidation'
import {
  PROPERTY_LOAN_FORM_STEP_COUNT,
  PROPERTY_LOAN_RESUME_ROUTE,
  PROPERTY_LOAN_STEPS,
  PROPERTY_LOAN_SUCCESS,
  PROPERTY_LOAN_TITLE,
  PROPERTY_LOAN_TYPE,
  INITIAL_PROPERTY_LOAN_DATA,
} from './propertyLoan.constants'
import {
  ApplicationSubmitted,
  Documents,
  KycVerification,
  PropertyAndLoanDetails,
  ReviewAndSubmit,
  loadVerifiedCustomer,
} from './steps'
import './propForm.css'
import './PropertyLoan.css'

export const PropertyLoan: React.FC = () => {
  const customer = useMemo(() => loadVerifiedCustomer(), [])

  const flow = useLoanStepFlow<PropertyLoanData>({
    loanType: PROPERTY_LOAN_TYPE,
    loanTitle: PROPERTY_LOAN_TITLE,
    initialValues: INITIAL_PROPERTY_LOAN_DATA,
    application: {
      serviceTitle: PROPERTY_LOAN_TITLE,
      totalSteps: PROPERTY_LOAN_FORM_STEP_COUNT,
      stepLabels: PROPERTY_LOAN_STEPS.slice(0, PROPERTY_LOAN_FORM_STEP_COUNT).map((s) => s.title ?? ''),
      resumeRoute: PROPERTY_LOAN_RESUME_ROUTE,
    },
    validators: [
      propertyLoanValidation.validateStep1,
      propertyLoanValidation.validateStep2,
      propertyLoanValidation.validateStep3,
      propertyLoanValidation.validateStep4,
      propertyLoanValidation.validateStep5,
    ],
    buildSubmission: (data) => ({
      title: 'Property Loan Application',
      category: 'Mortgage & Secured Finance',
      requestedAmount: toAmount(data.requestedLoanAmount || data.requiredAmount),
      tenureMonths: 180,
      details: { ...data },
    }),
  })

  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp || currentStep === PROPERTY_LOAN_STEPS.length) {
    return (
      <div className="property-loan-page" data-testid="property-loan-page">
        <FlowStepper steps={PROPERTY_LOAN_STEPS} currentStep={PROPERTY_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={PROPERTY_LOAN_TITLE}
          requestedAmount={formData.requestedLoanAmount || formData.requiredAmount || ''}
          submittedAt={submittedApp?.createdAt}
          onTrackApplication={flow.handleTrackStatus}
        />
      </div>
    )
  }

  return (
    <div className="property-loan-page" data-testid="property-loan-page">
      <h1 className="property-loan-page__title">{PROPERTY_LOAN_TITLE}</h1>

      <FlowStepper steps={PROPERTY_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

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
        <PropertyAndLoanDetails
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
        {...PROPERTY_LOAN_SUCCESS}
        testIdPrefix="property"
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue'}
        securityNote={
          flow.isLastStep ? (
            <div className="prop-submit-security" data-testid="prop-submit-security">
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

export default PropertyLoan
