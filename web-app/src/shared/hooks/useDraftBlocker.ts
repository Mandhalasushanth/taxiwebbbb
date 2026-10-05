/* oxlint-disable */
import { useState, useEffect, useCallback, useContext } from 'react'
import { UNSAFE_DataRouterContext, useBlocker, useNavigate, type Location } from 'react-router-dom'
import { routePaths } from '@core/config'

export interface UseDraftBlockerOptions {
  shouldBlock: boolean
  onSaveDraft: () => void
  onDiscardDraft: () => void
  defaultExitRoute?: string
  isNavigationAllowed?: (nextLocation: Location) => boolean
}

const dummyBlocker = { state: 'unblocked' as const, proceed: () => {}, reset: () => {} }

export const useDraftBlocker = ({
  shouldBlock,
  onSaveDraft,
  onDiscardDraft,
  defaultExitRoute = routePaths.dashboard,
  isNavigationAllowed,
}: UseDraftBlockerOptions) => {
  const navigate = useNavigate()
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false)

  const hasDataRouter = Boolean(useContext(UNSAFE_DataRouterContext))

  const shouldBlockNav = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: Location; nextLocation: Location }) => {
      if (!shouldBlock) return false
      if (currentLocation.pathname === nextLocation.pathname) return false
      if (nextLocation.pathname.includes('/loans/status')) return false
      if (isNavigationAllowed && isNavigationAllowed(nextLocation)) return false
      return true
    },
    [shouldBlock, isNavigationAllowed]
  )

  // Block route navigation if in data router and unsubmitted
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // oxlint-disable-next-line react-hooks/rules-of-hooks
  const blocker = hasDataRouter
    ? useBlocker(shouldBlockNav)
    : dummyBlocker

  const isModalOpen = isManualOpen || blocker.state === 'blocked'

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

  const handleSaveAndExit = useCallback(() => {
    onSaveDraft()
    setIsManualOpen(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else {
      navigate(defaultExitRoute)
    }
  }, [blocker, onSaveDraft, navigate, defaultExitRoute])

  const handleDiscardAndExit = useCallback(() => {
    onDiscardDraft()
    setIsManualOpen(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else {
      navigate(defaultExitRoute)
    }
  }, [blocker, onDiscardDraft, navigate, defaultExitRoute])

  const handleKeepEditing = useCallback(() => {
    setIsManualOpen(false)
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  return {
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  }
}

export default useDraftBlocker
