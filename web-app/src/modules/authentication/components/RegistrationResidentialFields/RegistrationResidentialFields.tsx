import React, { useState } from 'react'
import {
  BuildingIcon,
  PinIcon,
  MapIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationSelect } from '../RegistrationSelect/RegistrationSelect'
import { CANONICAL_INDIAN_STATES_AND_UTS } from '@shared/services'
import './RegistrationResidentialFields.css'

export interface RegistrationResidentialValues {
  addressLine1: string
  pincode: string
  areaLocality: string
  city: string
  district: string
  state: string
}

export interface RegistrationResidentialErrors {
  addressLine1?: string
  pincode?: string
  areaLocality?: string
  city?: string
  district?: string
  state?: string
}

export interface RegistrationResidentialFieldsProps {
  values: RegistrationResidentialValues
  errors: RegistrationResidentialErrors
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export const RegistrationResidentialFields: React.FC<RegistrationResidentialFieldsProps> = ({
  values,
  errors,
  onChange,
  onBlur,
}) => {
  const [showAddressLine2, setShowAddressLine2] = useState<boolean>(() => Boolean(values.areaLocality))

  return (
    <div className="reg-address-section">
      {/* Address Line 1 */}
      <div className="reg-field">
        <div className="reg-field__label-row">
          <label className="reg-field__label" htmlFor="reg-addressLine1">
            Address Line 1 <span className="reg-field__required">*</span>
          </label>
          {!showAddressLine2 && (
            <button
              type="button"
              className="reg-address-section__add-btn"
              onClick={() => setShowAddressLine2(true)}
            >
              + Add Line 2
            </button>
          )}
        </div>
        <div
          className={`reg-field__control ${
            errors.addressLine1 ? 'reg-field__control--error' : ''
          }`}
        >
          <span className="reg-field__icon">
            <BuildingIcon />
          </span>
          <input
            id="reg-addressLine1"
            name="addressLine1"
            type="text"
            className="reg-field__input"
            placeholder="House / Building / Street"
            value={values.addressLine1}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete="address-line1"
          />
        </div>
        {errors.addressLine1 && (
          <p className="reg-field__error">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 (Optional) - Shown when toggled */}
      {showAddressLine2 && (
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-areaLocality">
            Address Line 2 (Optional)
          </label>
          <div
            className={`reg-field__control ${
              errors.areaLocality ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <MapIcon />
            </span>
            <input
              id="reg-areaLocality"
              name="areaLocality"
              type="text"
              className="reg-field__input"
              placeholder="Locality, Landmark"
              value={values.areaLocality}
              onChange={onChange}
              onBlur={onBlur}
              autoFocus
            />
          </div>
          {errors.areaLocality && (
            <p className="reg-field__error">{errors.areaLocality}</p>
          )}
        </div>
      )}

      {/* City & PIN Code in side-by-side row */}
      <div className="reg-address-section__two-col">
        {/* City */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-city">
            City <span className="reg-field__required">*</span>
          </label>
          <div
            className={`reg-field__control ${
              errors.city ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <BuildingIcon />
            </span>
            <input
              id="reg-city"
              name="city"
              type="text"
              className="reg-field__input"
              placeholder="City"
              value={values.city}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="address-level2"
            />
          </div>
          {errors.city && <p className="reg-field__error">{errors.city}</p>}
        </div>

        {/* PIN Code */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-pincode">
            PIN Code <span className="reg-field__required">*</span>
          </label>
          <div
            className={`reg-field__control ${
              errors.pincode ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <PinIcon />
            </span>
            <input
              id="reg-pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              className="reg-field__input"
              placeholder="PIN Code"
              maxLength={6}
              value={values.pincode}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="postal-code"
            />
          </div>
          {errors.pincode && (
            <p className="reg-field__error">{errors.pincode}</p>
          )}
        </div>
      </div>

      {/* State / UT */}
      <div className="reg-field">
        <label className="reg-field__label" htmlFor="reg-state">
          State / UT <span className="reg-field__required">*</span>
        </label>
        <RegistrationSelect
          id="reg-state"
          name="state"
          value={values.state}
          placeholder="State / UT"
          options={CANONICAL_INDIAN_STATES_AND_UTS}
          icon={<MapIcon />}
          hasError={Boolean(errors.state)}
          align="left"
          searchable={true}
          onChange={onChange}
          onBlur={onBlur}
        />
        {errors.state && <p className="reg-field__error">{errors.state}</p>}
      </div>

      {/* Hidden District field to maintain complete data compatibility */}
      <input
        id="reg-district"
        name="district"
        type="hidden"
        value={values.district || values.city}
      />
    </div>
  )
}
