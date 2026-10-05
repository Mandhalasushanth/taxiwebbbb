import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
  style?: React.CSSProperties
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
  style,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxLength)
    onChange(digitsOnly)
  }

  const isInvalid = Boolean(hasError || error)

  return (
    <div className="confirm-acc-input-container" style={{ position: 'relative', width: '100%', ...style }}>
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
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
          className={`${className} ${isInvalid ? 'input--invalid has-error input-error' : ''}`}
          style={{ width: '100%', paddingRight: '2.5rem' }}
          aria-invalid={isInvalid}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          style={{
            position: 'absolute',
            right: '0.625rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
          aria-label={showPassword ? 'Hide confirm account number' : 'Show confirm account number'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span
          className="confirm-acc-error"
          role="alert"
          style={{
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 500,
            marginTop: '0.25rem',
            display: 'block',
            lineHeight: 1.25,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default ConfirmAccountNumberInput
