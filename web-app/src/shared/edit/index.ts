/**
 * Edit from a review page — everything in one place, used by GST, ITR, Incorporation and Loans:
 * - useReviewEdit: Edit opens a step; "Update & Review" and Back return to the review
 * - scrollToSection: Smoothly scrolls to section by ID / data-section with offset
 * - UpdateAndReviewButton: the main button for edit forms without the StepActionBar
 * - UPDATE_AND_REVIEW_LABEL: the label StepActionBar shows when given `isEditMode`
 */
export { useReviewEdit, scrollToSection } from './useReviewEdit'
export type { ReviewEdit } from './useReviewEdit'
export { UpdateAndReviewButton } from './UpdateAndReviewButton/UpdateAndReviewButton'
export { UPDATE_AND_REVIEW_LABEL } from './editLabels'
export type { UpdateAndReviewButtonProps } from './types'
