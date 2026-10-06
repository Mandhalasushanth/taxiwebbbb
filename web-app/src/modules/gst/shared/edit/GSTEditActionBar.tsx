import React from 'react'
import { StepActionBar } from '@shared/components'
import type { GSTEditActionBarProps } from './types'

export const GSTEditActionBar: React.FC<GSTEditActionBarProps> = ({
  isEditMode = false,
  onBack,
  onNext,
  onUpdateAndReview,
  onSaveDraft,
  nextLabel = 'Continue',
  updateLabel = 'Update & Review',
  backLabel = 'Back',
  saveDraftLabel = 'Save Draft & Exit',
  isSubmitting = false,
  nextDisabled = false,
  backDisabled = false,
  showBack = true,
  showNext = true,
  showSaveDraft = true,
  nextType = 'button',
  extraActions,
  className = '',
}) => {
  const handlePrimaryClick = () => {
    if (isEditMode) {
      if (onUpdateAndReview) {
        onUpdateAndReview()
      } else if (onNext) {
        onNext()
      }
    } else if (onNext) {
      onNext()
    }
  }

  const effectiveNextLabel = isEditMode ? updateLabel : nextLabel

  return (
    <StepActionBar
      onBack={onBack}
      onNext={handlePrimaryClick}
      onSaveDraft={onSaveDraft}
      saveDraftLabel={saveDraftLabel}
      backLabel={backLabel}
      nextLabel={effectiveNextLabel}
      isSubmitting={isSubmitting}
      nextDisabled={nextDisabled}
      backDisabled={backDisabled}
      showBack={showBack}
      showNext={showNext}
      showSaveDraft={showSaveDraft}
      nextType={nextType}
      extraActions={extraActions}
      className={`gst-edit-action-bar ${isEditMode ? 'gst-edit-action-bar--editing' : ''} ${className}`}
    />
  )
}

export default GSTEditActionBar
