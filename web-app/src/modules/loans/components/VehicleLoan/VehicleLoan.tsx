import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { FlowStepper } from '@shared/components'
import { routePaths } from '@core/config'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import { LoanStepErrorBanner, LoanStepFlowFooter } from '@modules/loans/shared'
import { useLoanStepFlow } from '@modules/loans/hooks/useLoanStepFlow'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import type { VehicleLoanData } from '@modules/loans/types/vehicleLoan.types'
import { vehicleLoanValidation } from '@modules/loans/validation/vehicleLoanValidation'
import {
  VEHICLE_LOAN_TITLE,
  VEHICLE_LOAN_TYPE,
  VEHICLE_LOAN_RESUME_ROUTE,
  VEHICLE_LOAN_STEPS,
  VEHICLE_LOAN_FORM_STEP_COUNT,
  INITIAL_VEHICLE_LOAN_DATA,
} from './vehicleLoan.constants'

import {
  KycVerification,
  loadVerifiedCustomer,
  VehicleAndLoanDetails,
  Documents,
  ReviewAndDeclaration,
  ApplicationSubmitted,
} from './steps'
import './vehForm.css'
import './VehicleLoan.css'

/** "3 Years" → 36, "18 Months" → 18 */
const toTenureMonths = (tenure?: string): number => {
  const value = Number(String(tenure || '').match(/\d+/)?.[0]) || 0
  return /year|yr/i.test(String(tenure || '')) ? value * 12 : value
}

export const VehicleLoan: React.FC = () => {
  const navigate = useNavigate()
  const customer = useMemo(() => loadVerifiedCustomer(), [])

  const flow = useLoanStepFlow<VehicleLoanData>({
    loanType: VEHICLE_LOAN_TYPE,
    loanTitle: VEHICLE_LOAN_TITLE,
    initialValues: INITIAL_VEHICLE_LOAN_DATA,
    application: {
      serviceTitle: VEHICLE_LOAN_TITLE,
      totalSteps: VEHICLE_LOAN_FORM_STEP_COUNT,
      stepLabels: VEHICLE_LOAN_STEPS.slice(0, VEHICLE_LOAN_FORM_STEP_COUNT).map((s) => s.title ?? ''),
      resumeRoute: VEHICLE_LOAN_RESUME_ROUTE,
    },
    validators: [
      vehicleLoanValidation.validateStep1,
      vehicleLoanValidation.validateStep2,
      vehicleLoanValidation.validateStep3,
      vehicleLoanValidation.validateStep4,
    ],
    buildSubmission: (data) => ({
      title: 'Vehicle Loan Application',
      category: 'Vehicle & Auto Finance',
      requestedAmount: toAmount(data.requestedLoanAmount || data.loanAmount),
      tenureMonths: toTenureMonths(data.repaymentTenure || '36 Months'),
      details: { ...data },
    }),
  })

  const { formData, currentStep, fieldErrors, handleFieldChange, submittedApp } = flow

  if (submittedApp || currentStep > VEHICLE_LOAN_FORM_STEP_COUNT) {
    return (
      <div className="vehicle-loan-page" data-testid="vehicle-loan-page">
        <FlowStepper steps={VEHICLE_LOAN_STEPS} currentStep={VEHICLE_LOAN_STEPS.length} />
        <ApplicationSubmitted
          referenceNumber={flow.referenceNumber}
          applicationType={VEHICLE_LOAN_TITLE}
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
    <div className="vehicle-loan-page" data-testid="vehicle-loan-page">
      <h1 className="vehicle-loan-page__title">{VEHICLE_LOAN_TITLE}</h1>

      <FlowStepper steps={VEHICLE_LOAN_STEPS} currentStep={currentStep} onStepClick={flow.handleStepClick} />

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
        <VehicleAndLoanDetails data={formData} onChange={handleFieldChange} errors={fieldErrors} />
      )}

      {currentStep === 3 && (
        <Documents data={formData} onChange={handleFieldChange} errors={fieldErrors} />
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
        serviceTitle="Vehicle Loan Application"
        successTitle="Vehicle Loan Submitted"
        successMessage="Your Vehicle Loan application has been successfully received. A TaxEdge Loan Advisor will review your vehicle quotation and contact you shortly."
        testIdPrefix="vehicle"
        nextDisabled={flow.isLastStep && !formData.termsAccepted}
        nextLabel={flow.isLastStep ? 'Submit Application →' : 'Continue →'}
        securityNote={
          flow.isLastStep ? (
            <div className="veh-submit-security" data-testid="veh-submit-security">
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

export default VehicleLoan
