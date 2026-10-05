import React from 'react'
import type { RevisionReasonKey } from '../../../types/revisedItr.types'
import { REVISION_REASONS } from '../../../services/revisedItrService'
import { Wallet as IconWallet, FileText as IconFileText, Landmark as BankIcon, Pencil as EditIcon } from 'lucide-react'
import './ReasonForRevision.css'

export interface ReasonForRevisionProps {
  selectedReason: RevisionReasonKey | null
  otherReasonText: string
  reasonError?: string | null
  otherReasonError?: string | null
  onSelectReason: (reason: RevisionReasonKey) => void
  onOtherReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const REASON_ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  income: IconWallet,
  deduction: IconFileText,
  bank: BankIcon,
  other: EditIcon,
}

const renderReasonIcon = (type: string) => {
  try {
    const IconComp = REASON_ICON_MAP[type] || IconFileText
    return <IconComp size={22} />
  } catch {
    return <IconFileText size={22} />
  }
}

export const ReasonForRevision: React.FC<ReasonForRevisionProps> = ({
  selectedReason,
  otherReasonText,
  reasonError,
  otherReasonError,
  onSelectReason,
  onOtherReasonChange,
}) => {
  const renderReasonOption = (option: (typeof REVISION_REASONS)[number]) => {
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
            {renderReasonIcon(option.icon)}
          </div>
          <div className="reason-card-text">
            <span className="reason-card-title">{option.title}</span>
            <span className="reason-card-sub">{option.subtitle}</span>
          </div>
        </div>

        <div className={`reason-card-radio ${isSelected ? 'selected' : ''}`}>
          {isSelected && <div className="radio-inner-dot" />}
        </div>
      </button>
    )
  }

  const renderOtherReasonInput = () =>
    selectedReason === 'other' ? (
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
        {otherReasonError && <span className="other-error-text">{otherReasonError}</span>}
      </div>
    ) : null

  return (
    <div className="step2-reason-for-revision">
      <h2 className="step2-heading">Why are you revising your ITR?</h2>
      {reasonError && <div className="step2-error-banner">{reasonError}</div>}
      <div className="reason-cards-list" role="radiogroup" aria-label="Reasons for revision">
        {REVISION_REASONS.map(renderReasonOption)}
      </div>
      {renderOtherReasonInput()}
    </div>
  )
}
