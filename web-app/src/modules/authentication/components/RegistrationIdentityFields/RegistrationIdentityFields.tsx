import React from 'react'
import {
  UsersIcon,
  IdCardIcon,
  DocumentIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationMobileField } from '../RegistrationMobileField/RegistrationMobileField'
import './RegistrationIdentityFields.css'

export interface RegistrationIdentityValues {
  fatherSpouseName: string
  pan: string
  aadhaar: string
  mobile: string
}

export interface RegistrationIdentityErrors {
  fatherSpouseName?: string
  pan?: string
  aadhaar?: string
  mobile?: string
}

export interface RegistrationIdentityFieldsProps {
  values: RegistrationIdentityValues
  errors: RegistrationIdentityErrors
  isMobileVerified: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const RegistrationIdentityFields: React.FC<RegistrationIdentityFieldsProps> = ({
  values,
  errors,
  isMobileVerified,
  onChange,
  onBlur,
}) => {
  return (
    <div className="reg-identity-fields">
      {/* Row 3: Father's / Spouse Name & PAN Number */}
      <div className="reg-identity-fields__row">
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-fatherSpouseName">
            Father's / Spouse Name
          </label>
          <div className={`reg-field__control ${errors.fatherSpouseName ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <UsersIcon />
            </span>
            <input
              id="reg-fatherSpouseName"
              name="fatherSpouseName"
              type="text"
              pattern="[a-zA-Z\s.'-]*"
              className="reg-field__input"
              placeholder="Enter Father's / Spouse Name"
              value={values.fatherSpouseName}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.fatherSpouseName && (
            <p className="reg-field__error">{errors.fatherSpouseName}</p>
          )}
        </div>

        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-pan">
            PAN Number <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.pan ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <IdCardIcon />
            </span>
            <input
              id="reg-pan"
              name="pan"
              type="text"
              className="reg-field__input"
              placeholder="PAN Number"
              maxLength={10}
              value={values.pan}
              onChange={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
            />
          </div>
          {errors.pan && <p className="reg-field__error">{errors.pan}</p>}
        </div>
      </div>

      {/* Row 4: Aadhaar Number & Mobile Number */}
      <div className="reg-identity-fields__row">
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-aadhaar">
            Aadhaar Number <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.aadhaar ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <DocumentIcon />
            </span>
            <input
              id="reg-aadhaar"
              name="aadhaar"
              type="text"
              inputMode="numeric"
              className="reg-field__input"
              placeholder="Aadhaar Number"
              maxLength={12}
              value={values.aadhaar}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
          {errors.aadhaar && <p className="reg-field__error">{errors.aadhaar}</p>}
        </div>

        <RegistrationMobileField
          value={values.mobile}
          error={errors.mobile}
          isVerified={isMobileVerified}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  )
}
