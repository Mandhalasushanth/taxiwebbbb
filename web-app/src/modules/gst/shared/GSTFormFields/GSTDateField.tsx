import { useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId } from './gstFieldClasses'
import { DobDatePickerModal } from '@modules/authentication/components/DobDatePickerModal/DobDatePickerModal'
import './GSTFormFields.css'

export interface GSTDateFieldProps {
  id: string
  label: string
  /** ISO date (YYYY-MM-DD) as stored in the form */
  value: string
  min?: string
  max?: string
  placeholder?: string
  error?: string | null
  onValueChange: (value: string) => void
}

/** YYYY-MM-DD → DD-MM-YYYY for display */
const toDisplayDate = (iso: string) => iso.split('-').reverse().join('-')

export const GSTDateField = ({
  id,
  label,
  value,
  min,
  max,
  placeholder = 'DD-MM-YYYY',
  error,
  onValueChange,
}: GSTDateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapClass = ['gst-date', error ? 'gst-date--error' : ''].filter(Boolean).join(' ')

  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined

  return (
    <GSTFieldShell id={id} label={label} error={error}>
      <div
        className={wrapClass}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        <span className="gst-date__icon" aria-hidden="true">
          <CalendarDays />
        </span>
        <span className={`gst-date__text ${value ? '' : 'gst-date__text--empty'}`} aria-hidden="true">
          {value ? toDisplayDate(value) : placeholder}
        </span>
        <ChevronDown className="gst-date__chevron" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type="hidden"
          value={value}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId(id) : undefined}
        />
        <DobDatePickerModal
          isOpen={isOpen}
          value={value}
          title={label}
          format="YYYY-MM-DD"
          minDate={minDate}
          maxDate={maxDate}
          onApply={(dateStr) => onValueChange(dateStr)}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </GSTFieldShell>
  )
}

export default GSTDateField
