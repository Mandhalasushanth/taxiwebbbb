import React, { useEffect, useRef } from 'react'
import './UnavailableModal.css'

export interface UnavailableModalProps {
  isOpen: boolean
  title: string | null
  onClose: () => void
}

export const UnavailableModal: React.FC<UnavailableModalProps> = ({
  isOpen,
  title,
  onClose,
}) => {
  const okButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Auto-focus the OK button for accessible keyboard navigation
    okButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !title) return null

  return (
    <div
      className="unavailable-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unavailable-modal-title"
      onClick={onClose}
      data-testid="unavailable-modal-overlay"
    >
      <div
        className="unavailable-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="unavailable-modal-card"
      >
        <h3 id="unavailable-modal-title" className="unavailable-modal-title">
          {title}
        </h3>
        <p className="unavailable-modal-message">
          This section isn't available yet.
        </p>
        <div className="unavailable-modal-actions">
          <button
            ref={okButtonRef}
            type="button"
            className="unavailable-modal-ok-btn"
            onClick={onClose}
            data-testid="unavailable-modal-ok-btn"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnavailableModal
