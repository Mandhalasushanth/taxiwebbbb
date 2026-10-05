// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach } from 'vitest'
import { BusinessLoan } from '../../src/modules/loans/components/BusinessLoan/BusinessLoan'
import { validateStep1LoanAndApplicant } from '../../src/modules/loans/validation/businessLoanValidation'
import type { BusinessLoanFormData } from '../../src/modules/loans/types/businessLoan.types'

afterEach(() => {
  cleanup()
})

describe('BusinessLoan Step 1 (Loan & Applicant)', () => {
  it('renders the Business Loan heading and 5-step progress indicator', () => {
    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    // Heading
    expect(screen.getByRole('heading', { level: 1, name: 'Business Loan' })).toBeInTheDocument()

    // 5 Steps
    expect(screen.getByText('Loan & Applicant')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.getByText('Banking')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders the Applicant Identity Details card with security alert and verified profile badge', () => {
    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    expect(screen.getByText('Applicant Identity Details')).toBeInTheDocument()
    expect(screen.getByText('Verified Profile')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your details are securely pulled from your TaxEdge account. You do not need to re-enter them.'
      )
    ).toBeInTheDocument()

    // Check applicant fields
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('PAN')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar')).toBeInTheDocument()
    expect(screen.getByText('Date of Birth')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
  })

  it('renders Employment / Business Profile options and allows switching', () => {
    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    const salariedBtn = screen.getByTestId('employment-option-salaried')
    const selfEmployedBtn = screen.getByTestId('employment-option-self-employed')
    const businessOwnerBtn = screen.getByTestId('employment-option-business-owner')

    expect(salariedBtn).toBeInTheDocument()
    expect(selfEmployedBtn).toBeInTheDocument()
    expect(businessOwnerBtn).toBeInTheDocument()

    // Initially unselected per user specification
    expect(salariedBtn).toHaveAttribute('aria-checked', 'false')
    expect(businessOwnerBtn).toHaveAttribute('aria-checked', 'false')

    // Click Business Owner
    fireEvent.click(businessOwnerBtn)
    expect(businessOwnerBtn).toHaveAttribute('aria-checked', 'true')
    expect(salariedBtn).toHaveAttribute('aria-checked', 'false')
  })

  it('renders the 2-column input fields and Existing Loans options', () => {
    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Required Loan Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred Tenure')).toBeInTheDocument()
    expect(screen.getByLabelText('Purpose of Loan')).toBeInTheDocument()
    expect(screen.getByLabelText('Monthly or Annual Revenue')).toBeInTheDocument()

    // Existing loans
    expect(screen.getByTestId('existing-loan-option-none')).toBeInTheDocument()
    expect(screen.getByTestId('existing-loan-option-active')).toBeInTheDocument()

    // Action buttons
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('validates Step 1 correctly and returns field errors for incomplete forms', () => {
    const emptyData: BusinessLoanFormData = {
      employmentProfile: 'salaried',
      requiredLoanAmount: '',
      preferredTenureMonths: '',
      purposeOfLoan: '',
      revenueOrTurnover: '',
      existingLoans: 'none',
    }

    const res = validateStep1LoanAndApplicant(emptyData)
    expect(res.isValid).toBe(false)
    expect(res.errors.requiredLoanAmount).toBeDefined()
    expect(res.errors.preferredTenureMonths).toBeDefined()
    expect(res.errors.purposeOfLoan).toBeDefined()
    expect(res.errors.revenueOrTurnover).toBeDefined()

    const validData: BusinessLoanFormData = {
      employmentProfile: 'business-owner',
      requiredLoanAmount: '1000000-2500000',
      preferredTenureMonths: '36',
      purposeOfLoan: 'Working Capital',
      revenueOrTurnover: '500000',
      existingLoans: 'none',
    }

    const validRes = validateStep1LoanAndApplicant(validData)
    expect(validRes.isValid).toBe(true)
    expect(Object.keys(validRes.errors)).toHaveLength(0)
  })

  it('displays error banner and field errors when clicking continue with empty inputs', () => {
    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueBtn)

    expect(screen.getByText('Please complete all required fields marked with *.')).toBeInTheDocument()
    expect(screen.getByText('Please select the required loan amount.')).toBeInTheDocument()
  })
})
