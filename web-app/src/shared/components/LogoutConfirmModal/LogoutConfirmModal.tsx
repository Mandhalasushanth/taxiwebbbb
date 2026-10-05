import { useEffect, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { LogoutIcon } from './LogoutIcon'
import './LogoutConfirmModal.css'

export interface LogoutConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Disables both buttons while the sign-out request is in flight */
  isLoggingOut?: boolean
}

const TITLE_ID = 'logout-modal-title'
const DESCRIPTION_ID = 'logout-modal-desc'

/** "Are you sure?" check shown before ending the session. Esc / backdrop click = Cancel. */
export const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, isLoggingOut = false }: LogoutConfirmModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return undefined
    // Safe default: focus starts on Cancel so Enter does not log out by accident
    cancelRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoggingOut) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoggingOut, onCancel])

  if (!isOpen) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoggingOut) onCancel()
  }

  return createPortal(
    <div
      className="logout-modal-backdrop"
      onClick={handleBackdropClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      aria-describedby={DESCRIPTION_ID}
    >
      <div className="logout-modal-card">
        <div className="logout-modal__icon-badge">
          <LogoutIcon size={32} />
        </div>

        <h2 id={TITLE_ID} className="logout-modal__title">
          Log out?
        </h2>
        <p id={DESCRIPTION_ID} className="logout-modal__subtitle">
          Are you sure you want to log out? You will need to sign in again to continue.
        </p>

        <div className="logout-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="logout-modal__btn logout-modal__btn--cancel"
            onClick={onCancel}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button
            type="button"
            className="logout-modal__btn logout-modal__btn--confirm"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            <LogoutIcon size={18} />
            <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default LogoutConfirmModal
