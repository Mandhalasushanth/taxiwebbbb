/* oxlint-disable */
import { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { UNSAFE_DataRouterContext, useBlocker, useNavigate, type Location } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAppStore } from '@store/index'
import { getIsReviewEditNavigationActive } from '@shared/edit'

export interface UseDraftBlockerOptions {
  shouldBlock: boolean
  onSaveDraft: () => void | Promise<void>
  onDiscardDraft: () => void
  defaultExitRoute?: string
  isNavigationAllowed?: (nextLocation: Location) => boolean
  /** Whether the user is currently on a Review page */
  isReview?: boolean
  module?: string
}

const dummyBlocker = { state: 'unblocked' as const, proceed: () => {}, reset: () => {} }

export const useDraftBlocker = ({
  shouldBlock,
  onSaveDraft,
  onDiscardDraft,
  defaultExitRoute = routePaths.dashboard,
  isNavigationAllowed,
  isReview = false,
}: UseDraftBlockerOptions) => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false)
  const [isReviewPopstateOpen, setIsReviewPopstateOpen] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const isExitingRef = useRef<boolean>(false)

  const hasDataRouter = Boolean(useContext(UNSAFE_DataRouterContext))

  const shouldBlockNav = useCallback(
    ({
      currentLocation,
      nextLocation,
      historyAction,
    }: {
      currentLocation: Location
      nextLocation: Location
      historyAction?: string
    }) => {
      if (!shouldBlock && !isReview) return false
      if (nextLocation.pathname.includes('/loans/status')) return false
      if (isExitingRef.current) return false

      // If an Edit action was clicked from review, NEVER block!
      if (getIsReviewEditNavigationActive()) return false

      const isAllowedRoute = Boolean(isNavigationAllowed?.(nextLocation))

      // On review pages:
      if (isReview) {
        // If it's an in-app navigation to an allowed flow route (e.g. clicking "Edit" or navigating within the flow)
        // and NOT a browser Back 'POP' action, allow it immediately without asking to save draft
        if (historyAction !== 'POP' && isAllowedRoute) {
          return false
        }
        // Browser Back ('POP') or exiting to outside route from Review triggers Save Draft confirmation
        return true
      }

      // Normal pages before Review
      if (currentLocation.pathname === nextLocation.pathname) return false
      if (isAllowedRoute) return false
      return true
    },
    [shouldBlock, isNavigationAllowed, isReview]
  )

  // Block route navigation if in data router and unsubmitted
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // oxlint-disable-next-line react-hooks/rules-of-hooks
  const blocker = hasDataRouter
    ? useBlocker(shouldBlockNav)
    : dummyBlocker

  // On Review pages only: register browser Back popstate interception
  useEffect(() => {
    if (!isReview) return

    // Ensure a review guard history entry exists so browser Back stays in the web app
    window.history.pushState({ __reviewGuard: true }, '', window.location.href)

    const handlePopState = (e: PopStateEvent) => {
      if (isExitingRef.current || getIsReviewEditNavigationActive()) return
      // Re-push review guard to prevent navigating backwards outside the web app
      window.history.pushState({ ...(e.state || {}), __reviewGuard: true }, '', window.location.href)
      setIsReviewPopstateOpen(true)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isReview])

  const isModalOpen = isManualOpen || isReviewPopstateOpen || blocker.state === 'blocked'
  const isReviewPrompt = isReview && isModalOpen

  // Reset blocker if shouldBlock transitions to false while in blocked state
  useEffect(() => {
    if (!shouldBlock && blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [shouldBlock, blocker])

  // Persist draft and show browser dialog if tab is closed or reloaded
  useEffect(() => {
    if (!shouldBlock) return

    const handleBeforeUnload = () => {
      onSaveDraft()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [shouldBlock, onSaveDraft])

  const openModal = useCallback(() => {
    setIsManualOpen(true)
  }, [])

  const handleSaveAndExit = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await onSaveDraft()
      isExitingRef.current = true
      setIsManualOpen(false)
      setIsReviewPopstateOpen(false)
      if (blocker.state === 'blocked') {
        blocker.proceed()
      } else {
        navigate(defaultExitRoute, { replace: true })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save draft. Please try again.'
      pushToast(msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }, [blocker, onSaveDraft, navigate, defaultExitRoute, isSaving, pushToast])

  const handleDiscardAndExit = useCallback(() => {
    if (isSaving) return
    isExitingRef.current = true
    onDiscardDraft()
    setIsManualOpen(false)
    setIsReviewPopstateOpen(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else {
      navigate(defaultExitRoute)
    }
  }, [blocker, onDiscardDraft, navigate, defaultExitRoute, isSaving])

  const handleKeepEditing = useCallback(() => {
    setIsManualOpen(false)
    setIsReviewPopstateOpen(false)
    if (isReview) {
      // Re-push review guard to stay on Review page in history
      window.history.pushState({ ...window.history.state, __reviewGuard: true }, '', window.location.href)
    }
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker, isReview])

  return {
    isModalOpen,
    isReviewPrompt,
    isSaving,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  }
}

export default useDraftBlocker
