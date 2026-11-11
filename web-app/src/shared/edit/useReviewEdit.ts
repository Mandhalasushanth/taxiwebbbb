import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'

/**
 * Resolves the appropriate module dashboard route across Finsolz:
 * - GST -> /gst (GST Dashboard)
 * - ITR / Income Tax -> /itr (Income Tax Dashboard)
 * - Loans -> /loans (Loans Marketplace / Dashboard)
 * - Incorporation -> /incorporation (Incorporation Dashboard)
 * - Other / generic fallback -> /dashboard (Customer Dashboard)
 */
export const getModuleDashboardRoute = (moduleOrPath?: string): string => {
  if (!moduleOrPath) return routePaths.dashboard
  const lower = moduleOrPath.toLowerCase()
  if (lower.startsWith('/gst') || lower === 'gst' || lower.includes('gst')) {
    return routePaths.gst.root
  }
  if (
    lower.startsWith('/itr') ||
    lower === 'itr' ||
    lower.includes('itr') ||
    lower.includes('tds') ||
    lower.includes('incometax') ||
    lower.includes('tax')
  ) {
    return routePaths.itr.root
  }
  if (lower.startsWith('/loans') || lower === 'loans' || lower === 'loan' || lower.includes('loan')) {
    return routePaths.loans
  }
  if (lower.startsWith('/incorporation') || lower === 'incorporation' || lower.includes('incorporation')) {
    return routePaths.incorporation.root
  }
  return routePaths.dashboard
}

/**
 * Robustly scrolls to a target section by ID, data-section, or data-testid
 * with offset for sticky headers. Retries briefly to allow newly mounted steps to render.
 */
