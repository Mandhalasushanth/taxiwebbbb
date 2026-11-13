import React, { useEffect, useRef, useState } from 'react'
import { CaretInput } from '@shared/components'
import {
  UsersIcon,
  IdCardIcon,
  DocumentIcon,
} from '../RegistrationIcons/RegistrationIcons'
import { AadhaarOtpCard } from './AadhaarOtpCard'
import { AadhaarVerifiedModal } from './AadhaarVerifiedModal'
import './RegistrationIdentityFields.css'

export interface RegistrationIdentityValues {
  fatherSpouseName: string
  pan: string
  aadhaar: string
  mobile: string
  isAadhaarVerified?: boolean
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
  isAadhaarVerified?: boolean
  onAadhaarVerifiedChange?: (verified: boolean) => void
  onClearAadhaarError?: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const GreenCheckCircleIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="10" fill="#10B981" />
    <path
      d="M6 10.2L8.7 13L14.2 7.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ShieldCheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = '#ea580c',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const RegistrationIdentityFields: React.FC<RegistrationIdentityFieldsProps> = ({
  values,
  errors,
  isMobileVerified: _isMobileVerified,
  isAadhaarVerified: propIsAadhaarVerified,
  onAadhaarVerifiedChange,
  onClearAadhaarError,
  onChange,
  onBlur,
}) => {
  const isAadhaarVerified = Boolean(
    propIsAadhaarVerified ?? values.isAadhaarVerified
  )

  const [otpSent, setOtpSent] = useState(false)
  const [showOtpSection, setShowOtpSection] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(50)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Check valid PAN format: 10 chars (3 letters, 1 category [ABCFGHJLPT], 1 letter, 4 numbers, 1 letter) without errors
  const panUpper = (values.pan || '').trim().toUpperCase()
  const isPanValid = Boolean(
    panUpper.length === 10 &&
      !errors.pan &&
      /^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/.test(panUpper)
  )

  // Check valid Aadhaar for sending OTP: 12 digits, doesn't start with 0 or 1, not all identical
  const cleanAadhaar = (values.aadhaar || '').replace(/\D/g, '')
  const isAadhaarValid = Boolean(
    cleanAadhaar.length === 12 &&
      /^[2-9]\d{11}$/.test(cleanAadhaar) &&
      !/^(\d)\1{11}$/.test(cleanAadhaar)
  )

  // Timer countdown when OTP section is open
  useEffect(() => {
    if (showOtpSection && !isAadhaarVerified && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showOtpSection, isAadhaarVerified, resendTimer])

  const handleSendOtp = () => {
    if (!isAadhaarValid) return
    setOtpSent(true)
    setShowOtpSection(true)
    setResendTimer(50)
    setOtp(['', '', '', '', '', ''])
    onClearAadhaarError?.()
    setTimeout(() => {
      otpInputRefs.current[0]?.focus()
    }, 50)
  }

  const handleResendOtp = () => {
    setOtpSent(true)
    setResendTimer(50)
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => {
      otpInputRefs.current[0]?.focus()
    }, 50)
  }

  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || ''
    }
    setOtp(newOtp)
    const nextIdx = Math.min(pasted.length, 5)
    otpInputRefs.current[nextIdx]?.focus()
  }

  const handleVerifyOtp = () => {
    const code = otp.join('')
    if (code.length !== 6) return
    // Show verified modal
    setShowSuccessModal(true)
  }

  const handleConfirmVerifiedModal = () => {
    setShowSuccessModal(false)
    setShowOtpSection(false)
    onAadhaarVerifiedChange?.(true)
  }

  const handleChangeAadhaar = () => {
    if (isAadhaarVerified) return
    onAadhaarVerifiedChange?.(false)
    setOtpSent(false)
    setShowOtpSection(false)
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => {
      const el = document.getElementById('reg-aadhaar')
      el?.focus()
    }, 50)
  }

  const handleAadhaarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAadhaarVerified) return
    if (otpSent) {
      setOtpSent(false)
      setShowOtpSection(false)
    }
    onChange(e)
  }

  return (
    <div className="reg-identity-fields">
      {/* Father's / Spouse Name */}
      <div className="reg-field">
        <label className="reg-field__label" htmlFor="reg-fatherSpouseName">
          Father's / Spouse Name <span className="reg-field__required">*</span>
        </label>
        <div
          className={`reg-field__control ${
            errors.fatherSpouseName ? 'reg-field__control--error' : ''
          }`}
        >
          <span className="reg-field__icon">
            <UsersIcon />
          </span>
          <CaretInput
            id="reg-fatherSpouseName"
            name="fatherSpouseName"
            type="text"
            className="reg-field__input"
            placeholder="Father's / Spouse Name"
            value={values.fatherSpouseName}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
        {errors.fatherSpouseName && (
          <p className="reg-field__error">{errors.fatherSpouseName}</p>
        )}
      </div>

      {/* Row: PAN Number & Aadhaar Number */}
      <div className="reg-identity-fields__row">
        {/* PAN Number Field */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-pan">
            PAN Number <span className="reg-field__required">*</span>
          </label>
          <div
            className={`reg-field__control ${
              errors.pan ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <IdCardIcon />
            </span>
            <CaretInput
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
            {isPanValid && (
              <span
                className="reg-field__valid-tick"
                data-testid="pan-valid-tick"
                aria-label="PAN Validated"
              >
                <GreenCheckCircleIcon size={20} />
              </span>
            )}
          </div>
          {errors.pan && <p className="reg-field__error">{errors.pan}</p>}
        </div>

        {/* Aadhaar Number Field */}
        <div className="reg-field">
          <label className="reg-field__label" htmlFor="reg-aadhaar">
            Aadhaar Number <span className="reg-field__required">*</span>
          </label>
          <div
            className={`reg-field__control ${
              errors.aadhaar ? 'reg-field__control--error' : ''
            }`}
          >
            <span className="reg-field__icon">
              <DocumentIcon />
            </span>
            <CaretInput
              id="reg-aadhaar"
              name="aadhaar"
              type="text"
              inputMode="numeric"
              className="reg-field__input"
              placeholder="Aadhaar Number"
              maxLength={12}
              value={values.aadhaar}
              onChange={handleAadhaarInputChange}
              onBlur={onBlur}
              readOnly={isAadhaarVerified}
            />
            {isAadhaarVerified ? (
              <div
                className="reg-aadhaar__verified-pill"
                data-testid="aadhaar-verified-pill"
              >
                <GreenCheckCircleIcon size={14} />
                <span>Verified</span>
              </div>
            ) : (
              <button
                type="button"
                className={`reg-aadhaar__otp-btn ${
                  isAadhaarValid
                    ? 'reg-aadhaar__otp-btn--active'
                    : 'reg-aadhaar__otp-btn--disabled'
                }`}
                disabled={!isAadhaarValid}
                onClick={handleSendOtp}
                data-testid="send-aadhaar-otp-btn"
              >
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            )}
          </div>

          {/* Red error below the Aadhaar field */}
          {errors.aadhaar && (
            <p className="reg-field__error" data-testid="aadhaar-field-error">
              {errors.aadhaar}
            </p>
          )}

          {/* Green verified confirmation banner */}
          {isAadhaarVerified && (
            <div
              className="reg-aadhaar__success-banner"
              data-testid="aadhaar-success-banner"
            >
              <div className="reg-aadhaar__success-left">
                <GreenCheckCircleIcon size={18} />
                <span className="reg-aadhaar__success-text">
                  Aadhaar verified successfully
                </span>
              </div>
              {/* BUG_GST_WB_004: Hide Change button after successful verification */}
              {!isAadhaarVerified && (
                <button
                  type="button"
                  className="reg-aadhaar__change-btn"
                  onClick={handleChangeAadhaar}
                  data-testid="change-aadhaar-btn"
                >
                  Change
                </button>
              )}
            </div>
          )}

          {/* Verify Aadhaar OTP Section */}
          {showOtpSection && !isAadhaarVerified && (
            <AadhaarOtpCard
              otp={otp}
              otpInputRefs={otpInputRefs}
              resendTimer={resendTimer}
              onOtpDigitChange={handleOtpDigitChange}
              onOtpKeyDown={handleOtpKeyDown}
              onOtpPaste={handleOtpPaste}
              onResendOtp={handleResendOtp}
              onVerifyOtp={handleVerifyOtp}
              ShieldIcon={ShieldCheckIcon}
            />
          )}
        </div>
      </div>

      <input
        id="reg-mobile"
        name="mobile"
        type="hidden"
        value={values.mobile}
      />

      {/* Aadhaar Verified Popup Modal */}
      <AadhaarVerifiedModal
        isOpen={showSuccessModal}
        onConfirm={handleConfirmVerifiedModal}
      />
    </div>
  )
}
