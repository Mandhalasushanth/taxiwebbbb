import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTCancellationSubmittedProps {
  applicationId?: string
  gstin?: string
  businessName?: string
  cancellationDate?: string
  onBackToForm?: () => void
  onAllForms?: () => void
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

export const GSTCancellationSubmitted: React.FC<GSTCancellationSubmittedProps> = ({
  applicationId,
  businessName,
  onAllForms,
  onBackToDashboard,
  onTrackApplications,
  onContactSupport,
}) => {
  const navigate = useNavigate()
  const displayAppId = applicationId || `GST-2026-${Math.floor(10000 + Math.random() * 90000)}`

  return (
    <GSTApplicationSubmitted
      applicationId={displayAppId}
      serviceType="GST Cancellation"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onBackToDashboard || onAllForms || (() => navigate(routePaths.dashboard))}
      onTrackApplications={onTrackApplications || (() => navigate(routePaths.applications))}
      onContactSupport={onContactSupport || (() => navigate(routePaths.support))}
    />
  )
}

export default GSTCancellationSubmitted
