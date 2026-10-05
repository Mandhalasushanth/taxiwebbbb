import React from 'react'
import './MobileEntryView.css'

export interface MobileEntryViewProps {
  mobile: string
  onMobileChange: (val: string) => void
  selectedCountryCode: string
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  error: string | null
}

export const MobileEntryView: React.FC<MobileEntryViewProps> = ({
  mobile,
  onMobileChange,
  selectedCountryCode,
  onSubmit,
  isSubmitting,
  error,
}) => {
  return (
    <form className="mobile-entry-form" onSubmit={onSubmit} noValidate>
      {/* Top Section: Mobile Number Input */}
      <div className="mobile-entry-form__top-section">
        <div className="mobile-entry-form__field">
          <label htmlFor="auth-mobile-input" className="mobile-entry-form__label">
            Mobile Number
          </label>
          <div className="mobile-entry-form__input-row">
            <span
              className="mobile-entry-form__country-box mobile-entry-form__country-box--static"
              aria-label={`Country code ${selectedCountryCode}`}
            >
              {selectedCountryCode}
            </span>

            <div className="mobile-entry-form__input-box">
              <input
                id="auth-mobile-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`mobile-entry-form__input ${error ? 'mobile-entry-form__input--error' : ''}`}
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => onMobileChange(e.target.value)}
                autoComplete="tel-national"
              />
            </div>
          </div>

          {error && <span className="mobile-entry-form__error-msg">{error}</span>}
        </div>
      </div>

      {/* Bottom Actions: Continue Button */}
      <div className="mobile-entry-form__bottom-actions">
        <button
          type="submit"
          className="mobile-entry-form__btn-primary"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Continuing...' : 'Continue'}</span>
        </button>
      </div>
    </form>
  )
}

export default MobileEntryView
