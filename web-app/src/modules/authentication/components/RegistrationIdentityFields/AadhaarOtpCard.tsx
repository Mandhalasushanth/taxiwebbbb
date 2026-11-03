import React from 'react'

export interface AadhaarOtpCardProps {
  otp: string[]
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  resendTimer: number
  onOtpDigitChange: (index: number, val: string) => void
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  onResendOtp: () => void
  onVerifyOtp: () => void
  ShieldIcon: React.FC<{ size?: number; color?: string }>
}

export const AadhaarOtpCard: React.FC<AadhaarOtpCardProps> = ({
  otp,
  otpInputRefs,
  resendTimer,
  onOtpDigitChange,
  onOtpKeyDown,
  onOtpPaste,
  onResendOtp,
  onVerifyOtp,
  ShieldIcon,
}) => {
  return (
    <div
      className="reg-aadhaar-otp-card"
      role="region"
      aria-label="Verify Aadhaar OTP"
      data-testid="verify-aadhaar-otp-section"
    >
      <div className="reg-aadhaar-otp__header">
        <div className="reg-aadhaar-otp__title-group">
          <ShieldIcon size={18} color="#ea580c" />
          <span>Verify Aadhaar OTP</span>
        </div>
        <span className="reg-aadhaar-otp__mock-badge">Mock: 123456</span>
      </div>

      <p className="reg-aadhaar-otp__subtitle">
        Enter the 6-digit verification code sent for Aadhaar authentication.
      </p>

      <div className="reg-aadhaar-otp__inputs-row">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              otpInputRefs.current[idx] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className="reg-aadhaar-otp__input-box"
            value={digit}
            onChange={(e) => onOtpDigitChange(idx, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(idx, e)}
            onPaste={idx === 0 ? onOtpPaste : undefined}
            aria-label={`Digit ${idx + 1}`}
            data-testid={`aadhaar-otp-box-${idx}`}
          />
        ))}
      </div>

      <div className="reg-aadhaar-otp__timer-row">
        {resendTimer > 0 ? (
          <>
            <span>Resend OTP in </span>
            <span className="reg-aadhaar-otp__timer-val">
              00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
            </span>
          </>
        ) : (
          <button
            type="button"
            className="reg-aadhaar-otp__resend-btn"
            onClick={onResendOtp}
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="button"
        className={`reg-aadhaar-otp__verify-btn ${
          otp.join('').length === 6
            ? 'reg-aadhaar-otp__verify-btn--active'
            : 'reg-aadhaar-otp__verify-btn--disabled'
        }`}
        disabled={otp.join('').length !== 6}
        onClick={onVerifyOtp}
        data-testid="verify-aadhaar-otp-btn"
      >
        Verify OTP
      </button>
    </div>
  )
}

