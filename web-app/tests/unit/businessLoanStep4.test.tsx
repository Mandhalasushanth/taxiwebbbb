// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { pickFiles, uploadTestFile } from './helpers/uploadTestFiles'
import { describe, it, expect, vi, afterEach } from 'vitest'

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
import { DocumentVerification } from '../../src/modules/loans/components/BusinessLoan/steps/DocumentVerification/DocumentVerification'
import { BusinessLoan } from '../../src/modules/loans/components/BusinessLoan/BusinessLoan'
import {
  validateStep4Documents,
  validateDocumentFile,
} from '../../src/modules/loans/validation/businessLoanValidation'
import type { BusinessLoanFormData } from '../../src/modules/loans/types/businessLoan.types'

afterEach(() => {
  cleanup()
})

const DEFAULT_MOCK_DATA: BusinessLoanFormData = {
  employmentProfile: 'business-owner',
  requiredLoanAmount: '2500000-5000000',
  preferredTenureMonths: '36',
  purposeOfLoan: 'Working Capital',
  revenueOrTurnover: '1500000',
  existingLoans: 'none',
  registeredBusinessName: 'Apex Enterprises Pvt Ltd',
  businessConstitution: 'Private Limited',
  gstin: '27ABCDE1234F1Z5',
  hasUdyam: 'no',
  udyamRegistrationNumber: '',
  businessVintage: '3–5 Years',
  annualTurnover: '5000000',
  annualNetProfit: '500000',
  signatoryName: 'Ramesh Kumar',
  signatoryDesignation: 'Director',
  signatoryEmail: 'ramesh@company.com',
  primaryOperatingBankName: 'HDFC Bank',
  currentAccountNumber: '50200012345678',
  bankIfscCode: 'HDFC0001234',
  currentLenderBank: '',
  totalActiveLoanLimit: '',
  itrAcknowledgementNumber: '',
  grossTotalIncomeItr: '',
  uploadedDocs: {},
}

