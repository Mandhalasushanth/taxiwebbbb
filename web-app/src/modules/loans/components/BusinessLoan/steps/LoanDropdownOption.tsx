import React from 'react'
import { Check } from 'lucide-react'

export interface LoanDropdownOptionProps {
  value: string
  label: string
  isSelected: boolean
  onSelect: (val: string) => void
  variant?: 'custom' | 'banking'
}

/**
 * Reusable dropdown option item for business loan forms.
 */
export const LoanDropdownOption: React.FC<LoanDropdownOptionProps> = ({
  value,
  label,
  isSelected,
  onSelect,
  variant = 'custom',
}) => {
  const isBanking = variant === 'banking'
  const baseClass = isBanking ? 'banking-dropdown-option' : 'custom-dropdown-option'
  const selectedClass = isBanking
    ? 'banking-dropdown-option--selected'
    : 'custom-dropdown-option--selected'
  const iconClass = isBanking ? 'banking-dropdown-check' : 'dropdown-check-icon'

  return (
    <button
      type="button"
      className={`${baseClass} ${isSelected ? selectedClass : ''}`}
      onClick={() => onSelect(value)}
      role="option"
      aria-selected={isSelected}
    >
      <span>{label}</span>
      {isSelected && (
        <Check
          size={16}
          className={iconClass}
          aria-hidden="true"
        />
      )}
    </button>
  )
}

export default LoanDropdownOption
