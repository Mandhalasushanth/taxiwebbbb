import React, { useState, useEffect, useRef } from 'react'
import './ChangePasscodeModal.css'

export interface ChangePasscodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const ChangePasscodeModal: React.FC<ChangePasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPasscode, setCurrentPasscode] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setCurrentPasscode('')
      setNewPasscode('')
      setConfirmPasscode('')
      setError(null)
      setIsSuccess(false)
      setIsSubmitting(false)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPasscode.trim()) {
      setError('Please enter your current passcode')
      return
    }

    if (!newPasscode.trim()) {
      setError('Please enter your new 6-digit passcode')
      return
    }

    if (!/^\d{6}$/.test(newPasscode.trim())) {
      setError('New passcode must be exactly 6 numeric digits')
      return
    }

    if (newPasscode === currentPasscode) {
      setError('New passcode cannot be the same as your current passcode')
      return
    }

    if (newPasscode !== confirmPasscode) {
      setError('New passcode and confirm passcode do not match')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
      }, 1500)
    }, 600)
  }

  return (
    <div
      className="change-passcode-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-passcode-modal-title"
      onClick={onClose}
      data-testid="change-passcode-modal-overlay"
    >
      <div
        className="change-passcode-modal-card"
        ref={modalCardRef}
        onClick={(e) => e.stopPropagation()}
        data-testid="change-passcode-modal-card"
      >
        <div className="change-passcode-modal-header">
          <div className="change-passcode-modal-icon-wrapper">
            <LockIcon />
          </div>
          <div>
            <h3 id="change-passcode-modal-title" className="change-passcode-modal-title">
              Change Passcode
            </h3>
            <p className="change-passcode-modal-subtitle">
              Update your 6-digit security passcode
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="change-passcode-modal-success" role="status">
            <div className="change-passcode-modal-success-icon">
              <CheckIcon />
            </div>
            <h4>Passcode Updated!</h4>
            <p>Your security passcode has been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="change-passcode-modal-form">
            {error && (
              <div className="change-passcode-modal-error" role="alert">
                {error}
              </div>
            )}

            <div className="change-passcode-modal-field">
              <label htmlFor="current-passcode" className="change-passcode-modal-label">
                Current Passcode
              </label>
              <div className="change-passcode-modal-input-wrapper">
                <input
                  id="current-passcode"
                  type={showCurrent ? 'text' : 'password'}
                  maxLength={6}
                  inputMode="numeric"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter current 6-digit passcode"
                  className="change-passcode-modal-input"
                  autoFocus
                />
                <button
                  type="button"
                  className="change-passcode-modal-toggle-btn"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={showCurrent ? 'Hide current passcode' : 'Show current passcode'}
                >
                  {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="change-passcode-modal-field">
              <label htmlFor="new-passcode" className="change-passcode-modal-label">
                New Passcode
              </label>
              <div className="change-passcode-modal-input-wrapper">
                <input
                  id="new-passcode"
                  type={showNew ? 'text' : 'password'}
                  maxLength={6}
                  inputMode="numeric"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter new 6-digit passcode"
                  className="change-passcode-modal-input"
                />
                <button
                  type="button"
                  className="change-passcode-modal-toggle-btn"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? 'Hide new passcode' : 'Show new passcode'}
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="change-passcode-modal-field">
              <label htmlFor="confirm-passcode" className="change-passcode-modal-label">
                Confirm New Passcode
              </label>
              <div className="change-passcode-modal-input-wrapper">
                <input
                  id="confirm-passcode"
                  type={showConfirm ? 'text' : 'password'}
                  maxLength={6}
                  inputMode="numeric"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Re-enter new 6-digit passcode"
                  className="change-passcode-modal-input"
                />
                <button
                  type="button"
                  className="change-passcode-modal-toggle-btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirm passcode' : 'Show confirm passcode'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="change-passcode-modal-actions">
              <button
                type="button"
                className="change-passcode-modal-cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="change-passcode-modal-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Passcode'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChangePasscodeModal
