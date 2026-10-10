import React, { useState } from 'react'
import type { DirectorDetails } from '../../types/incorporation.types'
import { filterDigits, filterMobile, filterPan } from '../../utils/validation'
import './DirectorCard.css'

interface FormFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  required?: boolean
  type?: string
  placeholder?: string
  error?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

const DirectorFormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder = '',
  error,
  inputProps = {},
}) => (
  <div className="director-group">
    <label className="director-label">
      {label}{required && <span className="director-required"> *</span>}
    </label>
    <input
      {...inputProps}
      type={type}
      className={`director-input ${error ? 'director-input--error' : ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {error && <span className="director-field-error">{error}</span>}
  </div>
)

export interface DirectorCardProps {
  director: DirectorDetails
  index: number
  onChange: (id: number, field: keyof DirectorDetails, value: DirectorDetails[keyof DirectorDetails]) => void
  onSave?: (id: number) => void
  onCancel?: (id: number) => void
  errors?: Record<string, string>
}

export const DirectorCard: React.FC<DirectorCardProps> = ({
  director,
  index,
  onChange,
  onSave,
  onCancel,
  errors = {},
}) => {
  const hasErrors = Object.keys(errors).length > 0
  const [isCollapsed, setIsCollapsed] = useState(Boolean(director.fullName.trim()) && !hasErrors)
  const displayedCollapsed = !hasErrors && isCollapsed

  const handleFieldChange = (field: keyof DirectorDetails, val: string | boolean) => {
    if (field === 'pan') {
      onChange(director.id, field, filterPan(String(val)))
      return
    }
    if (field === 'din') {
      onChange(director.id, field, filterDigits(String(val), 8))
      return
    }
    if (field === 'mobile') {
      onChange(director.id, field, filterMobile(String(val)))
      return
    }
    onChange(director.id, field, val)
  }

  const handleSave = () => {
    onSave?.(director.id)
    setIsCollapsed(true)
  }

  const handleCancel = () => {
    onCancel?.(director.id)
    setIsCollapsed(true)
  }

  return (
    <div className="director-card">
      {/* Header */}
      <div className="director-card__header">
        <div className="director-card__header-left">
          <div className="director-card__number-badge">#{index + 1}</div>
          <div className="director-card__meta">
            <div className="director-card__title-row">
              <span role="img" aria-label="director">👤</span>
              <h3 className="director-card__title">Director #{index + 1}</h3>
            </div>
            <span className="director-card__name">{director.fullName || 'Enter Director Details'}</span>
          </div>
        </div>

        {displayedCollapsed ? (
          <button
            type="button"
            className="director-card__btn-edit"
            onClick={() => setIsCollapsed(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit
          </button>
        ) : (
          <button
            type="button"
            className="director-card__btn-collapse"
            onClick={() => setIsCollapsed(true)}
          >
            ⌃ Collapse
          </button>
        )}
      </div>

      {/* Collapsed Summary View */}
      {displayedCollapsed && (
        <div className="director-card__collapsed-summary">
          <div className="director-card__summary-col">
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">PAN:</span>
              <span className="director-card__summary-val">{director.pan || '—'}</span>
            </span>
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">Designation:</span>
              <span className="director-card__summary-val">{director.designation || '—'}</span>
            </span>
          </div>

          <div className="director-card__summary-col director-card__summary-col--right">
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">Mobile:</span>
              <span className="director-card__summary-val">{director.mobile || '—'}</span>
            </span>
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">Email:</span>
              <span className="director-card__summary-val">{director.email || '—'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Expanded Form View */}
      {!displayedCollapsed && (
        <div className="director-card__body">
          <div className="director-grid-2">
            <DirectorFormField label="Full Name (as in PAN)" value={director.fullName} onChange={(val) => handleFieldChange('fullName', val)} placeholder="Full Legal Name" required error={errors.fullName} inputProps={{ maxLength: 100, autoComplete: 'name' }} />
            <DirectorFormField label="PAN Number" value={director.pan} onChange={(val) => handleFieldChange('pan', val)} placeholder="10-character PAN" required error={errors.pan} inputProps={{ maxLength: 10 }} />
          </div>
          <div className="director-grid-2">
            <DirectorFormField label="Date of Birth" type="date" value={director.dob} onChange={(val) => handleFieldChange('dob', val)} placeholder="DD-MM-YYYY" required error={errors.dob} inputProps={{ max: new Date().toISOString().slice(0, 10) }} />
            <DirectorFormField label="Designation" value={director.designation} onChange={(val) => handleFieldChange('designation', val)} placeholder="e.g. Director" required error={errors.designation} inputProps={{ maxLength: 60 }} />
          </div>
          <div className="director-grid-2">
            <DirectorFormField label="Email Address" type="email" value={director.email} onChange={(val) => handleFieldChange('email', val)} placeholder="Enter Email Address" required error={errors.email} inputProps={{ maxLength: 254, autoComplete: 'email' }} />
            <DirectorFormField label="Mobile Number" type="tel" value={director.mobile} onChange={(val) => handleFieldChange('mobile', val)} placeholder="Enter 10-digit Mobile" required error={errors.mobile} inputProps={{ inputMode: 'numeric', autoComplete: 'tel' }} />
          </div>
          <DirectorFormField label="DIN (if already allotted)" value={director.din} onChange={(val) => handleFieldChange('din', val)} placeholder="8-digit DIN (Optional)" error={errors.din} inputProps={{ inputMode: 'numeric', maxLength: 8 }} />

          {/* Card Actions */}
          <div className="director-card__actions">
            <button type="button" className="director-btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="director-btn-save" onClick={handleSave}>
              ✓ Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DirectorCard
