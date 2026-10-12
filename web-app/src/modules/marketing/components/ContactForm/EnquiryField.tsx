import type { ChangeEvent, FocusEvent, InputHTMLAttributes, ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { classNames } from '@shared/utils'
import './EnquiryField.css'

type FieldElement = HTMLInputElement | HTMLTextAreaElement

export interface EnquiryFieldProps {
  id: string
  name: string
  label: string
  value: string
  icon: ReactNode
  placeholder: string
  error?: string
  isValid?: boolean
  multiline?: boolean
  maxLength?: number
  /** Text shown inside the field before the value (e.g. +91) */
  prefix?: string
  /** Helper shown under the field when there is no error (e.g. a character counter) */
  hint?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  onChange: (event: ChangeEvent<FieldElement>) => void
  onBlur: (event: FocusEvent<FieldElement>) => void
}

/** One contact-form field: icon, input, live ✓ / ! status and its message. Same look for input and textarea. */
export const EnquiryField = ({
  id,
  label,
  icon,
  error,
  isValid = false,
  multiline = false,
  prefix,
  hint,
  type = 'text',
  ...inputProps
}: EnquiryFieldProps) => {
  const messageId = `${id}-message`
  const status = error ? 'invalid' : isValid ? 'valid' : 'idle'
  const sharedProps = {
    ...inputProps,
    id,
    required: true,
    className: 'mk-enquiry-field__input',
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': error || hint ? messageId : undefined,
  }

  const statusIcon = {
    invalid: <CircleAlert className="mk-enquiry-field__status" aria-hidden="true" />,
    valid: <CircleCheck className="mk-enquiry-field__status" aria-hidden="true" />,
    idle: null,
  }[status]

  return (
    <div className={classNames('mk-enquiry-field', `mk-enquiry-field--${status}`, multiline && 'mk-enquiry-field--multiline')}>
      <label className="mk-enquiry-field__label" htmlFor={id}>
        {label}
        <span aria-hidden="true"> *</span>
      </label>

      <div className="mk-enquiry-field__control">
        <span className="mk-enquiry-field__icon" aria-hidden="true">
          {icon}
        </span>
        {prefix && <span className="mk-enquiry-field__prefix">{prefix}</span>}
        {multiline ? <textarea {...sharedProps} rows={4} /> : <input {...sharedProps} type={type} />}
        {statusIcon}
      </div>

      {(error || hint) && (
        <p id={messageId} className="mk-enquiry-field__message" role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
