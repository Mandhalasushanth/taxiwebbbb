import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../msmeLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="msme-consent-card" aria-labelledby="msme-consent-title">
    <label className="msme-consent-label" htmlFor="msme-kyc-consent">
      <input
        id="msme-kyc-consent"
        type="checkbox"
        className="msme-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'msme-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="msme-consent-body">
        <span id="msme-consent-title" className="msme-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="msme-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="msme-kyc-consent-error" className="msme-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="msme-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
