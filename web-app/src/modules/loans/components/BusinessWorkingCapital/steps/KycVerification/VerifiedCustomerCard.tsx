import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import { maskAadhaar } from '@shared/utils'
import type { VerifiedCustomerDetails } from '@modules/loans/types/businessWorkingCapital.types'
import { KYC_COPY } from '../../businessWorkingCapital.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="bwc-field">
    <div className="bwc-field__label-row">
      <label className="bwc-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="bwc-field__lock" size={16} aria-hidden="true" />
    </div>
    <input id={id} className="bwc-field__input bwc-field__input--locked" value={value || '—'} readOnly aria-readonly="true" />
  </div>
)

export interface VerifiedCustomerCardProps {
  customer: VerifiedCustomerDetails
}

/** Read-only identity block; values come from the customer's verified KYC */
export const VerifiedCustomerCard: React.FC<VerifiedCustomerCardProps> = ({ customer }) => {
  const mobile = customer.mobile ? `+91 ${customer.mobile}` : ''

  return (
    <section className="bwc-card" aria-labelledby="bwc-verified-title">
      <div className="bwc-card__header">
        <span className="bwc-card__icon bwc-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="bwc-verified-title" className="bwc-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="bwc-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="bwc-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="bwc-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="bwc-kyc-mobile" label="Mobile Number" value={mobile} />
      <LockedField id="bwc-kyc-email" label="Email Address" value={customer.email} />
      <div className="bwc-row">
        <LockedField id="bwc-kyc-pan" label="PAN Number" value={customer.pan} />
        <LockedField id="bwc-kyc-aadhaar" label="Aadhaar Number" value={maskAadhaar(customer.aadhaar, '')} />
      </div>
      <LockedField id="bwc-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
