import { useCallback, useState } from 'react'

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

/**
 * "Edit" from a review page, shared by every multi-step service (GST, Loans, ITR, Incorporation):
 * - `startEdit(openStep, targetElementId?)` remembers the user came from review, opens the step, and scrolls to section
 * - while editing, the step's main button reads "Update & Review" (pass `isEditMode` to StepActionBar)
 * - "Update & Review" and Back both return straight to the review instead of walking the steps
 */
export const useReviewEdit = (goToReview: () => void) => {
  const [isEditMode, setIsEditMode] = useState(false)

  /** Opens a step from the review page in edit mode and optionally scrolls to a target section */
  const startEdit = useCallback((openStep: () => void, targetElementId?: string) => {
    setIsEditMode(true)
    openStep()
    if (targetElementId) {
      setTimeout(() => scrollToSection(targetElementId), 60)
    }
  }, [])

  /** Leaves edit mode and shows the review again */
  const finishEdit = useCallback(() => {
    setIsEditMode(false)
    goToReview()
  }, [goToReview])

  /** Leaves edit mode without moving (e.g. the user picked another step on the stepper) */
  const cancelEdit = useCallback(() => setIsEditMode(false), [])

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
