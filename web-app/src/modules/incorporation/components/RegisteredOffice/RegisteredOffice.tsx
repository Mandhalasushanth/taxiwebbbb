import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { StepActionBar } from '@shared/components'
import { getStatesForPincode } from '@shared/utils/pincodeState'
import { filterDigits, filterMobile, isValidMobile, isValidPincode, isValidEmail } from '../../utils/validation'
import type { RegisteredOfficeAddressData } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './RegisteredOffice.css'

type AddressField = keyof RegisteredOfficeAddressData & string

const EMPTY_ADDRESS: RegisteredOfficeAddressData = {
  addressLine1: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  ownershipStatus: '',
  email: '',
  mobile: '',
}

const OWNERSHIP_OPTIONS = ['Rented', 'Owned', 'Leased'] as const
const PIN_LENGTH = 6
const PLACE_NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,59}$/
const ADDRESS_MIN_LENGTH = 5

/** PIN must belong to the typed state (compared without case, e.g. "telangana" = "Telangana"). */
const pinStateError = (pin: string, state: string): string => {
  const states = getStatesForPincode(pin)
  if (states.length === 0) return `PIN code ${pin} is not a valid business address PIN`
  const typed = state.trim().toLowerCase()
  return states.some((s) => s.toLowerCase() === typed) ? '' : `PIN code ${pin} belongs to ${states.join(' / ')}, not ${state.trim()}`
}

const requiredError = (value: string | undefined, message: string): string => ((value || '').trim() ? '' : message)

const placeError = (value: string | undefined, label: string): string => {
  const trimmed = (value || '').trim()
  if (!trimmed) return `${label} is required`
  return PLACE_NAME_PATTERN.test(trimmed) ? '' : `Enter a valid ${label.toLowerCase()} (letters only)`
}

/** All field errors for the Registered Office step, keyed by field. */
const getAddressErrors = (address: RegisteredOfficeAddressData): Record<string, string> => {
  const line = (address.addressLine1 || '').trim()
  const pin = (address.pincode || '').trim()
  const email = (address.email || '').trim()
  const mobile = (address.mobile || '').trim()
  const pinError = !pin
    ? 'PIN code is required'
    : !isValidPincode(pin)
      ? 'Enter a valid 6-digit PIN code'
      : (address.state || '').trim()
        ? pinStateError(pin, address.state)
        : ''

  const errors: Record<string, string> = {
    addressLine1: !line ? 'Building / premises address is required' : line.length < ADDRESS_MIN_LENGTH ? 'Enter the full building / premises address' : '',
    city: placeError(address.city, 'City'),
    district: placeError(address.district, 'District'),
    state: placeError(address.state, 'State'),
    pincode: pinError,
    ownershipStatus: requiredError(address.ownershipStatus, 'Premises ownership status is required'),
    email: !email ? 'Email address is required' : isValidEmail(email) ? '' : 'Enter a valid email address',
    mobile: !mobile ? 'Mobile number is required' : isValidMobile(mobile) ? '' : 'Enter a valid 10-digit Indian mobile number',
  }
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message)))
}

export const RegisteredOffice: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const addressData: RegisteredOfficeAddressData = { ...EMPTY_ADDRESS, ...formData.registeredOffice?.addressData }
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: AddressField, val: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    const finalVal = field === 'pincode' ? filterDigits(val, PIN_LENGTH) : field === 'mobile' ? filterMobile(val) : val
    updateFormData({
      registeredOffice: { ...formData.registeredOffice, addressData: { ...addressData, [field]: finalVal } },
    })
  }

  const handleContinue = () => {
    const newErrors = getAddressErrors(addressData)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    goToStep(routePaths.incorporation.promoterDetails)
  }

  const renderInput = (
    label: string,
    field: AddressField,
    placeholder: string,
    inputProps: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="reg-office-group">
      <label htmlFor={`reg-office-${field}`} className="reg-office-label">
        {label}<span className="reg-office-required"> *</span>
      </label>
      <input
        id={`reg-office-${field}`}
        type="text"
        {...inputProps}
        className={`reg-office-input ${errors[field] ? 'reg-office-input--error' : ''}`}
        placeholder={placeholder}
        value={addressData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
      {errors[field] && <span className="reg-office-field-error">{errors[field]}</span>}
    </div>
  )

  return (
    <div className="reg-office-page">
      {/* Step Progress Tracker */}
      <div className="reg-office-stepbar">
        <span className="reg-office-stepbar__badge">Step 2 of 10</span>
        <div className="reg-office-stepbar__line">
          <div className="reg-office-stepbar__line-fill" />
        </div>
      </div>

      {/* Page Header */}
      <header className="reg-office-header">
        <h1 className="reg-office-header__title">Registered Office Details</h1>
      </header>

      {/* Card 1: Building / Address */}
      <section className="reg-office-card">
        <div className="reg-office-card__header">
          <h2 className="reg-office-card__title">Building / Address</h2>
          <p className="reg-office-card__subtitle">
            Provide official communication address for MCA, ROC, and statutory authorities.
          </p>
        </div>

        {renderInput('Building / Premises Address Line', 'addressLine1', 'Enter registered address', { maxLength: 200 })}

        <div className="reg-office-row-2">
          {renderInput('City', 'city', 'Enter city', { maxLength: 60 })}
          {renderInput('District', 'district', 'Enter district', { maxLength: 60 })}
        </div>

        <div className="reg-office-row-2">
          {renderInput('State', 'state', 'Enter state', { maxLength: 60 })}
          {renderInput('PIN Code', 'pincode', 'Enter 6-digit PIN code', { inputMode: 'numeric', maxLength: PIN_LENGTH })}
        </div>
      </section>

      {/* Card 2: Premises Ownership */}
      <section className="reg-office-card">
        <div className="reg-office-card__header">
          <h2 className="reg-office-card__title">Premises Ownership</h2>
        </div>
        <div className="reg-office-group">
          <span className="reg-office-label" id="reg-office-ownership-label">
            Premises Ownership Status<span className="reg-office-required"> *</span>
          </span>
          <div
            className={`reg-office-chips ${errors.ownershipStatus ? 'reg-office-chips--error' : ''}`}
            role="radiogroup"
            aria-labelledby="reg-office-ownership-label"
          >
            {OWNERSHIP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={addressData.ownershipStatus === opt}
                className={`reg-office-chip ${addressData.ownershipStatus === opt ? 'reg-office-chip--active' : ''}`}
                onClick={() => handleInputChange('ownershipStatus', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {errors.ownershipStatus && <span className="reg-office-field-error">{errors.ownershipStatus}</span>}
        </div>
      </section>

      {/* Card 3: Contact Details */}
      <section className="reg-office-card">
        <div className="reg-office-card__header">
          <h2 className="reg-office-card__title">Contact Details</h2>
        </div>
        <div className="reg-office-row-2">
          {renderInput('Company Email', 'email', 'Enter company email', { type: 'email', maxLength: 254, autoComplete: 'email' })}
          {renderInput('Mobile', 'mobile', 'Enter 10-digit mobile', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel' })}
        </div>
      </section>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => goToStep(routePaths.incorporation.companyDetails)}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default RegisteredOffice
