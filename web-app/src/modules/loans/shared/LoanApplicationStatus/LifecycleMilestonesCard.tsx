import React from 'react'
import type { LoanMilestoneItem } from '@modules/loans/types/loanApplication.types'
import { FileText, Check, CheckCircle, Clock } from 'lucide-react'
import './LifecycleMilestonesCard.css'

export interface LifecycleMilestonesCardProps {
  milestones?: LoanMilestoneItem[]
  submissionTimestamp?: string
}

/**
 * Reusable Lifecycle Milestones Card Component
 * Displays the 5 vertical lifecycle stages exactly as shown in the design.
 */
export const LifecycleMilestonesCard: React.FC<LifecycleMilestonesCardProps> = ({
  milestones,
  submissionTimestamp = '25 Sep 2026 10:30 AM',
}) => {
  // Extract milestone timestamps, falling back when missing
  const stage1 = milestones?.[0]
  const stage1Time = stage1?.timestamp || submissionTimestamp

  return (
    <div className="loan-lifecycle-card" data-testid="lifecycle-milestones-card">
      {/* Header */}
      <div className="loan-lifecycle-header">
        <div className="loan-lifecycle-icon-tile" aria-hidden="true">
          <FileText size={20} aria-hidden="true" />
        </div>
        <h2 className="loan-lifecycle-title">Application Lifecycle Milestones</h2>
      </div>

      {/* 5-Stage Vertical Timeline */}
      <div className="loan-timeline-track">
        {/* Stage 1: Application Submitted (Completed) */}
        <div className="loan-timeline-row">
          <div className="loan-timeline-node-col">
            <div className="loan-timeline-node loan-timeline-node--completed">
              <Check size={14} strokeWidth={3} aria-hidden="true" />
            </div>
            <div className="loan-timeline-connector-line loan-timeline-connector-line--completed" />
          </div>

          <div className="loan-timeline-label-col">
            <div className="loan-timeline-stage-title">Application Submitted</div>
            <div className="loan-timeline-stage-subtitle">Completed</div>
          </div>

          <div className="loan-timeline-badge-col">
            <span className="milestone-badge-completed">
              <CheckCircle size={14} aria-hidden="true" />
              <span>{stage1Time}</span>
            </span>
          </div>
        </div>

        {/* Stage 2: Agent Review (In Progress) */}
        <div className="loan-timeline-row">
          <div className="loan-timeline-node-col">
            <div className="loan-timeline-node loan-timeline-node--active">
              <span className="loan-timeline-inner-dot" />
            </div>
            <div className="loan-timeline-connector-line loan-timeline-connector-line--pending" />
          </div>

          <div className="loan-timeline-label-col">
            <div className="loan-timeline-stage-title loan-timeline-stage-title--active">
              Agent Review
            </div>
            <div className="loan-timeline-stage-subtitle">Documents Received</div>
          </div>

          <div className="loan-timeline-badge-col">
            <div className="milestone-status-box milestone-status-box--active">
              <div className="milestone-status-box__header">
                <Clock size={14} aria-hidden="true" />
                <span>In Progress</span>
              </div>
              <p className="milestone-status-box__desc">
                We are verifying your documents.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 3: Lender Review (Pending) */}
        <div className="loan-timeline-row">
          <div className="loan-timeline-node-col">
            <div className="loan-timeline-node loan-timeline-node--pending" />
            <div className="loan-timeline-connector-line loan-timeline-connector-line--pending" />
          </div>

          <div className="loan-timeline-label-col">
            <div className="loan-timeline-stage-title loan-timeline-stage-title--pending">
              Lender Review
            </div>
            <div className="loan-timeline-stage-subtitle loan-timeline-stage-subtitle--pending">
              Pending
            </div>
          </div>

          <div className="loan-timeline-badge-col">
            <div className="milestone-status-box milestone-status-box--pending">
              <div className="milestone-status-box__header">
                <Clock size={14} aria-hidden="true" />
                <span>Pending</span>
              </div>
              <p className="milestone-status-box__desc">
                Will start after agent review.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 4: Sanctioned (Pending) */}
        <div className="loan-timeline-row">
          <div className="loan-timeline-node-col">
            <div className="loan-timeline-node loan-timeline-node--pending" />
            <div className="loan-timeline-connector-line loan-timeline-connector-line--pending" />
          </div>

          <div className="loan-timeline-label-col">
            <div className="loan-timeline-stage-title loan-timeline-stage-title--pending">
              Sanctioned
            </div>
            <div className="loan-timeline-stage-subtitle loan-timeline-stage-subtitle--pending">
              Pending
            </div>
          </div>

          <div className="loan-timeline-badge-col">
            <div className="milestone-status-box milestone-status-box--pending">
              <div className="milestone-status-box__header">
                <Clock size={14} aria-hidden="true" />
                <span>Pending</span>
              </div>
              <p className="milestone-status-box__desc">
                Will start after lender review.
              </p>
            </div>
          </div>
        </div>

        {/* Stage 5: Disbursed (Pending) */}
        <div className="loan-timeline-row">
          <div className="loan-timeline-node-col">
            <div className="loan-timeline-node loan-timeline-node--pending" />
          </div>

          <div className="loan-timeline-label-col">
            <div className="loan-timeline-stage-title loan-timeline-stage-title--pending">
              Disbursed
            </div>
            <div className="loan-timeline-stage-subtitle loan-timeline-stage-subtitle--pending">
              Pending
            </div>
          </div>

          <div className="loan-timeline-badge-col">
            <div className="milestone-status-box milestone-status-box--pending">
              <div className="milestone-status-box__header">
                <Clock size={14} aria-hidden="true" />
                <span>Pending</span>
              </div>
              <p className="milestone-status-box__desc">
                Will start after sanction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LifecycleMilestonesCard
