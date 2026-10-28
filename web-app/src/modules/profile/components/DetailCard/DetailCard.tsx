import React from 'react'
import { isFieldValuePresent } from '../../utils/profileProgress'
import './DetailCard.css'

export interface DetailCardItem {
  label: string
  value: React.ReactNode | string | number | boolean | undefined | null
  isFullWidth?: boolean
  isVerified?: boolean
}

export interface DetailCardProps {
  title: string
  items: DetailCardItem[]
  icon?: React.ReactNode
  onEdit?: () => void
  editLabel?: string
}

const EditPencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const CheckmarkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const DetailCard: React.FC<DetailCardProps> = ({
  title,
  items,
  icon,
  onEdit,
  editLabel = 'Edit Details',
}) => {
  return (
    <div className="profile-detail-card" data-testid={`profile-detail-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="profile-detail-card__header">
        <div className="profile-detail-card__header-left">
          {icon && <div className="profile-detail-card__icon">{icon}</div>}
          <h3 className="profile-detail-card__title">{title}</h3>
        </div>

        {onEdit && (
          <button
            type="button"
            className="profile-detail-card__edit-btn"
            onClick={onEdit}
            aria-label={`${editLabel} for ${title}`}
          >
            <EditPencilIcon />
            <span>{editLabel}</span>
          </button>
        )}
      </div>

      <div className="profile-detail-card__body">
        {items.map((item, index) => {
          const { value, isVerified, isFullWidth, label } = item
          const hasValue = isFieldValuePresent(value)

          return (
            <div
              key={index}
              className={`profile-detail-card__item ${
                isFullWidth ? 'profile-detail-card__item--full' : ''
              }`}
            >
              <span className="profile-detail-card__label">{label}</span>
              <div className="profile-detail-card__value">
                {React.isValidElement(value) ? (
                  value
                ) : !hasValue ? (
                  <span className="profile-pending-badge" data-testid={`pending-${label.toLowerCase().replace(/\s+/g, '-')}`}>
                    Pending
                  </span>
                ) : (
                  <span className="profile-detail-card__value-row">
                    <span className="profile-detail-card__text">{String(value)}</span>
                    {isVerified && (
                      <span className="profile-verified-badge" data-testid={`verified-${label.toLowerCase().replace(/\s+/g, '-')}`}>
                        <CheckmarkIcon />
                        <span>Verified</span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
