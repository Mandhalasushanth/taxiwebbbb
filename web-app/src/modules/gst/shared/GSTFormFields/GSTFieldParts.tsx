import type { ReactNode } from 'react'
import { fieldErrorId } from './gstFieldClasses'

interface GSTFieldShellProps {
  id: string
  label: string
  error?: string | null
  alertError?: boolean
  children: ReactNode
}

/** Label + control + error message wrapper shared by every GST form field */
export const GSTFieldShell = ({ id, label, error, alertError = false, children }: GSTFieldShellProps) => (
  <div className="gst-field">
    <label htmlFor={id} className="gst-field__label">
      {label} <span className="gst-field__required" aria-hidden="true">*</span>
    </label>
    {children}
    {error && (
      <span id={fieldErrorId(id)} className="gst-field__error" role={alertError ? 'alert' : undefined}>
        {error}
      </span>
    )}
  </div>
)

