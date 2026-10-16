import React from 'react'
import { MapPin } from 'lucide-react'
import type { KycStepProps, YesNoChoice } from '@modules/loans/types'
import {
  CURRENT_ADDRESS_COPY,
  EMPTY_ADDRESS,
  KYC_COPY,
  PERMANENT_ADDRESS_COPY,
} from '../../machineryLoan.constants'
import { AddressFields } from './AddressFields'

const CHOICES: { value: Exclude<YesNoChoice, ''>; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

/** Current address, "same as current?" toggle and (when No) the permanent address */
export const AddressDetailsCard: React.FC<Required<KycStepProps>> = ({ data, onChange, errors }) => {
  const isSeparatePermanent = data.permanentSameAsCurrent === 'no'

  const handleChoice = (choice: YesNoChoice) => {
    try {
      onChange({
        permanentSameAsCurrent: choice,
        permanentAddress: choice === 'no' ? data.permanentAddress : EMPTY_ADDRESS,
      })
    } catch (err) {
      console.error('Error selecting permanent address choice', err)
    }
  }

  return (
    <section className="mach-card" aria-labelledby="mach-address-title">
      <div className="mach-card__header">
        <span className="mach-card__icon mach-card__icon--orange">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <h2 id="mach-address-title" className="mach-card__title">
          {KYC_COPY.addressTitle}
        </h2>
      </div>
      <p className="mach-card__subtitle">{KYC_COPY.addressSubtitle}</p>

      <AddressFields
        prefix="currentAddress"
        copy={CURRENT_ADDRESS_COPY}
        value={data.currentAddress}
        onChange={(currentAddress) => onChange({ currentAddress })}
        errors={errors}
      />

      <div className="mach-toggle" role="radiogroup" aria-label={KYC_COPY.sameAddressQuestion}>
        <p className="mach-toggle__question">{KYC_COPY.sameAddressQuestion}</p>
        <div className="mach-toggle__options">
          {CHOICES.map((choice) => {
            const isActive = data.permanentSameAsCurrent === choice.value
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`mach-toggle__option${isActive ? ' mach-toggle__option--active' : ''}`}
                onClick={() => handleChoice(choice.value)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
        {errors.permanentSameAsCurrent && (
          <p className="mach-field__error" role="alert">
            {errors.permanentSameAsCurrent}
          </p>
        )}
      </div>

      {isSeparatePermanent && (
        <>
          <hr className="mach-divider" />
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