export const scrollToSection = (targetElementId?: string, offset = 80): void => {
  if (!targetElementId || typeof window === 'undefined') return
  const cleanId = targetElementId.replace(/^#/, '')
  const tryScroll = (): boolean => {
    const el =
      document.getElementById(cleanId) ||
      document.querySelector(`[data-section="${cleanId}"]`) ||
      document.querySelector(`[data-testid="${cleanId}"]`)
    if (!el) return false
    const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - offset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    if (el instanceof HTMLElement && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
    return true
  }

  if (!tryScroll()) {
    setTimeout(tryScroll, 60)
    setTimeout(tryScroll, 180)
  }
}

export interface ReviewEditOptions {
  goToReview: () => void
  isReview?: boolean
  serviceId?: string
  serviceTitle?: string
  module?: string
  dashboardRoute?: string
  onSaveDraft?: () => void | Promise<void>
}

let isReviewEditNavigationActive = false
let activeReviewEditMode = false

export const setReviewEditMode = (active: boolean): void => {
  activeReviewEditMode = active
}

export const getIsReviewEditMode = (): boolean => activeReviewEditMode

export const setReviewEditNavigationActive = (active: boolean): void => {
  isReviewEditNavigationActive = active
}

export const getIsReviewEditNavigationActive = (): boolean => isReviewEditNavigationActive

/**
 * "Edit" from a review page, shared by every multi-step service (GST, Loans, ITR, Incorporation):
 * - `startEdit(openStep, targetElementId?)` remembers the user came from review, opens the step, and scrolls to section
 * - while editing, the step's main button reads "Update & Review" (pass `isEditMode` to StepActionBar)
 * - "Update & Review" and Back both return straight to the review instead of walking the steps
 */
export const useReviewEdit = (optionsOrGoToReview: (() => void) | ReviewEditOptions) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const goToReview = typeof optionsOrGoToReview === 'function' ? optionsOrGoToReview : optionsOrGoToReview.goToReview

  /** Opens a step from the review page in edit mode and optionally scrolls to a target section */
  const startEdit = useCallback((openStep: () => void, targetElementId?: string) => {
    setIsEditMode(true)
    setReviewEditMode(true)
    setReviewEditNavigationActive(true)
    try {
      openStep()
    } finally {
      setTimeout(() => {
        setReviewEditNavigationActive(false)
      }, 150)
    }
    if (targetElementId) {
      setTimeout(() => scrollToSection(targetElementId), 60)
    }
  }, [])

  /** Leaves edit mode and shows the review again */
  const finishEdit = useCallback(() => {
    setIsEditMode(false)
    setReviewEditMode(false)
    goToReview()
  }, [goToReview])

  /** Leaves edit mode without moving (e.g. the user picked another step on the stepper) */
  const cancelEdit = useCallback(() => {
    setIsEditMode(false)
    setReviewEditMode(false)
  }, [])

  /** Continue handler: back to the review while editing, otherwise the normal next step */
  const nextOrReview = useCallback(
    (next: () => void) => () => (isEditMode ? finishEdit() : next()),
    [isEditMode, finishEdit],
  )

  /** Back handler: back to the review while editing, otherwise the normal previous step */
  const backOrReview = useCallback(
    (back: () => void) => () => (isEditMode ? finishEdit() : back()),
    [isEditMode, finishEdit],
  )

  return { isEditMode, startEdit, finishEdit, cancelEdit, nextOrReview, backOrReview }
}

export type ReviewEdit = ReturnType<typeof useReviewEdit>

export interface UseReviewNavigationOptions {
  /** True when the user is on the review page / step */
  isReview: boolean
  /** Service identifier (e.g. 'gst-registration', 'gst-filing', 'itr-filing') */
  serviceId?: string
  /** Service title shown in dialogs */
  serviceTitle?: string
  /** Module identifier ('gst' | 'itr' | 'loans' | 'incorporation') */
  module?: string
  /** Custom dashboard route override (defaults to module dashboard) */
  dashboardRoute?: string
  /** Application ID / reference */
  applicationId?: string
  /** Callback when Save Draft is executed */
  onSaveDraft?: () => void | Promise<void>
  /** Callback to return to review */
  goToReview?: () => void
}

/**
 * Centralized Review Navigation mechanism shared across Finsolz:
 * 1. Review page detection
 * 2. Completely hides application Back button on Review
 * 3. Intercepts browser Back on Review only via history/popstate
 * 4. Displays custom Save Draft confirmation dialog ("Do you want to save your draft?")
 * 5. Handles "Stay on Page": restores history state, keeps data, closes dialog
 * 6. Handles "Save Draft": saves draft, prevents duplicate clicks, redirects to module dashboard
 * 7. Section-wise edit & direct return to Review
 * 8. Reopen application resumes directly from Review
 */
export const useReviewNavigation = ({
  isReview,
  serviceId,
  serviceTitle: _serviceTitle = 'Application',
  module,
  dashboardRoute,
  onSaveDraft,
  goToReview,
}: UseReviewNavigationOptions) => {
  const navigate = useNavigate()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const isExitingRef = useRef(false)

  const resolvedDashboard = dashboardRoute || getModuleDashboardRoute(module || serviceId)

  // Register browser Back popstate interception only when on Review page
  useEffect(() => {
    if (!isReview) return

    const currentState = window.history.state || {}
    if (!currentState.__reviewGuard) {
      window.history.pushState({ ...currentState, __reviewGuard: true }, '')
    }

    const handlePopState = (e: PopStateEvent) => {
      if (isExitingRef.current || getIsReviewEditNavigationActive()) return
      // Re-push history guard to stay on Review
      window.history.pushState({ ...(e.state || {}), __reviewGuard: true }, '')
      setIsReviewModalOpen(true)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isReview])

  const handleStayOnPage = useCallback(() => {
    setIsReviewModalOpen(false)
    window.history.pushState({ ...window.history.state, __reviewGuard: true }, '')
  }, [])

  const handleSaveDraft = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    setSaveError(null)
    try {
      if (onSaveDraft) {
        await onSaveDraft()
      }
      isExitingRef.current = true
      setIsReviewModalOpen(false)
      navigate(resolvedDashboard, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save draft'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSaveDraft, navigate, resolvedDashboard])

  const reviewEdit = useReviewEdit(goToReview || (() => {}))

  return {
    isReview,
    isReviewModalOpen,
    isSaving,
    saveError,
    showBackButton: !isReview && !reviewEdit.isEditMode,
    handleStayOnPage,
    handleSaveDraft,
    openReviewDraftModal: () => setIsReviewModalOpen(true),
    closeReviewDraftModal: () => setIsReviewModalOpen(false),
    dashboardRoute: resolvedDashboard,
    reviewEdit,
  }
}

export type ReviewNavigation = ReturnType<typeof useReviewNavigation>
