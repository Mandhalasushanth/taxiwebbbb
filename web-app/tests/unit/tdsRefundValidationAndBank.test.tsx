// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { TdsRefundCustomerIncome } from '../../src/modules/itr/components/TdsRefund/TdsRefundCustomerIncome/TdsRefundCustomerIncome'
import {
  sanitizeBusinessLegalName,
  validateBusinessLegalName,
  validateBusinessPan,
  validateIfscCode,
} from '../../src/modules/itr/components/TdsRefund/TdsRefundCustomerIncome/tdsBusinessValidation'

describe('TDS Refund - Business Details & Bank Validation Suite', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Pure Business & Bank Validators', () => {
    it('sanitizes Legal Name of Business: strips leading spaces, collapses multiple spaces, and disallows continuous or invalid special characters', () => {
      // From user screenshot: esdrft      dfghjk     @#$%$%^&*...
      expect(
        sanitizeBusinessLegalName('esdrft       dfghjk     @#$%$%^&*&^%$#$%$%^&*(*&^%%$#%^&').trim()
      ).toBe('esdrft dfghjk')

      // Continuous dots (.. or ... or . .)
      expect(sanitizeBusinessLegalName('Acme.....Solutions')).toBe('Acme.Solutions')
      expect(sanitizeBusinessLegalName('Acme . . Solutions')).toBe('Acme. Solutions')

      // Leading dots and leading spaces
      expect(sanitizeBusinessLegalName('...Acme Enterprises Ltd')).toBe('Acme Enterprises Ltd')
      expect(sanitizeBusinessLegalName('   esdrft             dfghjk')).toBe('esdrft dfghjk')

      // Only allows required characters: letters, numbers, spaces, and . (dot)
      expect(sanitizeBusinessLegalName('Tata Sons Pvt. Ltd.')).toBe('Tata Sons Pvt. Ltd.')
      expect(sanitizeBusinessLegalName('99acres India Pvt. Ltd.')).toBe('99acres India Pvt. Ltd.')
    })

    it('validates Legal Name of Business: requires min 3 chars, letters, and rejects consecutive dots', () => {
      expect(validateBusinessLegalName('')).toBe('Legal name of business is required')
      expect(validateBusinessLegalName('   ')).toBe('Legal name of business is required')
      expect(validateBusinessLegalName('AB')).toBe('Enter the legal name exactly as on the PAN (min 3 characters)')
      expect(validateBusinessLegalName('12345')).toBe('Legal name of business must contain letters')
      expect(validateBusinessLegalName('Acme..Solutions')).toBe(
        'Legal name of business should not contain consecutive dots'
      )
      expect(validateBusinessLegalName('Acme @#$ Solutions')).toBe(
        'Only letters, numbers, spaces, and dot are allowed'
      )
      expect(validateBusinessLegalName('Acme Solutions Pvt Ltd')).toBeNull()
      expect(validateBusinessLegalName('Acme Solutions Pvt. Ltd.')).toBeNull()
    })

    it('validates Business PAN: rejects invalid format and verifies 10 characters', () => {
      expect(validateBusinessPan('')).toBe('Business PAN is required')
      expect(validateBusinessPan('ABCDE')).toBe('Business PAN must be 10 characters')
      // All letters: GHJHBHJNHB from user image
      expect(validateBusinessPan('GHJHBHJNHB')).toBe('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)')
      // Valid Business PAN: GHJHG6566B from user image
      expect(validateBusinessPan('GHJHG6566B')).toBeNull()
      // Invalid 4th character entity
      expect(validateBusinessPan('ABCZE1234F')).toBe(
        'The 4th character of PAN must represent a valid entity type (A, B, C, F, G, H, J, L, P, or T).'
      )
    })

    it('validates IFSC Code: enforces 11 characters and 5th character as 0', () => {
      expect(validateIfscCode('')).toBe('IFSC code is required')
      expect(validateIfscCode('SBIN')).toBe('IFSC code must be exactly 11 characters')
      // 5th character not 0 (HJYTRAQWERT from user screenshot)
      expect(validateIfscCode('HJYTRAQWERT')).toBe('5th character of IFSC must be 0 (e.g. SBIN0001234)')
      // Valid IFSC code (SRTG0000001 from user screenshot)
      expect(validateIfscCode('SRTG0000001')).toBeNull()
      expect(validateIfscCode('SBIN0000123')).toBeNull()
    })
  })

  describe('TdsRefundCustomerIncome UI Behavior', () => {
    const defaultProps = {
      onBack: vi.fn(),
      onNext: vi.fn(),
    }

    it('does NOT render Account Type section (Savings / Current pills)', () => {
      render(<TdsRefundCustomerIncome {...defaultProps} />)
      expect(screen.queryByText('Account Type')).toBeNull()
      expect(screen.queryByText('Savings Account')).toBeNull()
      expect(screen.queryByText('Current Account')).toBeNull()
    })

    it('shows error warning on blur for Business PAN and clears live when corrected', () => {
      render(<TdsRefundCustomerIncome {...defaultProps} />)
      const panInput = screen.getByPlaceholderText(/Enter Business PAN/i)

      // Enter invalid PAN (all letters like user image) and blur
      act(() => {
        fireEvent.change(panInput, { target: { value: 'GHJHBHJNHB' } })
        fireEvent.blur(panInput)
      })

      // Error appears immediately on blur without clicking Continue
      expect(screen.getByText(/Please enter a valid 10-character PAN number/i)).toBeDefined()

      // Type valid PAN (GHJHG6566B) -> clears live while typing
      act(() => {
        fireEvent.change(panInput, { target: { value: 'GHJHG6566B' } })
      })
      expect(screen.queryByText(/Please enter a valid 10-character PAN number/i)).toBeNull()
    })

    it('shows error warning on blur for Legal Name of Business and sanitizes spaces & special characters on type', () => {
      render(<TdsRefundCustomerIncome {...defaultProps} />)
      const nameInput = screen.getByPlaceholderText(/Enter legal name of business/i) as HTMLInputElement

      // From user screenshot: type with multiple spaces and long string of junk special characters
      act(() => {
        fireEvent.change(nameInput, {
          target: { value: 'esdrft       dfghjk     @#$%$%^&*&^%$#$%$%^&*(*&^%%$#%^&' },
        })
      })

      // Input value is sanitized immediately: junk special characters stripped, spaces collapsed to 1
      expect(nameInput.value.trim()).toBe('esdrft dfghjk')

      // Blur trims trailing space
      act(() => {
        fireEvent.blur(nameInput)
      })
      expect(nameInput.value).toBe('esdrft dfghjk')

      // Type continuous dots or hyphens: 'Acme...--..Solutions'
      act(() => {
        fireEvent.change(nameInput, { target: { value: 'Acme...--..Solutions' } })
      })
      expect(nameInput.value).toBe('Acme.Solutions')

      // Clear input and blur -> error shows on blur
      act(() => {
        fireEvent.change(nameInput, { target: { value: '' } })
        fireEvent.blur(nameInput)
      })
      expect(screen.getByText('Legal name of business is required')).toBeDefined()
    })

    it('validates IFSC code live and does NOT auto-fetch bank name or show verified pill', async () => {
      render(<TdsRefundCustomerIncome {...defaultProps} />)
      const ifscInput = screen.getByPlaceholderText(/Enter your IFSC code/i)

      // Type invalid IFSC where 5th char is 'R' (HJYTRAQWERT)
      act(() => {
        fireEvent.change(ifscInput, { target: { value: 'HJYTRAQWERT' } })
      })

      // Shows error live because 11 chars reached
      expect(screen.getByText(/5th character of IFSC must be 0/i)).toBeDefined()

      // Bank name and branch are NOT auto-fetched
      const bankNameInput = screen.getByPlaceholderText(/Enter your bank name/i) as HTMLInputElement
      expect(bankNameInput.value).toBe('')

      // Type valid IFSC (SRTG0000001)
      act(() => {
        fireEvent.change(ifscInput, { target: { value: 'SRTG0000001' } })
      })
      expect(screen.queryByText(/5th character of IFSC must be 0/i)).toBeNull()

      // Verified pill is NOT rendered
      expect(screen.queryByTestId('tds-bank-verified-pill')).toBeNull()
    })
  })
})
