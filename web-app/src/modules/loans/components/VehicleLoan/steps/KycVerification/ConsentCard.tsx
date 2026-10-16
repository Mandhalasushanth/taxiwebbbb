import React from 'react'
import { Lock } from 'lucide-react'
import { KYC_COPY } from '../../vehicleLoan.constants'

export interface ConsentCardProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/** DPDP and RBI credit check authorization checkbox */
export const ConsentCard: React.FC<ConsentCardProps> = ({ checked, onChange, error }) => (
  <section className="veh-consent-card" aria-labelledby="veh-consent-title">
    <label className="veh-consent-label" htmlFor="veh-kyc-consent">
      <input
        id="veh-kyc-consent"
        type="checkbox"
        className="veh-consent-checkbox"
        checked={checked}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'veh-kyc-consent-error' : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="veh-consent-body">
        <span id="veh-consent-title" className="veh-consent-title">
          {KYC_COPY.consentTitle}
        </span>
        <p className="veh-consent-text">{KYC_COPY.consentText}</p>
      </div>
    </label>

    {error && (
      <p id="veh-kyc-consent-error" className="veh-field__error" role="alert">
        {error}
      </p>
    )}

    <div className="veh-consent-security">
      <Lock size={14} aria-hidden="true" />
      <span>{KYC_COPY.securityNote}</span>
    </div>
  </section>
)

export default ConsentCard
