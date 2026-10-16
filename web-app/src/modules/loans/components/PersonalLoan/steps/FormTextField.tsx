import React from 'react'
import type { ChangeEvent } from 'react'

export interface FormTextFieldProps {
  id: string
  label: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  maxLength?: number
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel'
  prefix?: string
  autoComplete?: string
  readOnly?: boolean
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  id,
  label,
  value = '',
  onChange,
  placeholder,
  required = true,
  error,
  maxLength,
  inputMode = 'text',
  prefix,
  autoComplete,
  readOnly = false,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      onChange(event.target.value)
    } catch (err) {
      console.error('Error handling input change', err)
    }
  }

  const inputClass = `pl-field__input${error ? ' pl-field__input--error' : ''}${
    readOnly ? ' pl-field__input--locked' : ''
  }`

  return (
    <div className="pl-field">
      <label className="pl-field__label" htmlFor={id}>
        {label} {required && <span className="pl-required">*</span>}
      </label>
      <div className="pl-field__input-wrap">
        {prefix && <span className="pl-field__prefix">{prefix}</span>}
        <input
          id={id}
          className={inputClass}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          readOnly={readOnly}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={handleChange}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="pl-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormTextField
