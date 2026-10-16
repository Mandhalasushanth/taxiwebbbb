import React from 'react'
import type { ChangeEvent } from 'react'
import { InlineSelect } from '../InlineSelect'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'
import { addressErrorKey } from '@modules/loans/validation/personalLoanValidation'
import { ADDRESS_INPUT_FILTERS, ADDRESS_LIMITS, STATE_OPTIONS } from '../../personalLoan.constants'
import type { AddressCopy } from '../../personalLoan.constants'

export interface AddressFieldsProps {
  /** Form key of this address, e.g. "currentAddress"; also used for ids and error keys */
  prefix: 'currentAddress' | 'permanentAddress'
  copy: AddressCopy
  value: LoanAddress
  onChange: (next: LoanAddress) => void
  errors: Record<string, string>
}

interface TextFieldConfig {
  field: Exclude<LoanAddressField, 'state'>
  label: string
  placeholder: string
  inputMode?: 'numeric' | 'text'
  autoComplete: string
}

const fieldErrorClass = (error?: string) => `pl-field__input${error ? ' pl-field__input--error' : ''}`

/** House, street, city, PIN and state inputs for one address (current or permanent) */
export const AddressFields: React.FC<AddressFieldsProps> = ({ prefix, copy, value, onChange, errors }) => {
  const id = (field: LoanAddressField) => `pl-${prefix}-${field}`
  const errorOf = (field: LoanAddressField) => errors[addressErrorKey(prefix, field)]

  const update = (field: LoanAddressField) => (event: ChangeEvent<HTMLInputElement>) => {
    try {
      onChange({ ...value, [field]: ADDRESS_INPUT_FILTERS[field](event.target.value) })
    } catch (err) {
      console.error('Error updating address field', err)
    }
  }

  const renderText = ({ field, label, placeholder, inputMode = 'text', autoComplete }: TextFieldConfig) => {
    const error = errorOf(field)
    return (
      <div className="pl-field" key={field}>
        <label className="pl-field__label" htmlFor={id(field)}>
          {label} <span className="pl-required">*</span>
        </label>
        <input
          id={id(field)}
          className={fieldErrorClass(error)}
          value={value[field]}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={ADDRESS_LIMITS[field]}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id(field)}-error` : undefined}
          onChange={update(field)}
        />
        {error && (
          <p id={`${id(field)}-error`} className="pl-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="pl-address">
      <h3 className="pl-address__heading">{copy.heading}</h3>
      {renderText({
        field: 'houseBuilding',
        label: 'House / Flat / Building',
        placeholder: copy.housePlaceholder,
        autoComplete: 'address-line1',
      })}
      {renderText({
        field: 'streetLocality',
        label: copy.streetLabel,
        placeholder: copy.streetPlaceholder,
        autoComplete: 'address-line2',
      })}
      <div className="pl-row">
        {renderText({
          field: 'city',
          label: 'City / District',
          placeholder: copy.cityPlaceholder,
          autoComplete: 'address-level2',
        })}
        {renderText({
          field: 'pincode',
          label: 'PIN Code',
          placeholder: copy.pincodePlaceholder,
          inputMode: 'numeric',
          autoComplete: 'postal-code',
        })}
      </div>

      <InlineSelect
        id={id('state')}
        label="State"
        placeholder={copy.statePlaceholder}
        options={STATE_OPTIONS}
        value={value.state}
        onChange={(state) => onChange({ ...value, state })}
        error={errorOf('state')}
      />
    </div>
  )
}

export default AddressFields
