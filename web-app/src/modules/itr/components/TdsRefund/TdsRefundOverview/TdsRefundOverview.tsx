import React, { useState } from 'react'
import { ArrowRight, Info, PlusCircle } from 'lucide-react'
import { TdsIcons } from '@modules/itr/utils/tdsRefund.constants'
import {
  TDS_MORE_DOCS,
  TDS_OVERVIEW_CONTENT as COPY,
  TDS_OVERVIEW_FEATURES,
  TDS_PRIMARY_DOCS,
  type TdsOverviewDoc,
  type TdsOverviewFeature,
} from './tdsOverview.config'
import './TdsRefundOverview.css'

export interface TdsRefundProgressTrackerProps {
  currentStep: number
}

const PROGRESS_STAGES = [
  { num: 1, label: 'Application Details' },
  { num: 2, label: 'Review & Estimate' },
  { num: 3, label: 'Payment' },
  { num: 4, label: 'Refund Credited' },
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

const renderFeatureCard = ({ id, title, desc, icon: Icon }: TdsOverviewFeature) => (
  <div key={id} className="tds-feature-card">
    <div className="tds-feature-icon" aria-hidden="true">
      <Icon size={22} strokeWidth={2} />
    </div>
    <h3 className="tds-feature-title">{title}</h3>
    <p className="tds-feature-desc">{desc}</p>
  </div>
)

const renderDocCard = ({ id, label, icon: Icon }: TdsOverviewDoc) => (
  <div key={id} className="tds-doc-card">
    <div className="tds-doc-card-icon" aria-hidden="true">
      <Icon size={20} strokeWidth={2} />
    </div>
    <span className="tds-doc-card-label">{label}</span>
  </div>
)

export const TdsRefundOverview: React.FC<TdsRefundOverviewProps> = ({
  onStart,
}) => {
  const [showMoreModal, setShowMoreModal] = useState(false)

  return (
    <div className="tds-web-page" data-testid="tds-refund-overview-page">
      {/* 1. Hero */}
      <section className="tds-hero-banner" data-testid="tds-hero-banner">
        <div className="tds-hero-left">
          <span className="tds-hero-tag">{COPY.heroTag}</span>
          <h1 className="tds-hero-title">{COPY.title}</h1>
          <p className="tds-hero-desc">{COPY.description}</p>
        </div>
        <div className="tds-hero-right" aria-hidden="true">
          <div className="tds-hero-illustration-glow" />
          <TdsIcons.HeroIllustration
            width={176}
            height={120}
            className="tds-hero-illustration-img"
          />
        </div>
      </section>

      {/* 2. Why choose TaxEdge */}
      <section className="tds-plain-section" aria-labelledby="tds-features-title">
        <h2 id="tds-features-title" className="tds-plain-section-title">{COPY.featuresTitle}</h2>
        <div className="tds-features-grid">{TDS_OVERVIEW_FEATURES.map(renderFeatureCard)}</div>
      </section>

      {/* 3. Documents Required */}
      <section
        className="tds-plain-section"
        aria-labelledby="tds-docs-title"
        data-testid="tds-documents-required-section"
      >
        <h2 id="tds-docs-title" className="tds-plain-section-title">{COPY.documentsTitle}</h2>
        <div className="tds-docs-grid">
          {TDS_PRIMARY_DOCS.map(renderDocCard)}
          <button
            type="button"
            className="tds-doc-card tds-doc-card--more"
            onClick={() => setShowMoreModal(true)}
            aria-label="View more required documents"
          >
            <PlusCircle size={20} strokeWidth={2} aria-hidden="true" />
            <span className="tds-doc-card-label">{COPY.moreLabel}</span>
          </button>
        </div>

        <div className="tds-info-banner" role="note">
          <div className="tds-info-banner-icon" aria-hidden="true">
            <Info size={18} strokeWidth={2.2} />
          </div>
          <p className="tds-info-banner-text">{COPY.infoNote}</p>
        </div>
      </section>

      {/* 4. Primary action: inline on desktop, pinned to the bottom on mobile */}
      <div className="tds-start-bar">
        <button
          type="button"
          className="tds-hero-start-btn"
          onClick={onStart}
          data-testid="tds-start-refund-btn"
        >
          <span>{COPY.startLabel}</span>
          <ArrowRight size={20} strokeWidth={2.4} className="tds-hero-arrow" aria-hidden="true" />
        </button>
      </div>

      {/* Additional Documents Modal */}
      {showMoreModal && (
        <div
          className="tds-modal-overlay"
          onClick={() => setShowMoreModal(false)}
        >
          <div
            className="tds-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tds-more-docs-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tds-modal-header">
              <h3 id="tds-more-docs-title" className="tds-modal-title">{COPY.moreModalTitle}</h3>
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
              {TDS_MORE_DOCS.map((doc) => (
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
