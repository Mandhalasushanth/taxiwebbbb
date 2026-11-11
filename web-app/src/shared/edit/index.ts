/**
 * Edit & Review navigation — everything in one place, used by GST, ITR, Incorporation and Loans:
 * - useReviewNavigation: Centralized Review page navigation, browser back interception, Save Draft confirmation, and module dashboard redirection
 * - useReviewEdit: Edit opens a step; "Update & Review" and Back return to the review
 * - getModuleDashboardRoute: Reusable module-aware dashboard route resolver
 * - scrollToSection: Smoothly scrolls to section by ID / data-section with offset
 * - UpdateAndReviewButton: the main button for edit forms without the StepActionBar
 * - UPDATE_AND_REVIEW_LABEL: the label StepActionBar shows when given `isEditMode`
 */
export {
  useReviewEdit,
  useReviewNavigation,
  getModuleDashboardRoute,
  scrollToSection,
  setReviewEditNavigationActive,
  getIsReviewEditNavigationActive,
  setReviewEditMode,
  getIsReviewEditMode,
} from './useReviewEdit'
export type { ReviewEdit, ReviewNavigation, UseReviewNavigationOptions, ReviewEditOptions } from './useReviewEdit'
export { UpdateAndReviewButton } from './UpdateAndReviewButton/UpdateAndReviewButton'
export { UPDATE_AND_REVIEW_LABEL } from './editLabels'
export type { UpdateAndReviewButtonProps } from './types'
