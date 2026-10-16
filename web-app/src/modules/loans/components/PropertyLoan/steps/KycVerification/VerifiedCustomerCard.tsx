import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { KYC_COPY } from '../../propertyLoan.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="prop-field">
    <div className="prop-field__label-row">
      <label className="prop-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="prop-field__lock" size={16} aria-hidden="true" />
    </div>
    <input
      id={id}
      className="prop-field__input prop-field__input--locked"
      value={value || '—'}
      readOnly
      aria-readonly="true"
    />
  </div>
)

export interface VerifiedCustomerCardProps {
  customer: VerifiedCustomerDetails
}

/** Read-only identity block; values come from the customer's verified KYC */
export const VerifiedCustomerCard: React.FC<VerifiedCustomerCardProps> = ({ customer }) => {
  const formatMobile = (mobile: string): string => {
    if (!mobile) return '—'
    return mobile.startsWith('+91') ? mobile : `+91 ${mobile}`
  }

  return (
    <section className="prop-card" aria-labelledby="prop-verified-title">
      <div className="prop-card__header">
        <span className="prop-card__icon prop-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="prop-verified-title" className="prop-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="prop-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="prop-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="prop-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="prop-kyc-mobile" label="Mobile Number" value={formatMobile(customer.mobile)} />
      <LockedField id="prop-kyc-email" label="Email Address" value={customer.email} />
      <LockedField id="prop-kyc-pan" label="PAN Number" value={customer.pan} />
      <LockedField id="prop-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
