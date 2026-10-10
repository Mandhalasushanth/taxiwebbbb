// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { pickFiles, uploadTestFile } from './helpers/uploadTestFiles'
import { cleanup } from '@testing-library/react'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TaxNoticeAssistance } from '../../src/modules/itr/components/TaxNoticeAssistance/TaxNoticeAssistance'
import { userStorage } from '../../src/core/storage/userStorage'
import { localStore } from '../../src/core/storage/localStorage'

afterEach(() => {
  cleanup()
})

describe('TaxNoticeAssistance Component', () => {
  beforeEach(() => {
    localStorage.clear()
    // Drafts are auto-saved through localStore (cached in memory); start every test without one
    localStore.clear()
    window.scrollTo = () => {}
  })

  it('renders Step 1 with form fields, step indicator, and bottom actions', () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/Step 1: Notice Details/i)).toBeDefined()
    expect(screen.getByText('Enter Notice Information')).toBeDefined()
    expect(screen.getByText('Back')).toBeDefined()
    expect(screen.getByText('Save Draft & Exit')).toBeDefined()
    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined()
  })

  it('validates required fields and prevents proceeding when empty', () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueBtn)

    // Should stay on Step 1
    expect(screen.getByLabelText(/Step 1: Notice Details/i)).toBeDefined()
  })

  it('proceeds to Step 2 when form is filled and displays summary review', () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    // Fill in required fields
    const panInput = screen.getByLabelText(/Permanent Account Number/i)
    fireEvent.change(panInput, { target: { value: 'CASPJ4743E' } })

    fireEvent.change(screen.getByLabelText(/Assessment Year/i), { target: { value: 'AY 2025-26' } })
    fireEvent.change(screen.getByLabelText(/Notice Type/i), { target: { value: 'Section 143(1)(a) - Proposed Adjustment' } })

    const dateInputs = screen.getAllByLabelText(/Notice Date|Response Due Date/i)
    fireEvent.change(dateInputs[0], { target: { value: '2026-09-22' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-10-15' } })

    const refInput = screen.getByLabelText(/Notice Reference Number/i)
    fireEvent.change(refInput, { target: { value: 'CPC/2526/A3/284419260' } })

    const explanationInput = screen.getByLabelText(/Your Explanation/i)
    fireEvent.change(explanationInput, { target: { value: 'Received 143(1) intimation discrepancy.' } })

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueBtn)

    // Should advance to Step 2
    expect(screen.getByTestId('notice-stepper')).toBeDefined()
    expect(screen.getByLabelText(/Step 2: Upload Notice/i)).toBeDefined()
    expect(screen.getByText('Upload your Income Tax notice')).toBeDefined()
    expect(screen.getByText('Entered Notice Information')).toBeDefined()
    expect(screen.getByText('CASPJ4743E')).toBeDefined()
    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined()
  })

  it('allows navigating back to Step 1 via Back button on Step 2', () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    // Fill fields and advance
    fireEvent.change(screen.getByLabelText(/Permanent Account Number/i), { target: { value: 'CASPJ4743E' } })
    fireEvent.change(screen.getByLabelText(/Assessment Year/i), { target: { value: 'AY 2025-26' } })
    fireEvent.change(screen.getByLabelText(/Notice Type/i), { target: { value: 'Section 143(1)(a) - Proposed Adjustment' } })
    const dateInputs = screen.getAllByLabelText(/Notice Date|Response Due Date/i)
    fireEvent.change(dateInputs[0], { target: { value: '2026-09-22' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-10-15' } })
    fireEvent.change(screen.getByLabelText(/Notice Reference Number/i), { target: { value: 'CPC/2526/A3/284419260' } })
    fireEvent.change(screen.getByLabelText(/Your Explanation/i), { target: { value: 'Testing explanation.' } })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByLabelText(/Step 2: Upload Notice/i)).toBeDefined()

    // Click Back on Step 2
    fireEvent.click(screen.getByTestId('step-back-btn'))
    expect(screen.getByLabelText(/Step 1: Notice Details/i)).toBeDefined()
  })

  it('progresses through NoticeSummary, SupportingDocuments, ReviewResponse, and NoticeStatus', async () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    // Step 1 -> Step 2
    fireEvent.change(screen.getByLabelText(/Permanent Account Number/i), { target: { value: 'CASPJ4743E' } })
    fireEvent.change(screen.getByLabelText(/Assessment Year/i), { target: { value: 'AY 2025-26' } })
    fireEvent.change(screen.getByLabelText(/Notice Type/i), { target: { value: 'Section 143(1)(a) - Proposed Adjustment' } })
    const dateInputs = screen.getAllByLabelText(/Notice Date|Response Due Date/i)
    fireEvent.change(dateInputs[0], { target: { value: '2026-09-22' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-10-15' } })
    fireEvent.change(screen.getByLabelText(/Notice Reference Number/i), { target: { value: 'CPC/2526/A3/284419260' } })
    fireEvent.change(screen.getByLabelText(/Your Explanation/i), { target: { value: 'Testing submission.' } })
    fireEvent.click(screen.getByTestId('step-continue-btn'))

    // Step 2: Notice Document -> Upload Notice file -> Step 3: Notice Summary
    expect(screen.getByLabelText(/Step 2: Upload Notice/i)).toBeDefined()
    const noticeFileInput = document.querySelector('input[type="file"]')
    const noticeFile = uploadTestFile('Notice_143_1_a.pdf')
    await pickFiles(noticeFileInput!, [noticeFile])

    const continueToReviewBtn = screen.getByRole('button', { name: /continue to staff review/i })
    expect(continueToReviewBtn.getAttribute('disabled')).toBeNull()
    fireEvent.click(continueToReviewBtn)

    // Step 3: Notice Summary -> Step 4: Supporting Documents
    expect(screen.getByText("Here's what this notice means")).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'What this notice means' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: /upload supporting documents/i }))

    // Step 4: Supporting Documents -> Upload required documents -> Step 5: Review Response
    expect(screen.getByText('Upload Supporting Documents')).toBeDefined()
    expect(screen.getByText(/ITR Acknowledgement/i)).toBeDefined()

    // Upload required documents
    const step4Inputs = document.querySelectorAll('input[type="file"]')
    const sampleDoc = uploadTestFile('doc.pdf')
    // One pick at a time, each waiting for the upload rule's check
    await Array.from(step4Inputs).reduce<Promise<void>>(
      (previous, input) => previous.then(() => pickFiles(input as HTMLElement, [sampleDoc])),
      Promise.resolve(),
    )

    const submitDocsBtn = screen.getByRole('button', { name: /submit documents & review response/i })
    expect(submitDocsBtn.getAttribute('disabled')).toBeNull()
    fireEvent.click(submitDocsBtn)

    // Step 5: Review Response
    expect(screen.getByText('Please review our response')).toBeDefined()
    expect(screen.getByText(/Why Assessee Review is Required/i)).toBeDefined()

    // Confirm checkbox and submit
    const confirmCheckbox = screen.getByRole('checkbox')
    fireEvent.click(confirmCheckbox)

    const approveBtn = screen.getByRole('button', { name: /approve & submit/i })
    expect(approveBtn).toBeDefined()
    fireEvent.click(approveBtn)

    // Step 6: Notice Status
    expect(await screen.findByText('Response Submitted Successfully', {}, { timeout: 5000 })).toBeDefined()
    expect(screen.getByText('Notice & Details Provided')).toBeDefined()
    expect(screen.getByText('Back to Tax Services')).toBeDefined()

    const apps = userStorage.getUserApplications()
    expect(apps.length).toBeGreaterThan(0)
    expect(apps[0].code).toMatch(/^NOT-/)
  }, 15000) // long multi-step UI flow: allow for a busy test runner

  it('handles uploading, viewing, and deleting supporting documents with Image 3 actions bar', async () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    // Advance to Step 4: Supporting Documents
    fireEvent.change(screen.getByLabelText(/Permanent Account Number/i), { target: { value: 'CASPJ4743E' } })
    fireEvent.change(screen.getByLabelText(/Assessment Year/i), { target: { value: 'AY 2025-26' } })
    fireEvent.change(screen.getByLabelText(/Notice Type/i), { target: { value: 'Section 143(1)(a) - Proposed Adjustment' } })
    const dateInputs = screen.getAllByLabelText(/Notice Date|Response Due Date/i)
    fireEvent.change(dateInputs[0], { target: { value: '2026-09-22' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-10-15' } })
    fireEvent.change(screen.getByLabelText(/Notice Reference Number/i), { target: { value: 'CPC/2526/A3/284419260' } })
    fireEvent.change(screen.getByLabelText(/Your Explanation/i), { target: { value: 'Document flow test.' } })
    fireEvent.click(screen.getByTestId('step-continue-btn'))

    // Step 2 -> Upload notice file -> Step 3
    const noticeInput = document.querySelector('input[type="file"]')
    const noticeSample = uploadTestFile('Notice.pdf')
    await pickFiles(noticeInput!, [noticeSample])
    fireEvent.click(screen.getByRole('button', { name: /continue to staff review/i }))

    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /upload supporting documents/i }))
    expect(screen.getByText('Upload Supporting Documents')).toBeDefined()

    // Verify "Upload File" buttons exist
    const uploadFileButtons = screen.getAllByRole('button', { name: /Upload File/i })
    expect(uploadFileButtons.length).toBeGreaterThan(0)

    // Simulate file input change on the first file input
    const fileInputs = document.querySelectorAll('input[type="file"]')
    const sampleFile = uploadTestFile('GST_Compliance_10_Fields_Professional.xlsx')
    await pickFiles(fileInputs[0], [sampleFile])

    // Card should now show Uploaded badge and filename
    expect(screen.getByText('Uploaded')).toBeDefined()
    expect(screen.getByText(/GST_Compliance_10_Fields_Professional.xlsx/i)).toBeDefined()

    // Card should show View Document, Replace, and Delete trash button
    expect(screen.getByText('View Document')).toBeDefined()
    expect(screen.getByText('Replace')).toBeDefined()
    const deleteBtn = screen.getByRole('button', { name: /^Delete /i })
    expect(deleteBtn).toBeDefined()

    // Click delete trash button to remove file
    fireEvent.click(deleteBtn)

    // File should be removed and "Upload File" button restored
    expect(screen.queryByText(/GST_Compliance_10_Fields_Professional.xlsx/i)).toBeNull()
  })

  it('supports selecting AY 2027-28 and custom Other assessment year', () => {
    render(
      <MemoryRouter>
        <TaxNoticeAssistance />
      </MemoryRouter>
    )

    // Verify AY 2027-28 and Other exist in select
    const select = screen.getByLabelText(/Assessment Year/i) as HTMLSelectElement
    const optionValues = Array.from(select.options).map((o) => o.value)
    expect(optionValues).toContain('AY 2027-28')
    expect(optionValues).toContain('Other')

    // Selecting Other swaps select for custom text input in the same area
    fireEvent.change(select, { target: { value: 'Other' } })

    const customInput = screen.getByPlaceholderText(/E.g., AY 2028-29/i) as HTMLInputElement
    expect(customInput).toBeDefined()

    // Type a custom AY
    fireEvent.change(customInput, { target: { value: 'AY 2020-21' } })
    expect(customInput.value).toBe('AY 2020-21')

    // Click circular cross button to clear and switch back to select
    const clearCrossBtn = screen.getByRole('button', { name: /Clear and choose from list/i })
    fireEvent.click(clearCrossBtn)

    const restoredSelect = screen.getByLabelText(/Assessment Year/i) as HTMLSelectElement
    expect(restoredSelect).toBeDefined()
  })
})
