import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import type { PaymentResult } from '@modules/gst/types/gst.types'
import './GSTFilingSuccess.css'

export interface GSTFilingSuccessProps {
  details: PaymentResult
  businessName?: string
  onBack?: () => void
  onViewReceipt?: () => void
  onTrackApplication?: () => void
  onBackToDashboard?: () => void
  onContactSupport?: () => void
}

interface TimelineStep {
  id: number
  title: string
  subtitle: string
  status: 'completed' | 'active' | 'pending'
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    title: 'Customer Request',
    subtitle: 'Filing request initiated',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Document Upload',
    subtitle: 'Sales & purchase registers submitted',
    status: 'completed',
  },
  {
    id: 3,
    title: 'Staff Verification',
    subtitle: 'Chartered Accountant reviewing invoices',
    status: 'active',
  },
  {
    id: 4,
    title: 'Data Preparation',
    subtitle: 'Accounting integration & ledger extraction',
    status: 'pending',
  },
  {
    id: 5,
    title: 'Return Preparation',
    subtitle: 'Form computation & ITC reconciliation',
    status: 'pending',
  },
  {
    id: 6,
    title: 'Customer Review',
    subtitle: 'Tax summary shared with business',
    status: 'pending',
  },
  {
    id: 7,
    title: 'Customer Approval',
    subtitle: 'Client signs off return computation',
    status: 'pending',
  },
  {
    id: 8,
    title: 'GST Filing Submission',
    subtitle: 'Return submitted to GSTN portal',
    status: 'pending',
  },
  {
    id: 9,
    title: 'Acknowledgement Receipt',
    subtitle: 'ARN generated & filed copy delivered',
    status: 'pending',
  },
  {
    id: 10,
    title: 'Filing Completed',
    subtitle: 'Compliance verified & closed',
    status: 'pending',
  },
]

export const GSTFilingSuccess: React.FC<GSTFilingSuccessProps> = ({
  details,
  businessName,
  onTrackApplication,
  onBackToDashboard,
  onContactSupport,
}) => {
  const navigate = useNavigate()

  const rawRef = details.applicationRef || ''
  const displayAppId = rawRef ? (rawRef.startsWith('FIL') ? rawRef : `FIL${rawRef.replace(/\D/g, '').slice(-6) || '165073'}`) : 'FIL165073'
  const displayBusiness = businessName?.trim() || 'Shree Deshmukh Traders'

  // Register filing application in user storage for tracking
  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === displayAppId)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-filing-${Date.now()}`,
          code: displayAppId,
          title: 'GST Filing',
          meta: `${displayBusiness} · India`,
          statusLabel: 'Under Verification',
          statusTone: 'warning',
          progress: 30,
          icon: '📊',
          to: routePaths.applicationTrack(displayAppId),
        })
      }
    } catch {
      // Storage write fallback
    }
  }, [displayAppId, displayBusiness])

  const handleDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard()
    } else {
      navigate(routePaths.dashboard)
    }
  }

  const handleTrackInApplications = () => {
    if (onTrackApplication) {
      onTrackApplication()
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
    <div className="gst-filing-status-container">
      {/* Top Header Bar */}
      <header className="gst-filing-status-header">
        <h1 className="gst-filing-status-title">Application Status</h1>
      </header>

      {/* 1. Green Success Alert Banner */}
      <div className="gst-filing-status-alert">
        <div className="gst-filing-status-alert__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="gst-filing-status-alert__text">
          <h2 className="gst-filing-status-alert__title">Application Submitted!</h2>
          <p className="gst-filing-status-alert__subtitle">
            Your GST application has been successfully filed with TaxEdge.
          </p>
        </div>
      </div>

      {/* 2. Dark Navy Summary Card */}
      <section className="gst-filing-status-navy-card" aria-label="Application Summary">
        <div className="gst-filing-status-navy-card__top">
          <div className="gst-filing-status-navy-card__id-group">
            <span className="gst-filing-status-navy-card__id-label">APPLICATION ID</span>
            <span className="gst-filing-status-navy-card__id-value">{displayAppId}</span>
          </div>
          <span className="gst-filing-status-navy-card__badge">Under Verification</span>
        </div>

        <div className="gst-filing-status-navy-card__divider" />

        <div className="gst-filing-status-navy-card__grid">
          <div className="gst-filing-status-navy-card__col">
            <span className="gst-filing-status-navy-card__label">Business</span>
            <span className="gst-filing-status-navy-card__val" title={displayBusiness}>
              {displayBusiness}
            </span>
          </div>
          <div className="gst-filing-status-navy-card__col">
            <span className="gst-filing-status-navy-card__label">Applied On</span>
            <span className="gst-filing-status-navy-card__val">Today</span>
          </div>
          <div className="gst-filing-status-navy-card__col">
            <span className="gst-filing-status-navy-card__label">Est. Completion</span>
            <span className="gst-filing-status-navy-card__val">1-2 Business Days</span>
          </div>
        </div>
      </section>

      {/* 3. Application Progress Section */}
      <section className="gst-filing-status-progress" aria-label="Application Progress">
        <h3 className="gst-filing-status-progress__heading">Application Progress</h3>

        <div className="gst-filing-status-timeline">
          {TIMELINE_STEPS.map((step, idx) => {
            const isLast = idx === TIMELINE_STEPS.length - 1
            return (
              <div key={step.id} className="gst-filing-timeline-item">
                <div className="gst-filing-timeline-track">
                  <div className={`gst-filing-timeline-circle gst-filing-timeline-circle--${step.status}`}>
                    {step.status === 'completed' && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="gst-filing-timeline-check"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {step.status === 'active' && (
                      <span className="gst-filing-timeline-active-dot" />
                    )}
                    {step.status === 'pending' && (
                      <span className="gst-filing-timeline-pending-dot" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`gst-filing-timeline-line ${
                        step.status === 'completed' ? 'gst-filing-timeline-line--completed' : ''
                      }`}
                    />
                  )}
                </div>

                <div className="gst-filing-timeline-content">
                  <h4 className={`gst-filing-timeline-title gst-filing-timeline-title--${step.status}`}>
                    {step.title}
                  </h4>
                  <p className={`gst-filing-timeline-subtitle gst-filing-timeline-subtitle--${step.status}`}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Action Buttons Stack */}
      <div className="gst-filing-status-actions">
        <button
          type="button"
          className="gst-filing-status-btn gst-filing-status-btn--dashboard"
          onClick={handleDashboard}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Go to Home Dashboard</span>
        </button>

        <button
          type="button"
          className="gst-filing-status-btn gst-filing-status-btn--track"
          onClick={handleTrackInApplications}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Track in My Applications</span>
        </button>

        <button
          type="button"
          className="gst-filing-status-btn gst-filing-status-btn--support"
          onClick={handleContactSupport}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Contact Support / CA</span>
        </button>
      </div>
    </div>
  )
}

export default GSTFilingSuccess
