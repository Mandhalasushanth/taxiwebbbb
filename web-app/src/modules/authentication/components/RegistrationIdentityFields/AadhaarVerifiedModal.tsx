import React from 'react'

export interface AadhaarVerifiedModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export const AadhaarVerifiedModal: React.FC<AadhaarVerifiedModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="reg-aadhaar-modal__overlay" role="presentation">
      <div
        className="reg-aadhaar-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aadhaar-modal-title"
      >
        <h3 id="aadhaar-modal-title" className="reg-aadhaar-modal__title">
          Aadhaar Verified
        </h3>
        <p className="reg-aadhaar-modal__message">
          Your Aadhaar number has been verified successfully!
        </p>
        <div className="reg-aadhaar-modal__actions">
          <button
            type="button"
            className="reg-aadhaar-modal__ok-btn"
            onClick={onConfirm}
            data-testid="aadhaar-modal-ok-btn"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

