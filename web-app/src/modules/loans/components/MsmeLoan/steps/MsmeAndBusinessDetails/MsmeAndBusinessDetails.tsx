import React from 'react'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { BusinessDetailsCard } from './BusinessDetailsCard'
import { BusinessActivityCard } from './BusinessActivityCard'
import { BusinessOperatingAddressCard } from './BusinessOperatingAddressCard'
import { MsmeRegistrationCard } from './MsmeRegistrationCard'
import { BusinessInformationCard } from './BusinessInformationCard'

export const MsmeAndBusinessDetails: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  return (
    <div className="msme-step" data-testid="msme-step-business-details">
      <BusinessDetailsCard data={data} onChange={onChange} errors={errors} />
      <BusinessActivityCard data={data} onChange={onChange} errors={errors} />
      <BusinessOperatingAddressCard data={data} onChange={onChange} errors={errors} />
      <MsmeRegistrationCard data={data} onChange={onChange} errors={errors} />
      <BusinessInformationCard data={data} onChange={onChange} errors={errors} />
    </div>
  )
}

export default MsmeAndBusinessDetails
