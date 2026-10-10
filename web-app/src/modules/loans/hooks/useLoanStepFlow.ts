import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviewEdit } from '@shared/edit'
import { useLoanApplication } from './useLoanApplication'
import type { UseLoanApplicationOptions } from './useLoanApplication'
import { loanApplicationService } from '@modules/loans/services/loanApplicationService'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import type { LoanApplicationBase } from '@modules/loans/types/loanApplication.types'
import type { LoanStepValidator } from '@modules/loans/validation/commonLoanValidation'
import { routePaths } from '@core/config'

export interface LoanSubmissionPayload {
  title: string
  category: string
  requestedAmount: number
  tenureMonths: number
  details: Record<string, unknown>
}

export interface UseLoanStepFlowConfig<T extends object> {
  loanType: string
  initialValues: T
  /** Draft metadata; `totalSteps` drives when "Continue" becomes "Submit" */
  application: UseLoanApplicationOptions & { totalSteps: number }
  /** One validator per step, in step order */
  validators: LoanStepValidator<T>[]
  /** Builds the submission body; when omitted the raw form data is submitted */
  buildSubmission?: (data: T) => LoanSubmissionPayload
  /** Extra error keys to clear when a field changes, e.g. { hasUdyam: ['udyamRegistrationNumber'] } */
  relatedErrorKeys?: Record<string, string[]>
  /** What "Back" does on step 1: leave the flow (default) or open the save-draft dialog */
  firstStepBack?: 'exit' | 'draft'
  /** Display name passed to the status page */
  loanTitle: string
  exitRoute?: string
}

const DEFAULT_STEP_ERROR = 'Please fill in all required fields.'

/**
 * Shared step-flow logic for every loan application: field updates with error clearing,
 * per-step validation, step navigation, submission and the post-submit actions.
 */
export function useLoanStepFlow<T extends object>(config: UseLoanStepFlowConfig<T>) {
  const {
    loanType,
    initialValues,
    application,
    validators,
    buildSubmission,
    relatedErrorKeys,
    firstStepBack = 'exit',
    loanTitle,
    exitRoute = routePaths.loans,
  } = config

  const navigate = useNavigate()
  const loan = useLoanApplication<T>(loanType, initialValues, application)
  const { formData, updateFormData, currentStep, goToStep, nextStep, prevStep, setIsSubmitting, markSubmitted } = loan

  const [stepError, setStepError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submittedApp, setSubmittedApp] = useState<LoanApplicationBase | null>(null)

  const totalSteps = application.totalSteps
  const isLastStep = currentStep === totalSteps

  const clearErrors = useCallback(() => {
    setStepError(null)
    setFieldErrors({})
  }, [])

  // "Edit" from the review (last step): the step shows "Update & Review" and returns to the review
  const goToReview = useCallback(() => {
    clearErrors()
    goToStep(totalSteps)
  }, [clearErrors, goToStep, totalSteps])
  const reviewEdit = useReviewEdit(goToReview)

  const handleFieldChange = useCallback(
    (fields: Partial<T>) => {
      updateFormData(fields)
      const changedKeys = Object.keys(fields)
      const uploaded = (fields as { uploadedDocs?: Record<string, unknown> }).uploadedDocs
      const keysToClear = [
        ...changedKeys,
        ...(uploaded ? Object.keys(uploaded) : []),
        ...changedKeys.flatMap((key) => relatedErrorKeys?.[key] ?? []),
      ]
      setFieldErrors((prev) => {
        if (!keysToClear.some((key) => key in prev)) return prev
        const next = { ...prev }
        keysToClear.forEach((key) => delete next[key])
        return next
      })
      setStepError(null)
    },
    [updateFormData, relatedErrorKeys]
  )

  const validateCurrentStep = useCallback((): boolean => {
    const validate = validators[currentStep - 1]
    const result = validate ? validate(formData) : { isValid: true, errors: {} }
    if (result.isValid) {
      clearErrors()
      return true
    }
    setFieldErrors(result.errors)
    setStepError(result.error || DEFAULT_STEP_ERROR)
    return false
  }, [validators, currentStep, formData, clearErrors])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const body = buildSubmission ? { loanType, ...buildSubmission(formData) } : formData
      const app = await loanApplicationService.submitApplication(loanType, body)
      markSubmitted()
      setSubmittedApp(app)
    } catch (err: unknown) {
      setStepError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [setIsSubmitting, buildSubmission, loanType, formData, markSubmitted])

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return
    if (isLastStep) {
      await submit()
    } else if (reviewEdit.isEditMode) {
      reviewEdit.finishEdit()
    } else {
      nextStep()
    }
  }, [validateCurrentStep, isLastStep, submit, reviewEdit, nextStep])

  const handleBack = useCallback(() => {
    if (reviewEdit.isEditMode && !isLastStep) {
      reviewEdit.finishEdit()
    } else if (currentStep > 1) {
      clearErrors()
      prevStep()
    } else if (firstStepBack === 'draft') {
      loan.setIsDraftModalOpen(true)
    } else {
      safeNavigateTo(navigate, exitRoute)
    }
  }, [reviewEdit, isLastStep, currentStep, clearErrors, prevStep, firstStepBack, loan, navigate, exitRoute])

  /** Stepper clicks: going back is always allowed, going forward only one step after validation */
  const handleStepClick = useCallback(
    (targetStep: number) => {
      // Picking a step on the stepper is ordinary navigation, not an edit from the review
      reviewEdit.cancelEdit()
      if (targetStep < currentStep) {
        clearErrors()
        goToStep(targetStep)
      } else if (targetStep === currentStep + 1 && validateCurrentStep()) {
        goToStep(targetStep)
      }
    },
    [reviewEdit, currentStep, clearErrors, goToStep, validateCurrentStep]
  )

  /** "Edit" on the review page: opens the step in edit mode ("Update & Review" returns here) */
  const navigateToStep = useCallback(
    (targetStep: number) => {
      clearErrors()
      reviewEdit.startEdit(() => goToStep(targetStep))
    },
    [clearErrors, reviewEdit, goToStep]
  )

  const referenceNumber = submittedApp?.referenceNumber || submittedApp?.refNumber || submittedApp?.id || ''

  const handleSuccessDone = useCallback(() => {
    safeNavigateTo(navigate, exitRoute)
  }, [navigate, exitRoute])

  const handleTrackStatus = useCallback(() => {
    navigate(routePaths.loansStatus(referenceNumber), {
      state: { application: submittedApp, formData, refNumber: referenceNumber, loanTitle },
    })
  }, [navigate, referenceNumber, submittedApp, formData, loanTitle])

  return {
    ...loan,
    totalSteps,
    isLastStep,
    stepError,
    fieldErrors,
    handleFieldChange,
    handleNext,
    handleBack,
    handleStepClick,
    navigateToStep,
    /** True on a step opened with "Edit" from the review */
    isEditMode: reviewEdit.isEditMode && !isLastStep,
    submittedApp,
    referenceNumber,
    handleSuccessDone,
    handleTrackStatus,
  }
}

export type LoanStepFlow<T extends object> = ReturnType<typeof useLoanStepFlow<T>>

export default useLoanStepFlow
