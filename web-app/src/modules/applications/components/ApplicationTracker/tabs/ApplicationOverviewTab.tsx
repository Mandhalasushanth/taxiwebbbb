import React from 'react'
import type { ApplicationTrackerData } from '../../../data/applicationTrackerData'

export interface ApplicationOverviewTabProps {
  data: ApplicationTrackerData
  onNavigateToChat: () => void
}

export const ApplicationOverviewTab: React.FC<ApplicationOverviewTabProps> = ({
  data,
  onNavigateToChat,
}) => {
  return (
    <div className="app-tracker-web-tab-content">
      <h2 className="app-tracker-section-heading">Overview</h2>

      {/* Application Details Card */}
      <div className="app-tracker-clean-card">
        <h3 className="app-tracker-card-subtitle">Application Details</h3>
        <div className="app-tracker-details-list">
          <div className="app-tracker-detail-row">
            <div className="app-tracker-detail-label-group">
              <span className="app-tracker-detail-icon app-tracker-detail-icon--doc">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <span className="app-tracker-detail-label">Service</span>
            </div>
            <span className="app-tracker-detail-value">{data.title}</span>
          </div>

          <div className="app-tracker-detail-row">
            <div className="app-tracker-detail-label-group">
              <span className="app-tracker-detail-icon app-tracker-detail-icon--user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="app-tracker-detail-label">Application ID</span>
            </div>
            <span className="app-tracker-detail-value app-tracker-detail-value--bold">{data.appId}</span>
          </div>

          <div className="app-tracker-detail-row">
            <div className="app-tracker-detail-label-group">
              <span className="app-tracker-detail-icon app-tracker-detail-icon--calendar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span className="app-tracker-detail-label">Submission Date</span>
            </div>
            <span className="app-tracker-detail-value">{data.appliedDate}</span>
          </div>

          <div className="app-tracker-detail-row">
            <div className="app-tracker-detail-label-group">
              <span className="app-tracker-detail-icon app-tracker-detail-icon--shield">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="app-tracker-detail-label">Status</span>
            </div>
            <span className="app-tracker-detail-status-green">Submitted</span>
          </div>
        </div>
      </div>

      {/* What happens next? Card */}
      <div className="app-tracker-clean-card app-tracker-clean-card--next">
        <div className="app-tracker-next-top">
          <div className="app-tracker-clock-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="app-tracker-next-body">
            <h4 className="app-tracker-next-title">What happens next?</h4>
            <p className="app-tracker-next-desc">
              Your application has been submitted successfully. We'll notify you when its status changes.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="app-tracker-next-chat-link"
          onClick={onNavigateToChat}
        >
          <span>Have questions? Chat with CA &gt;</span>
        </button>
      </div>
    </div>
  )
}
