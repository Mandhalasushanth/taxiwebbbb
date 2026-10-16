import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { KYC_COPY } from '../../personalLoan.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="pl-field">
    <div className="pl-field__label-row">
      <label className="pl-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="pl-field__lock" size={16} aria-hidden="true" />
    </div>
    <input
      id={id}
      className="pl-field__input pl-field__input--locked"
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
    <section className="pl-card" aria-labelledby="pl-verified-title">
      <div className="pl-card__header">
        <span className="pl-card__icon pl-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="pl-verified-title" className="pl-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="pl-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="pl-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="pl-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="pl-kyc-mobile" label="Mobile Number" value={formatMobile(customer.mobile)} />
      <LockedField id="pl-kyc-email" label="Email Address" value={customer.email} />
      <LockedField id="pl-kyc-pan" label="PAN Number" value={customer.pan} />
      <LockedField id="pl-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
