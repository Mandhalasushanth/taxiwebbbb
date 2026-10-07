import { useCallback, useState } from 'react'

/**
 * "Edit" from a review page, shared by every multi-step service (GST, Loans, ITR, Incorporation):
 * - `startEdit(open)` remembers the user came from the review and opens the step to change
 * - while editing, the step's main button reads "Update & Review" (pass `isEditMode` to StepActionBar)
 * - "Update & Review" and Back both return straight to the review instead of walking the steps
 */
export const useReviewEdit = (goToReview: () => void) => {
  const [isEditMode, setIsEditMode] = useState(false)

  /** Opens a step from the review page in edit mode */
  const startEdit = useCallback((openStep: () => void) => {
    setIsEditMode(true)
    openStep()
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
