import React, { useMemo } from 'react'
import { FlowStepper } from '@shared/components'
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
  LoanDetails,
  BusinessDetails,
  Banking,
  DocumentsAndReview,
} from './steps'
import './machForm.css'
import './MachineryLoan.css'

export const MachineryLoan: React.FC = () => {
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
      machineryLoanValidation.validateStep5,
    ],
    buildSubmission: (data) => ({
      title: 'Machinery Loan Application',
      category: 'Capital & Financing',
      requestedAmount: toAmount(data.loanAmount),
      tenureMonths: toAmount(data.repaymentTenure),
      details: { ...data },
    }),
  })
  const { formData, currentStep, fieldErrors, handleFieldChange } = flow

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
        <div className="machinery-loan-page__card">
          <LoanDetails data={formData} onChange={handleFieldChange} errors={fieldErrors} />
        </div>
      )}

      {currentStep === 3 && (
        <div className="machinery-loan-page__card">
          <BusinessDetails data={formData} onChange={handleFieldChange} errors={fieldErrors} />
        </div>
      )}

      {currentStep === 4 && (
        <div className="machinery-loan-page__card">
          <Banking data={formData} onChange={handleFieldChange} errors={fieldErrors} />
        </div>
      )}

      {currentStep === 5 && (
        <div className="machinery-loan-page__card">
          <DocumentsAndReview
            data={formData}
            onChange={handleFieldChange}
            onNavigateToStep={flow.navigateToStep}
            errors={fieldErrors}
          />
        </div>
      )}

      <LoanStepFlowFooter
        flow={flow}
        serviceTitle="Machinery Loan Application"
        successTitle="Machinery Loan Submitted"
        successMessage="Your Machinery Loan application has been successfully received. A TaxEdge Loan Advisor will review your equipment quotation and financial records and contact you shortly."
      />
    </div>
  )
}

export default MachineryLoan
