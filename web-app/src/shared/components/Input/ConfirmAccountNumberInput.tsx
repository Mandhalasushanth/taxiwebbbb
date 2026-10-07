import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './ConfirmAccountNumberInput.css'

export interface ConfirmAccountNumberInputProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  hasError?: boolean
  error?: string
  maxLength?: number
  disabled?: boolean
  required?: boolean
  autoComplete?: string
}

export const ConfirmAccountNumberInput: React.FC<ConfirmAccountNumberInputProps> = ({
  id = 'confirm-account-number',
  name = 'confirmAccountNumber',
  value,
  onChange,
  onBlur,
  placeholder = 'Confirm bank account number',
  className = '',
  hasError = false,
  error,
  maxLength = 18,
  disabled = false,
  required = true,
  autoComplete = 'off',
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxLength)
    onChange(digitsOnly)
  }

  const isInvalid = Boolean(hasError || error)

  return (
    <div className="confirm-acc-input-container">
      <div className="confirm-acc-input-row">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`confirm-acc-input ${className} ${isInvalid ? 'input--invalid has-error input-error' : ''}`}
          aria-invalid={isInvalid}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="confirm-acc-toggle"
          aria-label={showPassword ? 'Hide confirm account number' : 'Show confirm account number'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span
          className="confirm-acc-error"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default ConfirmAccountNumberInput
