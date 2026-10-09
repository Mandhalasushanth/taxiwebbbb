import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { buildProfileCompletionPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { CompleteProfileModal } from '@shared/components'
import { companyTypeOptions, companyRegistrationData } from '../../data/companyRegistrationData'
import type { CompanyEntityType } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './SelectCompanyType.css'

export const SelectCompanyType: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { updateFormData, goToStep } = useIncorporationFlow()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleStart = (typeId: CompanyEntityType) => {
    updateFormData({ companyType: typeId })

    if (!user?.isProfileComplete) {
      setIsProfileModalOpen(true)
      return
    }

    goToStep(routePaths.incorporation.companyDetails)
  }

  const handleConfirmProfile = () => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(routePaths.incorporation.companyDetails), {
      state: { returnTo: routePaths.incorporation.companyDetails, mobile: user?.mobile },
    })
  }

  const renderFallbackIcon = (icon: string) => {
    switch (icon) {
      case 'building':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <rect x="3" y="9" width="8" height="12" rx="1" />
            <rect x="13" y="4" width="8" height="17" rx="1" />
            <line x1="6" y1="12" x2="8" y2="12" />
            <line x1="6" y1="15" x2="8" y2="15" />
            <line x1="6" y1="18" x2="8" y2="18" />
            <line x1="16" y1="8" x2="18" y2="8" />
            <line x1="16" y1="12" x2="18" y2="12" />
            <line x1="16" y1="16" x2="18" y2="16" />
          </svg>
        )
      case 'user':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      case 'trending':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        )
      case 'briefcase':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      default:
        return null
    }
  }

  const CompanyTypeIconItem: React.FC<{
    image?: string
    title: string
    fallbackIcon: string
  }> = ({ image, title, fallbackIcon }) => {
    const [imgError, setImgError] = useState(false)

    if (image && !imgError) {
      return (
        <img
          src={image}
          alt={title}
          className="select-type-card__icon-img"
          width={54}
          height={54}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )
    }

    return renderFallbackIcon(fallbackIcon)
  }

  return (
    <div className="select-type-page">
      {/* Top Hero Banner */}
      <section className="select-type-banner" aria-labelledby="incorporation-banner-title">
        <div className="select-type-banner__content">
          <h1 id="incorporation-banner-title" className="select-type-banner__title">
            {companyRegistrationData.title}
          </h1>
          <p className="select-type-banner__subtitle">
            {companyRegistrationData.description}
          </p>
        </div>
      </section>

      {/* Entity Selection Cards Grid */}
      <main className="select-type-grid" aria-label="Company Type Options">
        {companyTypeOptions.map((opt) => (
          <div
            key={opt.id}
            className="select-type-card"
            onClick={() => handleStart(opt.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStart(opt.id)
              }
            }}
          >
              <div className="select-type-card__top">
                <div className={`select-type-card__icon-tile select-type-card__icon-tile--${opt.id}`}>
                  <CompanyTypeIconItem
                    image={opt.image}
                    title={opt.title}
                    fallbackIcon={opt.icon}
                  />
                </div>
              </div>

              <div className="select-type-card__body">
                <h2 className="select-type-card__title">{opt.title}</h2>
                <p className="select-type-card__desc">{opt.description}</p>
              </div>

              <div className="select-type-card__footer">
                <span className="select-type-card__badge">{opt.badge}</span>
                <span className="select-type-card__action-btn">
                  <span>Start</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="select-type-card__arrow"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
      </main>
      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onCompleteProfile={handleConfirmProfile}
      />
    </div>
  )
}

export default SelectCompanyType
