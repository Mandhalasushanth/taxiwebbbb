// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GSTFilingPeriod } from '../../src/modules/gst/components/GSTFiling/GSTFilingPeriod/GSTFilingPeriod'
import { GSTFilingDocuments } from '../../src/modules/gst/components/GSTFiling/GSTFilingDocuments/GSTFilingDocuments'
import { GSTFilingReview } from '../../src/modules/gst/components/GSTFiling/GSTFilingReview/GSTFilingReview'
import { GSTFilingStepper } from '../../src/modules/gst/shared/GSTFilingStepper/GSTFilingStepper'
import { GSTReviewTaxComputationCard } from '../../src/modules/gst/components/GSTFiling/GSTFilingReview/GSTReviewComputation'

beforeEach(() => {
  // Mock window.scrollTo for jsdom
  window.scrollTo = vi.fn()
  Object.assign(URL, {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GST Filing - Step 1: Filing Period & Nil Return vs Regular Return', () => {
  it('hides Calculation Method and Filing Return Type dropdown when Nil Return is selected', () => {
    render(
      <GSTFilingPeriod
        initialData={{
          frequency: 'Monthly',
          financialYear: 'FY 2025-26',
          selectedMonth: 'April 2025',
          gstin: '29AAAAA0000A1Z5',
          filingType: 'regular',
        }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    // Regular return initially shows Calculation Method and Filing Return Type
    expect(screen.getByText('Tax Calculation Method')).toBeDefined()
    expect(screen.getByLabelText(/Filing Return Type/i)).toBeDefined()

    // Switch to Nil Return
    const nilReturnRadio = screen.getByRole('radio', { name: /Nil Return/i })
    fireEvent.click(nilReturnRadio)

    // Calculation Method card and Return Type dropdown should not be present
    expect(screen.queryByText('Tax Calculation Method')).toBeNull()
    expect(screen.queryByLabelText(/Filing Return Type/i)).toBeNull()
  })

  it('allows Nil Return to submit with only Filing Frequency, FY, Return Period, and GSTIN without requiring calculation method', () => {
    const handleContinue = vi.fn()
    render(
      <GSTFilingPeriod
        initialData={{
          frequency: 'Monthly',
          financialYear: 'FY 2025-26',
          selectedMonth: 'April 2025',
          gstin: '29AAAAA0000A1Z5',
          filingType: 'nil',
        }}
        onContinue={handleContinue}
        onCancel={vi.fn()}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(submitBtn)

    expect(handleContinue).toHaveBeenCalledTimes(1)
    const passedData = handleContinue.mock.calls[0][0]
    expect(passedData.filingType).toBe('nil')
    expect(passedData.returnType).toBe('nil')
    expect(passedData.calculationMethod).toBe('')
  })

  it('validates GSTIN format and blocks submission if invalid', () => {
    const handleContinue = vi.fn()
    render(
      <GSTFilingPeriod
        initialData={{
          frequency: 'Monthly',
          financialYear: 'FY 2025-26',
          selectedMonth: 'April 2025',
          gstin: 'INVALIDGSTIN',
          filingType: 'nil',
        }}
        onContinue={handleContinue}
        onCancel={vi.fn()}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(submitBtn)

    expect(handleContinue).not.toHaveBeenCalled()
    expect(screen.getByText(/GSTIN must be exactly 15 characters/i)).toBeDefined()
  })

  it('validates monetary figures when estimated figures is selected for Regular Return', () => {
    const handleContinue = vi.fn()
    render(
      <GSTFilingPeriod
        initialData={{
          frequency: 'Monthly',
          financialYear: 'FY 2025-26',
          selectedMonth: 'April 2025',
          gstin: '29AAAAA0000A1Z5',
          filingType: 'regular',
          returnType: 'gstr1',
          calculationMethod: 'estimated_figures',
          estimatedSales: '',
          estimatedPurchases: '',
          estimatedItc: '',
        }}
        onContinue={handleContinue}
        onCancel={vi.fn()}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(submitBtn)

    expect(handleContinue).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter estimated taxable sales')).toBeDefined()
    expect(screen.getByText('Please enter estimated taxable purchases')).toBeDefined()
    expect(screen.getByText('Please enter estimated eligible ITC')).toBeDefined()
  })
})

describe('GST Filing - Stepper Behavior', () => {
  it('renders all 3 steps in the progress stepper even for Nil Return (Filing Period -> Documents -> Review)', () => {
    render(<GSTFilingStepper currentStep={1} isNilReturn={true} />)

    expect(screen.getByText('Filing Period')).toBeDefined()
    expect(screen.getByText('Documents')).toBeDefined()
    expect(screen.getByText('Review')).toBeDefined()
  })

  it('renders a 3-step progress stepper for Regular Return (Filing Period -> Documents -> Review)', () => {
    render(<GSTFilingStepper currentStep={1} isNilReturn={false} />)

    expect(screen.getByText('Filing Period')).toBeDefined()
    expect(screen.getByText('Documents')).toBeDefined()
    expect(screen.getByText('Review')).toBeDefined()
  })
})

describe('GST Filing - Step 2: Upload Documents Validation', () => {
  it('enforces 10 MB file size limit and shows error when file exceeds 10 MB', async () => {
    render(
      <GSTFilingDocuments
        selectedMonth="April 2025"
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    )

    // Simulate uploading a file larger than 10 MB (e.g. 11 MB)
    const largeFile = new File(['x'.repeat(100)], 'huge-ledger.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
      await waitFor(() => {
        expect(screen.getByText(/10.*MB/i)).toBeDefined()
      })
    }
  })

  it('blocks progression and shows missing required documents warning if required files are not attached', () => {
    const handleNext = vi.fn()
    render(
      <GSTFilingDocuments
        selectedMonth="April 2025"
        uploadedFiles={{}}
        onBack={vi.fn()}
        onNext={handleNext}
      />
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    expect(handleNext).not.toHaveBeenCalled()
    expect(screen.getByText(/Please upload Sales Invoices/i)).toBeDefined()
  })
})

describe('GST Filing - Step 3: Review & Summary', () => {
  it('completely removes the Tax Computation card and Documents card for Nil Return', () => {
    render(
      <MemoryRouter>
        <GSTFilingReview
          filingData={{
            gstin: '29AAAAA0000A1Z5',
            businessName: 'Shree Deshmukh Traders',
            financialYear: 'FY 2025-26',
            selectedMonth: 'April 2025',
            frequency: 'Monthly',
            filingType: 'nil',
          }}
          onBack={vi.fn()}
          onApprove={vi.fn()}
        />
      </MemoryRouter>
    )

    // Filing Details should be visible
    expect(screen.getByText('Filing Details')).toBeDefined()
    expect(screen.getByText('Nil Return')).toBeDefined()
    expect(screen.getByText('Not Required (Nil Return)')).toBeDefined()

    // Tax Computation card and Documents card should NOT be rendered
    expect(screen.queryByText(/Tax Computation/i)).toBeNull()
    expect(screen.queryByText(/All Required Documents Attached/i)).toBeNull()
    expect(screen.queryByText(/Professional Filing Fee/i)).toBeNull()
  })

  it('renders pending state for Regular Return with CA calculation method', () => {
    render(
      <GSTReviewTaxComputationCard
        calculationMethod="ca_calculate"
        isPending={true}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Tax Computation')).toBeDefined()
    expect(screen.getByText('Pending CA Computation')).toBeDefined()
    expect(screen.getByText(/Let TaxEdge CA calculate from documents/i)).toBeDefined()
    const pendingValues = screen.getAllByText('— Pending')
    expect(pendingValues.length).toBe(5)
  })

  it('renders estimated figures for Regular Return with user estimated figures', () => {
    render(
      <GSTReviewTaxComputationCard
        turnover={1200000}
        purchases={600000}
        outputGst={216000}
        eligibleItc={108000}
        netLiability={108000}
        calculationMethod="estimated_figures"
        isPending={false}
        onEdit={vi.fn()}
      />
    )

    expect(screen.getByText('Tax Computation (Estimated)')).toBeDefined()
    expect(screen.getByText('Estimated Figures')).toBeDefined()
    expect(screen.getByText(/12,00,000/)).toBeDefined()
    expect(screen.getByText(/6,00,000/)).toBeDefined()
    expect(screen.getByText(/2,16,000/)).toBeDefined()
    const itcAndLiabilityElements = screen.getAllByText(/1,08,000/)
    expect(itcAndLiabilityElements.length).toBe(2)
  })

  it('confirms the absence of Professional Filing Fee card in Review', () => {
    render(
      <MemoryRouter>
        <GSTFilingReview
          filingData={{
            gstin: '29AAAAA0000A1Z5',
            businessName: 'Shree Deshmukh Traders',
            financialYear: 'FY 2025-26',
            selectedMonth: 'April 2025',
            frequency: 'Monthly',
            filingType: 'regular',
            calculationMethod: 'ca_calculate',
          }}
          onBack={vi.fn()}
          onApprove={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.queryByText(/Professional Filing Fee/i)).toBeNull()
    expect(screen.queryByText(/Total Payable/i)).toBeNull()
  })

  it('prompts user to submit documents when Regular Return has no documents uploaded, and redirects to Step 2 on Submit Documents click', () => {
    const handleEditDocs = vi.fn()
    const handleApprove = vi.fn()

    render(
      <MemoryRouter>
        <GSTFilingReview
          filingData={{
            gstin: '29AAAAA0000A1Z5',
            businessName: 'Shree Deshmukh Traders',
            financialYear: 'FY 2025-26',
            selectedMonth: 'April 2025',
            frequency: 'Monthly',
            filingType: 'regular',
            returnType: 'gstr1',
            calculationMethod: 'ca_calculate',
          }}
          uploadedFiles={{}}
          onEditDocuments={handleEditDocs}
          onBack={vi.fn()}
          onApprove={handleApprove}
        />
      </MemoryRouter>
    )

    // Should indicate documents are required
    expect(screen.getByText(/Documents Required/i)).toBeDefined()
    expect(screen.getByText(/Please upload all 12 required documents/i)).toBeDefined()

    // Next button in StepActionBar is named "Submit"
    const submitBtn = screen.getByRole('button', { name: 'Submit' })
    expect(submitBtn).toBeDefined()

    // Clicking Submit when documents are missing shows red error warning and does not call handleApprove
    fireEvent.click(submitBtn)
    expect(handleApprove).not.toHaveBeenCalled()
    expect(screen.getByText(/Please upload all required documents before submitting/i)).toBeDefined()

    // The red warning alert displays only the warning message without a button
    const alertBanner = screen.getByRole('alert')
    expect(alertBanner).toBeDefined()
    expect(within(alertBanner).queryByRole('button')).toBeNull()

    // Duplicate header "Upload" button is removed; only "Upload Documents" button in the card exists
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull()
    const uploadDocBtn = screen.getByRole('button', { name: 'Upload Documents' })
    expect(uploadDocBtn).toBeDefined()
    fireEvent.click(uploadDocBtn)
    expect(handleEditDocs).toHaveBeenCalledTimes(1)
  })

  it('allows Submit when required documents are uploaded for Regular Return and provides Edit option', () => {
    const handleApprove = vi.fn()
    const handleEditDocs = vi.fn()
    const allDocsUploaded = {
      'sales-invoices': { name: 'sales.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'credit-notes': { name: 'credit.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'debit-notes': { name: 'debit.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'irn-data': { name: 'irn.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'eway-data': { name: 'eway.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'purchase-invoices': { name: 'purchase.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'gstr2b-statement': { name: 'gstr2b.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'expense-invoices': { name: 'expense.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'bank-statements': { name: 'bank.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'prev-gst-returns': { name: 'prev.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'prev-filing-ack': { name: 'ack.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
      'other-supporting-docs': { name: 'other.pdf', sizeText: '1 MB', uploadTime: '10:00 AM', status: 'verified' as const },
    }

    render(
      <MemoryRouter>
        <GSTFilingReview
          filingData={{
            gstin: '29AAAAA0000A1Z5',
            businessName: 'Shree Deshmukh Traders',
            financialYear: 'FY 2025-26',
            selectedMonth: 'April 2025',
            frequency: 'Monthly',
            filingType: 'regular',
            returnType: 'gstr1',
            calculationMethod: 'ca_calculate',
          }}
          uploadedFiles={allDocsUploaded}
          onEditDocuments={handleEditDocs}
          onBack={vi.fn()}
          onApprove={handleApprove}
        />
      </MemoryRouter>
    )

    // Should indicate all required documents attached
    expect(screen.getByText('All Required Documents Attached')).toBeDefined()

    // Shows Edit option in header after uploading to redirect to step 2 page
    const editDocsBtn = screen.getByRole('button', { name: 'Edit Documents' })
    expect(editDocsBtn).toBeDefined()
    fireEvent.click(editDocsBtn)
    expect(handleEditDocs).toHaveBeenCalledTimes(1)

    // Next button in StepActionBar should say "Submit"
    const submitBtn = screen.getByRole('button', { name: 'Submit' })
    expect(submitBtn).toBeDefined()

    // Clicking Submit calls handleApprove
    fireEvent.click(submitBtn)
    expect(handleApprove).toHaveBeenCalledTimes(1)
  })
})
