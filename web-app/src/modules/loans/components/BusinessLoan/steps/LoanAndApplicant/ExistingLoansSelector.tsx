import React from 'react'
import { FileText } from 'lucide-react'
import type { ExistingLoansType } from '@modules/loans/types/businessLoan.types'

interface ExistingLoanOptionCardProps {
  type: ExistingLoansType
  title: string
  subtitle: string
  selectedType: ExistingLoansType
  onSelect: (type: ExistingLoansType) => void
}

/**
 * Pure individual existing loan option card (Loop-free)
 */
const ExistingLoanOptionCard: React.FC<ExistingLoanOptionCardProps> = ({
  type,
  title,
  subtitle,
  selectedType,
  onSelect,
}) => {
  const isSelected = selectedType === type

  return (
    <button
      type="button"
      className={`existing-loan-card ${isSelected ? 'existing-loan-card--selected' : ''}`}
      onClick={() => onSelect(type)}
      role="radio"
      aria-checked={isSelected}
      data-testid={`existing-loan-option-${type}`}
    >
      <div className={`custom-radio-circle ${isSelected ? 'custom-radio-circle--selected' : ''}`}>
        {isSelected && <div className="custom-radio-inner-dot" />}
      </div>
      <div className="existing-loan-card__content">
        <span className="existing-loan-card__title">{title}</span>
        <span className="existing-loan-card__subtitle">{subtitle}</span>
      </div>
    </button>
  )
}

export interface ExistingLoansSelectorProps {
  value: ExistingLoansType
  onChange: (val: ExistingLoansType) => void
  error?: string
}

/**
 * Horizontal selector for Existing Loans verification
 */
export const ExistingLoansSelector: React.FC<ExistingLoansSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="form-section-block">
      <div className="form-section-header">
        <div className="form-section-header__left">
          <div className="form-section-icon-box">
            <FileText size={20} aria-hidden="true" />
          </div>

          <label className="form-section-title">
            Do you have any existing loans? <span className="text-required">*</span>
          </label>
        </div>
      </div>

      {/* 2 Explicit Radio Cards (Loop-Free) */}
      <div className="existing-loans-row" role="radiogroup" aria-label="Existing loans status">
        <ExistingLoanOptionCard
          type="none"
          title="No Existing Loans"
          subtitle="I do not have any active loans with other lenders."
          selectedType={value}
          onSelect={onChange}
        />
        <ExistingLoanOptionCard
          type="active"
          title="Yes, Active Loans"
          subtitle="I have one or more active loans with other lenders."
          selectedType={value}
          onSelect={onChange}
        />
      </div>

      {error && <span className="field-error-text">{error}</span>}
    </div>
  )
}

export default ExistingLoansSelector
