import type { ReactNode } from 'react'
import { fieldErrorId } from './gstFieldClasses'

interface GSTFieldShellProps {
  id: string
  label: string
  infoTooltip?: ReactNode
  error?: string | null
  alertError?: boolean
  helper?: ReactNode
  children: ReactNode
}

/** Label + control + error message wrapper shared by every GST form field */
export const GSTFieldShell = ({
  id,
  label,
  infoTooltip,
  error,
  alertError = false,
  helper,
  children,
}: GSTFieldShellProps) => (
  <div className="gst-field">
    {infoTooltip ? (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.6rem' }}>
        <label htmlFor={id} className="gst-field__label" style={{ marginBottom: 0 }}>
          {label} <span className="gst-field__required" aria-hidden="true">*</span>
        </label>
        {infoTooltip}
      </div>
    ) : (
      <label htmlFor={id} className="gst-field__label">
        {label} <span className="gst-field__required" aria-hidden="true">*</span>
      </label>
    )}
    {children}
    {error ? (
      <span id={fieldErrorId(id)} className="gst-field__error" role={alertError ? 'alert' : undefined}>
        {error}
      </span>
    ) : (
      helper
    )}
  </div>
)
