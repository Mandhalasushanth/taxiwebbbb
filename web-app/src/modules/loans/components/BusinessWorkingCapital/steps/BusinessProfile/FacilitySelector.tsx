import React from 'react'
import { Building2, Wallet } from 'lucide-react'
import type { FinancingFacility } from '@modules/loans/types/businessWorkingCapital.types'
import { BUSINESS_PROFILE_COPY, FACILITY_OPTIONS } from './businessProfile.constants'

const FACILITY_ICONS: Record<FinancingFacility, React.ReactNode> = {
  'business-loan': <Building2 size={24} aria-hidden="true" />,
  'working-capital': <Wallet size={24} aria-hidden="true" />,
}

export interface FacilitySelectorProps {
  value: FinancingFacility
  onChange: (value: FinancingFacility) => void
  error?: string
}

/** Business Loan vs Working Capital choice cards */
export const FacilitySelector: React.FC<FacilitySelectorProps> = ({ value, onChange, error }) => (
  <section className="bwc-facility" aria-labelledby="bwc-facility-title">
    <h2 id="bwc-facility-title" className="bwc-facility__heading">
      {BUSINESS_PROFILE_COPY.facilityHeading}
    </h2>
    <p className="bwc-facility__subtitle">{BUSINESS_PROFILE_COPY.facilitySubtitle}</p>

    <div className="bwc-facility__options" role="radiogroup" aria-labelledby="bwc-facility-title">
      {FACILITY_OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`bwc-facility__card${isActive ? ' bwc-facility__card--active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <span className="bwc-facility__top">
              <span className="bwc-facility__icon">{FACILITY_ICONS[option.value]}</span>
              <span className={`bwc-facility__radio${isActive ? ' bwc-facility__radio--checked' : ''}`} aria-hidden="true" />
            </span>
            <span className="bwc-facility__title">{option.title}</span>
            <span className="bwc-facility__description">{option.description}</span>
          </button>
        )
      })}
    </div>
    {error && (
      <p className="bwc-field__error" role="alert">
        {error}
      </p>
    )}
  </section>
)

export default FacilitySelector
