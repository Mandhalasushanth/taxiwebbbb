import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import './GSTAmendmentSubmitted.css'

interface GSTAmendmentSubmittedProps {
  arnNumber?: string
  submissionDateText?: string
  requestedSection?: string
  gstin?: string
  estimatedCompletion?: string
  onTrackAmendment?: () => void
  onOpenMyApplications?: () => void
  onGoToDashboard?: () => void
}

export const GSTAmendmentSubmitted: React.FC<GSTAmendmentSubmittedProps> = ({
  arnNumber = 'AA2993436247',
  submissionDateText = '',
  requestedSection = 'Legal Business Name',
  gstin = '29AAAAA0000F1Z2',
  estimatedCompletion = '15 Working Days',
  onTrackAmendment,
  onOpenMyApplications,
  onGoToDashboard,
}) => {
  const navigate = useNavigate()
  const displayDate = submissionDateText || new Date().toLocaleDateString('en-US')

  const handleTrack = () => {
    if (onTrackAmendment) {
      onTrackAmendment()
    } else {
      navigate(routePaths.applications)
    }
  }

  const handleDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard()
    } else if (onOpenMyApplications) {
      onOpenMyApplications()
    } else {
      navigate(routePaths.dashboard)
    }
  }

  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === arnNumber)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-amend-${Date.now()}`,
          code: arnNumber,
          title: 'GST Amendment',
          meta: `${requestedSection} · India`,
          statusLabel: 'Submitted',
          statusTone: 'info',
          progress: 25,
          icon: '📝',
          to: `/applications/track/${arnNumber}`,
        })
      }
    } catch {
      // storage write fallback
    }
  }, [arnNumber, requestedSection])

  return (
    <div className="gst-amend-submitted-container">
      {/* 1. Hero Checkmark Header */}
      <div className="gst-amend-submitted-hero">
        <div className="gst-amend-submitted-ring">
          <div className="gst-amend-submitted-inner-circle">
            <svg viewBox="0 0 24 24" className="gst-amend-check-svg">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h1 className="gst-amend-submitted-title">Amendment Submitted</h1>
        <p className="gst-amend-submitted-subtitle">
          Your GST amendment request has been successfully submitted.
        </p>
      </div>

      {/* 2. Mandatory Details Card Matching Design */}
      <div className="gst-amend-submitted-card">
        {/* Row 1: Application Type */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">Application Type</span>
          <span className="gst-amend-submitted-value">GST Amendment</span>
        </div>
        <div className="gst-amend-submitted-divider" />

        {/* Row 2: Field Amended */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">Field Amended</span>
          <span className="gst-amend-submitted-value">{requestedSection}</span>
        </div>
        <div className="gst-amend-submitted-divider" />

        {/* Row 3: GSTIN */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">GSTIN</span>
          <span className="gst-amend-submitted-value">{gstin}</span>
        </div>
        <div className="gst-amend-submitted-divider" />

        {/* Row 4: ARN */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">ARN</span>
          <span className="gst-amend-submitted-value gst-amend-submitted-value--arn">
            {arnNumber}
          </span>
        </div>
        <div className="gst-amend-submitted-divider" />

        {/* Row 5: Submission Date */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">Submission Date</span>
          <span className="gst-amend-submitted-value">{displayDate}</span>
        </div>
        <div className="gst-amend-submitted-divider" />

        {/* Row 6: Estimated Completion */}
        <div className="gst-amend-submitted-row">
          <span className="gst-amend-submitted-label">Estimated Completion</span>
          <span className="gst-amend-submitted-value">{estimatedCompletion}</span>
        </div>
      </div>

      {/* 3. Action Buttons - ONLY TWO BUTTONS AS REQUESTED */}
      <div className="gst-amend-submitted-actions-row">
        <button
          type="button"
          onClick={handleTrack}
          className="gst-amend-submitted-btn-orange"
        >
          Track My Application
        </button>

        <button
          type="button"
          onClick={handleDashboard}
          className="gst-amend-submitted-btn-navy"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default GSTAmendmentSubmitted
