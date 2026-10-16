import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../personalLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="pl-consent-card" aria-labelledby="pl-consent-title">
    <label className="pl-consent-label" htmlFor="pl-kyc-consent">
      <input
        id="pl-kyc-consent"
        type="checkbox"
        className="pl-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'pl-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="pl-consent-body">
        <span id="pl-consent-title" className="pl-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="pl-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="pl-kyc-consent-error" className="pl-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="pl-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
