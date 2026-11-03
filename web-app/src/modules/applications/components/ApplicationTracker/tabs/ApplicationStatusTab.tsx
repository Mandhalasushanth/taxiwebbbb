import React from 'react'
import type { ApplicationTrackerData } from '../../../data/applicationTrackerData'

export interface ApplicationStatusTabProps {
  data: ApplicationTrackerData
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
        <span className={`app-tracker-pill-badge ${data.rawApplication?.statusTone ? `app-tracker-pill-badge--${data.rawApplication.statusTone}` : 'app-tracker-pill-badge--submitted'}`}>
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
                  <div className={`app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--${statusClass}`}>
                    {isCompleted ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <circle cx="12" cy="12" r="9" />
                        <text x="12" y="16" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="700">
                          {step.stepNumber}
                        </text>
                      </svg>
                    )}
                  </div>
                  {!isLast && <div className={`app-tracker-stepper-line ${lineClass}`} />}
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
