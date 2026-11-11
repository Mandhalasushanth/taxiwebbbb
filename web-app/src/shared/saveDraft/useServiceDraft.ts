import { useCallback, useEffect, useRef, useState } from 'react'
import type { Location } from 'react-router-dom'
import { authStorage } from '@core/auth'
import { localStore } from '@core/storage/localStorage'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import { useDraftBlocker } from './useDraftBlocker'
import { DRAFT_NAMESPACES } from './draftNamespaces'
import { getModuleDashboardRoute, getIsReviewEditNavigationActive, getIsReviewEditMode, setReviewEditMode } from '@shared/edit'

/**
 * Draft handling shared by every multi-step service (GST, ITR, Incorporation), matching the loans flows:
 * - every change is auto-saved silently (per user), so a reload never loses work
 * - "Save Draft & Exit" opens the save / discard / keep-editing dialog
 * - leaving the flow with unsaved work (links, browser Back) opens the same dialog
 * - an explicit save puts the draft on the dashboard so it can be resumed
 * - on Review pages: custom Save Draft confirmation ("Do you want to save your draft?"),
 *   browser back interception, Stay on Page behavior, and module-aware dashboard redirection
 * - the chosen exit is never blocked a second time, and a discarded draft is never written back
 */

export interface ServiceDraftSnapshot<T> {
  formData: T
  currentStep: number
}

/** Storage namespace of the silent auto-save, e.g. 'gst' → taxedge_gst_draft_<user>_<service> */
const DEFAULT_NAMESPACE = 'service'

const autosaveKey = (serviceId: string, namespace: string): string =>
  `taxedge_${namespace}_draft_${authStorage.getUser()?.id || 'guest'}_${serviceId}`

const savedAtText = (): string =>
  new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

/** Draft to resume: an explicitly saved draft first, then the auto-saved copy */
export const readServiceDraft = <T>(
  serviceId: string,
  namespace = DEFAULT_NAMESPACE,
): ServiceDraftSnapshot<T> | null => {
  try {
    const saved = userStorage.getDraft(serviceId)
    if (saved?.formData) return { formData: saved.formData as T, currentStep: saved.currentStep }
    return localStore.get<ServiceDraftSnapshot<T>>(autosaveKey(serviceId, namespace))
  } catch {
    return null
  }
}

/**
 * Removes a service's draft everywhere: the dashboard entry and the auto-saved copy in every
 * module namespace. Used where only the service id is known (e.g. "Discard" on a dashboard draft card).
 */
export const deleteServiceDraft = (serviceId: string): void => {
  userStorage.deleteDraft(serviceId)
  ;[DEFAULT_NAMESPACE, ...Object.values(DRAFT_NAMESPACES)].forEach((namespace) =>
    localStore.remove(autosaveKey(serviceId, namespace)),
  )
}

/** True when two plain form values differ (used to tell whether the user has typed anything) */
export const hasFormChanged = (current: unknown, initial: unknown): boolean =>
  JSON.stringify(current) !== JSON.stringify(initial)

export interface UseServiceDraftOptions<T> {
  serviceId: string
  serviceTitle: string
  totalSteps: number
  currentStep: number
  stepLabel: string
  resumeRoute: string
  /** Where "Save & Exit" / "Discard & Exit" go when the user did not pick a destination */
  exitRoute: string
  formData: T
  /** The user has typed, uploaded or moved past the first step */
  hasEnteredData: boolean
  /** Submitted / paid: nothing left to save and nothing to block */
  isComplete: boolean
  /** Routes that belong to this flow (moving between them never asks to save) */
  isFlowRoute?: (pathname: string) => boolean
  /** Runs after "Discard & Exit" removed the stored copies (e.g. reset the form) */
  onDiscard?: () => void
  /** Auto-save storage namespace; keep a service's existing value so earlier drafts still resume */
  storageNamespace?: string
  /** Explicit review step flag. If omitted, automatically true when currentStep === totalSteps */
  isReview?: boolean
  /** Whether the user is currently editing a section from Review */
  isEditMode?: boolean
  /** Module identifier ('gst' | 'itr' | 'loans' | 'incorporation') */
  module?: string
  /** Route to resume directly to Review if different from resumeRoute */
  reviewRoute?: string
}