describe('BusinessLoan Step 4 (Document Verification)', () => {
  it('renders Document Verification header, accepted formats badge, and all 14 document cards', () => {
    const handleChange = vi.fn()

    render(
      <DocumentVerification
        data={DEFAULT_MOCK_DATA}
        onChange={handleChange}
        errors={{}}
      />
    )

    // Header & format badge
    expect(screen.getByText('Document Verification')).toBeInTheDocument()
    expect(
      screen.getByText('Upload the required documents based on your business profile and loan purpose.')
    ).toBeInTheDocument()
    expect(screen.getByText('Accepted files: PDF, Excel, JPG or PNG · max 15 MB')).toBeInTheDocument()

    // 14 Document cards
    // 1. PAN Card
    expect(screen.getByText('PAN Card')).toBeInTheDocument()
    expect(screen.getByText('Entity PAN card & Promoter/Director PAN card')).toBeInTheDocument()

    // 2. Aadhaar Card
    expect(screen.getByText('Aadhaar Card')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar of all Primary Directors / Partners')).toBeInTheDocument()

    // 3. KYC of Directors / Partners
    expect(screen.getByText('KYC of Directors / Partners')).toBeInTheDocument()
    expect(screen.getByText('PAN, Aadhaar, DIN and Passport photo')).toBeInTheDocument()

    // 4. Business Address Proof
    expect(screen.getByText('Business Address Proof')).toBeInTheDocument()
    expect(screen.getByText('Utility bill / Rent agreement / Property document')).toBeInTheDocument()

    // 5. Current Account Bank Statements
    expect(screen.getByText('Current Account Bank Statements')).toBeInTheDocument()
    expect(screen.getByText('Last 12 months bank statements')).toBeInTheDocument()

    // 6. GST Certificate (REG-06)
    expect(screen.getByText('GST Certificate (REG-06)')).toBeInTheDocument()
    expect(screen.getByText('GST registration certificate')).toBeInTheDocument()

    // 7. GST Returns (12 Months)
    expect(screen.getByText('GST Returns (12 Months)')).toBeInTheDocument()
    expect(screen.getByText('Filed GSTR-3B & GSTR-1 returns for last 12 months')).toBeInTheDocument()

    // 8. Business ITR (Last 2-3 Years)
    expect(screen.getByText('Business ITR (Last 2-3 Years)')).toBeInTheDocument()
    expect(screen.getByText('ITR-V and computation for the last 3 assessment years')).toBeInTheDocument()

    // 9. Audited Balance Sheet
    expect(screen.getByText('Audited Balance Sheet')).toBeInTheDocument()
    expect(screen.getByText('CA audited balance sheet for last 2-3 years')).toBeInTheDocument()

    // 10. Profit & Loss Statement
    expect(screen.getByText('Profit & Loss Statement')).toBeInTheDocument()
    expect(screen.getByText('CA certified P&L statement with schedules')).toBeInTheDocument()

    // 11. Udyam Registration Certificate (Optional)
    expect(screen.getByText('Udyam Registration Certificate')).toBeInTheDocument()
    expect(screen.getByText('MSME registration certificate')).toBeInTheDocument()
    expect(screen.getByText('Optional')).toBeInTheDocument()

    // 12. Cash Flow Statement
    expect(screen.getByText('Cash Flow Statement')).toBeInTheDocument()
    expect(screen.getByText('Cash flow statement for the latest financial year')).toBeInTheDocument()

    // 13. Business Expansion Document
    expect(screen.getByText('Business Expansion Document')).toBeInTheDocument()
    expect(screen.getByText('Project report / Business plan / Estimated cost')).toBeInTheDocument()

    // 14. Business Registration Proof
    expect(screen.getByText('Business Registration Proof')).toBeInTheDocument()
    expect(screen.getByText('Certificate of Incorporation / Business license')).toBeInTheDocument()
  })

  it('validates files against the application-wide rule (PDF, Excel, JPG, PNG · max 15 MB)', () => {
    // Valid PDF file under 15 MB
    const validPdf = uploadTestFile('pan_card.pdf')
    const resValid = validateDocumentFile(validPdf)
    expect(resValid.isValid).toBe(true)

    // Valid JPG file
    const validJpg = uploadTestFile('aadhaar.jpg')
    expect(validateDocumentFile(validJpg).isValid).toBe(true)

    // Valid PNG file
    const validPng = uploadTestFile('cert.png')
    expect(validateDocumentFile(validPng).isValid).toBe(true)

    // Invalid format (.exe)
    const invalidFile = new File(['code'], 'virus.exe', { type: 'application/x-msdownload' })
    const resInvalid = validateDocumentFile(invalidFile)
    expect(resInvalid.isValid).toBe(false)
    expect(resInvalid.error).toContain('Only PDF, Excel, JPG or PNG files are allowed')

    // Valid Excel workbook
    expect(validateDocumentFile(uploadTestFile('bank_statement.xlsx')).isValid).toBe(true)

    // File over 15 MB
    const largeFile = uploadTestFile('large.pdf')
    Object.defineProperty(largeFile, 'size', { value: 16 * 1024 * 1024 })
    const resLarge = validateDocumentFile(largeFile)
    expect(resLarge.isValid).toBe(false)
    expect(resLarge.error).toContain('Maximum size is 15.0 MB')
  })

  it('handles uploading, viewing, and removing a document correctly', async () => {
    const handleChange = vi.fn()

    const { rerender } = render(
      <DocumentVerification
        data={DEFAULT_MOCK_DATA}
        onChange={handleChange}
        errors={{}}
      />
    )

    // Find the PAN Card file input and upload a file
    const panCardNode = screen.getByTestId('doc-card-panCard')
    const fileInput = panCardNode.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    const testFile = uploadTestFile('company_pan.pdf')
    await pickFiles(fileInput, [testFile])

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadedDocs: expect.objectContaining({
          panCard: expect.objectContaining({
            name: 'company_pan.pdf',
          }),
        }),
      })
    )

    // Now re-render with the uploaded PAN Card
    const dataWithUploadedPan: BusinessLoanFormData = {
      ...DEFAULT_MOCK_DATA,
      uploadedDocs: {
        panCard: {
          id: 'panCard',
          name: 'company_pan.pdf',
          size: '1.2 MB',
          uploadedAt: new Date().toISOString(),
        },
      },
    }

    rerender(
      <DocumentVerification
        data={dataWithUploadedPan}
        onChange={handleChange}
        errors={{}}
      />
    )

    // Should now show "Uploaded" badge, "View Document", and delete button
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByTestId('view-doc-panCard')).toBeInTheDocument()
    expect(screen.getByTestId('delete-doc-panCard')).toBeInTheDocument()

    // Test removing document
    fireEvent.click(screen.getByTestId('delete-doc-panCard'))
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadedDocs: {},
      })
    )
  })

  it('validates required documents in validateStep4Documents without requiring optional Udyam', () => {
    // Empty docs should fail validation
    const emptyValidation = validateStep4Documents(DEFAULT_MOCK_DATA)
    expect(emptyValidation.isValid).toBe(false)
    expect(emptyValidation.errors.panCard).toBeDefined()
    expect(emptyValidation.errors.aadhaarCard).toBeDefined()
    expect(emptyValidation.errors.directorsKyc).toBeDefined()
    expect(emptyValidation.errors.businessAddressProof).toBeDefined()
    expect(emptyValidation.errors.bankStatements).toBeDefined()
    expect(emptyValidation.errors.gstCertificate).toBeDefined()
    expect(emptyValidation.errors.gstReturns).toBeDefined()
    expect(emptyValidation.errors.businessItr).toBeDefined()
    expect(emptyValidation.errors.auditedBalanceSheet).toBeDefined()
    expect(emptyValidation.errors.profitAndLossStatement).toBeDefined()
    expect(emptyValidation.errors.cashFlowStatement).toBeDefined()
    expect(emptyValidation.errors.businessExpansionDoc).toBeDefined()
    expect(emptyValidation.errors.businessRegistrationProof).toBeDefined()
    // Udyam is optional, so no error for it
    expect(emptyValidation.errors.udyamCertificate).toBeUndefined()

    // Provide all 13 required docs
    const allRequiredUploaded: BusinessLoanFormData = {
      ...DEFAULT_MOCK_DATA,
      uploadedDocs: {
        panCard: { name: 'pan.pdf', size: '1 MB', uploadedAt: '' },
        aadhaarCard: { name: 'aadhaar.pdf', size: '1 MB', uploadedAt: '' },
        directorsKyc: { name: 'kyc.pdf', size: '1 MB', uploadedAt: '' },
        businessAddressProof: { name: 'address.pdf', size: '1 MB', uploadedAt: '' },
        bankStatements: { name: 'bank.pdf', size: '1 MB', uploadedAt: '' },
        gstCertificate: { name: 'gst.pdf', size: '1 MB', uploadedAt: '' },
        gstReturns: { name: 'returns.pdf', size: '1 MB', uploadedAt: '' },
        businessItr: { name: 'itr.pdf', size: '1 MB', uploadedAt: '' },
        auditedBalanceSheet: { name: 'balance.pdf', size: '1 MB', uploadedAt: '' },
        profitAndLossStatement: { name: 'pnl.pdf', size: '1 MB', uploadedAt: '' },
        cashFlowStatement: { name: 'cashflow.pdf', size: '1 MB', uploadedAt: '' },
        businessExpansionDoc: { name: 'expansion.pdf', size: '1 MB', uploadedAt: '' },
        businessRegistrationProof: { name: 'proof.pdf', size: '1 MB', uploadedAt: '' },
      },
    }

    const fullValidation = validateStep4Documents(allRequiredUploaded)
    expect(fullValidation.isValid).toBe(true)
    expect(Object.keys(fullValidation.errors).length).toBe(0)
  })

  it('allows advancing from Step 1 to Step 2 to Step 3 to Step 4 and navigating back with preserved data', async () => {
    localStorage.clear()

    render(
      <MemoryRouter>
        <BusinessLoan />
      </MemoryRouter>
    )

    // Complete Step 1 inputs
    fireEvent.change(screen.getByLabelText('Required Loan Amount'), {
      target: { value: '2500000-5000000' },
    })
    fireEvent.change(screen.getByLabelText('Preferred Tenure'), {
      target: { value: '36' },
    })
    fireEvent.change(screen.getByLabelText('Purpose of Loan'), {
      target: { value: 'Working Capital' },
    })
    fireEvent.change(screen.getByLabelText('Monthly or Annual Revenue'), {
      target: { value: '500000' },
    })
    fireEvent.click(screen.getByTestId('employment-option-salaried'))
    fireEvent.click(screen.getByTestId('existing-loan-option-none'))

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Enterprise & Commercial Profile')).toBeInTheDocument()

    // Fill Step 2 mandatory fields
    fireEvent.change(screen.getByLabelText(/Registered Business \/ Firm Name/), {
      target: { value: 'Apex Enterprises Pvt Ltd' },
    })
    fireEvent.change(screen.getByLabelText(/^GSTIN/), {
      target: { value: '27ABCDE1234F1Z5' },
    })
    fireEvent.click(screen.getByTestId('business-constitution-dropdown'))
    fireEvent.click(screen.getByRole('option', { name: 'Private Limited' }))
    fireEvent.click(screen.getByTestId('udyam-toggle-no'))
    fireEvent.click(screen.getByTestId('business-vintage-dropdown'))
    fireEvent.click(screen.getByRole('option', { name: '3–5 Years' }))
    fireEvent.change(screen.getByLabelText(/Annual Turnover/), {
      target: { value: '5000000' },
    })
    fireEvent.change(screen.getByLabelText(/Annual Net Profit/), {
      target: { value: '500000' },
    })
    fireEvent.change(screen.getByLabelText(/^Name/), {
      target: { value: 'Ramesh Kumar' },
    })
    fireEvent.change(screen.getByLabelText(/^Designation/), {
      target: { value: 'Director' },
    })

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Banking & Tax Records')).toBeInTheDocument()

    // Fill Step 3 mandatory fields
    fireEvent.click(screen.getByTestId('bank-name-dropdown'))
    fireEvent.click(screen.getByRole('option', { name: 'HDFC Bank' }))
    fireEvent.change(screen.getByLabelText('Current Account Number'), {
      target: { value: '50200012345678' },
    })
    fireEvent.change(screen.getByLabelText('Bank IFSC Code'), {
      target: { value: 'HDFC0001234' },
    })

    // Advance to Step 4 (Document Verification)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Document Verification')).toBeInTheDocument()
    expect(screen.getByTestId('step-document-verification')).toBeInTheDocument()

    // Check Stepper status: Steps 1, 2, 3 completed, Step 4 active
    expect(screen.getByLabelText(/Loan & Applicant \(completed\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Business \(completed\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Banking \(completed\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Documents \(active\)/)).toBeInTheDocument()

    // Upload a document in Step 4
    const panNode = screen.getByTestId('doc-card-panCard')
    const panInput = panNode.querySelector('input[type="file"]') as HTMLInputElement
    const panFile = uploadTestFile('company_pan.pdf')
    await pickFiles(panInput, [panFile])

    // Verify uploaded badge appears for PAN
    expect(panNode).toHaveTextContent('Uploaded')

    // Click Back to Step 3
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Banking & Tax Records')).toBeInTheDocument()
    expect(screen.getByLabelText('Current Account Number')).toHaveValue('50200012345678')

    // Click Continue to return to Step 4
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('Document Verification')).toBeInTheDocument()

    // PAN document remains uploaded when navigating between steps
    const returnedPanNode = screen.getByTestId('doc-card-panCard')
    expect(returnedPanNode).toHaveTextContent('Uploaded')
  })
})

