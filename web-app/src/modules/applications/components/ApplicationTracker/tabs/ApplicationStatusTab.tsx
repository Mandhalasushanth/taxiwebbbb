import React from 'react'
import type { ApplicationTrackerData } from '../../../data/applicationTrackerData'

export interface ApplicationStatusTabProps {
  data: ApplicationTrackerData
}

const renderStepIcon = (idx: number) => {
  switch (idx) {
    case 0:
      // Document / FileText (Application Submitted)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 1:
      // Folder (Document Collection)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 2:
      // Shield with checkmark (Verification)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    case 3:
      // Credit card (Payment)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    case 4:
    default:
      // Award / Ribbon (Completed)
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )
  }
}

export const ApplicationStatusTab: React.FC<ApplicationStatusTabProps> = ({ data }) => {
  return (
    <div className="app-tracker-web-tab-content">
      {/* Top Banner Card: Application Submitted */}
      <div className="app-tracker-clean-card app-tracker-submitted-banner">
        <div className="app-tracker-submitted-left">
          <div className="app-tracker-submitted-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <h3 className="app-tracker-submitted-title">Application Submitted</h3>
            <p className="app-tracker-submitted-subtitle">
              Application submitted successfully on {data.appliedDate}.
            </p>
          </div>
        </div>
        <span className="app-tracker-pill-badge app-tracker-pill-badge--submitted">
          {data.rawApplication?.statusLabel || 'Submitted'}
        </span>
      </div>

      {/* Vertical Stepper Timeline Card */}
      <div className="app-tracker-clean-card app-tracker-stepper-card">
        <div className="app-tracker-stepper">
          {data.timelineSteps.map((step, idx) => {
            const isLast = idx === data.timelineSteps.length - 1
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'
            const isPending = step.status === 'pending'

            const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
            const lineClass = isCompleted ? 'app-tracker-stepper-line--active' : ''
            const pillBadgeClass = isCompleted
              ? 'app-tracker-pill-badge--completed'
              : isCurrent
              ? 'app-tracker-pill-badge--progress'
              : 'app-tracker-pill-badge--pending'
            const pillText = isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'

            return (
              <div key={step.stepNumber || idx} className="app-tracker-stepper-row">
                <div className="app-tracker-stepper-indicator-col">
                  <div className={`app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--step-${idx} app-tracker-stepper-icon-circle--${statusClass}`}>
                    {renderStepIcon(idx)}
                  </div>
                  {!isLast && <div className={`app-tracker-stepper-line app-tracker-stepper-line--step-${idx} ${lineClass}`} />}
                </div>
                <div className="app-tracker-stepper-content">
                  <div className="app-tracker-stepper-header-row">
                    <h4 className={`app-tracker-stepper-title ${isPending ? 'app-tracker-stepper-title--pending' : ''}`}>
                      {step.title}
                    </h4>
                    <span className={`app-tracker-pill-badge ${pillBadgeClass}`}>
                      {pillText}
                    </span>
                  </div>
                  {step.timestamp && <span className="app-tracker-stepper-date">{step.timestamp}</span>}
                  <p className="app-tracker-stepper-desc">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="app-tracker-clean-card app-tracker-info-banner">
        <div className="app-tracker-info-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <h4 className="app-tracker-info-banner-title">Application received</h4>
          <p className="app-tracker-info-banner-desc">
            Your application was received on {data.appliedDate} and is queued for verification.
          </p>
        </div>
      </div>
    </div>
  )
}
