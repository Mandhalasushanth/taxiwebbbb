import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import './GSTApplicationSubmitted.css'

export interface GSTApplicationSubmittedProps {
  applicationId?: string
  serviceType: string
  businessName?: string
  appliedOn?: string
  estCompletion?: string
  statusBadge?: string
  title?: string
  subtitle?: string
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

export const GSTApplicationSubmitted: React.FC<GSTApplicationSubmittedProps> = ({
  applicationId,
  serviceType,
  businessName,
  appliedOn = 'Today',
  estCompletion = '3–5 Business Days',
  statusBadge = 'Under Verification',
  title = 'Application Submitted!',
  subtitle = 'Your GST application has been successfully filed with Finsolz.',
  onBackToDashboard,
  onTrackApplications,
  onContactSupport,
}) => {
  const navigate = useNavigate()

  const profile = gstProfileService.get()
  const displayBusinessName =
    businessName?.trim() ||
    profile.tradeName?.trim() ||
    profile.legalName?.trim() ||
    'sagarika traders'

  const displayAppId = applicationId?.trim() || `GST-2026-${Math.floor(10000 + Math.random() * 90000)}`

  // Scroll to top on mount
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      // ignore
    }
  }, [])

  // Auto-record into user applications so tracker shows it
  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === displayAppId)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-gst-${Date.now()}`,
          code: displayAppId,
          title: serviceType,
          meta: `${displayBusinessName} · India`,
          statusLabel: 'Submitted',
          statusTone: 'info',
          progress: 25,
          icon: '📄',
          to: routePaths.applicationTrack(displayAppId),
        })
      }
    } catch {
      // storage fallback
    }
  }, [displayAppId, serviceType, displayBusinessName])

  // Handle browser Back button on submitted page: navigate cleanly to dashboard
  useEffect(() => {
    try {
      window.history.pushState({ __submittedPage: true }, '', window.location.href)
    } catch {
      // ignore
    }

    const handlePopState = () => {
      navigate(routePaths.dashboard, { replace: true })
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  const handleDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard()
    } else {
      navigate(routePaths.dashboard)
    }
  }

  const handleTrackInApplications = () => {
    if (onTrackApplications) {
      onTrackApplications()
    } else {
      navigate(routePaths.applications)
    }
  }

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
    } else {
      navigate(routePaths.support)
    }
  }

  return (
    <div className="gst-status-page-container">
      {/* 1. Full-Width Success Alert Banner */}
      <div className="gst-status-alert-banner">
        <div className="gst-status-alert__icon-wrap">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gst-status-alert__check"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="gst-status-alert__content">
          <h2 className="gst-status-alert__title">{title}</h2>
          <p className="gst-status-alert__desc">{subtitle}</p>
        </div>
        <div className="gst-status-alert__tag">
          <span>⚡ Est. Completion: {estCompletion}</span>
        </div>
      </div>

      {/* 2. Full-Width Deep Navy Application Summary Card */}
      <section className="gst-status-summary-card" aria-label="Application Summary">
        <div className="gst-status-summary-card__top">
          <div className="gst-status-summary-card__id-group">
            <span className="gst-status-summary-card__id-label">APPLICATION ID</span>
            <span className="gst-status-summary-card__id-value">{displayAppId}</span>
          </div>
          <span className="gst-status-summary-card__badge">{statusBadge}</span>
        </div>

        <div className="gst-status-summary-card__meta-grid">
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Business Name</span>
            <strong className="gst-status-summary-card__meta-value" title={displayBusinessName}>
              {displayBusinessName}
            </strong>
          </div>
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Applied On</span>
            <strong className="gst-status-summary-card__meta-value">{appliedOn}</strong>
          </div>
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Service Type</span>
            <strong className="gst-status-summary-card__meta-value">{serviceType}</strong>
          </div>
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Est. Completion</span>
            <strong className="gst-status-summary-card__meta-value">{estCompletion}</strong>
          </div>
        </div>
      </section>

      {/* 3. Bottom Action Buttons in ONE Full-Width Row: Left: Dashboard, Middle: Support/CA, Right: Track */}
      <div className="gst-status-bottom-actions-row">
        <button
          type="button"
          className="gst-status-btn gst-status-btn--dashboard"
          onClick={handleDashboard}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="gst-status-btn-icon">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Go to Dashboard</span>
        </button>

        <button
          type="button"
          className="gst-status-btn gst-status-btn--support"
          onClick={handleContactSupport}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gst-status-btn-icon"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Contact Support / CA</span>
        </button>

        <button
          type="button"
          className="gst-status-btn gst-status-btn--track"
          onClick={handleTrackInApplications}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gst-status-btn-icon"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Track in My Applications</span>
        </button>
      </div>
    </div>
  )
}

export default GSTApplicationSubmitted
