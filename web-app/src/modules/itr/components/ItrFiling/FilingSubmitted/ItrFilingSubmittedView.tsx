import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import { getStoredTaxpayerProfile, type FilingBankAccount } from '../itrFiling.constants'
import './ItrFilingSubmittedView.css'

export interface ItrUnifiedApplicationStatusProps {
  title?: string
  serviceName: string
  applicationId: string
  customerName?: string
  appliedDate?: string | Date
  estCompletion?: string
  statusBadge?: string
  onBack?: () => void
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

export const formatDisplayDate = (d?: string | Date): string => {
  try {
    const date = d ? new Date(d) : new Date()
    const validDate = isNaN(date.getTime()) ? new Date() : date
    const day = String(validDate.getDate()).padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[validDate.getMonth()]
    const year = validDate.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return '05 Nov 2026'
  }
}

export const ItrUnifiedApplicationStatusView: React.FC<ItrUnifiedApplicationStatusProps> = ({
  serviceName,
  applicationId,
  customerName,
  appliedDate,
  estCompletion = '1-2 Business Days',
  statusBadge = 'Under Verification',
  onBackToDashboard,
  onTrackApplications,
  onContactSupport,
}) => {
  const navigate = useNavigate()
  const authUser = useAuthStore((s) => s.user)
  const profile = getStoredTaxpayerProfile(authUser)

  const resolvedCustomer =
    customerName?.trim() ||
    profile?.fullName?.trim() ||
    authUser?.fullName?.trim() ||
    'Sagarika Jena'

  const formattedDate = formatDisplayDate(appliedDate)

  const handleDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard()
    } else {
      navigate(routePaths.dashboard)
    }
  }

  const handleTrack = () => {
    if (onTrackApplications) {
      onTrackApplications()
    } else if (applicationId) {
      navigate(routePaths.applicationTrack(applicationId))
    } else {
      navigate(routePaths.applications)
    }
  }

  const handleSupport = () => {
    if (onContactSupport) {
      onContactSupport()
    } else {
      navigate(routePaths.support)
    }
  }

  return (
    <div className="itr-status-page" data-testid="itr-unified-status-page">
      <div className="itr-status-container">
        {/* Green Banner: Application Submitted! */}
        <div className="itr-status-success-banner" data-testid="status-success-banner">
          <div className="itr-status-check-circle" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="itr-status-banner-text">
            <h3 className="itr-status-banner-title">Application Submitted!</h3>
            <p className="itr-status-banner-desc">
              Your {serviceName} application has been successfully filed with Finsolz.
            </p>
          </div>
        </div>

        {/* Navy Card */}
        <div className="itr-status-navy-card" data-testid="status-navy-card">
          <div className="itr-status-card-header">
            <div>
              <span className="itr-status-app-id-label">APPLICATION ID</span>
              <h2 className="itr-status-app-id-val" data-testid="status-app-id">{applicationId}</h2>
            </div>
            <span className="itr-status-badge" data-testid="status-badge-text">{statusBadge}</span>
          </div>

          <div className="itr-status-card-divider" />

          <div className="itr-status-card-rows">
            <div className="itr-status-card-row">
              <span className="itr-status-row-label">Customer</span>
              <span className="itr-status-row-value" data-testid="status-customer-name">{resolvedCustomer}</span>
            </div>
            <div className="itr-status-card-row">
              <span className="itr-status-row-label">Service</span>
              <span className="itr-status-row-value" data-testid="status-service-name">{serviceName}</span>
            </div>
            <div className="itr-status-card-row">
              <span className="itr-status-row-label">Applied On</span>
              <span className="itr-status-row-value" data-testid="status-applied-date">{formattedDate}</span>
            </div>
            <div className="itr-status-card-row">
              <span className="itr-status-row-label">Est. Completion</span>
              <span className="itr-status-row-value" data-testid="status-est-completion">{estCompletion}</span>
            </div>
          </div>
        </div>

        {/* 3 Buttons in a Row Side by Side */}
        <div className="itr-status-actions-row">
          <button
            type="button"
            className="itr-status-btn itr-status-btn--orange"
            onClick={handleDashboard}
            data-testid="status-btn-dashboard"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Go to Home Dashboard</span>
          </button>

          <button
            type="button"
            className="itr-status-btn itr-status-btn--blue"
            onClick={handleTrack}
            data-testid="status-btn-track"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Track in My Applications</span>
          </button>

          <button
            type="button"
            className="itr-status-btn itr-status-btn--white"
            onClick={handleSupport}
            data-testid="status-btn-support"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Contact Support / CA</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export interface ItrFilingSubmittedViewProps {
  submittedRef: string
  assessmentYear?: string
  selectedSources?: string[]
  selectedRegime?: string
  bankAccounts?: FilingBankAccount[]
  selectedBankId?: string
  docCount?: number
  customerName?: string
  onBack?: () => void
}

export const resolveItrServiceTitle = (
  selectedSources?: string[]
): { form: string; subtitle: string; fullTitle: string } => {
  const sources = Array.isArray(selectedSources) ? selectedSources : []
  if (sources.includes('business')) {
    return {
      form: 'ITR-3',
      subtitle: 'Business & Profession',
      fullTitle: 'ITR Filing - ITR-3 (Business & Profession)',
    }
  }
  if (sources.includes('capital_gains')) {
    return {
      form: 'ITR-2',
      subtitle: 'Capital Gains & Other Incomes',
      fullTitle: 'ITR Filing - ITR-2 (Capital Gains & Other Incomes)',
    }
  }
  if (sources.includes('house_property')) {
    return {
      form: 'ITR-1',
      subtitle: 'Salary & House Property',
      fullTitle: 'ITR Filing - ITR-1 (Salary & House Property)',
    }
  }
  return {
    form: 'ITR-1',
    subtitle: 'Salary & Other Sources',
    fullTitle: 'ITR Filing - ITR-1 (Salary & Other Sources)',
  }
}

export const ItrFilingSubmittedView: React.FC<ItrFilingSubmittedViewProps> = ({
  submittedRef,
  selectedSources = [],
  customerName,
  onBack,
}) => {
  const serviceInfo = resolveItrServiceTitle(selectedSources)

  return (
    <ItrUnifiedApplicationStatusView
      title={serviceInfo.fullTitle}
      serviceName={serviceInfo.fullTitle}
      applicationId={submittedRef || 'ITR-2026-873414'}
      customerName={customerName}
      appliedDate={new Date()}
      estCompletion="1-2 Business Days"
      onBack={onBack}
    />
  )
}
