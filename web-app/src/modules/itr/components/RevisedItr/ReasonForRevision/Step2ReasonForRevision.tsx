import React from 'react'
import type { RevisionReasonKey } from '../../../types/revisedItr.types'
import { REVISION_REASONS } from '../../../services/revisedItrService'
import './Step2ReasonForRevision.css'

interface Step2ReasonForRevisionProps {
  selectedReason: RevisionReasonKey | null
  otherReasonText: string
  reasonError?: string | null
  otherReasonError?: string | null
  onSelectReason: (reason: RevisionReasonKey) => void
  onOtherReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const Step2ReasonForRevision: React.FC<Step2ReasonForRevisionProps> = ({
  selectedReason,
  otherReasonText,
  reasonError,
  otherReasonError,
  onSelectReason,
  onOtherReasonChange,
}) => {
  const renderIcon = (type: 'income' | 'deduction' | 'bank' | 'other') => {
    switch (type) {
      case 'income':
        return (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        )
      case 'deduction':
        return (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )
      case 'bank':
        return (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="21" x2="21" y2="21" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <polyline points="5 6 12 3 19 6" />
            <line x1="8" y1="14" x2="8" y2="17" />
            <line x1="12" y1="14" x2="12" y2="17" />
            <line x1="16" y1="14" x2="16" y2="17" />
          </svg>
        )
      case 'other':
        return (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        )
    }
  }

  return (
    <div className="step2-reason-for-revision">
      <h2 className="step2-heading">Why are you revising your ITR?</h2>

      {reasonError && <div className="step2-error-banner">{reasonError}</div>}

      {/* Options List */}
      <div className="reason-cards-list" role="radiogroup" aria-label="Reasons for revision">
        {REVISION_REASONS.map((option) => {
          const isSelected = selectedReason === option.key
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`reason-card-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectReason(option.key)}
            >
              <div className="reason-card-left">
                <div className={`reason-card-icon-wrap ${isSelected ? 'selected' : ''}`}>
                  {renderIcon(option.icon)}
                </div>
                <div className="reason-card-text">
                  <span className="reason-card-title">{option.title}</span>
                  <span className="reason-card-sub">{option.subtitle}</span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`reason-card-radio ${isSelected ? 'selected' : ''}`}>
                {isSelected && <div className="radio-inner-dot" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Conditional "Other" Reason Textarea */}
      {selectedReason === 'other' && (
        <div className="other-reason-field">
          <label htmlFor="other-reason-input" className="other-field-label">
            Specify your reason for revision <span className="required-star">*</span>
          </label>
          <textarea
            id="other-reason-input"
            rows={4}
            placeholder="Enter reason for revision..."
            className={`other-reason-textarea ${otherReasonError ? 'input-error' : ''}`}
            value={otherReasonText}
            onChange={onOtherReasonChange}
          />
          {otherReasonError && (
            <span className="other-error-text">{otherReasonError}</span>
          )}
        </div>
      )}
    </div>
  )
}
