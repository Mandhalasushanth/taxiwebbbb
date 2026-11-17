import React from 'react'
import {
  ItrUnifiedApplicationStatusView,
  formatDisplayDate,
} from '../../ItrFiling/FilingSubmitted/ItrFilingSubmittedView'
import './TdsRefundStatus.css'

export interface TdsRefundStatusProps {
  applicationId?: string
  appliedDate?: string | Date
  assessmentYear?: string
  customerName?: string
  onBack?: () => void
  onBackToDashboard?: () => void
  onContactSupport?: () => void
}

export const formatAppliedDate = (dateInput?: string | Date): string => {
  return formatDisplayDate(dateInput)
}

export const TdsRefundStatus: React.FC<TdsRefundStatusProps> = ({
  applicationId = 'TDS87F6ACDC716E',
  appliedDate,
  customerName,
  onBack,
  onBackToDashboard,
  onContactSupport,
}) => {
  return (
    <ItrUnifiedApplicationStatusView
      title="TDS Refund"
      serviceName="TDS Refund"
      applicationId={applicationId}
      customerName={customerName}
      appliedDate={appliedDate || new Date()}
      estCompletion="1-2 Business Days"
      statusBadge="Under Verification"
      onBack={onBack}
      onBackToDashboard={onBackToDashboard}
      onContactSupport={onContactSupport}
    />
  )
}

export default TdsRefundStatus
