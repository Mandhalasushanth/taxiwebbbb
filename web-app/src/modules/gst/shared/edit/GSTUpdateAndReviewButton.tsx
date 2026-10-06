import React from 'react'
import type { GSTUpdateAndReviewButtonProps } from './types'
import './GSTUpdateAndReviewButton.css'

export const GSTUpdateAndReviewButton: React.FC<GSTUpdateAndReviewButtonProps> = ({
  onClick,
  type = 'button',
  disabled = false,
  isSubmitting = false,
  label = 'Update & Review',
  className = '',
  ariaLabel = 'Update and return to review summary',
  testId = 'gst-update-and-review-btn',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`gst-update-review-btn ${className}`}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {isSubmitting ? (
        <>
          <span className="gst-update-review-spinner" aria-hidden="true" />
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
            className="gst-update-review-icon"
            aria-hidden="true"
          >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </>
      )}
    </button>
  )
}

export default GSTUpdateAndReviewButton
