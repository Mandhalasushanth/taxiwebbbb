import React from 'react'
import { Briefcase, Info } from 'lucide-react'
import type { EmploymentProfileType } from '@modules/loans/types/businessLoan.types'

interface EmploymentOptionCardProps {
  type: EmploymentProfileType
  label: string
  selectedType: EmploymentProfileType
  onSelect: (type: EmploymentProfileType) => void
}

/**
 * Pure individual employment radio card (Loop-free)
 */
const EmploymentOptionCard: React.FC<EmploymentOptionCardProps> = ({
  type,
  label,
  selectedType,
  onSelect,
}) => {
  const isSelected = selectedType === type

  return (
    <button
      type="button"
      className={`employment-option-card ${isSelected ? 'employment-option-card--selected' : ''}`}
      onClick={() => onSelect(type)}
      role="radio"
      aria-checked={isSelected}
      data-testid={`employment-option-${type}`}
    >
      <div className={`custom-radio-circle ${isSelected ? 'custom-radio-circle--selected' : ''}`}>
        {isSelected && <div className="custom-radio-inner-dot" />}
      </div>
      <span className="employment-option-card__label">{label}</span>
    </button>
  )
}

export interface EmploymentProfileSelectorProps {
  value: EmploymentProfileType
  onChange: (val: EmploymentProfileType) => void
  error?: string
}

/**
 * Horizontal radio selector for Employment / Business Profile
 */
export const EmploymentProfileSelector: React.FC<EmploymentProfileSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="form-section-block">
      <div className="form-section-header">
        <div className="form-section-header__left">
          <div className="form-section-icon-box">
            <Briefcase size={20} aria-hidden="true" />
          </div>
          <label className="form-section-title">
            Employment / Business Profile <span className="text-required">*</span>
          </label>
          <div className="form-section-info-icon" title="Select your primary source of profession or business income">
            <Info size={16} aria-hidden="true" />
          </div>

        </div>
      </div>

      {/* 3 Explicit Radio Cards (Loop-Free) */}
      <div className="employment-options-row" role="radiogroup" aria-label="Employment Profile">
        <EmploymentOptionCard
          type="salaried"
          label="Salaried"
          selectedType={value}
          onSelect={onChange}
        />
        <EmploymentOptionCard
          type="self-employed"
          label="Self-Employed Professional"
          selectedType={value}
          onSelect={onChange}
        />
        <EmploymentOptionCard
          type="business-owner"
          label="Business Owner"
          selectedType={value}
          onSelect={onChange}
        />
      </div>

      {error && <span className="field-error-text">{error}</span>}
    </div>
  )
}

export default EmploymentProfileSelector
