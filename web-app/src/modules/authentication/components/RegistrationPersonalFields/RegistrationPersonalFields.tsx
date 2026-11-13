import React, { useState, useRef } from 'react'
import { CaretInput } from '@shared/components'
import {
  UserIcon,
  MailIcon,
  GenderIcon,
  CalendarIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationSelect } from '../RegistrationSelect/RegistrationSelect'
import { DobDatePickerModal } from '../DobDatePickerModal/DobDatePickerModal'
import { getTodayIso } from '@shared/utils/dateUtils'
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
  onOpenCalendar,
  isCalendarOpen: propIsCalendarOpen,
  onToggleCalendar,
  onCloseCalendar,
  onApplyDate,
}) => {
  const [internalCalendarOpen, setInternalCalendarOpen] = useState(false)
  const isCalendarOpen = propIsCalendarOpen !== undefined ? propIsCalendarOpen : internalCalendarOpen
  const nativeDateRef = useRef<HTMLInputElement>(null)

  const handleToggleCalendar = () => {
    if (onToggleCalendar) {
      onToggleCalendar()
    } else if (onOpenCalendar && !isCalendarOpen) {
      onOpenCalendar()
    } else {
      setInternalCalendarOpen((prev) => !prev)
    }
  }

  const handleCloseCalendar = () => {
    if (onCloseCalendar) {
      onCloseCalendar()
    } else {
      setInternalCalendarOpen(false)
    }
  }

  const handleApplyDateInternal = (formattedDate: string) => {
    if (onApplyDate) {
      onApplyDate(formattedDate)
    } else {
      onChange({
        target: { name: 'dob', value: formattedDate },
      } as React.ChangeEvent<HTMLInputElement>)
    }
    handleCloseCalendar()
  }

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dmy = toDmyDate(e.target.value)
    if (!dmy) return
    handleApplyDateInternal(dmy)
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault()
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
            <CaretInput
              id="reg-fullName"
              name="fullName"
              type="text"
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
            <CaretInput
              id="reg-email"
              name="email"
              type="text"
              inputMode="email"
              className="reg-field__input"
              placeholder="Email"
              maxLength={100}
              value={values.email}
              onChange={onChange}
              onKeyDown={handleEmailKeyDown}
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
            <CaretInput
              id="reg-dob"
              name="dob"
              type="text"
              inputMode="numeric"
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
              max={getTodayIso()}
              value={toIsoDate(values.dob)}
              onChange={handleNativeDateChange}
            />
            <button
              type="button"
              className="reg-field__picker-btn"
              onClick={handleToggleCalendar}
              title="Open calendar"
              aria-label="Open calendar"
              data-testid="dob-calendar-btn"
            >
              <CalendarIcon size={18} color="#F97316" />
            </button>
            <DobDatePickerModal
              isOpen={Boolean(isCalendarOpen)}
              value={values.dob}
              onApply={handleApplyDateInternal}
              onClose={handleCloseCalendar}
              maxDate={new Date()}
              minDate={new Date(1900, 0, 1)}
            />
          </div>
          {errors.dob && <p className="reg-field__error">{errors.dob}</p>}
        </div>
      </div>
    </div>
  )
}
