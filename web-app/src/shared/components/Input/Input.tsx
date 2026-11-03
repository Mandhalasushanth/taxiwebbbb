import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { classNames } from '../../utils/formatUtils'
import { CaretInput } from './CaretInput'
import './Input.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  hint?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export const Input = ({ label, hint, error, prefix, suffix, className, id, ...rest }: InputProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={classNames('field', error && 'field--invalid', className)}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {rest.required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="field__control">
        {prefix && <span className="field__affix">{prefix}</span>}
        <CaretInput
          {...rest}
          id={inputId}
          className="field__input"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
        />
        {suffix && <span className="field__affix">{suffix}</span>}
      </div>

      {error ? (
        <p className="field__error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${inputId}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
