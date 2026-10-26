import React, { useMemo } from 'react'
import { FlowStepper } from '@shared/components'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { businessWorkingCapitalValidation as v } from '@modules/loans/validation/businessWorkingCapitalValidation'
import type { BusinessWorkingCapitalFormData } from '@modules/loans/types/businessWorkingCapital.types'
import {
  BWC_FORM_STEP_COUNT,
  BWC_LOAN_TYPE,
  BWC_RESUME_ROUTE,
  BWC_STEPS,
  BWC_SUCCESS,
  BWC_TITLE,
  BWC_RELATED_ERROR_KEYS,
  INITIAL_BWC_DATA,
} from './businessWorkingCapital.constants'
import {
  KycVerification,
  BusinessProfile,
  Documents,
  ReviewAndSubmit,
  ApplicationSubmitted,
} from './steps'
import { FACILITY_OPTIONS } from './steps/BusinessProfile/businessProfile.constants'
import { loadVerifiedCustomer } from './steps/KycVerification/loadVerifiedCustomer'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import './bwcForm.css'
import './BusinessWorkingCapital.css'

/**
 * Business & Working Capital Loans: one unified flow replacing the separate Business Loan
 * and Working Capital Loan forms. Draft, stepper, edit-from-review and submit
 * come from the shared loan step flow.
 */
export const BusinessWorkingCapital: React.FC = () => {
  const customer = useMemo(() => loadVerifiedCustomer(), [])
  const flow = useLoanStepFlow<BusinessWorkingCapitalFormData>({
    loanType: BWC_LOAN_TYPE,
    loanTitle: BWC_TITLE,
    initialValues: INITIAL_BWC_DATA,
    application: {
      serviceTitle: BWC_TITLE,
      totalSteps: BWC_FORM_STEP_COUNT,
      stepLabels: BWC_STEPS.slice(0, BWC_FORM_STEP_COUNT).map((step) => step.title ?? ''),
      resumeRoute: BWC_RESUME_ROUTE,
    },
    validators: [v.validateStep1, v.validateStep2, v.validateStep3, v.validateStep4],
    relatedErrorKeys: BWC_RELATED_ERROR_KEYS,
    buildSubmission: (data) => ({
      title: 'Business & Working Capital Loan Application',
      category: 'Capital & Financing',
      requestedAmount: toAmount(data.loanAmount),
      tenureMonths: 36,
      details: { ...data },
    }),
  })
  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp) {
    return (
      <div className="bwc-page" data-testid="business-working-capital-page">
        <FlowStepper steps={BWC_STEPS} currentStep={BWC_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={FACILITY_OPTIONS.find((f) => f.value === formData.financingFacility)?.title ?? BWC_TITLE}
          requestedAmount={formData.loanAmount}
          submittedAt={submittedApp.createdAt}
          onTrackApplication={flow.handleTrackStatus}
        />
      </div>
    )
  }

  return (
    <div className="bwc-page" data-testid="business-working-capital-page">
      <h1 className="bwc-page__title">{BWC_TITLE}</h1>

      <FlowStepper steps={BWC_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

      <LoanStepErrorBanner message={flow.stepError} />

      {currentStep === 1 && (
        <KycVerification data={formData} customer={customer} onChange={handleFieldChange} errors={fieldErrors} />
      )}
      {currentStep === 2 && <BusinessProfile data={formData} onChange={handleFieldChange} errors={fieldErrors} />}
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
        {...BWC_SUCCESS}
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        successModal={<></>}
      />
    </div>
  )
}

export default BusinessWorkingCapital

