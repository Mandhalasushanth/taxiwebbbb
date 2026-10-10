import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config/routePaths'
import type { OriginalReturnDetails, UploadedDocument, DocumentTypeId } from '@modules/itr/types/revisedItr.types'
import {
  CheckCircle2 as CheckCircleIcon,
  Copy as CopyIcon,
  FileText as FileTextIcon,
  CreditCard as CreditCardIcon,
  ShieldCheck as ShieldCheckIcon,
  Pencil as EditIcon,
  Upload as UploadIcon,
  RefreshCw as ReplaceIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from 'lucide-react'
import './RevisionApplicationReceived.css'

export interface TimelineStage {
  id: number
  title: string
  status: 'completed' | 'active' | 'upcoming'
  icon: React.ReactNode
}

export const REVISED_ITR_STAGES: TimelineStage[] = [
  { id: 1, title: 'Application Received', status: 'completed', icon: <FileTextIcon size={18} /> },
  { id: 2, title: 'Payment Completed', status: 'completed', icon: <CreditCardIcon size={18} /> },
  { id: 3, title: 'CA Verification', status: 'active', icon: <ShieldCheckIcon size={18} /> },
  { id: 4, title: 'Revised ITR Preparation', status: 'upcoming', icon: <EditIcon size={18} /> },
  { id: 5, title: 'Filing', status: 'upcoming', icon: <UploadIcon size={18} /> },
  { id: 6, title: 'Income Tax Processing', status: 'upcoming', icon: <ReplaceIcon size={18} /> },
]

export const RevisedItrTimelineCard: React.FC = () => (
  <section className="step6-card step6-timeline-card">
    <div className="step6-timeline-header">
      <h3 className="step6-card-heading">Revised ITR Timeline</h3>
      <span className="step6-stage-badge">Stage 3 of 6</span>
    </div>

    <div className="step6-stepper-scroll">
      <div className="step6-stepper-row">
        {REVISED_ITR_STAGES.map((stage, index) => {
          const isLast = index === REVISED_ITR_STAGES.length - 1
          const nextStage = REVISED_ITR_STAGES[index + 1]
          const connectorClass =
            stage.status === 'completed'
              ? nextStage?.status === 'completed' || nextStage?.status === 'active'
                ? 'completed'
                : 'active-transition'
              : 'upcoming'

          return (
            <div key={stage.id} className="step6-stepper-item-wrap">
              <div className={`step6-stepper-node status-${stage.status}`}>
                <div className="step6-node-icon-circle">{stage.icon}</div>
                <span className="step6-node-title">{stage.title}</span>
              </div>
              {!isLast && <div className={`step6-stepper-connector connector-${connectorClass}`} />}
            </div>
          )
        })}
      </div>
    </div>

    <div className="step6-current-stage-callout">
      <div className="step6-callout-icon">
        <InfoIcon size={18} />
      </div>
      <div className="step6-callout-text">
        <h4 className="step6-callout-title">Current Stage 3: CA Verification</h4>
        <p className="step6-callout-desc">
          Certified CA verifying original filing and revised declaration.
        </p>
      </div>
    </div>
  </section>
)

export interface RevisionApplicationReceivedProps {
  applicationId: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  onBack?: () => void
  onDownloadReceipt: () => void
}

const CONFETTI_DOTS = [
  'dot-orange dot-1',
  'dot-green dot-2',
  'dot-blue dot-3',
  'dot-yellow dot-4',
  'dot-purple dot-5',
  'dot-green dot-6',
  'dot-orange dot-7',
  'dot-blue dot-8',
]

export const RevisionApplicationReceived: React.FC<RevisionApplicationReceivedProps> = ({
  applicationId,
  selectedAy,
  returnDetails,
  uploadedDocuments,
  onDownloadReceipt,
}) => {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const docCount = Object.keys(uploadedDocuments).length
  const displayAy = selectedAy || returnDetails?.assessmentYear || 'AY 2025-26'

  const handleCopyId = () => {
    try {
      navigator.clipboard.writeText(applicationId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Safe fallback
    }
  }

  const handleTrackApplication = () => {
    try {
      if (applicationId) {
        navigate(routePaths.applicationTrack(applicationId))
      } else {
        navigate(routePaths.applications)
      }
    } catch {
      navigate(routePaths.applications)
    }
  }

  const handleGoToDashboard = () => {
    try {
      navigate(routePaths.dashboard)
    } catch {
      navigate(routePaths.dashboard)
    }
  }

  const summaryRows = [
    { label: 'Assessment Year', value: displayAy },
    { label: 'Return Form', value: 'Revised ITR' },
    { label: 'Income Sources', value: 'Revised Return Filing' },
    { label: 'Tax Regime', value: 'New Tax Regime' },
    { label: 'Documents', value: `${docCount} of 6 received` },
    { label: 'Refund Bank', value: 'HDFC Bank ···· 1234' },
  ]

  const renderHeroCard = () => (
    <section className="step6-hero-card">
      <div className="step6-confetti-wrap" aria-hidden="true">
        {CONFETTI_DOTS.map((cls) => (
          <span key={cls} className={`step6-dot ${cls}`} />
        ))}
      </div>

      <div className="step6-hero-check-ring">
        <div className="step6-hero-check-circle">
          <CheckCircleIcon size={34} />
        </div>
      </div>

      <h1 className="step6-hero-title">Your Revised ITR application has been received.</h1>
      <p className="step6-hero-desc">
        Your documents and revised tax information have been received. A Tax Executive will review them before preparing your return.
      </p>

      <div
        className="step6-app-id-pill"
        onClick={handleCopyId}
        title="Click to copy Application ID"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCopyId()}
      >
        <span className="step6-app-id-label">Application ID</span>
        <strong className="step6-app-id-val">{applicationId}</strong>
        <span className="step6-copy-icon-btn" aria-label="Copy Application ID">
          {copied ? <span className="step6-copied-tooltip">Copied!</span> : <CopyIcon size={14} />}
        </span>
      </div>
    </section>
  )

  const renderDetailsGrid = () => (
    <div className="step6-details-grid">
      <section className="step6-card step6-what-we-have-card">
        <div className="step6-card-title-row">
          <div className="step6-title-icon-wrap icon-orange">
            <FileTextIcon size={18} />
          </div>
          <h3 className="step6-card-heading">What we have</h3>
        </div>

        <div className="step6-key-val-list">
          {summaryRows.map((row) => (
            <div key={row.label} className="step6-key-val-row">
              <span className="step6-key-label">{row.label}</span>
              <span className="step6-val-text">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="step6-right-col-stack">
        <section className="step6-card step6-what-happens-next-card">
          <div className="step6-card-title-row">
            <div className="step6-title-icon-wrap icon-blue">
              <InfoIcon size={18} />
            </div>
            <h3 className="step6-card-heading">What happens next</h3>
          </div>
          <p className="step6-next-text">
            A Tax Executive will verify your documents, prepare the return and send you the computation to review and approve. You will get a notification at each stage.
          </p>
        </section>

        <section className="step6-card step6-ca-assigned-card">
          <div className="step6-ca-header">
            <div className="step6-ca-avatar">CA</div>
            <div className="step6-ca-meta">
              <div className="step6-ca-name">Senior CA Meera Iyer</div>
              <div className="step6-ca-subtitle">Direct Tax Specialist · 12+ Yrs Exp</div>
            </div>
          </div>
          <div className="step6-ca-badges">
            <span className="step6-ca-badge">⚡ 4-Hour Review SLA</span>
            <span className="step6-ca-badge">🛡️ Notice Protection</span>
          </div>
        </section>
      </div>
    </div>
  )

  const renderActionsWrap = () => (
    <div className="step6-actions-wrap">
      <button
        type="button"
        className="step6-btn-primary"
        onClick={handleTrackApplication}
        data-testid="track-application-btn"
      >
        Track My Application &nbsp;→
      </button>

      <button
        type="button"
        className="step6-btn-secondary"
        onClick={handleGoToDashboard}
        data-testid="go-to-dashboard-btn"
      >
        Go to Dashboard
      </button>

      <button
        type="button"
        className="step6-btn-secondary"
        onClick={onDownloadReceipt}
        data-testid="download-receipt-btn"
      >
        <DownloadIcon size={18} />
        Download Receipt
      </button>
    </div>
  )

  return (
    <div className="step6-received-container">
      {renderHeroCard()}
      <RevisedItrTimelineCard />
      {renderDetailsGrid()}
      {renderActionsWrap()}
    </div>
  )
}

export default RevisionApplicationReceived
