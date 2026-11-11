import React from 'react'
import { GSTApplicationSubmitted } from '@modules/gst/shared/GSTApplicationSubmitted/GSTApplicationSubmitted'

export interface GSTAmendmentSubmittedProps {
  arnNumber?: string
  submissionDateText?: string
  requestedSection?: string
  gstin?: string
  businessName?: string
  estimatedCompletion?: string
  onTrackAmendment?: () => void
  onOpenMyApplications?: () => void
  onGoToDashboard?: () => void
  onContactSupport?: () => void
}

export const GSTAmendmentSubmitted: React.FC<GSTAmendmentSubmittedProps> = ({
  arnNumber = 'AA2993436247',
  businessName,
  estimatedCompletion = '3–5 Business Days',
  onTrackAmendment,
  onOpenMyApplications,
  onGoToDashboard,
  onContactSupport,
}) => {
  return (
    <GSTApplicationSubmitted
      applicationId={arnNumber}
      serviceType="GST Amendment"
      businessName={businessName}
      appliedOn="Today"
      estCompletion={estimatedCompletion}
      statusBadge="Under Verification"
      onBackToDashboard={onGoToDashboard || onOpenMyApplications}
      onTrackApplications={onTrackAmendment || onOpenMyApplications}
      onContactSupport={onContactSupport}
    />
  )
}

export default GSTAmendmentSubmitted
