import React from 'react'
import { Check, Lock } from 'lucide-react'
import { KYC_COPY } from '../../businessWorkingCapital.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** KYC / credit-check consent checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className={`bwc-card bwc-consent${error ? ' bwc-consent--error' : ''}`}>
    <label className="bwc-consent__label">
      <input
        type="checkbox"
        className="bwc-consent__input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={error ? 'bwc-consent-error' : undefined}
      />
      <span className={`bwc-consent__box${checked ? ' bwc-consent__box--checked' : ''}`} aria-hidden="true">
        {checked && <Check size={16} />}
      </span>
      <span className="bwc-consent__text">
        <strong className="bwc-consent__title">{KYC_COPY.consentTitle}</strong>
        {KYC_COPY.consentText}
      </span>
    </label>
    <p className="bwc-consent__security">
      <Lock size={14} aria-hidden="true" />
      {KYC_COPY.securityNote}
    </p>
    {error && (
      <p id="bwc-consent-error" className="bwc-field__error" role="alert">
        {error}
      </p>
    )}
  </section>
)

export default ConsentCard
