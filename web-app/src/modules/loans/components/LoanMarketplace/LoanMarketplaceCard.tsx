import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplyArrowIcon } from '@modules/loans/constants/loanMarketplace.icons'
import { LOAN_SERVICE_ICON_IMAGE_MAP } from '@modules/loans/constants/loanMarketplace.constants'
import { safeNavigateTo, buildLoanCardAriaLabel } from '@modules/loans/utils/loanMarketplace.utils'
import type { LoanMarketplaceCardProps } from '@modules/loans/types/loanMarketplace.types'

/**
 * Pure, reusable card component representing an individual loan product in the marketplace.
 */
export const LoanMarketplaceCard: React.FC<LoanMarketplaceCardProps> = ({ item, onSelect }) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const iconSrc = LOAN_SERVICE_ICON_IMAGE_MAP[item.id]

  /**
   * Hands the click to `onSelect` when provided; otherwise the link navigates normally.
   */
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (onSelect) {
      e.preventDefault()
      onSelect(item)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onSelect) {
        onSelect(item)
      } else {
        safeNavigateTo(navigate, item.applyPath)
      }
    }
  }

  const ariaLabel = buildLoanCardAriaLabel(item.title, item.rate, item.desc)

  return (
    <a
      href={item.applyPath}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="loan-item-card"
      aria-label={ariaLabel}
      data-testid={`loan-card-${item.id}`}
    >
      <div className="loan-item-card__top">
        <div className={`loan-item-card__icon-tile loan-item-card__icon-tile--${item.id}`}>
          {iconSrc && !imageError ? (
            <img
              src={iconSrc}
              alt={item.title}
              className="loan-item-card__icon-img"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            item.icon
          )}
        </div>
      </div>

      <div className="loan-item-card__body">
        <h2 className="loan-item-card__title">{item.title}</h2>
        <p className="loan-item-card__desc">{item.desc}</p>
      </div>

      <div className="loan-item-card__footer">
        <span className="loan-item-card__action-text">
          <span>Apply Now</span>
          <ApplyArrowIcon />
        </span>
      </div>
    </a>
  )
}

export default LoanMarketplaceCard
