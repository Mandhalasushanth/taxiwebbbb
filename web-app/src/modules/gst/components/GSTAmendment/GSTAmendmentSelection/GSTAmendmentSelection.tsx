import React, { useState } from 'react'
import { gstFieldRules } from '@modules/gst/validation/gstFieldRules'
import './GSTAmendmentSelection.css'

import { CORE_AMENDMENTS, NON_CORE_AMENDMENTS, type AmendmentCardItem } from '@modules/gst/constants/gstAmendmentOptions'

export type { AmendmentCardItem }

interface GSTAmendmentSelectionProps {
  gstin: string
  onGstinChange: (value: string) => void
  onSelectOption: (option: AmendmentCardItem) => void
}

export const GSTAmendmentSelection: React.FC<GSTAmendmentSelectionProps> = ({
  gstin,
  onGstinChange,
  onSelectOption,
}) => {
  const [errorText, setErrorText] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (val.length <= 15) {
      onGstinChange(val)
      if (errorText) setErrorText('')
    }
  }

  const handleCardClick = (item: AmendmentCardItem) => {
    const gstinError = gstFieldRules.gstin(gstin)
    if (gstinError) {
      setErrorText(gstinError)
      return
    }
    onSelectOption(item)
  }

  const renderIcon = (type: AmendmentCardItem['iconType'], color: string) => {
    switch (type) {
      case 'tag':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        )
      case 'building':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
          </svg>
        )
      case 'store':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        )
      case 'wallet':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
          </svg>
        )
      case 'pen':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        )
      case 'phone':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="gst-amend-select-container">
      {/* Page Titles */}
      <div className="gst-amend-select-header">
        <h1 className="gst-amend-select-title">GST Amendment</h1>
        <p className="gst-amend-select-subtitle">Select what you want to change</p>
      </div>

      {/* Top Search Bar & Info Card Row */}
      <div className="gst-amend-top-row">
        {/* Left Column: GSTIN Input Box */}
        <div className="gst-amend-gstin-box">
          <label htmlFor="gstin-search-input" className="gst-amend-gstin-label">
            GSTIN <span className="gst-amend-required-star">*</span>
          </label>

          <div className="gst-amend-input-wrapper">
            <input
              id="gstin-search-input"
              type="text"
              value={gstin}
              onChange={handleInputChange}
              maxLength={15}
              placeholder="Enter your GSTIN"
              className={`gst-amend-input ${errorText ? 'has-error' : ''}`}
            />
          </div>

          <div className="gst-amend-gstin-subrow">
            <span className="gst-amend-gstin-hint">
              {errorText ? <span className="gst-amend-error-text">{errorText}</span> : 'Enter 15 digit GSTIN to proceed'}
            </span>
            <span className="gst-amend-gstin-counter">{gstin.length} / 15 chars</span>
          </div>
        </div>

        {/* Right Column: Info Banner Card */}
        <div className="gst-amend-info-card">
          <div className="gst-amend-info-card__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="gst-amend-info-card__text-wrap">
            <h4 className="gst-amend-info-card__title">
              Amendments reuse your GST Registration fields, validation and upload flow — nothing new to learn.
            </h4>
          </div>
        </div>
      </div>

      {/* Core Amendments Section */}
      <section className="gst-amend-section">
        <div className="gst-amend-section__header">
          <h2 className="gst-amend-section__title">Core amendments</h2>
          <p className="gst-amend-section__desc">
            These changes require officer approval and are part of your core GST details.
          </p>
        </div>

        <div className="gst-amend-cards-grid">
          {CORE_AMENDMENTS.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="gst-amend-card"
              role="button"
              tabIndex={0}
            >
              <div className={`gst-amend-card__icon-box gst-amend-card__icon-box--${item.id}`}>
                {renderIcon(item.iconType, item.iconColor)}
              </div>
              <div className="gst-amend-card__info">
                <h3 className="gst-amend-card__title">{item.title}</h3>
                <p className="gst-amend-card__subtitle">{item.subtitle}</p>
              </div>
              <div className="gst-amend-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Non-core Amendments Section */}
      <section className="gst-amend-section">
        <div className="gst-amend-section__header">
          <h2 className="gst-amend-section__title">Non-core amendments</h2>
          <p className="gst-amend-section__desc">
            These changes are auto-approved and do not require officer approval.
          </p>
        </div>

        <div className="gst-amend-cards-grid">
          {NON_CORE_AMENDMENTS.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="gst-amend-card"
              role="button"
              tabIndex={0}
            >
              <div className={`gst-amend-card__icon-box gst-amend-card__icon-box--${item.id}`}>
                {renderIcon(item.iconType, item.iconColor)}
              </div>
              <div className="gst-amend-card__info">
                <h3 className="gst-amend-card__title">{item.title}</h3>
                <p className="gst-amend-card__subtitle">{item.subtitle}</p>
              </div>
              <div className="gst-amend-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GSTAmendmentSelection
