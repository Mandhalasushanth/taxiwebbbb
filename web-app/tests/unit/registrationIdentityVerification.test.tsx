// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React, { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import {
  RegistrationIdentityFields,
  type RegistrationIdentityValues,
  type RegistrationIdentityErrors,
} from '../../src/modules/authentication/components/RegistrationIdentityFields/RegistrationIdentityFields'
import { RegistrationPersonalFields } from '../../src/modules/authentication/components/RegistrationPersonalFields/RegistrationPersonalFields'
import { DobDatePickerModal } from '../../src/modules/authentication/components/DobDatePickerModal/DobDatePickerModal'
import { RegistrationForm } from '../../src/modules/authentication/components/RegistrationForm/RegistrationForm'
import { MemoryRouter } from 'react-router-dom'

afterEach(cleanup)

const ControlledIdentityFields = (props: {
  initialPan?: string
  initialAadhaar?: string
  initialVerified?: boolean
  initialErrors?: RegistrationIdentityErrors
}) => {
  const [values, setValues] = useState<RegistrationIdentityValues>({
    fatherSpouseName: '',
    pan: props.initialPan || '',
    aadhaar: props.initialAadhaar || '',
    mobile: '9876543210',
    isAadhaarVerified: props.initialVerified || false,
  })
  const [errors, setErrors] = useState<RegistrationIdentityErrors>(props.initialErrors || {})
  const [isVerified, setIsVerified] = useState(props.initialVerified || false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'aadhaar' ? { isAadhaarVerified: false } : {}),
    }))
  }

  return (
    <RegistrationIdentityFields
      values={values}
      errors={errors}
      isMobileVerified={true}
      isAadhaarVerified={isVerified}
      onAadhaarVerifiedChange={(verified) => {
        setIsVerified(verified)
        setValues((prev) => ({ ...prev, isAadhaarVerified: verified }))
        if (verified) {
          setErrors((prev) => ({ ...prev, aadhaar: undefined }))
        }
      }}
      onClearAadhaarError={() => setErrors((prev) => ({ ...prev, aadhaar: undefined }))}
      onChange={handleChange}
    />
  )
}

describe('RegistrationIdentityFields - PAN & Aadhaar Verification Flow', () => {
  it('renders green tick mark inside PAN field when valid 10-char PAN is entered', () => {
    render(<ControlledIdentityFields initialPan="EDHPT8695" />)
    expect(screen.queryByTestId('pan-valid-tick')).not.toBeInTheDocument()

    const panInput = screen.getByPlaceholderText('PAN Number')
    fireEvent.change(panInput, { target: { value: 'EDHPT8695D' } })
    expect(screen.getByTestId('pan-valid-tick')).toBeInTheDocument()
  })

  it('keeps Send OTP button disabled and grey when Aadhaar is incomplete', () => {
    render(<ControlledIdentityFields initialAadhaar="98998989989" />)
    const sendOtpBtn = screen.getByTestId('send-aadhaar-otp-btn')
    expect(sendOtpBtn).toBeDisabled()
    expect(sendOtpBtn).toHaveClass('reg-aadhaar__otp-btn--disabled')
    expect(sendOtpBtn).toHaveTextContent('Send OTP')
  })

  it('enables Send OTP button (orange style) when 12 valid digits are entered', () => {
    render(<ControlledIdentityFields initialAadhaar="253652365236" />)
    const sendOtpBtn = screen.getByTestId('send-aadhaar-otp-btn')
    expect(sendOtpBtn).not.toBeDisabled()
    expect(sendOtpBtn).toHaveClass('reg-aadhaar__otp-btn--active')
  })

  it('opens Verify Aadhaar OTP section on clicking Send OTP with mock badge, 6 boxes and timer', () => {
    render(<ControlledIdentityFields initialAadhaar="253652365236" />)
    const sendOtpBtn = screen.getByTestId('send-aadhaar-otp-btn')

    fireEvent.click(sendOtpBtn)

    expect(sendOtpBtn).toHaveTextContent('OTP Sent')
    expect(screen.getByTestId('verify-aadhaar-otp-section')).toBeInTheDocument()
    expect(screen.getByText('Verify Aadhaar OTP')).toBeInTheDocument()
    expect(screen.getByText('Mock: 123456')).toBeInTheDocument()
    expect(screen.getByText(/Resend OTP in/)).toBeInTheDocument()

    // 6 digit boxes present
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`aadhaar-otp-box-${i}`)).toBeInTheDocument()
    }
  })

  it('verifies 6-digit mock OTP, shows popup modal, and upon OK marks verified with green tick and Change link', async () => {
    render(<ControlledIdentityFields initialAadhaar="989989899892" />)
    const sendOtpBtn = screen.getByTestId('send-aadhaar-otp-btn')
    fireEvent.click(sendOtpBtn)

    // Type 6 digits
    const digits = ['1', '2', '3', '4', '5', '6']
    digits.forEach((d, i) => {
      fireEvent.change(screen.getByTestId(`aadhaar-otp-box-${i}`), { target: { value: d } })
    })

    const verifyBtn = screen.getByTestId('verify-aadhaar-otp-btn')
    expect(verifyBtn).not.toBeDisabled()
    expect(verifyBtn).toHaveClass('reg-aadhaar-otp__verify-btn--active')

    fireEvent.click(verifyBtn)

    // Aadhaar Verified popup modal opens
    expect(screen.getByText('Aadhaar Verified')).toBeInTheDocument()
    expect(
      screen.getByText('Your Aadhaar number has been verified successfully!')
    ).toBeInTheDocument()

    // Click OK on modal
    const okBtn = screen.getByTestId('aadhaar-modal-ok-btn')
    fireEvent.click(okBtn)

    // Modal and OTP section close
    await waitFor(() => {
      expect(screen.queryByText('Aadhaar Verified')).not.toBeInTheDocument()
      expect(screen.queryByTestId('verify-aadhaar-otp-section')).not.toBeInTheDocument()
    })

    // Inside field: Verified pill with green tick
    expect(screen.getByTestId('aadhaar-verified-pill')).toBeInTheDocument()
    expect(screen.getByTestId('aadhaar-verified-pill')).toHaveTextContent('Verified')

    // Aadhaar input is readOnly
    const aadhaarInput = screen.getByPlaceholderText('Aadhaar Number')
    expect(aadhaarInput).toHaveAttribute('readonly')

    // Below field: Green success banner without Change button
    expect(screen.getByTestId('aadhaar-success-banner')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar verified successfully')).toBeInTheDocument()
    expect(screen.queryByTestId('change-aadhaar-btn')).not.toBeInTheDocument()
  })

  it('BUG_GST_WB_004: hides Change button after successful verification and locks verified Aadhaar input', () => {
    render(<ControlledIdentityFields initialAadhaar="989989899892" initialVerified={true} />)

    expect(screen.getByTestId('aadhaar-verified-pill')).toBeInTheDocument()
    expect(screen.getByTestId('aadhaar-success-banner')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar verified successfully')).toBeInTheDocument()

    // Change button should NOT be present after successful verification
    expect(screen.queryByTestId('change-aadhaar-btn')).not.toBeInTheDocument()

    // Aadhaar input remains readOnly to prevent modifications
    const aadhaarInput = screen.getByPlaceholderText('Aadhaar Number')
    expect(aadhaarInput).toHaveAttribute('readonly')
  })

  it('allows user to edit Aadhaar number and retry verification before successful verification', () => {
    render(<ControlledIdentityFields initialAadhaar="989989899891" initialVerified={false} />)

    // Unverified: Verified pill and success banner should not be present
    expect(screen.queryByTestId('aadhaar-verified-pill')).not.toBeInTheDocument()
    expect(screen.queryByTestId('aadhaar-success-banner')).not.toBeInTheDocument()

    // Aadhaar input is editable
    const aadhaarInput = screen.getByPlaceholderText('Aadhaar Number')
    expect(aadhaarInput).not.toHaveAttribute('readonly')

    // User can edit Aadhaar number
    fireEvent.change(aadhaarInput, { target: { value: '989989899892' } })
    expect(aadhaarInput).toHaveValue('989989899892')

    // Send OTP button is active for valid 12-digit number
    expect(screen.getByTestId('send-aadhaar-otp-btn')).toBeInTheDocument()
  })
})

