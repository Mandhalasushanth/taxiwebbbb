import type { InputHTMLAttributes } from 'react'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId, fieldInputClass } from './gstFieldClasses'
import './GSTFormFields.css'

export interface GSTTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange' | 'className'> {
  id: string
  label: string
  value: string
  error?: string | null
  alertError?: boolean
  onValueChange: (value: string) => void
}

export const GSTTextField = ({
  id,
  label,
  value,
  error,
  alertError,
  onValueChange,
  name,
  type = 'text',
  ...inputProps
}: GSTTextFieldProps) => (
  <GSTFieldShell id={id} label={label} error={error} alertError={alertError}>
    <input
      {...inputProps}
      id={id}
      name={name ?? id}
      type={type}
      className={fieldInputClass(error)}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      aria-required="true"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? fieldErrorId(id) : undefined}
    />
  </GSTFieldShell>
)

export default GSTTextField
