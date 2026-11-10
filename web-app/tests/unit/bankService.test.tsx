// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import {
  lookupSampleBankByIfsc,
  fetchBankDetailsByIfsc,
} from '@shared/services/bankService'
import { GSTBankDetails } from '../../src/modules/gst/components/GSTRegistration/GSTBankDetails/GSTBankDetails'

afterEach(() => {
  cleanup()
})

describe('bankService - IFSC Auto-Fetch', () => {
  it('correctly resolves known sample IFSC for HDFC Bank', () => {
    const result = lookupSampleBankByIfsc('HDFC0000412')
    expect(result).not.toBeNull()
    expect(result?.bankName).toBe('HDFC Bank')
    expect(result?.branch).toBe('Fort Branch - Mumbai')
    expect(result?.source).toBe('sample-dataset')
  })

  it('correctly resolves known sample IFSC for SBI Bank', () => {
    const result = lookupSampleBankByIfsc('SBIN0000412')
    expect(result).not.toBeNull()
    expect(result?.bankName).toBe('State Bank of India')
    expect(result?.branch).toBe('Commercial Branch - MG Road')
  })

  it('dynamically generates realistic sample branch for any valid code', () => {
    const result = lookupSampleBankByIfsc('ICIC0009999')
    expect(result).not.toBeNull()
    expect(result?.bankName).toBe('ICICI Bank')
    expect(result?.branch).toBeTruthy()
    expect(result?.source).toBe('sample-generated')
  })

  it('returns null for short/incomplete IFSC codes (< 4 chars)', () => {
    expect(lookupSampleBankByIfsc('HDF')).toBeNull()
    expect(lookupSampleBankByIfsc('')).toBeNull()
  })

  it('returns null for invalid IFSC codes where 5th char is not 0 (e.g. HJYTRAQWERT)', () => {
    expect(lookupSampleBankByIfsc('HJYTRAQWERT')).toBeNull()
    expect(lookupSampleBankByIfsc('SBIN1001234')).toBeNull()
    expect(lookupSampleBankByIfsc('12340001234')).toBeNull()
  })

  it('fetchBankDetailsByIfsc resolves asynchronously', async () => {
    const result = await fetchBankDetailsByIfsc('HDFC0000412')
    expect(result).not.toBeNull()
    expect(result?.bankName).toBe('HDFC Bank')
  })
})

describe('GSTBankDetails Component - Manual Bank Details Input', () => {
  it('does NOT auto-fetch bankName and branch when user enters IFSC code', () => {
    const handleChange = vi.fn()
    const handleClearError = vi.fn()

    const initialData = {
      accountHolderName: 'Sagarika Jena',
      accountNumber: '918273645012',
      confirmAccountNumber: '918273645012',
      ifscCode: '',
      bankName: '',
      branch: '',
      accountType: 'Overdraft',
    }

    render(
      <GSTBankDetails
        data={initialData}
        onChange={handleChange}
        onClearError={handleClearError}
      />
    )

    const ifscInput = screen.getByLabelText(/IFSC Code/i)
    fireEvent.change(ifscInput, { target: { value: 'HDFC0000412' } })

    // Verify ifscCode updated
    expect(handleChange).toHaveBeenCalledWith('ifscCode', 'HDFC0000412')
    // Verify bankName and branch are NOT auto-fetched
    expect(handleChange).not.toHaveBeenCalledWith('bankName', expect.anything())
    expect(handleChange).not.toHaveBeenCalledWith('branch', expect.anything())
  })

  it('allows user to manually enter bankName and branch as text inputs', () => {
    const handleChange = vi.fn()
    const handleClearError = vi.fn()

    const initialData = {
      accountHolderName: 'Sagarika Jena',
      accountNumber: '918273645012',
      confirmAccountNumber: '918273645012',
      ifscCode: 'HDFC0000412',
      bankName: '',
      branch: '',
      accountType: 'Overdraft',
    }

    render(
      <GSTBankDetails
        data={initialData}
        onChange={handleChange}
        onClearError={handleClearError}
      />
    )

    const bankNameInput = screen.getByLabelText(/Bank Name/i)
    expect(bankNameInput.tagName).toBe('INPUT')
    fireEvent.change(bankNameInput, { target: { value: 'HDFC Bank' } })
    expect(handleChange).toHaveBeenCalledWith('bankName', 'HDFC Bank')

    const branchInput = screen.getByLabelText(/Branch/i)
    expect(branchInput.tagName).toBe('INPUT')
    fireEvent.change(branchInput, { target: { value: 'Fort Branch' } })
    expect(handleChange).toHaveBeenCalledWith('branch', 'Fort Branch')
  })

  it('renders eye toggle icon on both Bank Account Number and Confirm Account Number fields', () => {
    const initialData = {
      accountHolderName: 'Sagarika Jena',
      accountNumber: '918273645012',
      confirmAccountNumber: '918273645012',
      ifscCode: 'HDFC0000412',
      bankName: 'HDFC Bank',
      branch: 'Fort Branch',
      accountType: 'Current',
    }

    render(
      <GSTBankDetails
        data={initialData}
        onChange={vi.fn()}
      />
    )

    const accInput = screen.getByPlaceholderText('Enter account number')
    const confirmInput = screen.getByPlaceholderText('Re-enter account number')

    // Both start masked as password
    expect(accInput).toHaveAttribute('type', 'password')
    expect(confirmInput).toHaveAttribute('type', 'password')

    // Eye toggle button for Bank Account Number exists and toggles
    const accToggle = screen.getByRole('button', { name: /Show account number/i })
    expect(accToggle).toBeInTheDocument()
    fireEvent.click(accToggle)
    expect(accInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /Hide account number/i })).toBeInTheDocument()

    // Eye toggle button for Confirm Account Number exists and toggles
    const confirmToggle = screen.getByRole('button', { name: /Show confirm account number/i })
    expect(confirmToggle).toBeInTheDocument()
    fireEvent.click(confirmToggle)
    expect(confirmInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /Hide confirm account number/i })).toBeInTheDocument()
  })
})
