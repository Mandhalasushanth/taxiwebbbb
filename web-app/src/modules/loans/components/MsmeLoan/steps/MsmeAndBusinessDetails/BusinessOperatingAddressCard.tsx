import React from 'react'
import type { ChangeEvent } from 'react'
import { MapPin } from 'lucide-react'
import { StateSelect } from '@modules/loans/shared/StateSelect'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { ADDRESS_INPUT_FILTERS, ADDRESS_LIMITS, EMPTY_ADDRESS, STATE_OPTIONS } from '../../msmeLoan.constants'

export const BusinessOperatingAddressCard: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  const address: LoanAddress = data.operatingAddress || EMPTY_ADDRESS

  const errorOf = (field: LoanAddressField) =>
    errors[`operatingAddress.${field}`] || errors[`operating${field.charAt(0).toUpperCase()}${field.slice(1)}`]

  const update = (field: LoanAddressField) => (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = ADDRESS_INPUT_FILTERS[field](event.target.value)
      onChange({
        operatingAddress: {
          ...address,
          [field]: sanitized,
        },
      })
    } catch (err) {
      console.error('Error updating operating address field', err)
    }
  }

  const handleStateChange = (state: string) => {
    onChange({
      operatingAddress: {
        ...address,
        state,
      },
    })
  }

  const houseError = errorOf('houseBuilding')
  const streetError = errorOf('streetLocality')
  const cityError = errorOf('city')
  const stateError = errorOf('state')
  const pincodeError = errorOf('pincode')

  return (
    <section className="msme-card" aria-labelledby="msme-operating-address-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--navy">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-operating-address-title" className="msme-card__title">
          Business Operating Address
        </h2>
      </div>

      {/* House / Flat / Building */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-operating-house">
          House / Flat / Building <span className="msme-required">*</span>
        </label>
        <input
          id="msme-operating-house"
          className={`msme-field__input${houseError ? ' msme-field__input--error' : ''}`}
          placeholder="Enter house, flat or building"
          value={address.houseBuilding || ''}
          maxLength={ADDRESS_LIMITS.houseBuilding}
          autoComplete="address-line1"
          aria-invalid={Boolean(houseError) || undefined}
          aria-describedby={houseError ? 'msme-operating-house-error' : undefined}
          onChange={update('houseBuilding')}
        />
        {houseError && (
          <p id="msme-operating-house-error" className="msme-field__error" role="alert">
            {houseError}
          </p>
        )}
      </div>

      {/* Street / Locality / Landmark */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-operating-street">
          Street / Locality / Landmark <span className="msme-required">*</span>
        </label>
        <input
          id="msme-operating-street"
          className={`msme-field__input${streetError ? ' msme-field__input--error' : ''}`}
          placeholder="Enter street, locality or landmark"
          value={address.streetLocality || ''}
          maxLength={ADDRESS_LIMITS.streetLocality}
          autoComplete="address-line2"
          aria-invalid={Boolean(streetError) || undefined}
          aria-describedby={streetError ? 'msme-operating-street-error' : undefined}
          onChange={update('streetLocality')}
        />
        {streetError && (
          <p id="msme-operating-street-error" className="msme-field__error" role="alert">
            {streetError}
          </p>
        )}
      </div>

      {/* City / District */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-operating-city">
          City / District <span className="msme-required">*</span>
        </label>
        <input
          id="msme-operating-city"
          className={`msme-field__input${cityError ? ' msme-field__input--error' : ''}`}
          placeholder="Enter city or district"
          value={address.city || ''}
          maxLength={ADDRESS_LIMITS.city}
          autoComplete="address-level2"
          aria-invalid={Boolean(cityError) || undefined}
          aria-describedby={cityError ? 'msme-operating-city-error' : undefined}
          onChange={update('city')}
        />
        {cityError && (
          <p id="msme-operating-city-error" className="msme-field__error" role="alert">
            {cityError}
          </p>
        )}
      </div>

      {/* State / Union Territory (with typeahead alphabet search) */}
      <StateSelect
        id="msme-operating-state"
        label="State / Union Territory"
        value={address.state || ''}
        placeholder="Select state or union territory"
        options={STATE_OPTIONS}
        error={stateError}
        required
        onChange={handleStateChange}
      />

      {/* PIN Code */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-operating-pincode">
          PIN Code <span className="msme-required">*</span>
        </label>
        <input
          id="msme-operating-pincode"
          className={`msme-field__input${pincodeError ? ' msme-field__input--error' : ''}`}
          placeholder="Enter PIN code"
          value={address.pincode || ''}
          maxLength={ADDRESS_LIMITS.pincode}
          inputMode="numeric"
          autoComplete="postal-code"
          aria-invalid={Boolean(pincodeError) || undefined}
          aria-describedby={pincodeError ? 'msme-operating-pincode-error' : undefined}
          onChange={update('pincode')}
        />
        {pincodeError && (
          <p id="msme-operating-pincode-error" className="msme-field__error" role="alert">
            {pincodeError}
          </p>
        )}
      </div>
    </section>
  )
}

export default BusinessOperatingAddressCard
