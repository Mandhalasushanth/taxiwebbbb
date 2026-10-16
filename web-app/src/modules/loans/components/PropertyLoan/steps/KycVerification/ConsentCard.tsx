import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../propertyLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="prop-consent-card" aria-labelledby="prop-consent-title">
    <label className="prop-consent-label" htmlFor="prop-kyc-consent">
      <input
        id="prop-kyc-consent"
        type="checkbox"
        className="prop-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'prop-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="prop-consent-body">
        <span id="prop-consent-title" className="prop-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="prop-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="prop-kyc-consent-error" className="prop-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="prop-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
