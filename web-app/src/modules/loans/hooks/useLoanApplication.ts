import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { localStore } from '@core/storage/localStorage'
import { userStorage } from '@core/storage/userStorage'
import { useDraftBlocker } from '@shared/hooks'
import { useAppStore, useAuthStore } from '@store/index'
import { loanApplicationService, loanStorageKey } from '@modules/loans/services/loanApplicationService'

export interface UseLoanApplicationOptions {
  serviceTitle?: string
  totalSteps?: number
  stepLabels?: string[]
  resumeRoute?: string
}

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

export function useLoanApplication<T extends object>(
  loanType: string,
  initialValues: T,
  options?: UseLoanApplicationOptions
) {
  const pushToast = useAppStore((state) => state.pushToast)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const stepStorageKey = loanStorageKey(`step_${loanType}`)

  // Redirect to marketplace to complete registration if profile is incomplete
  useEffect(() => {
    if (user && user.isProfileComplete === false) {
      navigate('/loans', {
        replace: true,
        state: { openProfileModal: true, returnTo: window.location.pathname },
      })
    }
  }, [user, navigate])

  const [formData, setFormData] = useState<T>(() => {
    // 1. Check userStorage central draft first
    const centralDraft = userStorage.getDraft(loanType)
    if (centralDraft && centralDraft.formData) {
      return withoutUnsavedFiles({ ...initialValues, ...(centralDraft.formData as T) })
    }

    // 2. Fallback to loan application service storage
    const saved = loanApplicationService.getDraft<T>(loanType)
    return saved ? withoutUnsavedFiles({ ...initialValues, ...saved }) : initialValues
  })

  const [currentStep, setCurrentStepState] = useState<number>(() => {
    const savedStep = localStore.get<number>(stepStorageKey) ?? localStore.get<number>(`taxedge_loan_step_${loanType}`)
    if (typeof savedStep === 'number' && savedStep > 1) {
      return savedStep
    }
    const centralDraft = userStorage.getDraft(loanType)
    if (centralDraft && typeof centralDraft.currentStep === 'number' && centralDraft.currentStep > 1) {
      return centralDraft.currentStep
    }
    return 1
  })

  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [isManualDraftModalOpen, setIsManualDraftModalOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const setCurrentStep = useCallback(
    (step: number | ((prev: number) => number)) => {
      setCurrentStepState((prev) => {
        const next = typeof step === 'function' ? step(prev) : step
        if (next > 1) {
          localStore.set(stepStorageKey, next)
        }
        return next
      })
    },
    [stepStorageKey]
  )

  const updateFormData = useCallback(
    (fields: Partial<T>) => {
      setIsDirty(true)
      setFormData((prev) => {
        const updated = { ...prev, ...fields }
        loanApplicationService.saveDraft(loanType, updated)
        return updated
      })
    },
    [loanType]
  )

  const goToStep = useCallback(
    (stepNumber: number) => {
      setCurrentStep(stepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setCurrentStep]
  )

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setCurrentStep])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setCurrentStep])

  // Automatically sync step position to storage only when user is beyond step 1 and not submitted
  useEffect(() => {
    if (!isSubmitted && currentStep > 1) {
      localStore.set(stepStorageKey, currentStep)
    }
  }, [stepStorageKey, currentStep, isSubmitted])

  const saveDraft = useCallback(() => {
    // 1. Save local service draft
    loanApplicationService.saveDraft(loanType, formData)

    // 2. Save central dashboard draft into userStorage
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    const totalSteps = options?.totalSteps || 4
    const stepLabel = options?.stepLabels?.[currentStep - 1] || `Step ${currentStep} of ${totalSteps}`
    const serviceTitle = options?.serviceTitle || 'Loan Application'
    const resumeRoute =
      options?.resumeRoute ||
      (loanType === 'vehicle_loan'
        ? '/loans/vehicle-loan'
        : loanType === 'working_capital_loan'
        ? '/loans/working-capital-loan'
        : loanType === 'machinery_loan'
        ? '/loans/machinery-loan'
        : '/loans/home-loan')

    userStorage.saveDraft({
      serviceId: loanType,
      serviceTitle,
      currentStep,
      totalSteps,
      stepLabel,
      formData: formData as Record<string, unknown>,
      savedAt: timeStr,
      savedTimestamp: Date.now(),
      resumeRoute,
    })

    localStore.set(stepStorageKey, currentStep)
    setIsManualDraftModalOpen(false)
    setIsDirty(false)
    pushToast(`${serviceTitle} draft saved successfully`, 'success')
  }, [loanType, formData, currentStep, options, pushToast, stepStorageKey])

  const discardDraft = useCallback(() => {
    loanApplicationService.clearDraft(loanType)
    userStorage.deleteDraft(loanType)
    localStore.remove(stepStorageKey)
    localStore.remove(`taxedge_loan_step_${loanType}`)
    setFormData(initialValues)
    setIsDirty(false)
    setCurrentStepState(1)
    setIsManualDraftModalOpen(false)
    pushToast('Draft discarded', 'info')
  }, [loanType, initialValues, pushToast, stepStorageKey])

  const markSubmitted = useCallback(() => {
    setIsSubmitted(true)
    setIsDirty(false)
    loanApplicationService.clearDraft(loanType)
    userStorage.deleteDraft(loanType)
    localStore.remove(stepStorageKey)
    localStore.remove(`taxedge_loan_step_${loanType}`)
    setCurrentStepState(1)
  }, [loanType, stepStorageKey])

  // Block route navigation only if unsubmitted, not in submitting state,
  // and the user has actively entered data or moved past step 1.
  const hasEnteredData = isDirty || currentStep > 1 || hasUserEnteredData(formData, initialValues)
  const shouldBlock = !isSubmitted && !isSubmitting && hasEnteredData

  // Set once the user picks "Save & Exit" or "Discard & Exit", so the exit navigation itself isn't blocked again
  const isExitingRef = useRef(false)

  const draftBlocker = useDraftBlocker({
    shouldBlock,
    onSaveDraft: () => {
      saveDraft()
    },
    onDiscardDraft: () => {
      discardDraft()
    },
    defaultExitRoute: '/loans',
    isNavigationAllowed: (nextLocation) =>
      isExitingRef.current || isSubmitted || nextLocation.pathname.includes('/loans/status'),
  })

  const isDraftModalOpen = isManualDraftModalOpen || draftBlocker.isModalOpen

  // The blocker calls onSaveDraft / onDiscardDraft itself, so they must not be called here as well
  const handleSaveAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualDraftModalOpen(false)
    draftBlocker.handleSaveAndExit()
  }, [draftBlocker])

  const handleDiscardAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualDraftModalOpen(false)
    draftBlocker.handleDiscardAndExit()
  }, [draftBlocker])

  const handleKeepEditing = useCallback(() => {
    setIsManualDraftModalOpen(false)
    draftBlocker.handleKeepEditing()
  }, [draftBlocker])

  return {
    formData,
    setFormData,
    updateFormData,
    currentStep,
    setCurrentStep,
    goToStep,
    nextStep,
    prevStep,
    isDraftModalOpen,
    setIsDraftModalOpen: setIsManualDraftModalOpen,
    isSubmitting,
    setIsSubmitting,
    isSubmitted,
    setIsSubmitted,
    markSubmitted,
    saveDraft,
    discardDraft,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  }
}

export default useLoanApplication


