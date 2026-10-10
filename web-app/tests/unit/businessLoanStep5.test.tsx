// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReviewAndSubmit } from '../../src/modules/loans/components/BusinessLoan/steps/ReviewAndSubmit'
import { BusinessLoan } from '../../src/modules/loans/components/BusinessLoan/BusinessLoan'
import { loanApplicationService, loanStorageKey } from '../../src/modules/loans/services/loanApplicationService'
import type { BusinessLoanFormData, ApplicantIdentityProfile } from '../../src/modules/loans/types/businessLoan.types'

afterEach(() => {
  cleanup()
})

const mockApplicant: ApplicantIdentityProfile = {
  name: 'Sagarika Jena',
  mobile: '7008138785',
  email: 'jenasagarika211@gmail.com',
  pan: 'CASPJ2345E',
  aadhaar: 'XXXX-XXXX-6987',
  dob: '15/08/1990',
  address: 'Bhubaneswar, Odisha',
  isVerified: true,
}

const mockFormData: BusinessLoanFormData = {
  employmentProfile: 'salaried',
  requiredLoanAmount: '1000000',
  preferredTenureMonths: '12',
  purposeOfLoan: 'working-capital',
  revenueOrTurnover: '5000000',
  existingLoans: 'none',

  registeredBusinessName: 'Txrdd',
  businessConstitution: 'LLP',
  gstin: '29AAAAA0000A1Z5',
  hasUdyam: 'yes',
  udyamRegistrationNumber: 'UDYAM-MH-123456',
  businessVintage: '< 1 Year',
  annualTurnover: '5090686868',
  annualNetProfit: '8686868',
  signatoryName: 'Gdhchc',
  signatoryDesignation: 'Director',
  signatoryEmail: 'gdhchc@txrdd.com',

  primaryOperatingBankName: 'Cjyjukv',
  currentAccountNumber: '123456786868',
  bankIfscCode: 'HDFC0000123',
  currentLenderBank: '',
  totalActiveLoanLimit: '',
  itrAcknowledgementNumber: '',
  grossTotalIncomeItr: '',

  uploadedDocs: {
    panCard: { file: new File([''], 'pan.pdf'), fileName: 'pan.pdf', uploadedAt: new Date().toISOString() },
    aadhaarCard: { file: new File([''], 'aadhaar.pdf'), fileName: 'aadhaar.pdf', uploadedAt: new Date().toISOString() },
    directorsKyc: { file: new File([''], 'kyc.pdf'), fileName: 'kyc.pdf', uploadedAt: new Date().toISOString() },
    businessAddressProof: { file: new File([''], 'addr.pdf'), fileName: 'addr.pdf', uploadedAt: new Date().toISOString() },
    bankStatements: { file: new File([''], 'bank.pdf'), fileName: 'bank.pdf', uploadedAt: new Date().toISOString() },
    gstCertificate: { file: new File([''], 'gst.pdf'), fileName: 'gst.pdf', uploadedAt: new Date().toISOString() },
    gstReturns: { file: new File([''], 'gstr.pdf'), fileName: 'gstr.pdf', uploadedAt: new Date().toISOString() },
    businessItr: { file: new File([''], 'itr.pdf'), fileName: 'itr.pdf', uploadedAt: new Date().toISOString() },
    auditedBalanceSheet: { file: new File([''], 'balance.pdf'), fileName: 'balance.pdf', uploadedAt: new Date().toISOString() },
    profitAndLossStatement: { file: new File([''], 'pnl.pdf'), fileName: 'pnl.pdf', uploadedAt: new Date().toISOString() },
    cashFlowStatement: { file: new File([''], 'cash.pdf'), fileName: 'cash.pdf', uploadedAt: new Date().toISOString() },
    udyamRegistrationCert: { file: new File([''], 'udyam.pdf'), fileName: 'udyam.pdf', uploadedAt: new Date().toISOString() },
    businessRegistrationProof: { file: new File([''], 'reg.pdf'), fileName: 'reg.pdf', uploadedAt: new Date().toISOString() },
    businessExpansionDoc: { file: new File([''], 'expansion.pdf'), fileName: 'expansion.pdf', uploadedAt: new Date().toISOString() },
  },
  termsAccepted: false,
}

