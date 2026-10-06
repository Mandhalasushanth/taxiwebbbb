import type { ReactNode } from 'react'

export interface GSTEditModeState {
  isEditMode: boolean
  editingSection?: string | null
  returnStep?: number | string
}

export interface GSTUpdateAndReviewButtonProps {
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  isSubmitting?: boolean
  label?: string
  className?: string
  ariaLabel?: string
  testId?: string
}

export interface GSTEditActionBarProps {
  isEditMode?: boolean
  onBack?: () => void
  onNext?: () => void
  onUpdateAndReview?: () => void
  onSaveDraft?: () => void
  nextLabel?: string
  updateLabel?: string
  backLabel?: string
  saveDraftLabel?: string
  isSubmitting?: boolean
  nextDisabled?: boolean
  backDisabled?: boolean
  showBack?: boolean
  showNext?: boolean
  showSaveDraft?: boolean
  nextType?: 'button' | 'submit'
  extraActions?: ReactNode
  className?: string
}
