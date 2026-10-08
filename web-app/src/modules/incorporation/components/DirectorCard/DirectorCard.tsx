import React, { useState } from 'react'
import type { DirectorDetails } from '../../types/incorporation.types'
import { filterDigits, filterMobile, filterPan } from '../../utils/validation'
import { DobDatePickerModal } from '@modules/authentication/components/DobDatePickerModal/DobDatePickerModal'
import './DirectorCard.css'

interface FormFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  required?: boolean
  type?: string
  placeholder?: string
  error?: string
}

const DirectorFormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder = '',
  error,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  if (type === 'date') {
    return (
      <div className="director-group" style={{ position: 'relative' }}>
        <label className="director-label">
          {label}{required && <span className="director-required"> *</span>}
        </label>
        <input
          type="text"
          readOnly
          style={{ cursor: 'pointer' }}
          className={`director-input ${error ? 'director-input--error' : ''}`}
          value={value ? value.split('-').reverse().join('-') : ''}
          onClick={() => setIsPickerOpen((prev) => !prev)}
          placeholder="DD-MM-YYYY"
        />
        <DobDatePickerModal
          isOpen={isPickerOpen}
          title={label}
          format="YYYY-MM-DD"
          value={value}
          maxDate={new Date()}
          onApply={(val) => onChange(val)}
          onClose={() => setIsPickerOpen(false)}
        />
        {error && <span className="director-field-error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="director-group">
      <label className="director-label">
        {label}{required && <span className="director-required"> *</span>}
      </label>
      <input
        type={type}
        className={`director-input ${error ? 'director-input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <span className="director-field-error">{error}</span>}
    </div>
  )
}

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
    if (field === 'pincode') {
      onChange(director.id, field, filterDigits(String(val), 6))
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
            <span className="director-card__name">{director.fullName}</span>
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
              <span className="director-card__summary-label">Shares:</span>
              <span className="director-card__summary-val">
                {Number(director.equityShares || 0).toLocaleString()}
              </span>
            </span>
          </div>

          <div className="director-card__summary-col director-card__summary-col--right">
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">Mobile:</span>
              <span className="director-card__summary-val">{director.mobile || '—'}</span>
            </span>
            <span className="director-card__summary-item">
              <span className="director-card__summary-label">Shareholding:</span>
              <span className="director-card__summary-val">{director.shareholdingPercent || '0%'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Expanded Form View */}
      {!displayedCollapsed && (
        <div className="director-card__body">
          {/* A. Basic Details */}
          <section className="director-section">
            <h4 className="director-section__title">A. Basic Details</h4>
            <div className="director-grid-2">
              <DirectorFormField label="Full Name (as in PAN)" value={director.fullName} onChange={(val) => handleFieldChange('fullName', val)} placeholder="Enter full name" required error={errors.fullName} />
              <DirectorFormField label="PAN Number" value={director.pan} onChange={(val) => handleFieldChange('pan', val)} placeholder="Enter PAN" required error={errors.pan} />
            </div>
            <div className="director-grid-2">
              <DirectorFormField label="DIN (if already allotted)" value={director.din} onChange={(val) => handleFieldChange('din', val)} placeholder="Enter 8-digit DIN (Optional)" error={errors.din} />
              <DirectorFormField label="Date of Birth" type="date" value={director.dob} onChange={(val) => handleFieldChange('dob', val)} required error={errors.dob} />
            </div>
            <div className="director-grid-2">
              <DirectorFormField label="Father's Name" value={director.fatherName} onChange={(val) => handleFieldChange('fatherName', val)} placeholder="Enter father's name" required error={errors.fatherName} />
              <div className="director-group">
                <label className="director-label">Gender<span className="director-required"> *</span></label>
                <select className={`director-input ${errors.gender ? 'director-input--error' : ''}`} value={director.gender} onChange={(e) => handleFieldChange('gender', e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="director-field-error">{errors.gender}</span>}
              </div>
            </div>
            <div className="director-grid-2">
              <DirectorFormField label="Nationality" value={director.nationality} onChange={(val) => handleFieldChange('nationality', val)} placeholder="Enter nationality" required error={errors.nationality} />
              <DirectorFormField label="Designation" value={director.designation} onChange={(val) => handleFieldChange('designation', val)} placeholder="Enter designation" required error={errors.designation} />
            </div>
            <DirectorFormField label="Category" value={director.category} onChange={(val) => handleFieldChange('category', val)} placeholder="Enter category" required error={errors.category} />
          </section>

          {/* B. Contact */}
          <section className="director-section">
            <h4 className="director-section__title">B. Contact</h4>
            <div className="director-grid-2">
              <DirectorFormField label="Email Address" type="email" value={director.email} onChange={(val) => handleFieldChange('email', val)} placeholder="Enter email address" required error={errors.email} />
              <DirectorFormField label="Mobile Number" type="tel" value={director.mobile} onChange={(val) => handleFieldChange('mobile', val)} placeholder="Enter 10-digit mobile number" required error={errors.mobile} />
            </div>
          </section>

          {/* C. Residency & Address */}
          <section className="director-section">
            <h4 className="director-section__title">C. Residency & Address</h4>
            <div className="director-group">
              <label className="director-label">Whether resident in India<span className="director-required">*</span></label>
              <div className="director-chips">
                <button type="button" className={`director-chip ${director.isResident ? 'director-chip--active' : ''}`} onClick={() => handleFieldChange('isResident', true)}>Yes</button>
                <button type="button" className={`director-chip ${!director.isResident ? 'director-chip--active' : ''}`} onClick={() => handleFieldChange('isResident', false)}>No</button>
              </div>
            </div>

            <div className="director-group">
              <label className="director-label director-label--section">Permanent Residential Address<span className="director-required"> *</span></label>
            </div>

            <DirectorFormField label="Address Line 1" value={director.addressLine1} onChange={(val) => handleFieldChange('addressLine1', val)} placeholder="Enter address line 1" required error={errors.addressLine1} />
            <DirectorFormField label="Address Line 2 (Optional)" value={director.addressLine2} onChange={(val) => handleFieldChange('addressLine2', val)} placeholder="Enter address line 2 (Optional)" />
            <div className="director-grid-4">
              <DirectorFormField label="City" value={director.city} onChange={(val) => handleFieldChange('city', val)} placeholder="Enter city" required error={errors.city} />
              <DirectorFormField label="District" value={director.district} onChange={(val) => handleFieldChange('district', val)} placeholder="Enter district" required error={errors.district} />
              <DirectorFormField label="State" value={director.state} onChange={(val) => handleFieldChange('state', val)} placeholder="Enter state" required error={errors.state} />
              <DirectorFormField label="PIN Code" value={director.pincode} onChange={(val) => handleFieldChange('pincode', val)} placeholder="Enter 6-digit PIN code" required error={errors.pincode} />
            </div>

            <label className="director-checkbox-label">
              <input type="checkbox" className="director-checkbox" checked={director.isSameAddress} onChange={(e) => handleFieldChange('isSameAddress', e.target.checked)} />
              Present Residential Address same as Permanent Address
            </label>
          </section>

          {/* D. Share Subscription */}
          <section className="director-section">
            <h4 className="director-section__title">D. Share Subscription</h4>
            <div className="director-grid-2">
              <DirectorFormField label="Number of Equity Shares Subscribed" value={director.equityShares} onChange={(val) => handleFieldChange('equityShares', val)} placeholder="Enter number of equity shares" required error={errors.equityShares} />
              <DirectorFormField label="Amount of Equity Shares Subscribed" value={director.equityAmount} onChange={(val) => handleFieldChange('equityAmount', val)} placeholder="Enter amount of equity shares" required error={errors.equityAmount} />
            </div>
            <div className="director-group">
              <label className="director-label">Shareholding Percentage (READ ONLY)</label>
              <div className="director-share-box"><span>◔</span><span>{director.shareholdingPercent}</span></div>
            </div>
          </section>

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
