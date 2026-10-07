import React from 'react'
import { AY_OPTIONS, type OriginalReturnDetails } from '@modules/itr/types/revisedItr.types'
import { ChevronDown as ChevronDownIcon, Check as CheckIcon } from 'lucide-react'
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

interface OriginalReturnFoundCardProps {
  details: OriginalReturnDetails | null
}

const OriginalReturnFoundCard: React.FC<OriginalReturnFoundCardProps> = ({ details }) => {
  const foundRows = [
    { label: 'Filed:', value: details?.status || 'Verified from IT Portal', isDash: false },
    { label: 'Assessment Year:', value: details?.assessmentYear || '—', isDash: false },
    { label: 'ITR Form:', value: details?.itrForm || 'ITR Form', isDash: false },
    { label: 'Gross Total Income:', value: details?.grossTotalIncome || '—', isDash: true },
  ]

  return (
    <div className="original-return-found-card">
      <div className="found-card-header">
        <h3 className="found-card-title">Original Return Found</h3>
        <span className="found-card-badge">
          <CheckIcon size={14} />
        </span>
      </div>

      <div className="found-card-body">
        {foundRows.map((row) => (
          <div key={row.label} className="found-card-row">
            <span className="row-label">{row.label}</span>
            <span className={`row-value ${row.isDash ? 'row-dash' : ''}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface FindOriginalReturnProps {
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

export const FindOriginalReturn: React.FC<FindOriginalReturnProps> = ({
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
  const renderAckField = () => (
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
    <div className="step1-find-original-return">
      <h2 className="step1-heading">Find Original Return</h2>
      {renderAckField()}
      {renderAyField()}
      {isReturnFound && <OriginalReturnFoundCard details={returnDetails} />}
    </div>
  )
}
