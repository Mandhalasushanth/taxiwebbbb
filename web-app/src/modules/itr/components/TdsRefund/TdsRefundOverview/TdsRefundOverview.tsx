import React, { useState } from 'react'
import {
  WHY_CHOOSE_ITEMS, HOW_IT_WORKS_STEPS, DOCUMENTS_REQUIRED, ADDITIONAL_DOCUMENTS, TdsIcons,
} from '../../../utils/tdsRefund.constants'
import './TdsRefundOverview.css'

export interface TdsRefundProgressTrackerProps { currentStep: number }

const PROGRESS_STAGES = [
  { num: 1, label: 'Customer & Income' },
  { num: 2, label: 'Upload Documents' },
  { num: 3, label: 'CA Verification' },
  { num: 4, label: 'Refund Filing' },
  { num: 5, label: 'Refund Credited' },
]

export const TdsRefundProgressTracker: React.FC<TdsRefundProgressTrackerProps> = ({ currentStep }) => {
  const renderProgressNode = (stage: (typeof PROGRESS_STAGES)[number], idx: number) => {
    try {
      const isCompleted = stage.num < currentStep
      const isActive = stage.num === currentStep
      const isLast = idx === PROGRESS_STAGES.length - 1
      const dotClass = isCompleted ? 'tds-stepper-dot tds-stepper-dot--completed' : isActive ? 'tds-stepper-dot tds-stepper-dot--active' : 'tds-stepper-dot tds-stepper-dot--inactive'
      const lineClass = isCompleted ? 'tds-stepper-line tds-stepper-line--completed' : 'tds-stepper-line'

      return (
        <React.Fragment key={stage.num}>
          <div className="tds-stepper-step-item">
            <div className={dotClass} data-testid={`tds-step-${stage.num}`} title={`Step ${stage.num}: ${stage.label}`}>
              {isCompleted ? <TdsIcons.Checkmark /> : stage.num}
            </div>
            <span className={`tds-stepper-label ${isActive ? 'tds-stepper-label--active' : ''}`}>{stage.label}</span>
          </div>
          {!isLast && <div className={lineClass} data-testid={`tds-line-${stage.num}`} />}
        </React.Fragment>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="tds-stepper-wrapper">
      <nav className="tds-stepper-track" aria-label="Step progress" data-testid="tds-stepper-track">
        {PROGRESS_STAGES.map(renderProgressNode)}
      </nav>
    </div>
  )
}

export interface TdsRefundOverviewProps { onStart: () => void }

const WHY_ICON_MAP: Record<string, React.FC> = {
  wallet: TdsIcons.Briefcase, expert: TdsIcons.User, clock: TdsIcons.Clock, trending: TdsIcons.TrendingUp,
}

const WORKFLOW_ICON_MAP: Record<string, React.FC> = {
  edit: TdsIcons.FileText, upload: TdsIcons.Upload, verification: TdsIcons.User, filing: TdsIcons.FileText, credit: TdsIcons.Building,
}

const DOC_ICON_MAP: Record<string, React.FC> = {
  pan: TdsIcons.FileText, aadhaar: TdsIcons.User, form16: TdsIcons.FileText, ais: TdsIcons.TrendingUp,
  tis: TdsIcons.FileText, bank: TdsIcons.Building, salary: TdsIcons.FileText, more: TdsIcons.PlusCircle,
}

const ACTION_BENEFITS = [
  'Form 26AS & AIS tax reconciliation', 'Maximized eligible exemptions & credits',
  'Direct credit to verified bank account', 'End-to-end refund status tracking',
]

const resolveIcon = (map: Record<string, React.FC>, key: string, Fallback: React.FC) => {
  try {
    const Comp = map[key] || Fallback
    return <Comp />
  } catch {
    return <Fallback />
  }
}

export const TdsRefundOverview: React.FC<TdsRefundOverviewProps> = ({ onStart }) => {
  const [showMoreModal, setShowMoreModal] = useState(false)

  return (
    <div className="tds-web-page">
      <section className="tds-hero-banner">
        <div className="tds-hero-left">
          <span className="tds-hero-tag">Income Tax Services</span>
          <h1 className="tds-hero-title">TDS Refund</h1>
          <p className="tds-hero-desc">Claim excess TDS deducted from your salary, investments, or payments with certified CA verification and live status tracking.</p>
        </div>
        <div className="tds-hero-illustration" aria-hidden="true"><TdsIcons.HeroIllustration width={220} height={150} /></div>
      </section>

      <div className="tds-web-layout">
        <main className="tds-web-main">
          <section className="tds-section">
            <h2 className="tds-section-title">Why choose TaxEdge?</h2>
            <div className="tds-why-grid">
              {WHY_CHOOSE_ITEMS.map((item) => (
                <div key={item.id} className="tds-why-card">
                  <div className="tds-why-icon-box">{resolveIcon(WHY_ICON_MAP, item.icon, TdsIcons.Briefcase)}</div>
                  <div className="tds-why-text"><h3 className="tds-why-card-title">{item.title}</h3><p className="tds-why-card-desc">{item.description}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="tds-section">
            <div className="tds-section-header-row"><h2 className="tds-section-title">How it works</h2><span className="tds-section-subtitle">5-stage end-to-end filing workflow</span></div>
            <div className="tds-how-container">
              <div className="tds-how-track">
                <div className="tds-how-connector" aria-hidden="true" />
                {HOW_IT_WORKS_STEPS.map((step) => (
                  <div key={step.stepNumber} className="tds-how-step">
                    <div className="tds-how-circle-wrap"><div className="tds-how-badge">{step.stepNumber}</div><div className="tds-how-circle">{resolveIcon(WORKFLOW_ICON_MAP, step.icon, TdsIcons.FileText)}</div></div>
                    <span className="tds-how-step-label">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="tds-section">
            <div className="tds-section-header-row"><h2 className="tds-section-title">Documents Required</h2><span className="tds-section-subtitle">Keep digital copies ready for verification</span></div>
            <div className="tds-docs-grid">
              {DOCUMENTS_REQUIRED.map((doc) =>
                doc.isMoreBtn ? (
                  <button key={doc.id} type="button" className="tds-doc-card tds-doc-card--more" onClick={() => setShowMoreModal(true)} aria-label="View more required documents">
                    <span className="tds-doc-more-text"><TdsIcons.PlusCircle /><span>More</span></span>
                  </button>
                ) : (
                  <div key={doc.id} className="tds-doc-card">
                    <div className="tds-doc-icon">{resolveIcon(DOC_ICON_MAP, doc.icon, TdsIcons.FileText)}</div>
                    <span className="tds-doc-title">{doc.name || doc.title}</span>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="tds-info-box">
            <div className="tds-info-icon-wrap" aria-hidden="true"><TdsIcons.InfoCircle /></div>
            <p className="tds-info-text">Only the documents relevant to your refund claim will be requested in the next steps.</p>
          </div>
        </main>

        <aside className="tds-web-sidebar">
          <div className="tds-action-card">
            <div className="tds-action-card-header">
              <span className="tds-action-badge">AY 2026-27</span>
              <h3 className="tds-action-title">Start TDS Refund</h3>
              <p className="tds-action-desc">Fast-track your excess TDS claim with certified Chartered Accountant review.</p>
            </div>
            <div className="tds-action-benefits">
              {ACTION_BENEFITS.map((benefit) => (<div key={benefit} className="tds-action-benefit-row"><TdsIcons.Checkmark /><span>{benefit}</span></div>))}
            </div>
            <div className="tds-action-btn-wrap">
              <button type="button" className="tds-web-start-btn" onClick={onStart}>
                <span>Start TDS Refund</span><span className="tds-start-arrow" aria-hidden="true">→</span>
              </button>
            </div>
            <div className="tds-action-trust-box">
              <div className="tds-trust-item"><TdsIcons.Shield /><span>256-bit Bank Grade Security</span></div>
              <div className="tds-trust-item"><TdsIcons.Zap /><span>Average 24–48 hr CA Review</span></div>
            </div>
          </div>
        </aside>
      </div>

      {showMoreModal && (
        <div className="tds-modal-overlay" onClick={() => setShowMoreModal(false)}>
          <div className="tds-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tds-modal-header">
              <h3 className="tds-modal-title">Additional Documents</h3>
              <button type="button" className="tds-modal-close-btn" onClick={() => setShowMoreModal(false)} aria-label="Close modal">✕</button>
            </div>
            <div className="tds-modal-list">
              {ADDITIONAL_DOCUMENTS.map((doc) => (
                <div key={doc.name} className="tds-modal-item"><div className="tds-modal-item-name">{doc.name}</div><div className="tds-modal-item-desc">{doc.desc}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TdsRefundOverview
