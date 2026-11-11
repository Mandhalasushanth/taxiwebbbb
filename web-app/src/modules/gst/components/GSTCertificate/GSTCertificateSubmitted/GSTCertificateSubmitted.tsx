import React from 'react'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTCertificateSubmittedProps {
  applicationId?: string
  gstin?: string
  businessName?: string
  requestType?: string
  onBackToForm?: (section?: string) => void
  onAllForms?: () => void
  onContactSupport?: () => void
}

export const GSTCertificateSubmitted: React.FC<GSTCertificateSubmittedProps> = ({
  applicationId,
  businessName,
  onAllForms,
  onContactSupport,
}) => {
  const displayAppId = applicationId || `GST-2026-${Math.floor(10000 + Math.random() * 90000)}`

  return (
    <GSTApplicationSubmitted
      applicationId={displayAppId}
      serviceType="GST Certificate"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onAllForms}
      onTrackApplications={onAllForms}
      onContactSupport={onContactSupport}
    />
  )
}

export default GSTCertificateSubmitted
