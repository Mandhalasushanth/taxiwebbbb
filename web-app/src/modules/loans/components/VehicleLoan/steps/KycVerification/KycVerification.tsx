import React from 'react'
import type { KycStepProps, VerifiedCustomerDetails } from '@modules/loans/types'
import { VerifiedCustomerCard } from './VerifiedCustomerCard'
import { AddressDetailsCard } from './AddressDetailsCard'
import { ConsentCard } from './ConsentCard'

export interface KycVerificationProps extends KycStepProps {
  customer: VerifiedCustomerDetails
}

/** Step 1: verified identity (read-only), addresses and consent */
export const KycVerification: React.FC<KycVerificationProps> = ({
  data,
  customer,
  onChange,
  errors = {},
}) => (
  <div className="veh-step" data-testid="veh-step-kyc">
    <VerifiedCustomerCard customer={customer} />
    <AddressDetailsCard data={data} onChange={onChange} errors={errors} />
    <ConsentCard
      checked={data.kycConsent}
      onChange={(kycConsent) => onChange({ kycConsent })}
      error={errors.kycConsent}
    />
  </div>
)

export default KycVerification
