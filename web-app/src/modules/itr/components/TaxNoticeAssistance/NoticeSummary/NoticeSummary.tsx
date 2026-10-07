import React from 'react'
import { StepActionBar } from '@shared/components'
import type { NoticeFormData } from '@modules/itr/types/taxNoticeAssistance.types'
import './NoticeSummary.css'

export interface NoticeSummaryProps {
  formData: NoticeFormData
  onNext: () => void
  onBack: () => void
  onSaveDraftAndExit: () => void
}

export const NoticeSummary: React.FC<NoticeSummaryProps> = ({
  formData,
  onNext,
  onBack,
  onSaveDraftAndExit,
}) => {
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '22 Sep 2026'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Calculate days left
  const getDaysLeftText = (dueDateStr: string) => {
    if (!dueDateStr) return '0 days left'
    try {
      const due = new Date(dueDateStr).getTime()
      const today = new Date().setHours(0, 0, 0, 0)
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
      if (diff <= 0) return '0 days left'
      return `${diff} days left`
    } catch {
      return '0 days left'
    }
  }

  // Extract section from notice type if possible
  const extractSection = (typeStr: string) => {
    const match = typeStr.match(/Section\s+([0-9a-zA-Z()]+)/i)
    return match ? match[1] : '143(1)(a)'
  }

  // Extract clean title
  const extractCleanType = (typeStr: string) => {
    if (!typeStr) return 'Proposed Adjustment'
    if (typeStr.includes(' - ')) {
      return typeStr.split(' - ')[1]
    }
    return typeStr
  }

  return (
    <div className="notice-summary-container">
      {/* Header Introduction */}
      <div className="notice-form__intro">
        <h2 className="notice-form__heading">Here's what this notice means</h2>
        <p className="notice-form__subheading">
          A plain-language explanation from your Tax Executive — no jargon.
        </p>
      </div>

      {/* 2-Column Responsive Web Grid */}
      <div className="notice-summary-grid">
        {/* Left Column: Notice Facts */}
        <div className="notice-summary-facts-card">
          <div className="notice-summary-facts-list">
            <div className="notice-summary-fact-item">
              <span className="notice-summary-fact-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Notice Type
              </span>
              <span className="notice-summary-fact-value">
                {extractCleanType(formData.noticeType)}
              </span>
            </div>

            <div className="notice-summary-fact-item">
              <span className="notice-summary-fact-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Section
              </span>
              <span className="notice-summary-fact-value">
                {extractSection(formData.noticeType)}
              </span>
            </div>

            <div className="notice-summary-fact-item">
              <span className="notice-summary-fact-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Issued Date
              </span>
              <span className="notice-summary-fact-value">
                {formatDateDisplay(formData.noticeDate)}
              </span>
            </div>

            <div className="notice-summary-fact-item">
              <span className="notice-summary-fact-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Response Due Date
              </span>
              <span className="notice-summary-fact-value">
                {formatDateDisplay(formData.responseDueDate)}
                <span className="notice-summary-fact-sub">
                  {getDaysLeftText(formData.responseDueDate)}
                </span>
              </span>
            </div>

            <div className="notice-summary-fact-item">
              <span className="notice-summary-fact-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Risk Level
              </span>
              <span className="notice-summary-fact-badge">Low</span>
            </div>
          </div>
        </div>

        {/* Right Column: Explanations & Requirements */}
        <div className="notice-summary-content-col">
          {/* What this notice means card */}
          <div className="notice-summary-card">
            <div className="notice-summary-card__header">
              <div className="notice-summary-card__icon-box notice-summary-card__icon-box--blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="notice-summary-card__title">What this notice means</h3>
            </div>
            <p className="notice-summary-card__body">
              Notice received for {formData.assessmentYear || 'AY 2025–26'} regarding{' '}
              {extractCleanType(formData.noticeType)}. The department's records require clarification
              regarding your income returns and supporting documentation.
            </p>
          </div>

          {/* What action is required card */}
          <div className="notice-summary-card">
            <div className="notice-summary-card__header">
              <div className="notice-summary-card__icon-box notice-summary-card__icon-box--blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="notice-summary-card__title">What action is required</h3>
            </div>
            <p className="notice-summary-card__body">
              You need to confirm whether the reported items were accounted for, provide relevant proofs (AIS, Form 16, bank statements), and approve the legal response prepared by our Tax Executive.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Documents Required Banner - Full Width */}
      <div className="notice-summary-card notice-summary-card--highlight notice-summary-card--full-width">
        <div className="notice-summary-card__header">
          <div className="notice-summary-card__icon-box notice-summary-card__icon-box--green">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="notice-summary-card__title">Additional Documents Required</h3>
        </div>
        <p className="notice-summary-card__body">
          To prepare a strong legal reply, our Tax Executive requires supporting documents
          including your previous ITR, Form 16, AIS, and bank statements in the next step.
        </p>
      </div>

      {/* Bottom Step Action Bar */}
      <StepActionBar
        onBack={onBack}
        onSaveDraft={onSaveDraftAndExit}
        onNext={onNext}
        backLabel="Back"
        nextLabel="Continue"
        nextAriaLabel="Upload Supporting Documents"
      />
    </div>
  )
}

export default NoticeSummary
