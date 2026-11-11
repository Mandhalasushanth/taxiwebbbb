import React from 'react'
import type { PaymentResult } from '@modules/gst/types/gst.types'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTFilingSuccessProps {
  details: PaymentResult
  businessName?: string
  onBack?: () => void
  onViewReceipt?: () => void
  onTrackApplication?: () => void
  onBackToDashboard?: () => void
  onContactSupport?: () => void
}

export const GSTFilingSuccess: React.FC<GSTFilingSuccessProps> = ({
  details,
  businessName,
  onTrackApplication,
  onBackToDashboard,
  onContactSupport,
}) => {
  const rawRef = details?.applicationRef || ''
  const displayAppId = rawRef || `GST-2026-${Math.floor(10000 + Math.random() * 90000)}`

  return (
    <GSTApplicationSubmitted
      applicationId={displayAppId}
      serviceType="GST Filing"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onBackToDashboard}
      onTrackApplications={onTrackApplication}
      onContactSupport={onContactSupport}
    />
  )
}

export default GSTFilingSuccess
