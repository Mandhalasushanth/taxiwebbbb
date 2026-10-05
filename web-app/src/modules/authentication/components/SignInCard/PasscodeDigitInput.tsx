import React, { useEffect, useRef } from 'react'
import './PasscodeDigitInput.css'

export interface PasscodeDigitInputProps {
  value: string
  onChange: (value: string) => void
  length: number
  label: string
  masked?: boolean
  hasError?: boolean
  autoFocus?: boolean
}

const onlyDigits = (val: string): string => val.replace(/\D/g, '')

/** Row of single-digit boxes for OTP / passcode entry with paste and backspace support. */
export const PasscodeDigitInput: React.FC<PasscodeDigitInputProps> = ({
  value,
  onChange,
  length,
  label,
  masked = true,
  hasError = false,
  autoFocus = false,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  const focusBox = (index: number) => inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus()

  const handleDigitChange = (index: number, raw: string) => {
    const digit = onlyDigits(raw).slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d)).join('')
    onChange(next)
    if (digit) focusBox(index + 1)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return
    if (!digits[index] && index > 0) {
      focusBox(index - 1)
      return
    }
    onChange(digits.map((d, i) => (i === index ? '' : d)).join(''))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pasted = onlyDigits(e.clipboardData.getData('text')).slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusBox(pasted.length)
  }

  const boxClassName = (digit: string) =>
    [
      'passcode-digit-input__box',
      hasError ? 'passcode-digit-input__box--error' : '',
      digit ? 'passcode-digit-input__box--filled' : '',
    ].filter(Boolean).join(' ')

  return (
    <div className="passcode-digit-input" onPaste={handlePaste} role="group" aria-label={label}>
      {digits.map((digit, idx) => (
        <input
          key={`${label}-${idx}`}
          ref={(el) => {
            inputRefs.current[idx] = el
          }}
          type={masked ? 'password' : 'text'}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className={boxClassName(digit)}
          value={digit}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          autoComplete="off"
          aria-label={`${label} digit ${idx + 1} of ${length}`}
        />
      ))}
    </div>
  )
}

export default PasscodeDigitInput
