import type { FC } from 'react'
import { UPDATE_AND_REVIEW_LABEL } from '../editLabels'
import type { UpdateAndReviewButtonProps } from '../types'
import './UpdateAndReviewButton.css'

/** "Update & Review" for edit forms that do not use the StepActionBar (opened with "Edit" from a review) */
export const UpdateAndReviewButton: FC<UpdateAndReviewButtonProps> = ({
  onClick,
  type = 'button',
  disabled = false,
  isSubmitting = false,
  label = UPDATE_AND_REVIEW_LABEL,
  className = '',
  ariaLabel = 'Update and return to review summary',
  testId = 'update-and-review-btn',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || isSubmitting}
    className={['update-review-btn', className].filter(Boolean).join(' ')}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    {isSubmitting ? (
      <>
        <span className="update-review-btn__spinner" aria-hidden="true" />
        <span>Updating...</span>
      </>
    ) : (
      <>
        <span>{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="update-review-btn__icon"
          aria-hidden="true"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </>
    )}
  </button>
)

export default UpdateAndReviewButton
