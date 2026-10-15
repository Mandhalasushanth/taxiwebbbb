import React from 'react'
import type { ReactNode } from 'react'

export interface FormTextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  maxLength?: number
  multiline?: boolean
  type?: 'text' | 'date'
  inputMode?: 'text' | 'numeric' | 'decimal'
  autoComplete?: string
  /** Shown inside the field before the value, e.g. "₹" */
  prefix?: ReactNode
  /** Extra attributes for date inputs */
  min?: string
  max?: string
}

/** Labelled input / textarea with hint and error, styled for the Business & Working Capital flow */
export const FormTextField: React.FC<FormTextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required = true,
  maxLength,
  multiline = false,
  type = 'text',
  inputMode,
  autoComplete = 'off',
  prefix,
  min,
  max,
}) => {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const controlClass = `bwc-field__input${multiline ? ' bwc-field__input--multiline' : ''}${error ? ' bwc-field__input--error' : ''}${prefix ? ' bwc-field__input--prefixed' : ''}`
  const shared = {
    id,
    value,
    placeholder,
    maxLength,
    className: controlClass,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': describedBy,
  }

  return (
    <div className="bwc-field">
      <label className="bwc-field__label" htmlFor={id}>
        {label} {required && <span className="bwc-required">*</span>}
      </label>
      <div className="bwc-field__control">
        {prefix && <span className="bwc-field__prefix">{prefix}</span>}
        {multiline ? (
          <textarea {...shared} rows={3} onChange={(event) => onChange(event.target.value)} />
        ) : (
          <input
            {...shared}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            min={min}
            max={max}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="bwc-field__error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="bwc-field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export default FormTextField
