import React from 'react'
import './CompleteProfileCard.css'

export interface CompleteProfileCardProps {
  progress: number
  onCompleteProfile: () => void
}

const UserBadgeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className="complete-profile-card__icon-svg"
  >
    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export const CompleteProfileCard: React.FC<CompleteProfileCardProps> = ({
  progress,
  onCompleteProfile,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <div className="complete-profile-card" data-testid="complete-profile-card">
      <div className="complete-profile-card__left">
        <div className="complete-profile-card__avatar">
          <UserBadgeIcon />
        </div>

        <div className="complete-profile-card__info">
          <h2 className="complete-profile-card__title">Complete Your Profile</h2>
          <p className="complete-profile-card__description">
            Complete your personal information and KYC details to access all TaxEdge services
            such as GST, ITR, Loans, Incorporation and more.
          </p>

          <div className="complete-profile-card__progress-row">
            <div
              className="complete-profile-card__progress-track"
              role="progressbar"
              aria-valuenow={clampedProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion progress"
            >
              <div
                className="complete-profile-card__progress-fill"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className="complete-profile-card__progress-label">
              {clampedProgress}% Completed
            </span>
          </div>
        </div>
      </div>

      <div className="complete-profile-card__right">
        <button
          type="button"
          className="complete-profile-card__action-btn"
          onClick={onCompleteProfile}
          id="btn-complete-profile"
        >
          <span>Complete Profile</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}
