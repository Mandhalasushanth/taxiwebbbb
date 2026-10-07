import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { localStore } from '@core/storage/localStorage'
import { useServiceDraft, readServiceDraft } from '@shared/hooks'
import { useAuthStore } from '@store/index'
import { loanApplicationService, loanStorageKey } from '@modules/loans/services/loanApplicationService'

export interface UseLoanApplicationOptions {
  serviceTitle?: string
  totalSteps?: number
  stepLabels?: string[]
  resumeRoute?: string
}

/** Auto-save storage namespace for loan drafts (taxedge_loan_draft_<user>_<loanType>) */
const LOAN_DRAFT_NAMESPACE = 'loan'
const LOANS_ROUTE = '/loans'
const DEFAULT_TOTAL_STEPS = 4

/** Resume routes for loans that do not pass one (kept for drafts listed before resumeRoute existed) */
const DEFAULT_RESUME_ROUTES: Record<string, string> = {
  vehicle_loan: '/loans/vehicle-loan',
  working_capital_loan: '/loans/working-capital-loan',
  machinery_loan: '/loans/machinery-loan',
}
const FALLBACK_RESUME_ROUTE = '/loans/home-loan'

export function hasUserEnteredData<T extends object>(formData: T, initialValues: T): boolean {
  if (!formData || !initialValues) return false

  return Object.keys(formData).some((k) => {
    const key = k as keyof T
    const curr = formData[key]
    const init = initialValues[key]

    if (curr === init) return false

    // Check uploaded documents map
    if (key === 'uploadedDocs' && typeof curr === 'object' && curr !== null) {
      return Object.keys(curr).length > 0
    }

    // Check arrays
    if (Array.isArray(curr)) {
      if (!Array.isArray(init)) return curr.length > 0
      return JSON.stringify(curr) !== JSON.stringify(init)
    }

    // Check generic objects
    if (typeof curr === 'object' && curr !== null) {
      return JSON.stringify(curr) !== JSON.stringify(init)
    }

    // Check strings
    if (typeof curr === 'string') {
      const initStr = typeof init === 'string' ? init : ''
      if (!initStr) {
        return curr.trim().length > 0
      }
      return curr.trim() !== initStr.trim()
    }

    // Booleans or numbers
    return curr !== init
  })
}

/**
 * Uploaded files cannot be written to browser storage, so a restored draft only
 * has their names. Drop those entries so the user re-uploads instead of seeing
 * documents that look uploaded but have no file behind them.
 */
function withoutUnsavedFiles<T extends object>(data: T): T {
  const docs = (data as { uploadedDocs?: Record<string, unknown> }).uploadedDocs
  if (!docs || typeof docs !== 'object') return data
  const kept = Object.fromEntries(
    Object.entries(docs).filter(
      ([, doc]) =>
        doc instanceof File ||
        (doc as { file?: unknown })?.file instanceof File ||
        Boolean((doc as { fileName?: string })?.fileName) ||
        Boolean((doc as { name?: string })?.name)
    )
  )
  return { ...data, uploadedDocs: kept }
}

/** Storage keys used before loans moved to the shared draft (read once, then cleared) */
const legacyStepKeys = (loanType: string): string[] => [
  loanStorageKey(`step_${loanType}`),
  `taxedge_loan_step_${loanType}`,
]

const readLegacyStep = (loanType: string): number | null =>
  legacyStepKeys(loanType).reduce<number | null>(
    (found, key) => found ?? localStore.get<number>(key),
    null,
  )

const clearLegacyDraft = (loanType: string): void => {
  loanApplicationService.clearDraft(loanType)
  legacyStepKeys(loanType).forEach((key) => localStore.remove(key))
}

export function useLoanApplication<T extends object>(
  loanType: string,
  initialValues: T,
  options?: UseLoanApplicationOptions
) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  // Redirect to marketplace to complete registration if profile is incomplete
  useEffect(() => {
    if (user && user.isProfileComplete === false) {
      navigate(LOANS_ROUTE, {
        replace: true,
        state: { openProfileModal: true, returnTo: window.location.pathname },
      })
    }
  }, [user, navigate])

  // Resume: the shared draft first, then a draft saved by the earlier loan storage
  const [savedDraft] = useState(() => readServiceDraft<T>(loanType, LOAN_DRAFT_NAMESPACE))

  const [formData, setFormData] = useState<T>(() => {
    const restored = savedDraft?.formData ?? loanApplicationService.getDraft<T>(loanType)
    return restored ? withoutUnsavedFiles({ ...initialValues, ...restored }) : initialValues
  })

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const step = savedDraft?.currentStep ?? readLegacyStep(loanType)
    return typeof step === 'number' && step > 1 ? step : 1
  })

  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const updateFormData = useCallback((fields: Partial<T>) => {
    setIsDirty(true)
    setFormData((prev) => ({ ...prev, ...fields }))
  }, [])

  const goToStep = useCallback((stepNumber: number) => {
    setCurrentStep(stepNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const totalSteps = options?.totalSteps || DEFAULT_TOTAL_STEPS
  // Ask to save only once the user has entered data or moved past step 1
  const hasEnteredData = isDirty || currentStep > 1 || hasUserEnteredData(formData, initialValues)

  // Same draft behaviour as GST, ITR and Incorporation (shared useServiceDraft)
  const draft = useServiceDraft<T>({
    serviceId: loanType,
    serviceTitle: options?.serviceTitle || 'Loan Application',
    totalSteps,
    currentStep,
    stepLabel: options?.stepLabels?.[currentStep - 1] || `Step ${currentStep} of ${totalSteps}`,
    resumeRoute: options?.resumeRoute || DEFAULT_RESUME_ROUTES[loanType] || FALLBACK_RESUME_ROUTE,
    exitRoute: LOANS_ROUTE,
    formData,
    hasEnteredData,
    isComplete: isSubmitted || isSubmitting,
    // The status page after submitting belongs to the flow
    isFlowRoute: (pathname) => pathname.includes('/loans/status'),
    storageNamespace: LOAN_DRAFT_NAMESPACE,
    onDiscard: () => {
      clearLegacyDraft(loanType)
      setFormData(initialValues)
      setIsDirty(false)
      setCurrentStep(1)
    },
  })

  const { clearDraft } = draft
  const markSubmitted = useCallback(() => {
    setIsSubmitted(true)
    setIsDirty(false)
    clearDraft()
    clearLegacyDraft(loanType)
    setCurrentStep(1)
  }, [clearDraft, loanType])

  const { openDraftModal } = draft
  /** Opens the save / discard / keep-editing dialog (closing goes through its buttons) */
  const setIsDraftModalOpen = useCallback(
    (open: boolean) => {
      if (open) openDraftModal()
    },
    [openDraftModal],
  )

  return {
    formData,
    setFormData,
    updateFormData,
    currentStep,
    setCurrentStep,
    goToStep,
    nextStep,
    prevStep,
    isDraftModalOpen: draft.isDraftModalOpen,
    setIsDraftModalOpen,
    isSubmitting,
    setIsSubmitting,
    isSubmitted,
    setIsSubmitted,
    markSubmitted,
    saveDraft: draft.saveDraft,
    discardDraft: draft.handleDiscardAndExit,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
  }
}

export default useLoanApplication
