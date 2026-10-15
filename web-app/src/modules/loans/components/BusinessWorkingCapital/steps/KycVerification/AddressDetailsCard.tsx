import React from 'react'
import { MapPin } from 'lucide-react'
import type { KycStepProps, YesNoChoice } from '@modules/loans/types/businessWorkingCapital.types'
import { CURRENT_ADDRESS_COPY, EMPTY_ADDRESS, KYC_COPY, PERMANENT_ADDRESS_COPY } from '../../businessWorkingCapital.constants'
import { AddressFields } from './AddressFields'

const CHOICES: { value: Exclude<YesNoChoice, ''>; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

/** Current address, "same as current?" toggle and (when No) the permanent address */
export const AddressDetailsCard: React.FC<Required<KycStepProps>> = ({ data, onChange, errors }) => {
  const isSeparatePermanent = data.permanentSameAsCurrent === 'no'

  const handleChoice = (choice: YesNoChoice) =>
    onChange({
      permanentSameAsCurrent: choice,
      // Starting fresh avoids stale values when switching back to "No"
      permanentAddress: choice === 'no' ? data.permanentAddress : EMPTY_ADDRESS,
    })

  return (
    <section className="bwc-card" aria-labelledby="bwc-address-title">
      <div className="bwc-card__header">
        <span className="bwc-card__icon bwc-card__icon--orange">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <h2 id="bwc-address-title" className="bwc-card__title">
          {KYC_COPY.addressTitle}
        </h2>
      </div>
      <p className="bwc-card__subtitle">{KYC_COPY.addressSubtitle}</p>

      <AddressFields
        prefix="currentAddress"
        copy={CURRENT_ADDRESS_COPY}
        value={data.currentAddress}
        onChange={(currentAddress) => onChange({ currentAddress })}
        errors={errors}
      />

      <div className="bwc-toggle" role="radiogroup" aria-label={KYC_COPY.sameAddressQuestion}>
        <p className="bwc-toggle__question">{KYC_COPY.sameAddressQuestion}</p>
        <div className="bwc-toggle__options">
          {CHOICES.map((choice) => {
            const isActive = data.permanentSameAsCurrent === choice.value
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`bwc-toggle__option${isActive ? ' bwc-toggle__option--active' : ''}`}
                onClick={() => handleChoice(choice.value)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
        {errors.permanentSameAsCurrent && (
          <p className="bwc-field__error" role="alert">
            {errors.permanentSameAsCurrent}
          </p>
        )}
      </div>

      {isSeparatePermanent && (
        <>
          <hr className="bwc-divider" />
          <AddressFields
            prefix="permanentAddress"
            copy={PERMANENT_ADDRESS_COPY}
            value={data.permanentAddress}
            onChange={(permanentAddress) => onChange({ permanentAddress })}
            errors={errors}
          />
        </>
      )}
    </section>
  )
}

export default AddressDetailsCard
