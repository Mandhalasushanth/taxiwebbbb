import React from 'react'
import { UPDATE_AND_REVIEW_LABEL } from '@shared/edit'
import { SAVE_DRAFT_LABEL } from '@shared/saveDraft'
import './StepActionBar.css'

export interface StepActionBarProps {
  onBack?: () => void
  onNext?: () => void
  onSaveDraft?: () => void
  saveDraftLabel?: string
  backLabel?: string
  nextLabel?: string
  /** Step opened with "Edit" from a review page: the main button reads "Update & Review" */
  isEditMode?: boolean
  isSubmitting?: boolean
  nextDisabled?: boolean
  backDisabled?: boolean
  showBack?: boolean
  showNext?: boolean
  showSaveDraft?: boolean
  hideNextWhenDisabled?: boolean
  nextType?: 'button' | 'submit'
  backTestId?: string
  nextTestId?: string
  nextAriaLabel?: string
  saveDraftTestId?: string
  extraActions?: React.ReactNode
  className?: string
}

export const StepActionBar: React.FC<StepActionBarProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  saveDraftLabel = SAVE_DRAFT_LABEL,
  backLabel = 'Back',
  nextLabel = 'Continue',
  isEditMode = false,
  isSubmitting = false,
  nextDisabled = false,
  backDisabled = false,
  showBack = true,
  showNext = true,
  showSaveDraft = true,
  hideNextWhenDisabled: _hideNextWhenDisabled = false,
  nextType = 'button',
  backTestId = 'step-back-btn',
  nextTestId = 'step-continue-btn',
  nextAriaLabel,
  saveDraftTestId = 'step-save-draft-btn',
  extraActions,
  className = '',
}) => {
  const isContinueVisible = showNext

  const handleBackClick = () => {
    if (isSubmitting) return
    if (onBack) {
      onBack()
      return
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    }
  }

  const handleSaveDraftClick = () => {
    if (isSubmitting) return
    if (onSaveDraft) {
      onSaveDraft()
      return
    }
    // Fallback: Dispatch custom event for parents to listen to, or go back
    window.dispatchEvent(
      new CustomEvent('step-action-bar:save-draft', {
        bubbles: true,
        detail: { nextTestId },
      })
    )
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    }
  }

  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isSubmitting) return

    if (nextDisabled) {
      e.preventDefault()
      e.stopPropagation()

      // Notify parent views that a continue was attempted while incomplete
      window.dispatchEvent(
        new CustomEvent('step-action-bar:submit-attempt', {
          bubbles: true,
          detail: { nextTestId },
        })
      )

      // Trigger HTML form submit / reportValidity if inside a form
      const form = e.currentTarget.closest('form') || document.querySelector('form')
      if (form) {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit()
        } else {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
      return
    }

    if (nextType === 'button') {
      onNext?.()
    }
  }

  // 'Continue' by default; screens opened with "Edit" from a review page pass 'Update & Review'
  const displayContinueLabel = isSubmitting
    ? 'Processing...'
    : isEditMode
      ? UPDATE_AND_REVIEW_LABEL
      : nextLabel || 'Continue'
  const displayBackLabel = backLabel || 'Back'
  const displaySaveDraftLabel = saveDraftLabel || SAVE_DRAFT_LABEL

  return (
    <div className={`step-action-bar ${className}`} data-testid="step-action-bar">
      <div className="step-action-bar__left">
        {showBack && (
          <button
            type="button"
            className="step-action-bar__btn step-action-bar__btn--back"
            onClick={handleBackClick}
            disabled={backDisabled || isSubmitting}
            data-testid={backTestId}
          >
            <svg
              className="step-action-bar__icon-arrow step-action-bar__icon-arrow--back"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>{displayBackLabel}</span>
          </button>
        )}
      </div>

      <div className="step-action-bar__right">
        {showSaveDraft && (
          <button
            type="button"
            className="step-action-bar__btn step-action-bar__btn--save-draft"
            onClick={handleSaveDraftClick}
            data-testid={saveDraftTestId}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{displaySaveDraftLabel}</span>
          </button>
        )}

        {extraActions && <div className="step-action-bar__extra">{extraActions}</div>}

        {isContinueVisible && (
          <button
            type={nextType}
            className={`step-action-bar__btn step-action-bar__btn--next ${nextDisabled ? 'step-action-bar__btn--next-incomplete' : ''}`}
            onClick={handleNextClick}
            disabled={isSubmitting}
            data-testid={nextTestId}
            aria-label={nextAriaLabel}
          >
            {isSubmitting ? (
              <>
                <span className="step-action-bar__spinner" aria-hidden="true" />
                <span>{displayContinueLabel}</span>
              </>
            ) : (
              <span>{displayContinueLabel}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
