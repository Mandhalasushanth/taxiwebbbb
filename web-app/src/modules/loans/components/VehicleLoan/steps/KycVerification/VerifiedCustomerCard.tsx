import React from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import type { VerifiedCustomerDetails } from '@modules/loans/types'
import { KYC_COPY } from '../../vehicleLoan.constants'

interface LockedFieldProps {
  id: string
  label: string
  value: string
}

const LockedField: React.FC<LockedFieldProps> = ({ id, label, value }) => (
  <div className="veh-field">
    <div className="veh-field__label-row">
      <label className="veh-field__label" htmlFor={id}>
        {label}
      </label>
      <Lock className="veh-field__lock" size={16} aria-hidden="true" />
    </div>
    <input
      id={id}
      className="veh-field__input veh-field__input--locked"
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
    <section className="veh-card" aria-labelledby="veh-verified-title">
      <div className="veh-card__header">
        <span className="veh-card__icon veh-card__icon--navy">
          <Lock size={20} aria-hidden="true" />
        </span>
        <h2 id="veh-verified-title" className="veh-card__title">
          {KYC_COPY.verifiedTitle}
        </h2>
        {customer.isVerified && (
          <span className="veh-verified-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            {KYC_COPY.verifiedBadge}
          </span>
        )}
      </div>

      <p className="veh-note">
        <Info size={16} aria-hidden="true" />
        {KYC_COPY.verifiedNote}
      </p>

      <LockedField id="veh-kyc-name" label="Full Legal Name" value={customer.fullName} />
      <LockedField id="veh-kyc-mobile" label="Mobile Number" value={formatMobile(customer.mobile)} />
      <LockedField id="veh-kyc-email" label="Email Address" value={customer.email} />
      <LockedField id="veh-kyc-pan" label="PAN Number" value={customer.pan} />
      <LockedField id="veh-kyc-dob" label="Date of Birth" value={customer.dob} />
    </section>
  )
}

export default VerifiedCustomerCard
