import type { FC } from 'react'
import { Save } from 'lucide-react'
import { SAVE_DRAFT_LABEL } from '../draftLabels'
import './SaveDraftButton.css'

export interface SaveDraftButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

/** "Save Draft & Exit" for forms that do not use the StepActionBar (same look in every service) */
export const SaveDraftButton: FC<SaveDraftButtonProps> = ({
  onClick,
  label = SAVE_DRAFT_LABEL,
  disabled = false,
}) => (
  <button type="button" className="save-draft-btn" onClick={onClick} disabled={disabled}>
    <Save className="save-draft-btn__icon" size={16} aria-hidden="true" />
    <span>{label}</span>
  </button>
)

export default SaveDraftButton
