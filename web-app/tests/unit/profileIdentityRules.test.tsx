// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { isValidVerhoeff, validateAadhaar, validateIndividualPan, validatePan } from '../../src/shared/utils'
import { RegistrationSelect } from '../../src/modules/authentication/components/RegistrationSelect/RegistrationSelect'
import { RegistrationSecurityFields } from '../../src/modules/authentication/components/RegistrationSecurityFields/RegistrationSecurityFields'
import {
  INITIAL_REGISTRATION_VALUES,
  validateField,
} from '../../src/modules/authentication/validation/registrationValidation'

afterEach(cleanup)

const dobYearsAgo = (years: number, extraDays = 0): string => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  date.setDate(date.getDate() + extraDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

const dobError = (dob: string) => validateField('dob', { ...INITIAL_REGISTRATION_VALUES, dob })

describe('BUG-CP-006: date of birth age range (18 to 120)', () => {
  it('rejects implausible and under-age birth dates', () => {
    expect(dobError('01-01-1900')).toMatch(/120 years/)
    expect(dobError(dobYearsAgo(121))).toMatch(/120 years/)
    expect(dobError(dobYearsAgo(17))).toMatch(/at least 18/)
    expect(dobError(dobYearsAgo(18, 1))).toMatch(/at least 18/)
  })

  it('accepts ages on the boundaries', () => {
    expect(dobError(dobYearsAgo(18))).toBeUndefined()
    expect(dobError(dobYearsAgo(35))).toBeUndefined()
    expect(dobError(dobYearsAgo(121, 1))).toBeUndefined()
  })
})

describe('BUG-CP-007: individual PAN rules', () => {
  it('requires P as the 4th character for individuals', () => {
    expect(validateIndividualPan('ABCPE1234F')).toBeNull()
    expect(validateIndividualPan('AAACT1234A')).toMatch(/individual PAN/)
    expect(validateField('pan', { ...INITIAL_REGISTRATION_VALUES, pan: 'AAACT1234A' })).toMatch(/individual PAN/)
  })

  it('rejects PANs whose 4th character is not a valid holder type', () => {
    expect(validatePan('ABCDE1234F')).toMatch(/4th character/)
    expect(validatePan('AAACT1234A')).toBeNull()
  })
})

describe('BUG-CP-008: Aadhaar format and Verhoeff checksum', () => {
  it('accepts valid Aadhaar numbers', () => {
    expect(validateAadhaar('234567890124')).toBeNull()
    expect(validateAadhaar('4918 2736 4507')).toBeNull()
  })

  it('rejects numbers starting with 0 or 1', () => {
    expect(validateAadhaar('034567890124')).toMatch(/cannot start with 0 or 1/)
    expect(validateAadhaar('134567890124')).toMatch(/cannot start with 0 or 1/)
  })

  it('rejects a wrong check digit and wrong length', () => {
    expect(isValidVerhoeff('234567890125')).toBe(false)
    expect(validateAadhaar('234567890125')).toMatch(/check digit/)
    expect(validateAadhaar('23456789012')).toMatch(/12-digit/)
  })
})

const GENDERS = ['Male', 'Female', 'Other'] as const

const ControlledSelect = ({ onChange }: { onChange: (value: string) => void }) => {
  const [value, setValue] = useState('')
  return (
    <>
      <label htmlFor="reg-gender">Gender</label>
      <RegistrationSelect
        id="reg-gender"
        name="gender"
        value={value}
        placeholder="Select Gender"
        options={GENDERS}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
      />
    </>
  )
}

describe('BUG-CP-009: dropdown keyboard accessibility', () => {
  it('opens with ArrowDown, moves with arrows and selects with Enter', () => {
    const onChange = vi.fn()
    render(<ControlledSelect onChange={onChange} />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-activedescendant', 'reg-gender-option-0')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('Female')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('is reachable from its label, supports type-ahead and closes with Escape', () => {
    const onChange = vi.fn()
    render(<ControlledSelect onChange={onChange} />)
    expect(screen.getByLabelText('Gender')).toBe(screen.getByRole('combobox'))

    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'o' })
    expect(trigger).toHaveAttribute('aria-activedescendant', 'reg-gender-option-2')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('BUG-CP-010: Terms of Service feedback', () => {
  it('shows an inline error linked to the checkbox', () => {
    render(
      <RegistrationSecurityFields
        values={{ password: '', confirmPassword: '', agreeTerms: false }}
        errors={{ agreeTerms: 'You must agree to the Terms of Service to continue' }}
        isFormValid={false}
        isSubmitting={false}
        onChange={() => undefined}
        onToggleTerms={() => undefined}
      />,
    )
    const checkbox = screen.getByRole('checkbox')
    expect(screen.getByRole('alert')).toHaveTextContent('You must agree to the Terms of Service to continue')
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveAttribute('aria-describedby', 'reg-agreeTerms-error')
  })
})
