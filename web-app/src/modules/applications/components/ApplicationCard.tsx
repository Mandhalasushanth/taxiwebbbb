import { routePaths } from '@core/config'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApplicationsItem } from '../types/applications.types'
import { GstDocIcon, ItrDocIcon, LoansIcon, BusinessIcon, InsuranceIcon, ChevronRightIcon } from './ApplicationIcons'

interface ApplicationCardProps {
  item: ApplicationsItem
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ item }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    const targetId = item.reference || item.id
    if (targetId) {
      navigate(routePaths.applicationTrack(encodeURIComponent(targetId)))
    } else if (item.to) {
      navigate(item.to)
    }
  }

  const renderServiceIcon = () => {
    switch (item.category) {
      case 'GST':
        return <GstDocIcon className="app-item-icon-svg" />
      case 'ITR':
        return <ItrDocIcon className="app-item-icon-svg" />
      case 'Loans':
        return <LoansIcon className="app-item-icon-svg" />
      case 'Business':
        return <BusinessIcon className="app-item-icon-svg" />
      case 'Insurance':
        return <InsuranceIcon className="app-item-icon-svg" />
      default:
        return <GstDocIcon className="app-item-icon-svg" />
    }
  }

  return (
    <article
      className="app-item-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      <div className="app-item-card__left">
        <div className="app-item-card__icon-box">
          {renderServiceIcon()}
        </div>

        <div className="app-item-card__details">
          <div className="app-item-card__top-line">
            <span className="app-item-card__ref">{item.reference}</span>
            <span className="app-item-card__status-pill">{item.statusLabel}</span>
          </div>

          <h3 className="app-item-card__title">{item.title}</h3>

          <div className="app-item-card__meta-line">
            <span className="app-item-card__date">
              <span className="app-item-card__cal-emoji" aria-hidden="true">🗓️</span> {item.date}
            </span>
            {item.tag && (
              <>
                <span className="app-item-card__separator" aria-hidden="true">-</span>
                <span className="app-item-card__tag-pill">{item.tag}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="app-item-card__right">
        <span className="app-item-card__track-text">Track</span>
        <div className="app-item-card__chevron-wrap">
          <ChevronRightIcon />
        </div>
      </div>
    </article>
  )
}
