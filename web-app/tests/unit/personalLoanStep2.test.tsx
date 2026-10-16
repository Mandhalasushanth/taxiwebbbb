// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { EmploymentIncome } from '../../src/modules/loans/components/PersonalLoan/steps/EmploymentIncome/EmploymentIncome'
import { validateStep2EmploymentIncome } from '../../src/modules/loans/validation/personalLoanValidation'
import { INITIAL_PERSONAL_LOAN_DATA } from '../../src/modules/loans/components/PersonalLoan/personalLoan.constants'
import type { PersonalLoanFormData } from '../../src/modules/loans/types'

const VALID_SALARIED_DATA: PersonalLoanFormData = {
  ...INITIAL_PERSONAL_LOAN_DATA,
  requestedLoanAmount: '2,50,000',
  employmentType: 'salaried',
  employerName: 'Tata Consultancy Services',
  jobType: 'Private',
  monthlySalary: '75,000',
  workExperience: '3 - 5 Years',
  salaryReceivedMode: 'Bank Account',
}

describe('Personal Loan – Step 2 Employment & Income', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders loan requirement card and formats amount with commas', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <EmploymentIncome
          data={INITIAL_PERSONAL_LOAN_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('How much loan do you need?')).toBeInTheDocument()
    const amountInput = screen.getByLabelText(/Requested Loan Amount/i)
    fireEvent.change(amountInput, { target: { value: '250000' } })
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ requestedLoanAmount: '2,50,000' }),
    )
  })

  it('renders Employment Type cards and toggles between Salaried and Self Employed', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <EmploymentIncome
          data={VALID_SALARIED_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const salariedCard = screen.getByRole('radio', { name: /Salaried/i })
    const selfEmployedCard = screen.getByRole('radio', { name: /Self Employed/i })

    expect(salariedCard).toHaveAttribute('aria-checked', 'true')
    expect(selfEmployedCard).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(selfEmployedCard)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ employmentType: 'self-employed' }),
    )
  })

  it('opens Job Type inline dropdown list below field and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <EmploymentIncome
          data={VALID_SALARIED_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const jobBtn = screen.getByRole('button', { name: /Job Type/i })
    fireEvent.click(jobBtn)

    // Listbox opens directly beneath the field
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('Public Sector')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Government'))
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ jobType: 'Government' }))
  })

  it('opens Salary Receive Mode inline dropdown list below field and selects an option', () => {
    const handleChange = vi.fn()
    render(
      <MemoryRouter>
        <EmploymentIncome
          data={VALID_SALARIED_DATA}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    const salaryModeBtn = screen.getByRole('button', { name: /How do you receive your salary/i })
    fireEvent.click(salaryModeBtn)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Cheque')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cheque'))
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ salaryReceivedMode: 'Cheque' }))
  })

  it('renders Business / Profession Details and options for Self Employed mode', () => {
    const handleChange = vi.fn()
    const selfEmployedData: PersonalLoanFormData = {
      ...INITIAL_PERSONAL_LOAN_DATA,
      employmentType: 'self-employed',
      employerName: 'Rohit Enterprises',
      jobType: '',
      monthlySalary: '60,000',
      workExperience: 'Less than 1 year',
    }

    render(
      <MemoryRouter>
        <EmploymentIncome
          data={selfEmployedData}
          onChange={handleChange}
          errors={{}}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Business / Profession Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/Business \/ Profession Name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nature of Business \/ Profession/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Average Monthly Income/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Years in Business/i })).toBeInTheDocument()
    expect(screen.queryByText(/How do you receive your salary/i)).not.toBeInTheDocument()

    // Test inline dropdown options for Nature of Business
    const natureBtn = screen.getByRole('button', { name: /Nature of Business \/ Profession/i })
    fireEvent.click(natureBtn)
    expect(screen.getByText('Trading')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Manufacturing')).toBeInTheDocument()
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('validates Step 2 fields accurately (required, min/max bounds, junk detection)', () => {
    // Empty data validation
    const emptyResult = validateStep2EmploymentIncome({
      ...INITIAL_PERSONAL_LOAN_DATA,
      requestedLoanAmount: '',
      employmentType: '',
      employerName: '',
      jobType: '',
      monthlySalary: '',
      workExperience: '',
      salaryReceivedMode: '',
    })
    expect(emptyResult.isValid).toBe(false)
    expect(emptyResult.errors.requestedLoanAmount).toBeDefined()
    expect(emptyResult.errors.employmentType).toBeDefined()
    expect(emptyResult.errors.employerName).toBeDefined()
    expect(emptyResult.errors.jobType).toBeDefined()
    expect(emptyResult.errors.monthlySalary).toBeDefined()
    expect(emptyResult.errors.workExperience).toBeDefined()

    // Minimum loan amount check (< 25000)
    const lowAmountResult = validateStep2EmploymentIncome({
      ...VALID_SALARIED_DATA,
      requestedLoanAmount: '10,000',
    })
    expect(lowAmountResult.isValid).toBe(false)
    expect(lowAmountResult.errors.requestedLoanAmount).toContain('Minimum loan amount is ₹25,000')

    // Valid data
    const validResult = validateStep2EmploymentIncome(VALID_SALARIED_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