describe('BusinessLoan Step 5 (Review & Submit)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders Application Dossier Review header and all 5 review cards with actual data', () => {
    const handleNavigate = vi.fn()
    const handleChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <ReviewAndSubmit
        data={mockFormData}
        applicant={mockApplicant}
        onChange={handleChange}
        onNavigateToStep={handleNavigate}
        onSubmit={handleSubmit}
      />
    )

    // 1. Header Banner
    expect(screen.getByText('Application Dossier Review')).toBeInTheDocument()
    expect(
      screen.getByText(/Please review all the details and uploaded documents before submitting/i)
    ).toBeInTheDocument()

    // 2. Section 1: Applicant Information
    expect(screen.getByText('Applicant Information')).toBeInTheDocument()
    expect(screen.getByText('Verified Profile')).toBeInTheDocument()
    expect(screen.getByText('Sagarika Jena')).toBeInTheDocument()
    expect(screen.getByText('7008138785')).toBeInTheDocument()
    expect(screen.getByText('jenasagarika211@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('CASPJ2345E')).toBeInTheDocument()
    expect(screen.getByText('XXXX-XXXX-6987')).toBeInTheDocument()

    // 3. Section 2: Loan Requirement
    expect(screen.getByText('Loan Requirement')).toBeInTheDocument()
    expect(screen.getByText('Business Loan')).toBeInTheDocument()
    expect(screen.getByText('₹10,00,000')).toBeInTheDocument()
    expect(screen.getByText('Working Capital & Inventory')).toBeInTheDocument()
    expect(screen.getByText('12 Months')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument() // existing loans none

    // 4. Section 3: Business Details
    expect(screen.getByText('Business Details')).toBeInTheDocument()
    expect(screen.getByText('Txrdd')).toBeInTheDocument()
    expect(screen.getByText('LLP')).toBeInTheDocument()
    expect(screen.getByText('Gdhchc')).toBeInTheDocument()
    expect(screen.getByText('29AAAAA0000A1Z5')).toBeInTheDocument()
    expect(screen.getByText('Yes (UDYAM-MH-123456)')).toBeInTheDocument()
    expect(screen.getByText('< 1 Year Years')).toBeInTheDocument()
    expect(screen.getByText('₹5,09,06,86,868')).toBeInTheDocument()
    expect(screen.getByText('₹86,86,868')).toBeInTheDocument()

    // 5. Section 4: Banking & Tax Details
    expect(screen.getByText('Banking & Tax Details')).toBeInTheDocument()
    expect(screen.getByText('Cjyjukv')).toBeInTheDocument()
    expect(screen.getByText('XXXXXX6868')).toBeInTheDocument()
    expect(screen.getByText('HDFC0000123')).toBeInTheDocument()
    expect(screen.getByText('Filed (Last 3 Years)')).toBeInTheDocument()

    // 6. Section 5: Uploaded Documents
    expect(screen.getByText('Uploaded Documents')).toBeInTheDocument()
    expect(screen.getByText('14 of 14 uploaded')).toBeInTheDocument()
    expect(screen.getByText('PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar Card')).toBeInTheDocument()
    expect(screen.getByText('KYC of Directors / Partners')).toBeInTheDocument()
    expect(screen.getByText('Business Address Proof')).toBeInTheDocument()
    expect(screen.getByText('Current Account Bank Statements')).toBeInTheDocument()
    expect(screen.getByText('GST Certificate (REG-06)')).toBeInTheDocument()
    expect(screen.getByText('GST Returns (12 Months)')).toBeInTheDocument()
    expect(screen.getByText('Business ITR (Last 2-3 Years)')).toBeInTheDocument()
    expect(screen.getByText('Audited Balance Sheet')).toBeInTheDocument()
    expect(screen.getByText('Profit & Loss Statement')).toBeInTheDocument()
    expect(screen.getByText('Cash Flow Statement')).toBeInTheDocument()
    expect(screen.getByText('Udyam Registration Certificate')).toBeInTheDocument()
    expect(screen.getByText('Business Registration Proof')).toBeInTheDocument()
    expect(screen.getByText('Business Expansion Document')).toBeInTheDocument()

    // 7. Authorization Checkbox
    expect(
      screen.getByText(/I hereby authorize TaxEdge and its lending partners/i)
    ).toBeInTheDocument()
  })

  it('triggers navigation callback when clicking Edit / Manage buttons', () => {
    const handleNavigate = vi.fn()
    const handleChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <ReviewAndSubmit
        data={mockFormData}
        applicant={mockApplicant}
        onChange={handleChange}
        onNavigateToStep={handleNavigate}
        onSubmit={handleSubmit}
      />
    )

    // Edit Loan Requirement (Step 1)
    const editLoanBtn = screen.getByLabelText('Edit Loan Requirement')
    fireEvent.click(editLoanBtn)
    expect(handleNavigate).toHaveBeenCalledWith(1)

    // Edit Business Details (Step 2)
    const editBusinessBtn = screen.getByLabelText('Edit Business Details')
    fireEvent.click(editBusinessBtn)
    expect(handleNavigate).toHaveBeenCalledWith(2)

    // Edit Banking Details (Step 3)
    const editBankingBtn = screen.getByLabelText('Edit Banking & Tax Details')
    fireEvent.click(editBankingBtn)
    expect(handleNavigate).toHaveBeenCalledWith(3)

    // Manage Uploaded Documents (Step 4)
    const manageDocsBtn = screen.getByLabelText('Manage Uploaded Documents')
    fireEvent.click(manageDocsBtn)
    expect(handleNavigate).toHaveBeenCalledWith(4)
  })

  it('toggles authorization checkbox and notifies parent handler', () => {
    const handleChange = vi.fn()

    render(
      <ReviewAndSubmit
        data={mockFormData}
        applicant={mockApplicant}
        onChange={handleChange}
        onNavigateToStep={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const checkbox = screen.getByTestId('terms-accepted-checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith({ termsAccepted: true })
  })

  it('displays authorization error when provided in errors prop', () => {
    const handleSubmit = vi.fn()
    const handleChange = vi.fn()

    render(
      <ReviewAndSubmit
        data={{ ...mockFormData, termsAccepted: false }}
        applicant={mockApplicant}
        onChange={handleChange}
        onNavigateToStep={vi.fn()}
        onSubmit={handleSubmit}
        errors={{ termsAccepted: 'Please check the authorization box before submitting.' }}
      />
    )

    expect(
      screen.getByText('Please check the authorization box before submitting.')
    ).toBeInTheDocument()
  })

  it('renders correctly and submits application with service integration in BusinessLoan', async () => {
    // Seed draft with complete data through step 4 in localStorage
    localStorage.setItem(
      loanStorageKey('business_loan'),
      JSON.stringify(mockFormData)
    )

    const submitSpy = vi
      .spyOn(loanApplicationService, 'submitApplication')
      .mockResolvedValueOnce({
        id: 'TXE-LN-888888',
        refNumber: 'TXE-LN-888888',
        referenceNumber: 'TXE-LN-888888',
        loanType: 'business_loan',
        loanCategory: 'Capital & Financing',
        loanAmount: 1000000,
        tenureYears: 1,
        status: 'submitted',
        statusLabel: 'Documents Received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [],
      })

    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    // Step 1: Input values are loaded from draft or can advance
    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByTestId('step-business-details')).toBeInTheDocument()

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByTestId('step-business-banking')).toBeInTheDocument()

    // Advance to Step 4
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByTestId('step-document-verification')).toBeInTheDocument()

    // Advance to Step 5 (all docs are pre-populated in mockFormData draft)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByTestId('review-and-submit-step')).toBeInTheDocument()
    })

    // Action button should now be "Submit Application"
    const submitBtn = screen.getByRole('button', { name: 'Submit Application' })
    expect(submitBtn).toBeInTheDocument()

    // Clicking Submit without terms checkbox checked displays validation error
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(
        screen.getByText(/Please check the authorization box before submitting/i)
      ).toBeInTheDocument()
    })
    expect(submitSpy).not.toHaveBeenCalled()

    // Check authorization checkbox
    const checkbox = screen.getByTestId('terms-accepted-checkbox')
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    // Submit successfully
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith('business_loan', expect.anything())
    })
  })
})
