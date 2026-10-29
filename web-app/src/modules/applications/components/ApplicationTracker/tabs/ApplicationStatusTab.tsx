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
        <span className="app-tracker-pill-badge app-tracker-pill-badge--submitted">Submitted</span>
      </div>

      {/* Vertical Stepper Timeline Card */}
      <div className="app-tracker-clean-card app-tracker-stepper-card">
        <div className="app-tracker-stepper">
          {/* Step 1: Filing Data Submitted */}
          <div className="app-tracker-stepper-row">
            <div className="app-tracker-stepper-indicator-col">
              <div className="app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="app-tracker-stepper-line app-tracker-stepper-line--active" />
            </div>
            <div className="app-tracker-stepper-content">
              <div className="app-tracker-stepper-header-row">
                <h4 className="app-tracker-stepper-title">Filing Data Submitted</h4>
                <span className="app-tracker-pill-badge app-tracker-pill-badge--completed">Completed</span>
              </div>
              <span className="app-tracker-stepper-date">{data.appliedDate}</span>
              <p className="app-tracker-stepper-desc">Sales, purchase &amp; turnover details received</p>
            </div>
          </div>

          {/* Step 2: Document Collection */}
          <div className="app-tracker-stepper-row">
            <div className="app-tracker-stepper-indicator-col">
              <div className="app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--current">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="app-tracker-stepper-line" />
            </div>
            <div className="app-tracker-stepper-content">
              <div className="app-tracker-stepper-header-row">
                <h4 className="app-tracker-stepper-title">Document Collection</h4>
                <span className="app-tracker-pill-badge app-tracker-pill-badge--progress">In Progress</span>
              </div>
              <p className="app-tracker-stepper-desc">Input Tax Credit &amp; invoice records checked</p>
            </div>
          </div>

          {/* Step 3: Verification */}
          <div className="app-tracker-stepper-row">
            <div className="app-tracker-stepper-indicator-col">
              <div className="app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="app-tracker-stepper-line" />
            </div>
            <div className="app-tracker-stepper-content">
              <div className="app-tracker-stepper-header-row">
                <h4 className="app-tracker-stepper-title app-tracker-stepper-title--pending">Verification</h4>
                <span className="app-tracker-pill-badge app-tracker-pill-badge--pending">Pending</span>
              </div>
              <p className="app-tracker-stepper-desc">CA reconciliation and return computation</p>
            </div>
          </div>

          {/* Step 4: Completed */}
          <div className="app-tracker-stepper-row">
            <div className="app-tracker-stepper-indicator-col">
              <div className="app-tracker-stepper-icon-circle app-tracker-stepper-icon-circle--pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
            </div>
            <div className="app-tracker-stepper-content">
              <div className="app-tracker-stepper-header-row">
                <h4 className="app-tracker-stepper-title app-tracker-stepper-title--pending">Completed</h4>
                <span className="app-tracker-pill-badge app-tracker-pill-badge--pending">Pending</span>
              </div>
              <p className="app-tracker-stepper-desc">Portal e-filing confirmed and ARN generated</p>
            </div>
          </div>
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
