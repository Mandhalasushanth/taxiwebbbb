import React from 'react'
import { Briefcase, Check, UserRound } from 'lucide-react'
import type { EmploymentType } from '@modules/loans/types/personalLoan.types'

export interface EmploymentTypeSelectorProps {
  value: EmploymentType
  onChange: (value: EmploymentType) => void
  error?: string
}

export const EmploymentTypeSelector: React.FC<EmploymentTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const options = [
    { type: 'salaried' as const, label: 'Salaried', icon: <Briefcase size={28} /> },
    { type: 'self-employed' as const, label: 'Self Employed', icon: <UserRound size={28} /> },
  ]

  return (
    <div className="pl-emp-selector" role="radiogroup" aria-labelledby="pl-emp-type-label">
      <div id="pl-emp-type-label" className="pl-emp-section-label">
        Employment Type <span className="pl-required">*</span>
      </div>

      <div className="pl-emp-type-grid">
        {options.map((option) => {
          const isSelected = value === option.type
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`pl-emp-type-card${isSelected ? ' pl-emp-type-card--selected' : ''}`}
              onClick={() => onChange(option.type)}
            >
              {isSelected && (
                <span className="pl-emp-type-badge" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <span className="pl-emp-type-icon">{option.icon}</span>
              <span className="pl-emp-type-label">{option.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="pl-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default EmploymentTypeSelector
