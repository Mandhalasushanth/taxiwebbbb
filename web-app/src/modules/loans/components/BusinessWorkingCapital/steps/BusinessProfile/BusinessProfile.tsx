import React from 'react'
import type { BusinessWorkingCapitalStepProps, FinancingFacility } from '@modules/loans/types/businessWorkingCapital.types'
import { LOAN_PURPOSE_OPTIONS } from './businessProfile.constants'
import { FacilitySelector } from './FacilitySelector'
import { BusinessProfileCard } from './BusinessProfileCard'
import { LoanRequirementsCard } from './LoanRequirementsCard'
import './BusinessProfile.css'

/** Step 2: financing facility, business profile and loan requirements */
export const BusinessProfile: React.FC<BusinessWorkingCapitalStepProps> = ({ data, onChange, errors = {} }) => {
  const handleFacilityChange = (financingFacility: FinancingFacility) => {
    // Keep the purpose only if the new facility also offers it
    const purposeStillValid = LOAN_PURPOSE_OPTIONS[financingFacility].some((o) => o.value === data.loanPurpose)
    onChange({ financingFacility, loanPurpose: purposeStillValid ? data.loanPurpose : '' })
  }

  return (
    <div className="bwc-step" data-testid="bwc-step-business-profile">
      <FacilitySelector value={data.financingFacility} onChange={handleFacilityChange} error={errors.financingFacility} />
      <BusinessProfileCard data={data} onChange={onChange} errors={errors} />
      <LoanRequirementsCard data={data} onChange={onChange} errors={errors} />
    </div>
  )
}

export default BusinessProfile
