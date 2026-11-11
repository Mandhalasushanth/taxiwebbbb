import React from 'react'
import './CompleteProfileModal.css'

export interface CompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onCompleteProfile: () => void
}

const UserProfileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="complete-profile-modal__icon-svg"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="complete-profile-modal__btn-icon"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  onCompleteProfile,
}) => {
  if (!isOpen) return null

  return (
    <div className="complete-profile-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="complete-profile-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Top Centered Icon Badge */}
        <div className="complete-profile-modal__badge">
          <UserProfileIcon />
        </div>

        {/* Title & Subtitle */}
        <h2 className="complete-profile-modal__title">Complete Your Profile</h2>
        <p className="complete-profile-modal__desc">
          Please complete your profile to access Finsolz services.
        </p>

        {/* Action Buttons */}
        <div className="complete-profile-modal__actions">
          <button
            type="button"
            className="complete-profile-modal__btn-primary"
            onClick={onCompleteProfile}
          >
            <ShieldCheckIcon />
            <span>Complete Profile</span>
          </button>

          <button
            type="button"
            className="complete-profile-modal__btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfileModal
