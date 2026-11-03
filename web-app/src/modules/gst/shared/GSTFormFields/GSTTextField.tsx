import type { InputHTMLAttributes, ReactNode } from 'react'
import { CaretInput } from '@shared/components'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId, fieldInputClass } from './gstFieldClasses'
import './GSTFormFields.css'

export interface GSTTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange' | 'className'> {
  id: string
  label: string
  infoTooltip?: ReactNode
  value: string
  error?: string | null
  alertError?: boolean
  helper?: ReactNode
  onValueChange: (value: string) => void
}

export const GSTTextField = ({
  id,
  label,
  infoTooltip,
  value,
  error,
  alertError,
  helper,
  onValueChange,
  name,
  type = 'text',
  ...inputProps
}: GSTTextFieldProps) => (
  <GSTFieldShell id={id} label={label} infoTooltip={infoTooltip} error={error} alertError={alertError} helper={helper}>
    <CaretInput
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
