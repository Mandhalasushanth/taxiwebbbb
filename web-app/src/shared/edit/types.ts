export interface UpdateAndReviewButtonProps {
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  isSubmitting?: boolean
  label?: string
  className?: string
  ariaLabel?: string
  testId?: string
}
