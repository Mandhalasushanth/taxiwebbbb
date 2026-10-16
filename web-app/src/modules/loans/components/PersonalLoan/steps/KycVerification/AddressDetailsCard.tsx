import React from 'react'
import { MapPin } from 'lucide-react'
import type { KycStepProps, YesNoChoice } from '@modules/loans/types'
import {
  CURRENT_ADDRESS_COPY,
  EMPTY_ADDRESS,
  KYC_COPY,
  PERMANENT_ADDRESS_COPY,
} from '../../personalLoan.constants'
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
    <section className="pl-card" aria-labelledby="pl-address-title">
      <div className="pl-card__header">
        <span className="pl-card__icon pl-card__icon--orange">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <h2 id="pl-address-title" className="pl-card__title">
          {KYC_COPY.addressTitle}
        </h2>
      </div>
      <p className="pl-card__subtitle">{KYC_COPY.addressSubtitle}</p>

      <AddressFields
        prefix="currentAddress"
        copy={CURRENT_ADDRESS_COPY}
        value={data.currentAddress}
        onChange={(currentAddress) => onChange({ currentAddress })}
        errors={errors}
      />

      <div className="pl-toggle" role="radiogroup" aria-label={KYC_COPY.sameAddressQuestion}>
        <p className="pl-toggle__question">{KYC_COPY.sameAddressQuestion}</p>
        <div className="pl-toggle__options">
          {CHOICES.map((choice) => {
            const isActive = data.permanentSameAsCurrent === choice.value
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`pl-toggle__option${isActive ? ' pl-toggle__option--active' : ''}`}
                onClick={() => handleChoice(choice.value)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
        {errors.permanentSameAsCurrent && (
          <p className="pl-field__error" role="alert">
            {errors.permanentSameAsCurrent}
          </p>
        )}
      </div>

      {isSeparatePermanent && (
        <>
          <hr className="pl-divider" />
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
