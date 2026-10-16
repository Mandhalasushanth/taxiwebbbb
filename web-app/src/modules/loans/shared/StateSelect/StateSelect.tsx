import React from 'react'
import { CANONICAL_INDIAN_STATES_AND_UTS } from '@shared/services/indianStates'
import './StateSelect.css'

export interface StateSelectOption {
  value: string
  label: string
}

export interface StateSelectProps {
  id: string
  label?: string
  value?: string
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
  options?: readonly string[] | readonly StateSelectOption[]
  onChange: (value: string) => void
}

/**
 * Reusable State / Union Territory select component modeled directly on GST Amendment.
 * Uses a native <select> element with custom chevron styling so users can click/focus
 * and type alphabets to jump directly to any state (e.g. 'T' -> Telangana, 'M' -> Maharashtra).
 */
export const StateSelect: React.FC<StateSelectProps> = ({
  id,
  label = 'State',
  value = '',
  placeholder = 'Select State',
  required = true,
  error,
  disabled = false,
  className = '',
  options = CANONICAL_INDIAN_STATES_AND_UTS,
  onChange,
}) => {
  const labelId = `${id}-label`
  const errorId = `${id}-error`
  const isEmpty = !value

  return (
    <div className={`loan-state-select-field ${className}`}>
      {label && (
        <label id={labelId} htmlFor={id} className="loan-state-select-label">
          {label} {required && <span className="loan-state-select-required">*</span>}
        </label>
      )}
      <div className="loan-state-select-wrapper">
        <select
          id={id}
          name={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={`loan-state-select-input${isEmpty ? ' loan-state-select-input--empty' : ''}${
            error ? ' loan-state-select-input--error' : ''
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => {
            const optVal = typeof opt === 'string' ? opt : opt.value
            const optLabel = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <span className="loan-state-select-chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={errorId} className="loan-state-select-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default StateSelect
