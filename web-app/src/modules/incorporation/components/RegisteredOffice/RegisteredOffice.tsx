import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { StepActionBar, CaretInput } from '@shared/components'
import { getStatesForPincode } from '@shared/utils/pincodeState'
import { filterDigits, filterMobile } from '../../utils/validation'
import {
  validateAddress,
  validateCity,
  validatePincode,
  validateEmail,
  validateMobileNumber,
} from '@shared/utils/validationUtils'
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
const ADDRESS_MIN_LENGTH = 5

/** PIN must belong to the typed state (compared without case, e.g. "telangana" = "Telangana"). */
const pinStateError = (pin: string, state: string): string => {
  const states = getStatesForPincode(pin)
  if (states.length === 0) return `PIN code ${pin} is not a valid business address PIN`
  const typed = state.trim().toLowerCase()
  return states.some((s) => s.toLowerCase() === typed) ? '' : `PIN code ${pin} belongs to ${states.join(' / ')}, not ${state.trim()}`
}

const requiredError = (value: string | undefined, message: string): string => ((value || '').trim() ? '' : message)

const validateSingleAddressField = (
  field: AddressField,
  value: string | undefined,
  currentAddress: RegisteredOfficeAddressData
): string => {
  const val = (value || '').trim()
  switch (field) {
    case 'addressLine1':
      if (!val) return 'Building / premises address is required'
      if (val.length < ADDRESS_MIN_LENGTH) return 'Enter the full building / premises address'
      return validateAddress(val, { label: 'Building / premises address', minLength: ADDRESS_MIN_LENGTH }) || ''
    case 'city':
      if (!val) return 'City is required'
      return validateCity(val, 'City') || ''
    case 'district':
      if (!val) return 'District is required'
      return validateCity(val, 'District') || ''
    case 'state':
      if (!val) return 'State is required'
      return validateCity(val, 'State') || ''
    case 'pincode': {
      if (!val) return 'PIN code is required'
      const pinErr = validatePincode(val, 'PIN code')
      if (pinErr) return pinErr
      if ((currentAddress.state || '').trim()) {
        return pinStateError(val, currentAddress.state)
      }
      return ''
    }
    case 'ownershipStatus':
      return requiredError(val, 'Premises ownership status is required')
    case 'email':
      if (!val) return 'Email address is required'
      return validateEmail(val, 'Email address') || ''
    case 'mobile':
      if (!val) return 'Mobile number is required'
      return validateMobileNumber(val, 'Mobile number') || ''
    default:
      return ''
  }
}

/** All field errors for the Registered Office step, keyed by field. */
const getAddressErrors = (address: RegisteredOfficeAddressData): Record<string, string> => {
  const fields: AddressField[] = [
    'addressLine1',
    'city',
    'district',
    'state',
    'pincode',
    'ownershipStatus',
    'email',
    'mobile',
  ]
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const err = validateSingleAddressField(field, address[field], address)
    if (err) {
      errors[field] = err
    }
  }
  return errors
}

export const RegisteredOffice: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const addressData: RegisteredOfficeAddressData = { ...EMPTY_ADDRESS, ...formData.registeredOffice?.addressData }
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: AddressField, val: string) => {
    const finalVal = field === 'pincode' ? filterDigits(val, PIN_LENGTH) : field === 'mobile' ? filterMobile(val) : val
    const updated = { ...addressData, [field]: finalVal }
    updateFormData({
      registeredOffice: { ...formData.registeredOffice, addressData: updated },
    })

    if (errors[field]) {
      const err = validateSingleAddressField(field, finalVal, updated)
      setErrors((prev) => {
        if (!err) {
          const next = { ...prev }
          delete next[field]
          return next
        }
        return { ...prev, [field]: err }
      })
    }
  }

  const handleInputBlur = (field: AddressField) => {
    const err = validateSingleAddressField(field, addressData[field], addressData)
    setErrors((prev) => (err ? { ...prev, [field]: err } : { ...prev, [field]: '' }))
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
      <CaretInput
        id={`reg-office-${field}`}
        type="text"
        {...inputProps}
        className={`reg-office-input ${errors[field] ? 'reg-office-input--error' : ''}`}
        placeholder={placeholder}
        value={addressData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleInputBlur(field)}
      />
      {errors[field] && <span className="reg-office-field-error">{errors[field]}</span>}
    </div>
  )

  return (
    <div className="reg-office-page">
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
