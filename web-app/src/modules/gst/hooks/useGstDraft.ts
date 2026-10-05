import { useCallback, useEffect, useRef, useState } from 'react'
import type { Location } from 'react-router-dom'
import { authStorage } from '@core/auth'
import { localStore } from '@core/storage/localStorage'
import { userStorage } from '@core/storage/userStorage'
import { useDraftBlocker } from '@shared/hooks'
import { useAppStore } from '@store/index'

/**
 * Draft handling shared by every GST flow, matching the loans flows:
 * - every change is auto-saved silently (per user), so a reload never loses work
 * - "Save Draft & Exit" opens the save / discard / keep-editing dialog
 * - leaving the flow with unsaved work opens the same dialog
 * - the chosen exit is never blocked a second time
 */

export interface GstDraftSnapshot<T> {
  formData: T
  currentStep: number
}

const autosaveKey = (serviceId: string): string =>
  `taxedge_gst_draft_${authStorage.getUser()?.id || 'guest'}_${serviceId}`

const savedAtText = (): string =>
  new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

/** Draft to resume: an explicitly saved draft first, then the auto-saved copy */
export const readGstDraft = <T>(serviceId: string): GstDraftSnapshot<T> | null => {
  const saved = userStorage.getDraft(serviceId)
  if (saved?.formData) return { formData: saved.formData as T, currentStep: saved.currentStep }
  return localStore.get<GstDraftSnapshot<T>>(autosaveKey(serviceId))
}

/** True when two plain form values differ (used to tell whether the user has typed anything) */
export const hasGstFormChanged = (current: unknown, initial: unknown): boolean =>
  JSON.stringify(current) !== JSON.stringify(initial)

export interface UseGstDraftOptions<T> {
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
}

export const useGstDraft = <T>({
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
}: UseGstDraftOptions<T>) => {
  const pushToast = useAppStore((state) => state.pushToast)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  // Set once the user picks an exit, so that navigation is not blocked again
  const isExitingRef = useRef(false)
  // Set by "Discard & Exit": nothing may write the draft back while the page unmounts
  const isDiscardedRef = useRef(false)

  // Silent auto-save of every change (storage write only, no state update)
  useEffect(() => {
    if (isComplete || !hasEnteredData || isDiscardedRef.current) return
    localStore.set<GstDraftSnapshot<T>>(autosaveKey(serviceId), { formData, currentStep })
  }, [serviceId, formData, currentStep, hasEnteredData, isComplete])

  const saveDraft = useCallback(() => {
    if (isDiscardedRef.current) return
    localStore.set<GstDraftSnapshot<T>>(autosaveKey(serviceId), { formData, currentStep })
    userStorage.saveDraft({
      serviceId,
      serviceTitle,
      currentStep,
      totalSteps,
      stepLabel,
      formData: formData as Record<string, unknown>,
      savedAt: savedAtText(),
      savedTimestamp: Date.now(),
      resumeRoute,
    })
    pushToast(`${serviceTitle} draft saved successfully`, 'success')
  }, [serviceId, serviceTitle, currentStep, totalSteps, stepLabel, formData, resumeRoute, pushToast])

  /** Removes both the saved and the auto-saved draft (after submit or discard) */
  const clearDraft = useCallback(() => {
    userStorage.deleteDraft(serviceId)
    localStore.remove(autosaveKey(serviceId))
  }, [serviceId])

  /**
   * Purges every stored copy (saved draft, auto-save, drafts list) and blocks any later
   * auto-save / unload save, so reopening the flow starts empty.
   */
  const discardDraft = useCallback(() => {
    isDiscardedRef.current = true
    clearDraft()
    pushToast('Draft discarded', 'info')
  }, [clearDraft, pushToast])

  const isNavigationAllowed = useCallback(
    (nextLocation: Location) => isExitingRef.current || Boolean(isFlowRoute?.(nextLocation.pathname)),
    [isFlowRoute]
  )

  const blocker = useDraftBlocker({
    shouldBlock: !isComplete && hasEnteredData,
    onSaveDraft: saveDraft,
    onDiscardDraft: discardDraft,
    defaultExitRoute: exitRoute,
    isNavigationAllowed,
  })

  // The blocker saves / discards and navigates itself, so nothing is called twice here
  const handleSaveAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualModalOpen(false)
    blocker.handleSaveAndExit()
  }, [blocker])

  const handleDiscardAndExit = useCallback(() => {
    isExitingRef.current = true
    setIsManualModalOpen(false)
    blocker.handleDiscardAndExit()
  }, [blocker])

  const handleKeepEditing = useCallback(() => {
    setIsManualModalOpen(false)
    blocker.handleKeepEditing()
  }, [blocker])

  const openDraftModal = useCallback(() => setIsManualModalOpen(true), [])

  return {
    isDraftModalOpen: isManualModalOpen || blocker.isModalOpen,
    openDraftModal,
    saveDraft,
    clearDraft,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  }
}
