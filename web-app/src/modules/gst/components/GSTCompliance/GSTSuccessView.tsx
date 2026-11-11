import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTSuccessViewProps {
  applicationId: string
  requestType: string
  gstin?: string
  businessName?: string
  onReset?: () => void
  onBackToDashboard?: () => void
  onContactSupport?: () => void
  onTrackApplications?: () => void
}

export const GSTSuccessView: React.FC<GSTSuccessViewProps> = ({
  applicationId,
  businessName,
  onReset,
  onBackToDashboard,
  onContactSupport,
  onTrackApplications,
}) => {
  const navigate = useNavigate()

  return (
    <GSTApplicationSubmitted
      applicationId={applicationId}
      serviceType="GST Compliance"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onBackToDashboard || (() => {
        onReset?.()
        navigate(routePaths.dashboard)
      })}
      onTrackApplications={onTrackApplications || (() => {
        onReset?.()
        navigate(routePaths.applications)
      })}
      onContactSupport={onContactSupport || (() => {
        onReset?.()
        navigate(routePaths.support)
      })}
    />
  )
}

export default GSTSuccessView
