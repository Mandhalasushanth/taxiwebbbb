import React from 'react'
import {
  UserIcon,
  MailIcon,
  GenderIcon,
  CalendarIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { RegistrationSelect } from '../RegistrationSelect/RegistrationSelect'
import { DobDatePickerModal } from '../DobDatePickerModal/DobDatePickerModal'
import { AGE_LIMITS } from '@shared/utils'
import './RegistrationPersonalFields.css'

const yearsAgo = (years: number, extraDays = 0): Date => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  date.setDate(date.getDate() + extraDays)
  return date
}

/** Calendar only offers birth dates for ages AGE_LIMITS.min to AGE_LIMITS.max */
const DOB_PICKER_RANGE = {
  min: yearsAgo(AGE_LIMITS.max + 1, 1),
  max: yearsAgo(AGE_LIMITS.min),
}

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

export const RegistrationPersonalFields: React.FC<RegistrationPersonalFieldsProps> = ({
  values,
  errors,
  onChange,
  onBlur,
  onOpenCalendar,
  isCalendarOpen = false,
  onToggleCalendar,
  onCloseCalendar,
  onApplyDate,
}) => {
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
              placeholder="Enter your name"
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
              placeholder="Enter your email"
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
            placeholder="Select Gender"
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
            <button
              type="button"
              className="reg-field__picker-btn"
              onClick={onToggleCalendar || onOpenCalendar}
              title="Open calendar"
              aria-label="Open calendar"
            >
              <CalendarIcon size={18} color="#F97316" />
            </button>
            {onApplyDate && onCloseCalendar && (
              <DobDatePickerModal
                isOpen={Boolean(isCalendarOpen)}
                minDate={DOB_PICKER_RANGE.min}
                maxDate={DOB_PICKER_RANGE.max}
                value={values.dob}
                onApply={onApplyDate}
                onClose={onCloseCalendar}
              />
            )}
          </div>
          {errors.dob && <p className="reg-field__error">{errors.dob}</p>}
        </div>
      </div>
    </div>
  )
}
