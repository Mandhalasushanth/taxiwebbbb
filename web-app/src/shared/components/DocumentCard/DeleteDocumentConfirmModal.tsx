import React, { useEffect, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'
import './DeleteDocumentConfirmModal.css'

export interface DeleteDocumentConfirmModalProps {
  isOpen: boolean
  fileName?: string
  documentTitle?: string
  onConfirm: () => void
  onCancel: () => void
}

export const DeleteDocumentConfirmModal: React.FC<DeleteDocumentConfirmModalProps> = ({
  isOpen,
  fileName,
  documentTitle,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined
    cancelRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel()
  }

  const docName = fileName || documentTitle || 'this document'

  return createPortal(
    <div
      className="delete-doc-modal-backdrop"
      onClick={handleBackdropClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-doc-modal-title"
      aria-describedby="delete-doc-modal-desc"
    >
      <div className="delete-doc-modal-card">
        <div className="delete-doc-modal__icon-badge">
          <Trash2 size={28} strokeWidth={2.2} />
        </div>

        <h2 id="delete-doc-modal-title" className="delete-doc-modal__title">
          Delete Document?
        </h2>
        <p id="delete-doc-modal-desc" className="delete-doc-modal__subtitle">
          Are you sure you want to remove <strong className="delete-doc-modal__filename">{docName}</strong>? You will need to upload it again if it is required.
        </p>

        <div className="delete-doc-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="delete-doc-modal__btn delete-doc-modal__btn--cancel"
            onClick={onCancel}
            data-testid="cancel-delete-doc-modal"
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-doc-modal__btn delete-doc-modal__btn--confirm"
            onClick={onConfirm}
            data-testid="confirm-delete-doc-modal"
          >
            <Trash2 size={16} strokeWidth={2.2} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default DeleteDocumentConfirmModal

