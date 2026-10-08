import React, { useState } from 'react'
import {
  BuildingIcon,
  CalendarIcon,
  DocumentIcon,
  IdCardIcon,
  MailIcon,
  UserIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationMobileField } from '../RegistrationMobileField/RegistrationMobileField'
import { DobDatePickerModal } from '../DobDatePickerModal/DobDatePickerModal'
import type { EntityFormConfig } from '../../constants/profileFormConfig'
import './RegistrationEntityFields.css'

export interface RegistrationEntityValues {
  entityName: string
  registrationNumber: string
  incorporationDate: string
  pan: string
  fullName: string
  email: string
  mobile: string
}

export type RegistrationEntityErrors = Partial<Record<keyof RegistrationEntityValues, string>>

export interface RegistrationEntityFieldsProps {
  config: EntityFormConfig
  values: RegistrationEntityValues
  errors: RegistrationEntityErrors
  isMobileVerified: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

interface TextFieldSpec {
  name: keyof RegistrationEntityValues
  label: string
  placeholder: string
  icon: React.ReactNode
  required: boolean
  type?: string
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
}

const DATE_INPUT_MAX_LENGTH = 10
const PAN_MAX_LENGTH = 10

/** Business-entity profile: company / LLP / firm details instead of personal KYC fields. */
export const RegistrationEntityFields: React.FC<RegistrationEntityFieldsProps> = ({
  config,
  values,
  errors,
  isMobileVerified,
  onChange,
  onBlur,
}) => {
  const entityFields: TextFieldSpec[] = [
    { name: 'entityName', label: config.nameLabel, placeholder: config.namePlaceholder, icon: <BuildingIcon />, required: true, autoComplete: 'organization' },
    { name: 'registrationNumber', label: config.registrationLabel, placeholder: config.registrationPlaceholder, icon: <DocumentIcon />, required: config.registrationRequired, maxLength: config.registrationMaxLength },
    { name: 'incorporationDate', label: config.dateLabel, placeholder: 'DD-MM-YYYY', icon: <CalendarIcon />, required: true, maxLength: DATE_INPUT_MAX_LENGTH, inputMode: 'numeric' },
    { name: 'pan', label: config.panLabel, placeholder: `${config.panLabel} (e.g. AAA${config.panHolderCode}A1234A)`, icon: <IdCardIcon />, required: true, maxLength: PAN_MAX_LENGTH },
  ]

  const contactFields: TextFieldSpec[] = [
    { name: 'fullName', label: 'Authorised Person Name', placeholder: 'Enter authorised person name', icon: <UserIcon />, required: true, autoComplete: 'name' },
    { name: 'email', label: 'Email', placeholder: 'Enter official email', icon: <MailIcon />, required: true, type: 'email', autoComplete: 'email' },
  ]

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const renderTextField = (field: TextFieldSpec) => {
    const isDate = field.name === 'incorporationDate'
    return (
      <div className="reg-field" key={field.name}>
        <label className="reg-field__label" htmlFor={`reg-${field.name}`}>
          {field.label} {field.required && <span className="reg-field__required">*</span>}
        </label>
        <div className={`reg-field__control ${errors[field.name] ? 'reg-field__control--error' : ''}`}>
          <span className="reg-field__icon">{field.icon}</span>
          <input
            id={`reg-${field.name}`}
            name={field.name}
            type={field.type ?? 'text'}
            inputMode={field.inputMode}
            className="reg-field__input"
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={values[field.name]}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete={field.autoComplete ?? 'off'}
          />
          {isDate && (
            <>
              <button
                type="button"
                className="reg-field__picker-btn"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                title="Open calendar"
                aria-label="Open calendar"
              >
                <CalendarIcon size={18} color="#F97316" />
              </button>
              <DobDatePickerModal
                isOpen={isCalendarOpen}
                title={config.dateLabel || 'Select Date'}
                value={values.incorporationDate}
                maxDate={new Date()}
                onApply={(val) => {
                  const syntheticEvent = {
                    target: { name: 'incorporationDate', value: val }
                  } as unknown as React.ChangeEvent<HTMLInputElement>
                  onChange(syntheticEvent)
                }}
                onClose={() => setIsCalendarOpen(false)}
              />
            </>
          )}
        </div>
        {errors[field.name] && <p className="reg-field__error">{errors[field.name]}</p>}
      </div>
    )
  }

  return (
    <div className="reg-entity-fields">
      <div className="reg-entity-fields__row">{entityFields.map(renderTextField)}</div>
      <div className="reg-entity-fields__row">
        {contactFields.map(renderTextField)}
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

export default RegistrationEntityFields
