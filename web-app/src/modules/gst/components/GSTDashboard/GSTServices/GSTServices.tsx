import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildProfileCompletionPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { CompleteProfileModal } from '@shared/components'
import { GST_SERVICE_ROUTES, GST_SERVICE_ICON_IMAGE_MAP, type GstService } from '@modules/gst/constants/gstServices.constants'
import './GSTServices.css'

export interface GSTServicesProps {
  services: readonly GstService[]
}

const ServiceIconItem = ({ iconType, title }: { iconType: GstService['iconType']; title: string }) => {
  const [imgError, setImgError] = useState(false)
  const imageSrc = GST_SERVICE_ICON_IMAGE_MAP[iconType]

  if (imageSrc && !imgError) {
    return (
      <img
        src={imageSrc}
        alt={title}
        className="gst-service-card__icon-img"
        width={48}
        height={48}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    )
  }

  return getServiceIcon(iconType)
}

const getServiceIcon = (type: GstService['iconType']) => {
  switch (type) {
    case 'registration':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h18v14H3z" />
          <circle cx="8" cy="12" r="3" />
          <line x1="14" y1="10" x2="19" y2="10" />
          <line x1="14" y1="14" x2="19" y2="14" />
        </svg>
      )
    case 'filing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      )
    case 'compliance':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'cancellation':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" />
          <line x1="14.5" y1="14.5" x2="9.5" y2="9.5" />
        </svg>
      )
    case 'amendment':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    case 'certificate':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )
  }
}

export const GSTServices = ({ services }: GSTServicesProps) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState('')

  const handleStart = (service: GstService) => {
    const target = GST_SERVICE_ROUTES[service.iconType]
    if (!user?.isProfileComplete) {
      setSelectedTarget(target)
      setIsProfileModalOpen(true)
    } else {
      navigate(target)
    }
  }

  const handleConfirmProfile = () => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(selectedTarget), {
      state: { returnTo: selectedTarget, mobile: user?.mobile },
    })
  }

  return (
    <div className="gst-services-section">
      <div className="gst-services-section__header">
        <h2 className="gst-services-section__title">GST Services</h2>
        <p className="gst-services-section__subtitle">
          Select a service to start an application or manage your tax compliance
        </p>
      </div>

      <div className="gst-services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="gst-service-card"
            onClick={() => handleStart(service)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStart(service)
              }
            }}
          >
            <div className="gst-service-card__top">
              <div className={`gst-service-card__icon gst-icon-${service.iconType}`}>
                <ServiceIconItem iconType={service.iconType} title={service.title} />
              </div>
            </div>

            <h3 className="gst-service-card__title">{service.title}</h3>
            <p className="gst-service-card__description">{service.description}</p>

            <div className="gst-service-card__footer">
              <button
                type="button"
                className="gst-service-card__action"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStart(service)
                }}
                aria-label={`Start ${service.title}`}
              >
                <span>Start</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="gst-service-card__arrow">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onCompleteProfile={handleConfirmProfile}
      />
    </div>
  )
}
