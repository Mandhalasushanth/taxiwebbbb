import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { getEntityStructureLabel, getProposedCompanyName } from '../../types/incorporation.types'
import './SubmissionSuccess.css'

export const SubmissionSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as Record<string, any>

  useEffect(() => {
    // Forward directly to Step 10: Application Tracking
    navigate(routePaths.incorporation.applicationTracking, { replace: true, state: location.state })
  }, [navigate, location.state])


  const companyType = state.companyType || 'pvt_ltd'
  const entityStructure = getEntityStructureLabel(companyType)
  const companyName = getProposedCompanyName(companyType, state.companyDetails?.firstPreferredName)
  const applicationId = state.applicationId || 'INC-2026-89421'


  const handleViewStatus = () => {
    navigate(routePaths.incorporation.applicationTracking, { state })
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
            Your company incorporation file has been received and assigned to a TaxEdge compliance officer.
          </p>
        </div>

        {/* Status Summary Card */}
        <section className="submit-success-card">
          <div className="submit-success-row">
            <span className="submit-success-row__label">Application ID</span>
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
            <span className="submit-success-row__label">Current Status</span>
            <span className="submit-success-row__val submit-success-status">Under Verification</span>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="submit-success-actions">
          <button
            type="button"
            className="submit-success-btn-primary"
            onClick={handleViewStatus}
          >
            View Application Status
          </button>
        </div>
      </div>
    </div>
  )
}
export default SubmissionSuccess
