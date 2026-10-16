import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { KYC_COPY } from '../../machineryLoan.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="mach-field">
    <div className="mach-field__label-row">
      <label className="mach-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="mach-field__lock" size={16} aria-hidden="true" />
    </div>
    <input
      id={id}
      className="mach-field__input mach-field__input--locked"
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
    <section className="mach-card" aria-labelledby="mach-verified-title">
      <div className="mach-card__header">
        <span className="mach-card__icon mach-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="mach-verified-title" className="mach-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="mach-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="mach-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="mach-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="mach-kyc-mobile" label="Mobile Number" value={formatMobile(customer.mobile)} />
      <LockedField id="mach-kyc-email" label="Email Address" value={customer.email} />
      <LockedField id="mach-kyc-pan" label="PAN Number" value={customer.pan} />
      <LockedField id="mach-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
