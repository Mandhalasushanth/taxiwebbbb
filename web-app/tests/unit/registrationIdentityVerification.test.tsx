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

    // Below field: Green success banner + Change button
    expect(screen.getByTestId('aadhaar-success-banner')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar verified successfully')).toBeInTheDocument()
    expect(screen.getByTestId('change-aadhaar-btn')).toBeInTheDocument()
  })

  it('allows clicking Change to clear verified status and re-edit Aadhaar number', () => {
    render(<ControlledIdentityFields initialAadhaar="989989899892" initialVerified={true} />)

    expect(screen.getByTestId('aadhaar-verified-pill')).toBeInTheDocument()
    expect(screen.getByTestId('aadhaar-success-banner')).toBeInTheDocument()

    const changeBtn = screen.getByTestId('change-aadhaar-btn')
    fireEvent.click(changeBtn)

    // Verified tag and banner disappear
    expect(screen.queryByTestId('aadhaar-verified-pill')).not.toBeInTheDocument()
    expect(screen.queryByTestId('aadhaar-success-banner')).not.toBeInTheDocument()

    // Aadhaar input is no longer readOnly
    const aadhaarInput = screen.getByPlaceholderText('Aadhaar Number')
    expect(aadhaarInput).not.toHaveAttribute('readonly')

    // Send OTP button is back
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
