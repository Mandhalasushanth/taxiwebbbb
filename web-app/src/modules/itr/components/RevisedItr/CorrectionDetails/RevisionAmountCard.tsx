import React from 'react'
import { calculateIncomeChange } from '../../../validation/revisedItrValidation'
import './RevisionAmountCard.css'

interface RevisionAmountCardProps {
  id: string
  title: string
  isRequired?: boolean
  originalAmount: number
  revisedValue: string
  placeholder: string
  error?: string | null
  onChange: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const RevisionAmountCard: React.FC<RevisionAmountCardProps> = ({
  id,
  title,
  isRequired = false,
  originalAmount,
  revisedValue,
  placeholder,
  error,
  onChange,
  onKeyDown,
}) => {
  const { changeText, tone } = calculateIncomeChange(originalAmount, revisedValue)

  const formattedOriginal = originalAmount > 0
    ? `₹ ${new Intl.NumberFormat('en-IN').format(originalAmount)}`
    : '₹'

  return (
    <div className="revision-amount-card">
      {/* Header */}
      <div className="correction-card-header">
        <span className="correction-card-title">
          {title} {isRequired && <span className="required-star">*</span>}
        </span>
      </div>

      {/* Original Amount Row */}
      <div className="correction-original-row">
        <span className="original-label">Original</span>
        <span className="original-value">{formattedOriginal}</span>
      </div>

      {/* Revised Amount Input Group */}
      <div className="correction-input-group">
        <label htmlFor={id} className="revised-label">Revised</label>
        <div className="input-field-wrap">
          <span className="input-currency-prefix">₹</span>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            className={`correction-input ${error ? 'input-error' : ''}`}
            value={revisedValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        {error && <span className="correction-field-error">{error}</span>}
      </div>

      {/* Change Difference Row */}
      <div className="correction-change-row">
        <span className="change-label">Change</span>
        <span className={`change-value ${tone}`}>
          {changeText}
        </span>
      </div>
    </div>
  )
}