export const useServiceDraft = <T>({
  serviceId,
  serviceTitle,
  totalSteps,
  currentStep,
  stepLabel,
  resumeRoute,
  exitRoute,
  formData,
  hasEnteredData,
  isComplete,
  isFlowRoute,
  onDiscard,
  storageNamespace = DEFAULT_NAMESPACE,
  isReview,
  isEditMode,
  module,
  reviewRoute,
}: UseServiceDraftOptions<T>) => {
  const pushToast = useAppStore((state) => state.pushToast)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  // Set once the user picks an exit, so that navigation is not blocked again
  const isExitingRef = useRef(false)
  // Set by "Discard & Exit": nothing may write the draft back while the page unmounts
  const isDiscardedRef = useRef(false)
  const storageKey = autosaveKey(serviceId, storageNamespace)

  const isEditing = Boolean(isEditMode || getIsReviewEditMode())
  const isReviewStep = Boolean(isReview ?? (totalSteps > 0 && currentStep === totalSteps))
  const isReviewOrEdit = Boolean(isReviewStep || isEditing)
  const moduleDashboard = getModuleDashboardRoute(module || exitRoute || serviceId)
  const effectiveExitRoute = isReviewOrEdit ? moduleDashboard : exitRoute

  // Silent auto-save of every change (storage write only, no state update)
  useEffect(() => {
    if (isComplete || !hasEnteredData || isDiscardedRef.current) return
    localStore.set<ServiceDraftSnapshot<T>>(storageKey, { formData, currentStep })
  }, [storageKey, formData, currentStep, hasEnteredData, isComplete])

  const saveDraft = useCallback(() => {
    if (isDiscardedRef.current || isComplete) return
    localStore.set<ServiceDraftSnapshot<T>>(storageKey, { formData, currentStep })
    userStorage.saveDraft({
      serviceId,
      serviceTitle,
      currentStep: isReviewOrEdit ? totalSteps : currentStep,
      totalSteps,
      stepLabel: isReviewOrEdit ? 'Review' : stepLabel,
      formData: formData as Record<string, unknown>,
      savedAt: savedAtText(),
      savedTimestamp: Date.now(),
      resumeRoute: (isReviewOrEdit && reviewRoute) ? reviewRoute : resumeRoute,
    })
  }, [storageKey, isComplete, serviceId, serviceTitle, currentStep, totalSteps, stepLabel, formData, resumeRoute, reviewRoute, isReviewOrEdit])

  /** Removes both the saved and the auto-saved draft (after submit or discard) */
  const clearDraft = useCallback(() => {
    userStorage.deleteDraft(serviceId)
    localStore.remove(storageKey)
  }, [serviceId, storageKey])

  /** Purges every stored copy and blocks any later auto-save / unload save, so reopening starts empty */
  const discardDraft = useCallback(() => {
    isDiscardedRef.current = true
    clearDraft()
    onDiscard?.()
    pushToast('Draft discarded', 'info')
  }, [clearDraft, onDiscard, pushToast])

  const isNavigationAllowed = useCallback(
    (nextLocation: Location) => {
      if (isExitingRef.current || getIsReviewEditNavigationActive()) return true
      if (isFlowRoute?.(nextLocation.pathname)) return true
      const resumePrefix = resumeRoute ? resumeRoute.split('?')[0].replace(/\/$/, '') : ''
      if (resumePrefix && nextLocation.pathname.startsWith(resumePrefix)) return true
      return false
    },
    [isFlowRoute, resumeRoute],
  )

  const blocker = useDraftBlocker({
    shouldBlock: !isComplete && hasEnteredData,
    onSaveDraft: saveDraft,
    onDiscardDraft: discardDraft,
    defaultExitRoute: effectiveExitRoute,
    isNavigationAllowed,
    isReview: isReviewStep,
    module,
  })

  // The blocker saves / discards and navigates itself, so nothing is called twice here
  const handleSaveAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualModalOpen(false)
    setReviewEditMode(false)
    blocker.handleSaveAndExit()
  }, [blocker])

  const handleDiscardAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualModalOpen(false)
    setReviewEditMode(false)
    blocker.handleDiscardAndExit()
  }, [blocker])

  const handleKeepEditing = useCallback(() => {
    setIsManualModalOpen(false)
    blocker.handleKeepEditing()
  }, [blocker])

  const openDraftModal = useCallback(() => setIsManualModalOpen(true), [])

  return {
    isDraftModalOpen: isManualModalOpen || blocker.isModalOpen,
    isReviewPrompt: blocker.isReviewPrompt,
    isSaving: blocker.isSaving,
    openDraftModal,
    saveDraft,
    clearDraft,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  }
}

export type ServiceDraft = ReturnType<typeof useServiceDraft>
