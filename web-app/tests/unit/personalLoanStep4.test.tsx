// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ReviewAndSubmit } from '../../src/modules/loans/components/PersonalLoan/steps/ReviewAndSubmit/ReviewAndSubmit'
import { validateStep4Review } from '../../src/modules/loans/validation/personalLoanValidation'
import { INITIAL_PERSONAL_LOAN_DATA } from '../../src/modules/loans/components/PersonalLoan/personalLoan.constants'
import type { PersonalLoanFormData } from '../../src/modules/loans/types'
import type { VerifiedCustomerDetails } from '../../src/modules/loans/types'

const MOCK_CUSTOMER: VerifiedCustomerDetails = {
  fullName: 'Shashiprakash',
  mobile: '9347074726',
  email: 'shashiprakash.paladugu@gmail.com',
  pan: 'HFGPP3149F',
  aadhaar: 'XXXX XXXX 8265',
  dob: '01-01-2000',
  isVerified: true,
}

const VALID_SALARIED_DATA: PersonalLoanFormData = {
  ...INITIAL_PERSONAL_LOAN_DATA,
  currentAddress: {
    houseBuilding: 'Hanamkonda',
    streetLocality: 'G g g g. G',
    city: 'Hnk',
    state: 'Telangana',
    pincode: '506001',
  },
  permanentSameAsCurrent: 'yes',
  kycConsent: true,
  requestedLoanAmount: '59,668',
  employmentType: 'salaried',
  employerName: 'Tata Consultancy Services',
  jobType: 'Government',
  monthlySalary: '8,98,880',
  workExperience: '1 - 3 Years',
  salaryReceivedMode: 'Bank Account',
  uploadedDocs: {
    pan_card: { id: 'pan_card', name: 'pan.pdf', size: 100, type: 'application/pdf', file: new File([''], 'pan.pdf') },
    salary_bank_statement: { id: 'salary_bank_statement', name: 'statement.pdf', size: 200, type: 'application/pdf', file: new File([''], 'statement.pdf') },
  },
  termsAccepted: true,
}

const VALID_SELF_EMPLOYED_DATA: PersonalLoanFormData = {
  ...VALID_SALARIED_DATA,
  requestedLoanAmount: '5,49,599',
  employmentType: 'self-employed',
  employerName: 'Vxnfjkckkvhhx',
  jobType: 'Professional',
  monthlySalary: '98,98,988',
  workExperience: 'Less than 1 year',
  uploadedDocs: {
    pan_card: { id: 'pan_card', name: 'pan.pdf', size: 100, type: 'application/pdf', file: new File([''], 'pan.pdf') },
  },
}

