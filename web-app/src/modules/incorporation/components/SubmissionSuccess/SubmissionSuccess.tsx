import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { getEntityStructureLabel } from '../../types/incorporation.types'
import { userStorage } from '@core/storage/userStorage'
import { useIncorporationFlow } from '../../hooks'
import './SubmissionSuccess.css'

export const SubmissionSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { formData, draft } = useIncorporationFlow()
  const state = (location.state || {}) as Record<string, any>

  const companyType = state.companyType || formData.companyType || 'pvt_ltd'
  const entityStructure = getEntityStructureLabel(companyType)
  const preferredName = (
    state.companyDetails?.firstPreferredName ||
    formData.companyDetails?.firstPreferredName ||
    ''
  ).trim()
  const companyName = preferredName || entityStructure
  const applicationId = state.applicationId || formData.applicationId || 'INC-800419'
  const submissionDate = state.submissionDate || new Date().toISOString().split('T')[0]

  const persistApplication = React.useCallback(() => {
    if (applicationId) {
      try {
        userStorage.saveUserApplication({
          id: applicationId,
          code: applicationId,
          title: `${companyName} Incorporation`,
          meta: `${entityStructure} · India`,
          statusLabel: 'Submitted',
          statusTone: 'info',
          progress: 25,
          icon: '🏢',
          to: routePaths.applicationTrack(applicationId),
        })
      } catch {
        // Storage write fallback
      }
    }
  }, [applicationId, companyName, entityStructure])

  React.useEffect(() => {
    draft?.clearDraft?.()
    persistApplication()
  }, [draft, persistApplication])

  const handleGoToDashboard = () => {
    draft?.clearDraft?.()
    persistApplication()
    navigate(routePaths.dashboard)
  }

  const handleTrackApplication = () => {
    draft?.clearDraft?.()
    persistApplication()
    navigate(routePaths.applications)
  }

  return (
    <div className="submit-success-page">
      <div className="submit-success-content">
        {/* Green Checkmark Circle */}
        <div className="submit-success-icon-wrap">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Header */}
        <div className="submit-success-header">
          <h1 className="submit-success-header__title">Application Submitted Successfully!</h1>
          <p className="submit-success-header__subtitle">
            Your company incorporation application has been submitted successfully.
          </p>
        </div>

        {/* Status Summary Card */}
        <section className="submit-success-card">
          <div className="submit-success-row">
            <span className="submit-success-row__label">Application Reference Number</span>
            <span className="submit-success-row__val submit-success-id">{applicationId}</span>
          </div>
          <div className="submit-success-row">
            <span className="submit-success-row__label">Proposed Company Name</span>
            <span className="submit-success-row__val">{companyName}</span>
          </div>
          <div className="submit-success-row">
            <span className="submit-success-row__label">Entity Structure</span>
            <span className="submit-success-row__val">{entityStructure}</span>
          </div>
          <div className="submit-success-row">
            <span className="submit-success-row__label">Submission Date</span>
            <span className="submit-success-row__val">{submissionDate}</span>
          </div>
          <div className="submit-success-row">
            <span className="submit-success-row__label">Current Status</span>
            <span className="submit-success-row__val submit-success-status">Submitted</span>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="submit-success-actions">
          <button
            type="button"
            className="submit-success-btn-primary"
            onClick={handleGoToDashboard}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '8px' }}
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Go to Dashboard</span>
          </button>
          <button
            type="button"
            className="submit-success-btn-secondary"
            onClick={handleTrackApplication}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '8px' }}
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Track Application</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmissionSuccess
