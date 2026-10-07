import type { MouseEvent } from 'react'
import './DraftConfirmModal.css'

export interface DraftConfirmModalProps {
  isOpen: boolean
  serviceTitle: string
  onSaveAndExit: () => void
  onDiscardAndExit: () => void
  onKeepEditing: () => void
}

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="draft-modal__bookmark-svg">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const SaveDiskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="draft-modal__btn-svg">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

export const DraftConfirmModal = ({
  isOpen,
  serviceTitle,
  onSaveAndExit,
  onDiscardAndExit,
  onKeepEditing,
}: DraftConfirmModalProps) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onKeepEditing()
    }
  }

  return (
    <div className="draft-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="draft-modal-title">
      <div className="draft-modal-card">
        {/* Bookmark Icon in Soft Orange Badge */}
        <div className="draft-modal__icon-badge" aria-hidden="true">
          <BookmarkIcon />
        </div>

        {/* Title */}
        <h2 id="draft-modal-title" className="draft-modal__title">
          Save Application Progress?
        </h2>

        {/* Subtitle */}
        <p className="draft-modal__subtitle">
          You have unsaved changes in your {serviceTitle.toLowerCase()} application. Save your progress so you can resume anytime without re-entering details.
        </p>

        {/* Action Buttons */}
        <div className="draft-modal__actions">
          <button
            type="button"
            className="draft-modal__btn draft-modal__btn--save"
            onClick={onSaveAndExit}
          >
            <SaveDiskIcon />
            <span>Save as Draft &amp; Exit</span>
          </button>

          <button
            type="button"
            className="draft-modal__btn draft-modal__btn--discard"
            onClick={onDiscardAndExit}
          >
            Discard &amp; Exit
          </button>

          <button
            type="button"
            className="draft-modal__btn draft-modal__btn--keep"
            onClick={onKeepEditing}
          >
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraftConfirmModal
