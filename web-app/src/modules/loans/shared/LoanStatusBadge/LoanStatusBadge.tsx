import React from 'react'
import './LoanStatusBadge.css'

export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'REVIEW'

interface LoanStatusBadgeProps {
  status: LoanStatus
  className?: string
}

export const LoanStatusBadge: React.FC<LoanStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return { variantClass: 'loan-status-badge--approved', label: 'Approved' }
      case 'REJECTED':
        return { variantClass: 'loan-status-badge--rejected', label: 'Rejected' }
      case 'DISBURSED':
        return { variantClass: 'loan-status-badge--disbursed', label: 'Disbursed' }
      case 'REVIEW':
        return { variantClass: 'loan-status-badge--review', label: 'Under Review' }
      case 'PENDING':
      default:
        return { variantClass: 'loan-status-badge--pending', label: 'Pending' }
    }
  }

  const config = getStatusConfig()

  return (
    <span className={`loan-status-badge ${config.variantClass} ${className}`}>
      {config.label}
    </span>
  )
}

export default LoanStatusBadge

