import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { KYC_COPY } from '../../msmeLoan.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="msme-field">
    <div className="msme-field__label-row">
      <label className="msme-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="msme-field__lock" size={16} aria-hidden="true" />
    </div>
    <input
      id={id}
      className="msme-field__input msme-field__input--locked"
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
    <section className="msme-card" aria-labelledby="msme-verified-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-verified-title" className="msme-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="msme-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="msme-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="msme-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="msme-kyc-mobile" label="Mobile Number" value={formatMobile(customer.mobile)} />
      <LockedField id="msme-kyc-email" label="Email Address" value={customer.email} />
      <LockedField id="msme-kyc-pan" label="PAN Number" value={customer.pan} />
      <LockedField id="msme-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
