import React from 'react'
import type { KycStepData, VerifiedCustomerDetails } from '@modules/loans/types'
import type { MachineryLoanData } from '@modules/loans/types/machineryLoan.types'
import { VerifiedCustomerCard } from './VerifiedCustomerCard'
import { AddressDetailsCard } from './AddressDetailsCard'
import { ConsentCard } from './ConsentCard'

export interface KycVerificationProps {
  data: KycStepData | MachineryLoanData
  customer: VerifiedCustomerDetails
  onChange: (patch: Partial<MachineryLoanData> | Partial<KycStepData>) => void
  errors?: Record<string, string>
}

/** Step 1: verified identity (read-only), addresses and consent */
export const KycVerification: React.FC<KycVerificationProps> = ({
  data,
  customer,
  onChange,
  errors = {},
}) => (
  <div className="mach-step" data-testid="mach-step-kyc">
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
