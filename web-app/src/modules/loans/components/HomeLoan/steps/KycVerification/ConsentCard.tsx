import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../homeLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="hl-consent-card" aria-labelledby="hl-consent-title">
    <label className="hl-consent-label" htmlFor="hl-kyc-consent">
      <input
        id="hl-kyc-consent"
        type="checkbox"
        className="hl-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'hl-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="hl-consent-body">
        <span id="hl-consent-title" className="hl-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="hl-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="hl-kyc-consent-error" className="hl-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="hl-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
