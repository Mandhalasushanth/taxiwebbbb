import React, { useState, useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { GSTFieldShell } from './GSTFieldParts'
import { fieldErrorId } from './gstFieldClasses'
import { CustomCalendarPopover } from '../../../../shared/components'
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
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

/** YYYY-MM-DD → DD-MM-YYYY for display */
const toDisplayDate = (iso: string) => {
  if (!iso) return ''
  return iso.split('-').reverse().join('-')
}

export const GSTDateField = ({
  id,
  label,
  value,
  min,
  max,
  placeholder = 'DD-MM-YYYY',
  error,
  onValueChange,
  onBlur,
}: GSTDateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const wrapClass = ['gst-date', error ? 'gst-date--error' : ''].filter(Boolean).join(' ')

  const handleApplyDate = (newIsoDate: string) => {
    onValueChange(newIsoDate)
    setIsOpen(false)
  }

  return (
    <GSTFieldShell id={id} label={label} error={error}>
      <div
        ref={anchorRef}
        className={wrapClass}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ cursor: 'pointer', position: 'relative' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
        onBlur={onBlur}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? fieldErrorId(id) : undefined}
      >
        <span className="gst-date__icon" aria-hidden="true">
          <CalendarDays />
        </span>
        <span className={`gst-date__text ${value ? '' : 'gst-date__text--empty'}`} aria-hidden="true">
          {value ? toDisplayDate(value) : placeholder}
        </span>

        <CustomCalendarPopover
          isOpen={isOpen}
          value={value}
          format="YYYY-MM-DD"
          minDate={min}
          maxDate={max}
          anchorRef={anchorRef}
          onChange={handleApplyDate}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </GSTFieldShell>
  )
}

export default GSTDateField
