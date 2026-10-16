import React from 'react'
import { FILING_TYPE_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'
import './GSTFilingTypeSelector.css'

interface GSTFilingTypeSelectorProps {
  value: 'regular' | 'nil' | ''
  onChange: (type: 'regular' | 'nil') => void
}

export const GSTFilingTypeSelector: React.FC<GSTFilingTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="gst-filing-type">
      <span className="gst-filing-type__label">
        Return Type <span className="gst-filing-period__required">*</span>
      </span>
      <div className="gst-filing-type__grid" role="radiogroup" aria-label="Return Type">
        {FILING_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.id
          return (
            <div
              key={option.id}
              className={`gst-filing-type__card ${
                isSelected ? 'gst-filing-type__card--active' : ''
              }`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onChange(option.id)
                }
              }}
            >
              <div className="gst-filing-type__radio-circle">
                {isSelected && <div className="gst-filing-type__radio-dot" />}
              </div>
              <div className="gst-filing-type__content">
                <span className="gst-filing-type__title">{option.title}</span>
                <span className="gst-filing-type__desc">{option.description}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
