import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../machineryLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="mach-consent-card" aria-labelledby="mach-consent-title">
    <label className="mach-consent-label" htmlFor="mach-kyc-consent">
      <input
        id="mach-kyc-consent"
        type="checkbox"
        className="mach-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'mach-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="mach-consent-body">
        <span id="mach-consent-title" className="mach-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="mach-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="mach-kyc-consent-error" className="mach-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="mach-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