describe('Personal Loan – Step 4 Review & Submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders all review dossier cards for Salaried applicant and triggers navigation on Edit click', () => {
    const handleNavigate = vi.fn()
    const handleChange = vi.fn()

    render(
      <ReviewAndSubmit
        data={VALID_SALARIED_DATA}
        customer={MOCK_CUSTOMER}
        onChange={handleChange}
        onNavigateToStep={handleNavigate}
        errors={{}}
      />,
    )

    // 1. Applicant Details Card
    expect(screen.getByText('Applicant Details')).toBeInTheDocument()
    expect(screen.getByText('Shashiprakash')).toBeInTheDocument()
    expect(screen.getByText('+91 9347074726')).toBeInTheDocument()
    expect(screen.getByText('shashiprakash.paladugu@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('HFGPP3149F')).toBeInTheDocument()
    expect(screen.getByText('XXXX XXXX 8265')).toBeInTheDocument()
    expect(screen.getByText('01-01-2000')).toBeInTheDocument()
    expect(screen.getByText('Same as current address')).toBeInTheDocument()

    // 2. Loan Requirements Card
    expect(screen.getByText('Loan Requirements')).toBeInTheDocument()
    expect(screen.getByText('Personal Loan')).toBeInTheDocument()
    expect(screen.getByText('₹59,668')).toBeInTheDocument()

    // 3. Employment & Income Card (Salaried)
    expect(screen.getByText('Employment & Income')).toBeInTheDocument()
    expect(screen.getByText('Salaried')).toBeInTheDocument()
    expect(screen.getByText('Tata Consultancy Services')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('₹8,98,880')).toBeInTheDocument()
    expect(screen.getByText('1 - 3 Years')).toBeInTheDocument()
    expect(screen.getByText('Bank Account')).toBeInTheDocument()

    // 4. Documents Card
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Applicant PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Salary Bank Statement (Last 3 Months)')).toBeInTheDocument()

    // 5. Applicant Declaration
    expect(screen.getByText('Applicant Declaration')).toBeInTheDocument()
    expect(
      screen.getByText(/I confirm that the information provided in this application is accurate and complete/i),
    ).toBeInTheDocument()

    // Test Edit button navigation
    const editApplicantBtn = screen.getByRole('button', { name: /Edit Applicant Details/i })
    fireEvent.click(editApplicantBtn)
    expect(handleNavigate).toHaveBeenCalledWith(1)

    const editLoanBtn = screen.getByRole('button', { name: /Edit Loan Requirements/i })
    fireEvent.click(editLoanBtn)
    expect(handleNavigate).toHaveBeenCalledWith(2)

    const editDocsBtn = screen.getByRole('button', { name: /Edit Documents/i })
    fireEvent.click(editDocsBtn)
    expect(handleNavigate).toHaveBeenCalledWith(3)
  })

  it('renders review dossier cards for Self Employed applicant matching screenshot', () => {
    render(
      <ReviewAndSubmit
        data={VALID_SELF_EMPLOYED_DATA}
        customer={MOCK_CUSTOMER}
        onChange={vi.fn()}
        onNavigateToStep={vi.fn()}
        errors={{}}
      />,
    )

    // Check Self Employed rows
    expect(screen.getByText('Self Employed')).toBeInTheDocument()
    expect(screen.getByText('Vxnfjkckkvhhx')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('₹98,98,988')).toBeInTheDocument()
    expect(screen.getByText('Less than 1 year')).toBeInTheDocument()
    expect(screen.queryByText('Salary Credit Method')).not.toBeInTheDocument()

    // Documents subtitle for 1 required doc
    expect(screen.getByText('1 of 1 required documents uploaded')).toBeInTheDocument()
  })

  it('validates Step 4 with strong pre-flight checks across all earlier steps', () => {
    // 1. Missing Step 1 KYC invalidates Step 4
    const badKyc = validateStep4Review({
      ...VALID_SALARIED_DATA,
      currentAddress: { ...VALID_SALARIED_DATA.currentAddress, pincode: '' },
    })
    expect(badKyc.isValid).toBe(false)
    expect(badKyc.errors.step1).toBe('incomplete')
    expect(badKyc.error).toContain('KYC Verification')

    // 2. Missing Step 2 Employment details invalidates Step 4
    const badEmp = validateStep4Review({
      ...VALID_SALARIED_DATA,
      requestedLoanAmount: '',
    })
    expect(badEmp.isValid).toBe(false)
    expect(badEmp.errors.step2).toBe('incomplete')
    expect(badEmp.error).toContain('Employment & Income')

    // 3. Missing Step 3 Documents invalidates Step 4
    const badDocs = validateStep4Review({
      ...VALID_SALARIED_DATA,
      uploadedDocs: {},
    })
    expect(badDocs.isValid).toBe(false)
    expect(badDocs.errors.step3).toBe('incomplete')
    expect(badDocs.error).toContain('Documents')

    // 4. Missing terms declaration
    const uncheckedTerms = validateStep4Review({
      ...VALID_SALARIED_DATA,
      termsAccepted: false,
    })
    expect(uncheckedTerms.isValid).toBe(false)
    expect(uncheckedTerms.errors.termsAccepted).toBeDefined()

    // 5. Complete and valid application passes Step 4
    const validResult = validateStep4Review(VALID_SALARIED_DATA)
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})
