import React from 'react'
import type { PaymentResult } from '@modules/gst/types/gstPayment.types'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTPaymentSuccessProps {
  details: PaymentResult
  businessName?: string
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

export const GSTPaymentSuccess: React.FC<GSTPaymentSuccessProps> = ({
  details,
  businessName,
  onBackToDashboard,
  onTrackApplications,
  onContactSupport,
}) => {
  const appRef = details?.applicationRef || ''

  return (
    <GSTApplicationSubmitted
      applicationId={appRef}
      serviceType="GST Registration"
      businessName={businessName}
      appliedOn="Today"
      estCompletion="3–5 Business Days"
      statusBadge="Under Verification"
      onBackToDashboard={onBackToDashboard}
      onTrackApplications={onTrackApplications}
      onContactSupport={onContactSupport}
    />
  )
}

export default GSTPaymentSuccess
