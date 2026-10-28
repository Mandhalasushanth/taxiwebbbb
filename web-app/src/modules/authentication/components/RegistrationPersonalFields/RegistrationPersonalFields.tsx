import React, { useRef } from 'react'
import {
  UserIcon,
  MailIcon,
  GenderIcon,
  CalendarIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationSelect } from '../RegistrationSelect/RegistrationSelect'
import './RegistrationPersonalFields.css'

export interface RegistrationPersonalValues {
  fullName: string
  email: string
  gender: string
  dob: string
}

export interface RegistrationPersonalErrors {
  fullName?: string
  email?: string
  gender?: string
  dob?: string
}

export interface RegistrationPersonalFieldsProps {
  values: RegistrationPersonalValues
  errors: RegistrationPersonalErrors
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
  onOpenCalendar?: () => void
  isCalendarOpen?: boolean
  onToggleCalendar?: () => void
  onCloseCalendar?: () => void
  onApplyDate?: (formattedDate: string) => void
}

/** Convert DD-MM-YYYY to YYYY-MM-DD for native date picker */
const toIsoDate = (dmy: string): string => {
  if (!dmy) return ''
  const parts = dmy.split('-')
  if (parts.length === 3 && parts[2]?.length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return ''
}

/** Convert YYYY-MM-DD to DD-MM-YYYY */
const toDmyDate = (iso: string): string => {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return iso
}

export const RegistrationPersonalFields: React.FC<RegistrationPersonalFieldsProps> = ({
  values,
  errors,
  onChange,
  onBlur,
  onApplyDate,
}) => {
  const nativeDateRef = useRef<HTMLInputElement>(null)

  const handleOpenPicker = () => {
    try {
      nativeDateRef.current?.showPicker?.()
    } catch {
      nativeDateRef.current?.focus()
    }
  }

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dmy = toDmyDate(e.target.value)
    if (!dmy) return
    if (onApplyDate) {
      onApplyDate(dmy)
    } else {
      onChange({
        target: { name: 'dob', value: dmy },
      } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div className="reg-personal-fields">
      {/* Row 1: Full Name & Email */}
      <div className="reg-personal-fields__row">
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-fullName">
            Full Name <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.fullName ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <UserIcon />
            </span>
            <input
              id="reg-fullName"
              name="fullName"
              type="text"
              pattern="[a-zA-Z\s.'-]*"
              className="reg-field__input"
              placeholder="Full Name"
              value={values.fullName}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="name"
            />
          </div>
          {errors.fullName && <p className="reg-field__error">{errors.fullName}</p>}
        </div>

        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-email">
            Email <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.email ? 'reg-field__control--error' : ''}`}>
            <span className="reg-field__icon">
              <MailIcon />
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="reg-field__input"
              placeholder="Email"
              value={values.email}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="reg-field__error">{errors.email}</p>}
        </div>
      </div>

      {/* Row 2: Gender & Date of Birth */}
      <div className="reg-personal-fields__row">
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-gender">
            Gender <span className="reg-field__required">*</span>
          </label>
          <RegistrationSelect
            id="reg-gender"
            name="gender"
            value={values.gender}
            placeholder="Gender"
            options={['Male', 'Female', 'Other']}
            icon={<GenderIcon />}
            hasError={Boolean(errors.gender)}
            align="left"
            searchable={false}
            onChange={onChange}
            onBlur={onBlur}
          />
          {errors.gender && <p className="reg-field__error">{errors.gender}</p>}
        </div>

        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-dob">
            Date of Birth <span className="reg-field__required">*</span>
          </label>
          <div className={`reg-field__control ${errors.dob ? 'reg-field__control--error' : ''}`}>
            <input
              id="reg-dob"
              name="dob"
              type="text"
              className="reg-field__input"
              placeholder="DD-MM-YYYY"
              maxLength={10}
              value={values.dob}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete="bday"
            />
            <input
              ref={nativeDateRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              className="reg-field__hidden-date"
              max={new Date().toISOString().slice(0, 10)}
              value={toIsoDate(values.dob)}
              onChange={handleNativeDateChange}
            />
            <button
              type="button"
              className="reg-field__picker-btn"
              onClick={handleOpenPicker}
              title="Open calendar"
              aria-label="Open calendar"
            >
              <CalendarIcon size={18} color="#F97316" />
            </button>
          </div>
          {errors.dob && <p className="reg-field__error">{errors.dob}</p>}
        </div>
      </div>
    </div>
  )
}
