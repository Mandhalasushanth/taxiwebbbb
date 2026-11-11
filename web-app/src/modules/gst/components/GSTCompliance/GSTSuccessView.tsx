import React from 'react'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTSuccessViewProps {
  applicationId: string
  requestType: string
  gstin?: string
  businessName?: string
  onReset?: () => void
  onContactSupport?: () => void
  onTrackApplications?: () => void
}

export const GSTSuccessView: React.FC<GSTSuccessViewProps> = ({
  applicationId,
  businessName,
  onReset,
  onContactSupport,
  onTrackApplications,
}) => {
  return (
    <GSTApplicationSubmitted
      applicationId={applicationId}
      serviceType="GST Compliance"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onReset}
      onTrackApplications={onTrackApplications}
      onContactSupport={onContactSupport}
    />
  )
}

export default GSTSuccessView
