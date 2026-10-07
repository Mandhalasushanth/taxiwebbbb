import { ChevronDown } from 'lucide-react'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId, fieldInputClass } from './gstFieldClasses'
import './GSTFormFields.css'

export interface GSTSelectOptionState {
  disabled?: boolean
  label?: string
}

export interface GSTSelectFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  options: readonly string[]
  error?: string | null
  onValueChange: (value: string) => void
  /** Lets a caller disable or relabel individual options (e.g. composition-scheme rules) */
  getOptionState?: (option: string) => GSTSelectOptionState
}

export const GSTSelectField = ({
  id,
  label,
  value,
  placeholder,
  options,
  error,
  onValueChange,
  getOptionState,
}: GSTSelectFieldProps) => {
  const isEmpty = !value

  const renderOption = (option: string) => {
    const state = getOptionState?.(option) ?? {}
    return (
      <option key={option} value={option} disabled={state.disabled}>
        {state.label ?? option}
      </option>
    )
  }

  return (
    <GSTFieldShell id={id} label={label} error={error}>
      <div className="gst-field__select-wrap">
        <select
          id={id}
          name={id}
          className={fieldInputClass(error, `gst-field__select ${isEmpty ? 'gst-field__select--empty' : ''}`)}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId(id) : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map(renderOption)}
        </select>
        <ChevronDown className="gst-field__chevron" aria-hidden="true" />
      </div>
    </GSTFieldShell>
  )
}

export default GSTSelectField
