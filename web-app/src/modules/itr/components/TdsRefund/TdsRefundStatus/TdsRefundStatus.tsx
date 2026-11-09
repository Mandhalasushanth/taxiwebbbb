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

export interface TimelineStage {
  num: number
  title: string
  desc: string
  status: 'completed' | 'active' | 'pending'
}

export const TIMELINE_STAGES: TimelineStage[] = [
  { num: 1, title: 'New Request Received', desc: 'Application submitted', status: 'completed' },
  { num: 2, title: 'Documents Received', desc: 'All documents uploaded', status: 'completed' },
  { num: 3, title: 'Under Verification', desc: 'Documents being verified by CA', status: 'active' },
  { num: 4, title: 'ITR Preparation', desc: 'Return computation by CA', status: 'pending' },
  { num: 5, title: 'Customer Approval', desc: 'Review and approve the return', status: 'pending' },
  { num: 6, title: 'ITR Filed', desc: 'Submitted on IT Department portal', status: 'pending' },
  { num: 7, title: 'E-Verification Pending', desc: 'Verify using Aadhaar OTP / DSC', status: 'pending' },
  { num: 8, title: 'Processing by IT Dept.', desc: 'Department processing', status: 'pending' },
  { num: 9, title: 'Refund Credited', desc: 'Direct credit to bank account', status: 'pending' },
]

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
