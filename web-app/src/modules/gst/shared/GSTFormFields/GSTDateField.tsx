import React, { type MouseEvent } from 'react'
import { CalendarDays } from 'lucide-react'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId } from './gstFieldClasses'
import './GSTFormFields.css'

export interface GSTDateFieldProps {
  id: string
  label: string
  infoTooltip?: React.ReactNode
  /** ISO date (YYYY-MM-DD) as stored in the form */
  value: string
  min?: string
  max?: string
  placeholder?: string
  error?: string | null
  onValueChange: (value: string) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

/** YYYY-MM-DD → DD-MM-YYYY for display */
const toDisplayDate = (iso: string) => {
  if (!iso) return ''
  return iso.split('-').reverse().join('-')
}

const openPicker = (e: MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // Browsers without showPicker fall back to native behaviour
  }
}

export const GSTDateField = ({
  id,
  label,
  infoTooltip,
  value,
  min,
  max,
  placeholder = 'DD-MM-YYYY',
  error,
  onValueChange,
  onBlur,
}: GSTDateFieldProps) => {
  const wrapClass = ['gst-date', error ? 'gst-date--error' : ''].filter(Boolean).join(' ')

  return (
    <GSTFieldShell id={id} label={label} infoTooltip={infoTooltip} error={error}>
      <div className={wrapClass}>
        <span className="gst-date__icon" aria-hidden="true">
          <CalendarDays />
        </span>
        <span className={`gst-date__text ${value ? '' : 'gst-date__text--empty'}`} aria-hidden="true">
          {value ? toDisplayDate(value) : placeholder}
        </span>
        <input
          id={id}
          name={id}
          type="date"
          className="gst-date__native"
          value={value}
          min={min}
          max={max}
          onClick={openPicker}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={onBlur}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId(id) : undefined}
        />
      </div>
    </GSTFieldShell>
  )
}

export default GSTDateField

