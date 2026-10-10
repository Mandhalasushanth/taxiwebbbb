import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import type { PaymentResult } from '@modules/gst/types/gstPayment.types'
import { GSTStatusTimeline } from './GSTStatusTimeline'
import './GSTPaymentSuccess.css'
import './GSTPaymentSuccess.timeline.css'

export interface GSTPaymentSuccessProps {
  details: PaymentResult
  businessName?: string
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

export const GSTPaymentSuccess: React.FC<GSTPaymentSuccessProps> = ({
  details,
  businessName,
  onBackToDashboard,
  onTrackApplications,
  onContactSupport,
}) => {
  const navigate = useNavigate()

  const appRef = details.applicationRef || ''
  const displayBusinessName = businessName || 'Your Business'

  // Ensure this newly submitted/viewed registration appears under My Applications
  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === appRef)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-gst-${Date.now()}`,
          code: appRef,
          title: 'GST Registration',
          meta: `${displayBusinessName} · India`,
          statusLabel: 'Submitted',
          statusTone: 'info',
          progress: 25,
          icon: '📄',
          to: routePaths.applicationTrack(appRef),
        })
      }
    } catch {
      // Storage write fallback
    }
  }, [appRef, displayBusinessName])

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
          <h2 className="gst-status-alert__title">Application Submitted!</h2>
          <p className="gst-status-alert__desc">
            Your GST application has been successfully filed with TaxEdge.
          </p>
        </div>
        <div className="gst-status-alert__tag">
          <span>⚡ Est. Completion: 3–5 Business Days</span>
        </div>
      </div>

      {/* 2. Full-Width Deep Navy Application Summary Card */}
      <section className="gst-status-summary-card" aria-label="Application Summary">
        <div className="gst-status-summary-card__top">
          <div className="gst-status-summary-card__id-group">
            <span className="gst-status-summary-card__id-label">APPLICATION ID</span>
            <span className="gst-status-summary-card__id-value">{appRef}</span>
          </div>
          <span className="gst-status-summary-card__badge">Under Verification</span>
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
            <strong className="gst-status-summary-card__meta-value">Today</strong>
          </div>
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Service Type</span>
            <strong className="gst-status-summary-card__meta-value">GST Registration</strong>
          </div>
          <div className="gst-status-summary-card__meta-item">
            <span className="gst-status-summary-card__meta-label">Est. Completion</span>
            <strong className="gst-status-summary-card__meta-value">3–5 Business Days</strong>
          </div>
        </div>
      </section>

      {/* 3. Full-Width Application Progress Tracker */}
      <div className="gst-status-tracker-fullwidth">
        <GSTStatusTimeline />
      </div>

      {/* 4. Bottom Action Buttons in ONE Full-Width Row */}
      <div className="gst-status-bottom-actions-row">
        <button
          type="button"
          className="gst-status-btn gst-status-btn--track"
          onClick={handleTrackInApplications}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gst-status-btn-icon"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Track in My Applications</span>
        </button>

        <button
          type="button"
          className="gst-status-btn gst-status-btn--dashboard"
          onClick={handleDashboard}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="gst-status-btn-icon"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Go to Home Dashboard</span>
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
      </div>
    </div>
  )
}

export default GSTPaymentSuccess
