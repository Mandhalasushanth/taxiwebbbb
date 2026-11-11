import React from 'react'
import { CaretInput, FieldInfoTooltip } from '@shared/components'
import { AY_OPTIONS } from '@modules/itr/types/revisedItr.types'
import { ChevronDown as ChevronDownIcon, Check as CheckIcon, FileText } from 'lucide-react'
import './FindOriginalReturn.css'

interface AssessmentYearDropdownProps {
  selectedAy: string
  isOpen: boolean
  hasError: boolean
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onToggle: () => void
  onSelect: (ay: string) => void
}

const AssessmentYearDropdown: React.FC<AssessmentYearDropdownProps> = ({
  selectedAy,
  isOpen,
  hasError,
  dropdownRef,
  onToggle,
  onSelect,
}) => {
  const renderMenuOption = (ay: string) => {
    const isSelected = ay === selectedAy
    return (
      <button
        key={ay}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={`assessment-year-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(ay)}
      >
        <span>{ay}</span>
        {isSelected && <CheckIcon size={16} className="selected-check-icon" />}
      </button>
    )
  }

  return (
    <div className="assessment-year-dropdown-wrap" ref={dropdownRef}>
      <button
        type="button"
        className={`assessment-year-select-btn ${isOpen ? 'open' : ''} ${hasError ? 'input-error' : ''}`}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedAy ? 'select-value' : 'select-placeholder'}>
          {selectedAy || 'Select Assessment Year'}
        </span>
        <ChevronDownIcon size={18} className={`select-arrow ${isOpen ? 'flipped' : ''}`} />
      </button>

      {isOpen && (
        <div className="assessment-year-menu" role="listbox">
          {AY_OPTIONS.map(renderMenuOption)}
        </div>
      )}
    </div>
  )
}

export interface FindOriginalReturnProps {
  ackNumber: string
  selectedAy: string
  isDropdownOpen: boolean
  ackError?: string | null
  ayError?: string | null
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onAckChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onToggleDropdown: () => void
  onSelectAy: (ay: string) => void
}

export const FindOriginalReturn: React.FC<FindOriginalReturnProps> = ({
  ackNumber,
  selectedAy,
  isDropdownOpen,
  ackError,
  ayError,
  dropdownRef,
  onAckChange,
  onKeyDown,
  onToggleDropdown,
  onSelectAy,
}) => {
  const renderAckField = () => (
    <div className="step1-form-field">
      <div className="field-label-row">
        <label htmlFor="ack-input" className="field-label">
          Original ITR Acknowledgement Number <span className="required-star">*</span>
        </label>
        <FieldInfoTooltip
          title="ITR Acknowledgement Number"
          description="Enter the 15-digit acknowledgement number printed on your ITR-V acknowledgment receipt."
        />
      </div>
      <CaretInput
        id="ack-input"
        type="text"
        inputMode="numeric"
        maxLength={15}
        placeholder="Enter 15-digit acknowledgement number"
        className={`step1-text-input ${ackError ? 'input-error' : ''}`}
        value={ackNumber}
        onKeyDown={onKeyDown}
        onChange={onAckChange}
      />
      {ackError && <span className="field-error-text">{ackError}</span>}
    </div>
  )

  const renderAyField = () => (
    <div className="step1-form-field">
      <label className="field-label">
        Assessment Year <span className="required-star">*</span>
      </label>
      <AssessmentYearDropdown
        selectedAy={selectedAy}
        isOpen={isDropdownOpen}
        hasError={Boolean(ayError)}
        dropdownRef={dropdownRef}
        onToggle={onToggleDropdown}
        onSelect={onSelectAy}
      />
      {ayError && <span className="field-error-text">{ayError}</span>}
    </div>
  )

  return (
    <div className="step1-find-original-return" id="revised-step1-search" data-section="revised-step1-search">
      <div className="step1-page-header">
        <h2 className="step1-heading">Find Original Return</h2>
        <p className="step1-subheading">Verify your previous return filing details to start the revision.</p>
      </div>

      <div className="step1-section-card">
        <div className="step1-card-header">
          <div className="step1-card-title-row">
            <FileText size={20} className="step1-card-icon" aria-hidden="true" />
            <h3 className="step1-card-title">Original Return Details</h3>
          </div>
          <p className="step1-card-desc">
            Enter the 15-digit acknowledgement number from your previously filed ITR-V and select the assessment year.
          </p>
        </div>

        <div className="step1-card-body">
          {renderAckField()}
          {renderAyField()}
        </div>
      </div>
    </div>
  )
}
