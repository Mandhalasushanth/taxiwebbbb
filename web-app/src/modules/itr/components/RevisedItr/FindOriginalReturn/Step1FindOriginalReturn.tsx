import React from 'react'
import { AY_OPTIONS, type OriginalReturnDetails } from '../../../types/revisedItr.types'
import './Step1FindOriginalReturn.css'

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
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`select-arrow ${isOpen ? 'flipped' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="assessment-year-menu" role="listbox">
          {AY_OPTIONS.map((ay) => {
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
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="selected-check-icon"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface OriginalReturnFoundCardProps {
  details: OriginalReturnDetails | null
}

const OriginalReturnFoundCard: React.FC<OriginalReturnFoundCardProps> = ({ details }) => {
  return (
    <div className="original-return-found-card">
      <div className="found-card-header">
        <h3 className="found-card-title">Original Return Found</h3>
        <span className="found-card-badge">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>

      <div className="found-card-body">
        <div className="found-card-row">
          <span className="row-label">Filed:</span>
          <span className="row-value">{details?.status || 'Verified from IT Portal'}</span>
        </div>

        <div className="found-card-row">
          <span className="row-label">Assessment Year:</span>
          <span className="row-value">{details?.assessmentYear || '—'}</span>
        </div>

        <div className="found-card-row">
          <span className="row-label">ITR Form:</span>
          <span className="row-value">{details?.itrForm || 'ITR Form'}</span>
        </div>

        <div className="found-card-row">
          <span className="row-label">Gross Total Income:</span>
          <span className="row-value row-dash">{details?.grossTotalIncome || '—'}</span>
        </div>
      </div>
    </div>
  )
}

interface Step1FindOriginalReturnProps {
  ackNumber: string
  selectedAy: string
  isDropdownOpen: boolean
  isReturnFound: boolean
  returnDetails: OriginalReturnDetails | null
  ackError?: string | null
  ayError?: string | null
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onAckChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onToggleDropdown: () => void
  onSelectAy: (ay: string) => void
}

export const Step1FindOriginalReturn: React.FC<Step1FindOriginalReturnProps> = ({
  ackNumber,
  selectedAy,
  isDropdownOpen,
  isReturnFound,
  returnDetails,
  ackError,
  ayError,
  dropdownRef,
  onAckChange,
  onKeyDown,
  onToggleDropdown,
  onSelectAy,
}) => {
  return (
    <div className="step1-find-original-return">
      <h2 className="step1-heading">Find Original Return</h2>

      {/* Acknowledgement Number Input */}
      <div className="step1-form-field">
        <label htmlFor="ack-input" className="field-label">
          Original ITR Acknowledgement Number <span className="required-star">*</span>
        </label>
        <input
          id="ack-input"
          type="text"
          inputMode="numeric"
          maxLength={15}
          placeholder="Enter acknowledgement number"
          className={`step1-text-input ${ackError ? 'input-error' : ''}`}
          value={ackNumber}
          onKeyDown={onKeyDown}
          onChange={onAckChange}
        />
        {ackError && <span className="field-error-text">{ackError}</span>}
      </div>

      {/* Assessment Year Dropdown */}
      <div className="step1-form-field">
        <label className="field-label">
          Assessment Year <span className="required-star">*</span>
        </label>
        <AssessmentYearDropdown
          selectedAy={selectedAy}
          isOpen={isDropdownOpen}
          hasError={!!ayError}
          dropdownRef={dropdownRef}
          onToggle={onToggleDropdown}
          onSelect={onSelectAy}
        />
        {ayError && <span className="field-error-text">{ayError}</span>}
      </div>

      {/* Original Return Found Card */}
      {isReturnFound && <OriginalReturnFoundCard details={returnDetails} />}
    </div>
  )
}