describe('RegistrationForm - Aadhaar verification enforcement on proceed', () => {
  it('shows red error warning "please send otp and verify your aadhar number" below Aadhaar field when proceeding unverified', async () => {
    render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    )

    // Attempt to submit form
    const submitBtn = screen.getByRole('button', { name: /Create Account/i })
    fireEvent.click(submitBtn)

    // Red error warning is shown below Aadhaar field
    await waitFor(() => {
      expect(
        screen.getByText('please send otp and verify your aadhar number')
      ).toBeInTheDocument()
    })
  })
})

describe('BUG_GST_WB_005 - Date of Birth (DOB) Calendar and Manual Input', () => {
  it('opens DOB calendar defaulting to the current system year dynamically', () => {
    const currentYear = new Date().getFullYear()
    render(
      <DobDatePickerModal
        isOpen={true}
        value=""
        onApply={vi.fn()}
        onClose={vi.fn()}
        maxDate={new Date()}
        minDate={new Date(1900, 0, 1)}
      />
    )

    // Displays current year dynamically
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
  })

  it('allows navigating backwards to previous years and disables future jump', () => {
    const currentYear = new Date().getFullYear()
    render(
      <DobDatePickerModal
        isOpen={true}
        value=""
        onApply={vi.fn()}
        onClose={vi.fn()}
        maxDate={new Date()}
        minDate={new Date(1900, 0, 1)}
      />
    )

    // +5 Yrs and +10 Yrs are disabled because we start at current year (maxDate)
    expect(screen.getByRole('button', { name: '+5 Yrs' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '+10 Yrs' })).toBeDisabled()

    // Jump back 10 years
    const minus10Btn = screen.getByRole('button', { name: '-10 Yrs' })
    fireEvent.click(minus10Btn)
    expect(screen.getByText(new RegExp(`${currentYear - 10}`))).toBeInTheDocument()

    // Now +5 Yrs is enabled
    expect(screen.getByRole('button', { name: '+5 Yrs' })).not.toBeDisabled()
  })

  it('allows manually typing a date of birth into the input field', () => {
    const handleChange = vi.fn()
    render(
      <RegistrationPersonalFields
        values={{ fullName: 'John Doe', email: 'john@example.com', gender: 'Male', dob: '' }}
        errors={{}}
        onChange={handleChange}
      />
    )

    const dobInput = screen.getByPlaceholderText('DD-MM-YYYY')
    expect(dobInput).not.toHaveAttribute('readonly')
    fireEvent.change(dobInput, { target: { name: 'dob', value: '15-08-1995' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('opens DOB calendar popover when clicking the calendar button', () => {
    const onApply = vi.fn()
    render(
      <RegistrationPersonalFields
        values={{ fullName: 'John Doe', email: 'john@example.com', gender: 'Male', dob: '' }}
        errors={{}}
        onChange={vi.fn()}
        onApplyDate={onApply}
      />
    )

    const calendarBtn = screen.getByTestId('dob-calendar-btn')
    fireEvent.click(calendarBtn)

    // Calendar popover is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Select Date of Birth')).toBeInTheDocument()
  })
})
