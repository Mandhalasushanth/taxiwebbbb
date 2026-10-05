// @vitest-environment jsdom
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

  it('fetchBankDetailsByIfsc resolves asynchronously', async () => {
    const result = await fetchBankDetailsByIfsc('HDFC0000412')
    expect(result).not.toBeNull()
    expect(result?.bankName).toBe('HDFC Bank')
  })
})

describe('GSTBankDetails Component - IFSC Auto-Fill', () => {
  it('automatically triggers onChange for bankName and branch when user enters IFSC', () => {
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
    // Verify bankName auto-fetched
    expect(handleChange).toHaveBeenCalledWith('bankName', 'HDFC Bank')
    // Verify branch auto-fetched
    expect(handleChange).toHaveBeenCalledWith('branch', 'Fort Branch - Mumbai')
    // Verify errors cleared
    expect(handleClearError).toHaveBeenCalledWith('bankName')
    expect(handleClearError).toHaveBeenCalledWith('branch')
  })

  it('updates bankName and branch when user changes from one bank code to another', () => {
    const handleChange = vi.fn()
    const handleClearError = vi.fn()

    // Simulating user who previously had SBI populated
    const previousSbiData = {
      accountHolderName: 'Sagarika Jena',
      accountNumber: '918273645012',
      confirmAccountNumber: '918273645012',
      ifscCode: 'SBIN0000412',
      bankName: 'State Bank of India',
      branch: 'Commercial Branch',
      accountType: 'Overdraft',
    }

    render(
      <GSTBankDetails
        data={previousSbiData}
        onChange={handleChange}
        onClearError={handleClearError}
      />
    )

    const ifscInput = screen.getByLabelText(/IFSC Code/i)
    fireEvent.change(ifscInput, { target: { value: 'HDFC0000412' } })

    // Must overwrite previous bankName and branch
    expect(handleChange).toHaveBeenCalledWith('bankName', 'HDFC Bank')
    expect(handleChange).toHaveBeenCalledWith('branch', 'Fort Branch - Mumbai')
  })
})
