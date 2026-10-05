import React from 'react'
import './LoanReviewSection.css'

export interface ReviewItem {
  label: string
  value: React.ReactNode
}

export interface LoanReviewSectionProps {
  icon?: React.ReactNode
  title: string
  items: ReviewItem[]
  onEdit?: () => void
  editLabel?: string
  className?: string
}

export const LoanReviewSection: React.FC<LoanReviewSectionProps> = ({
  icon,
  title,
  items,
  onEdit,
  editLabel = 'Edit',
  className = '',
}) => {
  return (
    <div className={`loan-review-section ${className}`.trim()}>
      <div className="loan-review-section__header">
        <div className="loan-review-section__title-box">
          {icon && <div className="loan-review-section__icon">{icon}</div>}
          <h3 className="loan-review-section__title">{title}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            className="loan-review-section__edit-btn"
            onClick={onEdit}
          >
            {editLabel}
          </button>
        )}
      </div>

      <div className="loan-review-section__grid">
        {items.map((item, index) => (
          <div key={index} className="loan-review-section__item">
            <span className="loan-review-section__label">{item.label}</span>
            <span className="loan-review-section__value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoanReviewSection
