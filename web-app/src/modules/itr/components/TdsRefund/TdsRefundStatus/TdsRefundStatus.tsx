import React from 'react'
import { TdsIcons } from '../../../utils/tdsRefund.constants'
import { TdsRefundProgressTracker } from '../TdsRefundOverview'
import './TdsRefundStatus.css'

export interface TdsRefundStatusProps {
  applicationId?: string
  onBack?: () => void
  onBackToDashboard?: () => void
  onContactSupport?: () => void
}

interface TimelineStage {
  num: number
  title: string
  desc: string
  status: 'completed' | 'active' | 'pending'
}

const TIMELINE_STAGES: TimelineStage[] = [
  { num: 1, title: 'New Request Received', desc: 'Application submitted', status: 'completed' },
  { num: 2, title: 'Documents Received', desc: 'All documents uploaded', status: 'completed' },
  { num: 3, title: 'Under Verification', desc: 'Documents being verified by CA', status: 'active' },
  { num: 4, title: 'ITR Preparation', desc: 'Return computation by CA', status: 'pending' },
  { num: 5, title: 'Customer Approval', desc: 'Review and approve the return', status: 'pending' },
  { num: 6, title: 'ITR Filed', desc: 'Submitted on IT Department portal', status: 'pending' },
  { num: 7, title: 'E-Verification Pending', desc: 'Verify using Aadhaar OTP / DSC', status: 'pending' },
  { num: 8, title: 'Processing by IT Dept.', desc: 'Department processing', status: 'pending' },
  { num: 9, title: 'Refund / Tax Payable', desc: 'Direct credit to bank account ••••6068', status: 'pending' },
]

const OVERVIEW_META_ITEMS = [
  { label: 'Service', value: 'TDS Refund' },
  { label: 'AY', value: '2025-26' },
  { label: 'Applied', value: '17 Sept 2026' },
]

export const TdsRefundStatus: React.FC<TdsRefundStatusProps> = ({
  applicationId = 'TDS-2026-59303',
  onBack,
  onBackToDashboard,
  onContactSupport,
}) => {
  const renderOverviewCard = () => (
    <section className="tds-status-card" data-testid="tds-status-overview">
      <div className="tds-status-overview-header">
        <div className="tds-status-header-left">
          {onBack && (
            <button
              type="button"
              className="tds-action-back-btn tds-action-back-btn--compact"
              onClick={onBack}
              data-testid="tds-status-back-btn"
              title="Back"
            >
              ←
            </button>
          )}
          <div>
            <div className="tds-status-app-id-label">Application ID</div>
            <h2 className="tds-status-app-id-val" data-testid="status-application-id">{applicationId}</h2>
          </div>
        </div>
        <span className="tds-status-badge-purple" data-testid="status-badge">
          <span className="tds-status-badge-dot" />
          Under Verification
        </span>
      </div>

      <div className="tds-status-grid">
        {OVERVIEW_META_ITEMS.map((item) => (
          <div key={item.label} className="tds-status-item">
            <span className="tds-status-item-label">{item.label}</span>
            <span className="tds-status-item-val">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="tds-status-progress-wrap">
        <div className="tds-status-progress-track">
          <div className="tds-status-progress-fill" />
        </div>
        <span className="tds-status-progress-label" data-testid="status-progress-label">30% complete</span>
      </div>
    </section>
  )

  const renderTimelineCard = () => (
    <section className="tds-status-card" data-testid="tds-status-timeline">
      <div className="tds-timeline-list">
        {TIMELINE_STAGES.map((stage, idx) => (
          <div
            key={stage.num}
            className={`tds-timeline-item tds-timeline-item--${stage.status}`}
            data-testid={`timeline-stage-${stage.num}`}
          >
            {idx < TIMELINE_STAGES.length - 1 && <div className="tds-timeline-line" />}
            <div className="tds-timeline-node">
              {stage.status === 'completed' ? '✓' : stage.num}
            </div>
            <div className="tds-timeline-info">
              <h4 className="tds-timeline-title">{stage.title}</h4>
              <p className="tds-timeline-desc">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  const renderActionsRow = () => (
    <div className="tds-status-actions-row">
      <button
        type="button"
        className="tds-btn-contact-support"
        onClick={onContactSupport}
        data-testid="tds-btn-contact-support"
      >
        <TdsIcons.MessageCircle />
        Contact Support
      </button>
      <button
        type="button"
        className="tds-btn-dashboard"
        onClick={onBackToDashboard}
        data-testid="tds-btn-dashboard"
      >
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="tds-status-page" data-testid="tds-refund-status-page">
      <div className="tds-status-stepper-wrap">
        <TdsRefundProgressTracker currentStep={5} />
      </div>
      <div className="tds-status-layout">
        <main className="tds-status-main">
          {renderOverviewCard()}
          {renderTimelineCard()}
          {renderActionsRow()}
        </main>
      </div>
    </div>
  )
}

export default TdsRefundStatus
