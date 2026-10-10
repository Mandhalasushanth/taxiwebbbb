import React, { useState, useEffect } from 'react'
import { orNotAvailable } from '@modules/gst/services/gstProfileService'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import './GSTSuccessView.css'

interface GSTSuccessViewProps {
  applicationId: string
  requestType: string
  gstin: string
  onReset?: () => void
}

export const GSTSuccessView: React.FC<GSTSuccessViewProps> = ({
  applicationId,
  requestType,
  gstin,
  onReset,
}) => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const [copied, setCopied] = useState(false)

  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const refId = applicationId

  // Scroll to top immediately when success view mounts
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      // window fallback
    }
  }, [])

  // Persist into user applications so application tracker can display it
  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === refId)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-gstc-${Date.now()}`,
          code: refId,
          title: `GST Compliance — ${requestType || 'Notice Response'}`,
          meta: `${gstin || 'TaxEdge Customer'} · Active`,
          statusLabel: 'Submitted',
          statusTone: 'info',
          progress: 25,
          icon: '📄',
          to: routePaths.applicationTrack(refId),
        })
      }
    } catch {
      // storage fallback
    }
  }, [refId, requestType, gstin])

  const handleCopy = () => {
    navigator.clipboard.writeText(refId)
    setCopied(true)
    pushToast('Reference ID copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTrackRequest = () => {
    navigate(routePaths.applicationTrack(refId))
  }

  const handleDashboard = () => {
    if (onReset) onReset()
    navigate(routePaths.dashboard)
  }

  const reviewTargetText =
    requestType === 'Reconciliation Support'
      ? 'uploaded purchase & sales registers.'
      : 'uploaded documents and notice details.'

  return (
    <div className="gst-success-page-container">
      {/* Top Green Check Mark Badge with Confetti Sparks */}
      <div className="gst-success-badge-wrapper">
        <span className="gst-spark spark-top-left" />
        <span className="gst-spark spark-top-right" />
        <span className="gst-spark spark-bottom-left" />
        <span className="gst-spark spark-bottom-right" />
        <div className="gst-success-badge-ring-outer">
          <div className="gst-success-badge-ring-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" width="34" height="34">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title & Subtitle */}
      <h2 className="gst-success-main-title">Request Submitted Successfully</h2>
      <p className="gst-success-main-subtitle">
        Your GST Compliance request has been submitted successfully. Our CA team will review your documents and contact you shortly.
      </p>

      {/* Details Card */}
      <div className="gst-success-card gst-success-details-card">
        {/* Reference ID Centered Hero Section */}
        <div className="gst-success-ref-section">
          <span className="gst-success-meta-label">REFERENCE ID</span>
          <div className="gst-success-ref-pill">
            <span className="gst-success-ref-id">{refId}</span>
            <button
              type="button"
              className="gst-success-copy-btn"
              onClick={handleCopy}
              title="Copy Reference ID"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="gst-success-card-divider" />

        {/* 4-Column Responsive Stats Grid across full width */}
        <div className="gst-success-stats-grid">
          {/* 1. Submitted On */}
          <div className="gst-success-grid-item">
            <div className="gst-meta-icon-badge blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="gst-meta-content">
              <span className="gst-success-meta-label">SUBMITTED ON</span>
              <span className="gst-success-meta-value">{formattedDate}</span>
              <span className="gst-meta-subtime">{formattedTime}</span>
            </div>
          </div>

          {/* 2. Estimated Response */}
          <div className="gst-success-grid-item">
            <div className="gst-meta-icon-badge green">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="gst-meta-content">
              <span className="gst-success-meta-label">ESTIMATED RESPONSE</span>
              <span className="gst-success-meta-value gst-text-blue">Within 24 Hours</span>
            </div>
          </div>

          {/* 3. Request Type */}
          <div className="gst-success-grid-item">
            <div className="gst-meta-icon-badge orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="gst-meta-content">
              <span className="gst-success-meta-label">REQUEST TYPE</span>
              <span className="gst-success-meta-value">{requestType || 'Notice Response'}</span>
            </div>
          </div>

          {/* 4. GSTIN */}
          <div className="gst-success-grid-item">
            <div className="gst-meta-icon-badge purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-3" />
                <path d="M9 9h.01" />
                <path d="M9 13h.01" />
                <path d="M9 17h.01" />
              </svg>
            </div>
            <div className="gst-meta-content">
              <span className="gst-success-meta-label">GSTIN</span>
              <span className="gst-success-meta-value gst-mono-text" title={orNotAvailable(gstin)}>
                {orNotAvailable(gstin)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What Happens Next Card */}
      <div className="gst-success-next-card-blue">
        <div className="gst-next-card-header">
          <div className="gst-next-info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="none" />
              <path d="M12 16v-4m0-4h.01" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="gst-next-card-title">What happens next?</h3>
        </div>

        <ul className="gst-next-card-list">
          <li>
            <span className="gst-bullet-dot" />
            <span>A certified Chartered Accountant will review your {reviewTargetText}</span>
          </li>
          <li>
            <span className="gst-bullet-dot" />
            <span>You will receive an update in your TaxEdge Notifications and WhatsApp within 24 hours.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons Row: Left = Track Request, Right = Go to Dashboard */}
      <div className="gst-success-actions-row">
        <button
          type="button"
          className="gst-success-btn-track"
          onClick={handleTrackRequest}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="gst-success-btn-icon">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span>Track Request</span>
        </button>

        <button
          type="button"
          className="gst-success-btn-dashboard"
          onClick={handleDashboard}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="gst-success-btn-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  )
}

export default GSTSuccessView
