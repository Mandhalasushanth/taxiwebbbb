import React, { useState } from 'react'
import {
  FileText,
  Upload,
  UserRound,
  Landmark,
  TrendingUp,
  PlusCircle,
  Info,
} from 'lucide-react'
import {
  ADDITIONAL_DOCUMENTS,
  TdsIcons,
} from '../../../utils/tdsRefund.constants'
import './TdsRefundOverview.css'

export interface TdsRefundProgressTrackerProps {
  currentStep: number
}

const PROGRESS_STAGES = [
  { num: 1, label: 'Customer & Income' },
  { num: 2, label: 'Upload Documents' },
  { num: 3, label: 'Review & Estimate' },
  { num: 4, label: 'Payment' },
  { num: 5, label: 'Refund Credited' },
]

export const TdsRefundProgressTracker: React.FC<TdsRefundProgressTrackerProps> = ({
  currentStep,
}) => {
  const renderProgressNode = (
    stage: (typeof PROGRESS_STAGES)[number],
    idx: number
  ) => {
    try {
      const isCompleted = stage.num < currentStep
      const isActive = stage.num === currentStep
      const isLast = idx === PROGRESS_STAGES.length - 1
      const dotClass = isCompleted
        ? 'tds-stepper-dot tds-stepper-dot--completed'
        : isActive
          ? 'tds-stepper-dot tds-stepper-dot--active'
          : 'tds-stepper-dot tds-stepper-dot--inactive'
      const lineClass = isCompleted
        ? 'tds-stepper-line tds-stepper-line--completed'
        : 'tds-stepper-line'

      return (
        <React.Fragment key={stage.num}>
          <div className="tds-stepper-step-item">
            <div
              className={dotClass}
              data-testid={`tds-step-${stage.num}`}
              title={`Step ${stage.num}: ${stage.label}`}
            >
              {isCompleted ? <TdsIcons.Checkmark /> : stage.num}
            </div>
            <span
              className={`tds-stepper-label ${isActive ? 'tds-stepper-label--active' : ''}`}
            >
              {stage.label}
            </span>
          </div>
          {!isLast && (
            <div
              className={lineClass}
              data-testid={`tds-line-${stage.num}`}
            />
          )}
        </React.Fragment>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="tds-stepper-wrapper">
      <nav
        className="tds-stepper-track"
        aria-label="Step progress"
        data-testid="tds-stepper-track"
      >
        {PROGRESS_STAGES.map(renderProgressNode)}
      </nav>
    </div>
  )
}

export interface TdsRefundOverviewProps {
  onStart: () => void
}

const HOW_IT_WORKS_STEPS = [
  { stepNumber: 1, label: 'Submit\nDetails', icon: FileText },
  { stepNumber: 2, label: 'Upload\nDocuments', icon: Upload },
  { stepNumber: 3, label: 'Executive\nVerification', icon: UserRound },
  { stepNumber: 4, label: 'Payment', icon: FileText },
  { stepNumber: 5, label: 'Refund\nCredited', icon: Landmark },
]

const REQUIRED_DOCS = [
  { id: 'pan', label: 'PAN Card', icon: FileText },
  { id: 'aadhaar', label: 'Aadhaar Card', icon: UserRound },
  { id: 'form16', label: 'Form 16 /\nForm 16A', icon: FileText },
  { id: 'ais', label: 'AIS Statement', icon: TrendingUp },
  { id: 'tis', label: 'TIS Statement', icon: FileText },
  { id: 'bank', label: 'Bank Statement', icon: Landmark },
  { id: 'salary', label: 'Salary Slip\n(if applicable)', icon: FileText },
  { id: 'more', label: 'More', icon: PlusCircle, isMoreBtn: true },
]

export const TdsRefundOverview: React.FC<TdsRefundOverviewProps> = ({
  onStart,
}) => {
  const [showMoreModal, setShowMoreModal] = useState(false)

  return (
    <div className="tds-web-page" data-testid="tds-refund-overview-page">
      {/* 1. Full-width Navy Hero Banner */}
      <section className="tds-hero-banner" data-testid="tds-hero-banner">
        <div className="tds-hero-left">
          <span className="tds-hero-tag">AY 2026-27</span>
          <h1 className="tds-hero-title">TDS Refund</h1>
          <p className="tds-hero-desc">
            Claim excess TDS deducted from your salary, investments, or payments with certified CA verification and live status tracking.
          </p>
          <button
            type="button"
            className="tds-hero-start-btn"
            onClick={onStart}
            data-testid="tds-start-refund-btn"
          >
            <span>Start TDS Refund</span>
            <span className="tds-hero-arrow" aria-hidden="true">→</span>
          </button>
        </div>
        <div className="tds-hero-right" aria-hidden="true">
          <div className="tds-hero-illustration-glow" />
          <TdsIcons.HeroIllustration
            width={220}
            height={150}
            className="tds-hero-illustration-img"
          />
        </div>
      </section>

      {/* 2. How it works Section */}
      <section className="tds-card-section" data-testid="tds-how-it-works-section">
        <h2 className="tds-card-section-title">How it works</h2>
        <div className="tds-how-it-works-track">
          <div className="tds-how-connector-line" aria-hidden="true" />
          {HOW_IT_WORKS_STEPS.map((step) => {
            const StepIcon = step.icon
            return (
              <div key={step.stepNumber} className="tds-how-step-node">
                <div className="tds-how-node-top">
                  <div className="tds-how-badge-number">{step.stepNumber}</div>
                  <div className="tds-how-icon-circle">
                    <StepIcon size={22} strokeWidth={2} />
                  </div>
                </div>
                <span className="tds-how-node-label">{step.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Documents Required Section */}
      <section
        className="tds-card-section"
        data-testid="tds-documents-required-section"
      >
        <h2 className="tds-card-section-title">Documents Required</h2>
        <div className="tds-docs-grid">
          {REQUIRED_DOCS.map((doc) => {
            const DocIcon = doc.icon
            if (doc.isMoreBtn) {
              return (
                <button
                  key={doc.id}
                  type="button"
                  className="tds-doc-card tds-doc-card--more"
                  onClick={() => setShowMoreModal(true)}
                  aria-label="View more required documents"
                >
                  <div className="tds-doc-card-icon" aria-hidden="true">
                    <DocIcon size={20} strokeWidth={2} />
                  </div>
                  <span className="tds-doc-card-label">{doc.label}</span>
                </button>
              )
            }
            return (
              <div key={doc.id} className="tds-doc-card">
                <div className="tds-doc-card-icon" aria-hidden="true">
                  <DocIcon size={20} strokeWidth={2} />
                </div>
                <span className="tds-doc-card-label">{doc.label}</span>
              </div>
            )
          })}
        </div>

        {/* Compact Information Message Banner */}
        <div className="tds-info-banner" role="note">
          <div className="tds-info-banner-icon" aria-hidden="true">
            <Info size={18} strokeWidth={2.2} />
          </div>
          <p className="tds-info-banner-text">
            Only the documents relevant to your refund claim will be requested in the next steps.
          </p>
        </div>
      </section>

      {/* Additional Documents Modal */}
      {showMoreModal && (
        <div
          className="tds-modal-overlay"
          onClick={() => setShowMoreModal(false)}
        >
          <div
            className="tds-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tds-modal-header">
              <h3 className="tds-modal-title">Additional Documents</h3>
              <button
                type="button"
                className="tds-modal-close-btn"
                onClick={() => setShowMoreModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="tds-modal-list">
              {ADDITIONAL_DOCUMENTS.map((doc) => (
                <div key={doc.name} className="tds-modal-item">
                  <div className="tds-modal-item-name">{doc.name}</div>
                  <div className="tds-modal-item-desc">{doc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TdsRefundOverview
