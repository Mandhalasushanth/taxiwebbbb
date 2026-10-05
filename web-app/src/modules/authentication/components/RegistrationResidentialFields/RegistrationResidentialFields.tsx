import React from 'react'
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
  return (
    <div className="reg-address-section">
      {/* Section Header */}
      <div className="reg-address-section__header">
        <div className="reg-address-section__title-group">
          <h3 className="reg-address-section__title">Residential Details</h3>
        </div>
      </div>

      {/* Row 1: Address Line 1 + PIN Code */}
      <div className="reg-address-section__two-col">
        {/* Address Line 1 */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-addressLine1">
            Address Line 1 <span className="reg-field__required">*</span>
          </label>
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
              placeholder="House No, Building, Street"
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
              placeholder="6-digit PIN code"
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

      {/* Row 2: Area / Locality + City */}
      <div className="reg-address-section__two-col">
        {/* Area / Locality */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-areaLocality">
            Area / Locality
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
              placeholder="e.g. Shivajinagar, HSR Layout"
              value={values.areaLocality}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.areaLocality && (
            <p className="reg-field__error">{errors.areaLocality}</p>
          )}
        </div>

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
              placeholder="e.g. Pune, Hyderabad, Mumbai"
              value={values.city}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="address-level2"
            />
          </div>
          {errors.city && <p className="reg-field__error">{errors.city}</p>}
        </div>
      </div>

      {/* Row 3: District + State / UT */}
      <div className="reg-address-section__two-col">
        {/* District */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-district">
            District <span className="reg-field__required">*</span>
          </label>
          <div
            className={`reg-field__control ${
              errors.district ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <BuildingIcon />
            </span>
            <input
              id="reg-district"
              name="district"
              type="text"
              className="reg-field__input"
              placeholder="e.g. Pune, Warangal, Thane"
              value={values.district}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="address-level2"
            />
          </div>
          {errors.district && (
            <p className="reg-field__error">{errors.district}</p>
          )}
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
            placeholder="Select your State / UT"
            options={CANONICAL_INDIAN_STATES_AND_UTS}
            icon={<MapIcon />}
            hasError={Boolean(errors.state)}
            align="right"
            searchable={true}
            onChange={onChange}
            onBlur={onBlur}
          />
          {errors.state && <p className="reg-field__error">{errors.state}</p>}
        </div>
      </div>
    </div>
  )
}
