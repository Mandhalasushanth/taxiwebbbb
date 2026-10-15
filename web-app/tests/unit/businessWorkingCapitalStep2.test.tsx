// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { validateStep2BusinessProfile } from '../../src/modules/loans/validation/businessWorkingCapitalValidation'
import { INITIAL_BWC_DATA } from '../../src/modules/loans/components/BusinessWorkingCapital/businessWorkingCapital.constants'
import { InlineSelect } from '../../src/modules/loans/components/BusinessWorkingCapital/steps/InlineSelect'

const VALID = {
  ...INITIAL_BWC_DATA,
  businessName: 'Apex Enterprises',
  businessConstitution: 'proprietorship',
  businessActivity: 'trading',
  establishmentDate: '2019-04-01',
  operatingAddress: 'Shop 12, Galaxy Complex, MG Road',
  businessPincode: '560001',
  loanAmount: '10,00,000',
  loanPurpose: 'business-expansion',
  purposeDescription: 'Opening a second outlet to increase sales',
  avgMonthlySales: '8,00,000',
  avgMonthlyExpenses: '5,50,000',
}

describe('Business & Working Capital – Step 2 Business Profile', () => {
  afterEach(cleanup)

  it('passes with complete details and no GST', () => {
    expect(validateStep2BusinessProfile(VALID).isValid).toBe(true)
  })

  it('requires every mandatory field', () => {
    const { errors } = validateStep2BusinessProfile(INITIAL_BWC_DATA)
    expect(Object.keys(errors).sort()).toEqual([
      'avgMonthlyExpenses',
      'avgMonthlySales',
      'businessActivity',
      'businessConstitution',
      'businessName',
      'businessPincode',
      'establishmentDate',
      'loanAmount',
      'loanPurpose',
      'operatingAddress',
      'purposeDescription',
    ])
  })

  it('needs a GSTIN only when GST registered, and it must match the PIN code state', () => {
    expect(validateStep2BusinessProfile({ ...VALID, gstRegistered: 'yes' }).errors.gstin).toMatch(/required/)
    expect(validateStep2BusinessProfile({ ...VALID, gstRegistered: 'yes', gstin: '27ABCDE1234F1Z5' }).errors.gstin).toMatch(/does not match/)
    expect(validateStep2BusinessProfile({ ...VALID, gstRegistered: 'yes', gstin: '29ABCDE1234F1Z5' }).isValid).toBe(true)
  })

  it('rejects amounts below ₹25,000, future dates and a bad Udyam number', () => {
    const { errors } = validateStep2BusinessProfile({
      ...VALID,
      loanAmount: '20,000',
      establishmentDate: '2999-01-01',
      udyamNumber: 'UDYAM-12',
    })
    expect(errors.loanAmount).toMatch(/Minimum/)
    expect(errors.establishmentDate).toMatch(/future/)
    expect(errors.udyamNumber).toBeTruthy()
  })

  it('validates avg monthly sales and expenses bounds', () => {
    const { errors } = validateStep2BusinessProfile({
      ...VALID,
      avgMonthlySales: '500',
      avgMonthlyExpenses: '100',
    })
    expect(errors.avgMonthlySales).toMatch(/Minimum/)
    expect(errors.avgMonthlyExpenses).toMatch(/Minimum/)
  })

  it('opens the options list below the field and selects one', () => {
    const onChange = vi.fn()
    render(
      <InlineSelect
        id="t"
        label="Business Constitution"
        placeholder="Select legal entity constitution"
        options={[{ value: 'llp', label: 'LLP' }]}
        value=""
        onChange={onChange}
      />,
    )
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Business Constitution/ }))
    fireEvent.click(screen.getByRole('option', { name: 'LLP' }))
    expect(onChange).toHaveBeenCalledWith('llp')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
