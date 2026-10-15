import React from 'react'
import { FILING_FREQUENCY_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'
import './GSTFilingFrequency.css'

interface GSTFilingFrequencyProps {
  value: string
  onChange: (frequency: string) => void
  error?: string
}

export const GSTFilingFrequency: React.FC<GSTFilingFrequencyProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <div className="gst-filing-frequency">
      <span className="gst-filing-frequency__label">Filing Frequency *</span>
      <div className="gst-filing-frequency__grid" role="radiogroup" aria-label="Filing Frequency">
        {FILING_FREQUENCY_OPTIONS.map((opt) => {
          const isSelected = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              className={`gst-filing-frequency__btn ${
                isSelected ? 'gst-filing-frequency__btn--active' : ''
              }`}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.id)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      <p className="gst-filing-frequency__hint">
        Frequency filters both the period list and the return types below.
      </p>
      {error && <span className="gst-filing-period__error-text">{error}</span>}
    </div>
  )
}
