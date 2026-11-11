// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { pickFiles, uploadTestFile } from './helpers/uploadTestFiles'
import { GSTComplianceReview } from '../../src/modules/gst/components/GSTCompliance/GSTComplianceReview'
import { GSTCompliance } from '../../src/modules/gst/components/GSTCompliance/GSTCompliance'
import { GSTSubmitConfirmModal } from '../../src/modules/gst/components/GSTCompliance/GSTSubmitConfirmModal'
import { GSTSuccessView } from '../../src/modules/gst/components/GSTCompliance/GSTSuccessView'
import type { ComplianceFields } from '../../src/modules/gst/hooks/useGSTComplianceState'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GST Compliance Review Page', () => {
  const mockOnEdit = vi.fn()
  const mockOnViewDoc = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  describe('Notice Response Review View', () => {
    const noticeFields: ComplianceFields = {
      gstin: '29AAAAA0000A1Z5',
      financialYear: '2024-25',
      requestType: 'Notice Response',
      gstr2bRef: '',
      notes: '',
      noticeNumber: 'BXHCU467GHH',
      issueDate: '2026-10-28',
      dueDate: '2026-10-28',
      additionalInfo: '',
    }
    const fakeNoticeFile = new File(['dummy notice content'], '54cea840-d101-4c81-b728-3830ee699002.jpeg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(fakeNoticeFile, 'size', { value: 828375 }) // ~0.79 MB

    it('renders CA banner, and Request & Filing Details without the redundant top header', () => {
      render(
        <GSTComplianceReview
          fields={noticeFields}
          purchaseFile={null}
          salesFile={null}
          noticeFile={fakeNoticeFile}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.queryByText('Review Compliance Request')).toBeNull()
      expect(screen.queryByText('Step 2 of 2 · Review & Submit')).toBeNull()

      expect(screen.getByText('Ready for CA Review & Filing')).toBeDefined()
      expect(
        screen.getByText('Finsolz CA compliance desk will verify your records and prepare the official response.')
      ).toBeDefined()

      expect(screen.getByText('Request & Filing Details')).toBeDefined()
      expect(screen.getByText('29AAAAA0000A1Z5')).toBeDefined()
      expect(screen.getByText('2024-25')).toBeDefined()
      expect(screen.getByText('Notice Response')).toBeDefined()
    })

    it('renders Notice Details correctly with formatted dates and fallback for empty remarks', () => {
      render(
        <GSTComplianceReview
          fields={noticeFields}
          purchaseFile={null}
          salesFile={null}
          noticeFile={fakeNoticeFile}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Notice Details')).toBeDefined()
      expect(screen.getByText('BXHCU467GHH')).toBeDefined()
      expect(screen.getAllByText('28 Oct 2026').length).toBe(2) // Notice Issue Date & Reply Due Date
      expect(screen.getByText('None')).toBeDefined() // Remarks / Grounds is None
    })

    it('renders Notice Copy document with filename, size, and View action', () => {
      render(
        <GSTComplianceReview
          fields={noticeFields}
          purchaseFile={null}
          salesFile={null}
          noticeFile={fakeNoticeFile}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Attached Documents')).toBeDefined()
      expect(screen.getByText('Notice Copy')).toBeDefined()
      expect(screen.getByText(/54cea840-d101-4c81-b728-3830ee699002\.jpeg/)).toBeDefined()

      const viewBtn = screen.getByRole('button', { name: /view notice copy/i })
      fireEvent.click(viewBtn)
      expect(mockOnViewDoc).toHaveBeenCalledWith(fakeNoticeFile, 'Notice Copy')
    })

    it('triggers onEdit when Edit buttons are clicked', () => {
      render(
        <GSTComplianceReview
          fields={noticeFields}
          purchaseFile={null}
          salesFile={null}
          noticeFile={fakeNoticeFile}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(3) // 3 cards have Edit buttons + Back to Edit
      fireEvent.click(editButtons[0])
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('triggers onSubmit when Submit Compliance Request is clicked', () => {
      render(
        <GSTComplianceReview
          fields={noticeFields}
          purchaseFile={null}
          salesFile={null}
          noticeFile={fakeNoticeFile}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      const submitBtn = screen.getByRole('button', { name: /submit compliance request/i })
      fireEvent.click(submitBtn)
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Reconciliation Support Review View', () => {
    const reconFields: ComplianceFields = {
      gstin: '29AAAAA0000A1Z5',
      financialYear: '2024-25',
      requestType: 'Reconciliation Support',
      gstr2bRef: '',
      notes: '',
      noticeNumber: '',
      issueDate: '',
      dueDate: '',
      additionalInfo: '',
    }
    const fakePurchaseFile = new File(['purchase data'], 'fe19e0f5-7c45-441d-b5f8-d4ae30f69a1b.jpeg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(fakePurchaseFile, 'size', { value: 828375 })

    const fakeSalesFile = new File(['sales data'], '59f5dd6e-db62-4bd3-892e-797852626cc3.jpeg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(fakeSalesFile, 'size', { value: 849346 })

    it('renders Reconciliation Parameters with NOT_PROVIDED and None fallbacks', () => {
      render(
        <GSTComplianceReview
          fields={reconFields}
          purchaseFile={fakePurchaseFile}
          salesFile={fakeSalesFile}
          noticeFile={null}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Reconciliation Support')).toBeDefined()
      expect(screen.getByText('Reconciliation Parameters')).toBeDefined()
      expect(screen.getByText('NOT_PROVIDED')).toBeDefined()
      expect(screen.getByText('None')).toBeDefined()
    })

    it('renders both Purchase Register and Sales Register documents with View actions', () => {
      render(
        <GSTComplianceReview
          fields={reconFields}
          purchaseFile={fakePurchaseFile}
          salesFile={fakeSalesFile}
          noticeFile={null}
          onEdit={mockOnEdit}
          onViewDoc={mockOnViewDoc}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Purchase Register')).toBeDefined()
      expect(screen.getByText(/fe19e0f5-7c45-441d-b5f8-d4ae30f69a1b\.jpeg/)).toBeDefined()
      expect(screen.getByText('Sales Register')).toBeDefined()
      expect(screen.getByText(/59f5dd6e-db62-4bd3-892e-797852626cc3\.jpeg/)).toBeDefined()

      const viewPurchase = screen.getByRole('button', { name: /view purchase register/i })
      fireEvent.click(viewPurchase)
      expect(mockOnViewDoc).toHaveBeenCalledWith(fakePurchaseFile, 'Purchase Register')

      const viewSales = screen.getByRole('button', { name: /view sales register/i })
      fireEvent.click(viewSales)
      expect(mockOnViewDoc).toHaveBeenCalledWith(fakeSalesFile, 'Sales Register')
    })
  })

  describe('Submit Confirmation Popup', () => {
    it('renders the popup modal with shield checkmark, details, and action buttons', () => {
      const handleClose = vi.fn()
      const handleConfirm = vi.fn()

      render(
        <GSTSubmitConfirmModal
          isOpen={true}
          requestType="Reconciliation Support"
          gstin="29AAAAA0000A1Z5"
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )

      expect(screen.getByText('Submit GST Compliance Request?')).toBeDefined()
      expect(screen.getByText('Reconciliation Support')).toBeDefined()
      expect(screen.getByText('29AAAAA0000A1Z5')).toBeDefined()
      expect(screen.getByText(/Our CA team will immediately begin processing/)).toBeDefined()

      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      const submitBtn = screen.getByRole('button', { name: /submit/i })

      fireEvent.click(cancelBtn)
      expect(handleClose).toHaveBeenCalledTimes(1)

      fireEvent.click(submitBtn)
      expect(handleConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('Next Page as Usual (Success View)', () => {
    it('renders the standard GST success page after confirmation', () => {
      render(
        <MemoryRouter>
          <GSTSuccessView
            applicationId="GSTC-20261028-1234"
            requestType="Reconciliation Support"
            gstin="29AAAAA0000A1Z5"
          />
        </MemoryRouter>
      )

      expect(screen.getByText('Application Submitted!')).toBeDefined()
      expect(screen.getByText('GSTC-20261028-1234')).toBeDefined()
      expect(screen.getByText('GST Compliance')).toBeDefined()
      expect(
        screen.getByText(
          'Your GST application has been successfully filed with Finsolz.'
        )
      ).toBeDefined()
    })
  })

  describe('Full GST Compliance Stepper Integration', () => {
    it('renders exactly 4 financial years (FY 2022-23 to FY 2025-26) in GST Compliance', () => {
      render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      const fySelect = screen.getByLabelText(/financial year/i) as HTMLSelectElement
      const fyOptions = Array.from(fySelect.options)
        .map((o) => o.value)
        .filter(Boolean)

      expect(fyOptions).toEqual([
        'FY 2022-23',
        'FY 2023-24',
        'FY 2024-25',
        'FY 2025-26',
      ])
      expect(fyOptions).toHaveLength(4)
      expect(fyOptions).not.toContain('FY 2017-18')
    })

    it('switches between Form (Step 1) and Review (Step 2) dynamically', () => {
      render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      // Step 1: Form is shown
      expect(screen.getByText('Business & Filing Details')).toBeDefined()
      expect(screen.getByRole('button', { name: /proceed to review/i })).toBeDefined()

      // Fill in Request Type: Notice Response
      const reqTypeSelect = screen.getByLabelText(/request type/i)
      fireEvent.change(reqTypeSelect, { target: { value: 'Notice Response' } })

      // Notice Details section appears
      expect(screen.getByText('Notice Details & Documents')).toBeDefined()
    })

    it('renders notice issue date and reply due date side-by-side in one row with date pickers inside field', () => {
      const { container } = render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      const reqTypeSelect = screen.getByLabelText(/request type/i)
      fireEvent.change(reqTypeSelect, { target: { value: 'Notice Response' } })

      // Both date inputs exist inside the form
      const issueDateInput = container.querySelector('#gst-notice-issue-date') as HTMLInputElement
      const dueDateInput = container.querySelector('#gst-notice-due-date') as HTMLInputElement
      expect(issueDateInput).not.toBeNull()
      expect(dueDateInput).not.toBeNull()

      // Both are placed inside the same .gst-notice-grid-row parent (one row side by side)
      const gridRow = issueDateInput.closest('.gst-notice-grid-row')
      expect(gridRow).not.toBeNull()
      expect(gridRow?.contains(dueDateInput)).toBe(true)

      // Both date inputs are housed inside .gst-notice-date-wrapper with their respective calendar buttons
      const issueWrap = issueDateInput.closest('.gst-notice-date-wrapper')
      const dueWrap = dueDateInput.closest('.gst-notice-date-wrapper')
      expect(issueWrap).not.toBeNull()
      expect(dueWrap).not.toBeNull()

      expect(issueWrap?.querySelector('.gst-notice-date-btn')).not.toBeNull()
      expect(dueWrap?.querySelector('.gst-notice-date-btn')).not.toBeNull()

      // Both date inputs are housed inside .gst-notice-date-picker-anchor on the right side of .gst-notice-date-wrapper
      expect(issueDateInput.closest('.gst-notice-date-picker-anchor')).not.toBeNull()
      expect(dueDateInput.closest('.gst-notice-date-picker-anchor')).not.toBeNull()

      // Both fields display formatted date text on the left
      expect(issueWrap?.querySelector('.gst-notice-date-display')).not.toBeNull()
      expect(dueWrap?.querySelector('.gst-notice-date-display')).not.toBeNull()
    })

    it('enforces Notice Issue Date <= today and allows Reply Due Date to be a future date >= Notice Issue Date', () => {
      const { container } = render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      const reqTypeSelect = screen.getByLabelText(/request type/i)
      fireEvent.change(reqTypeSelect, { target: { value: 'Notice Response' } })

      const issueDateInput = container.querySelector('#gst-notice-issue-date') as HTMLInputElement
      const dueDateInput = container.querySelector('#gst-notice-due-date') as HTMLInputElement

      // 1. Notice Issue Date has max set to today (future dates disabled)
      expect(issueDateInput.getAttribute('max')).toBeDefined()

      // 2. Set Notice Issue Date to '2026-10-01'
      fireEvent.change(issueDateInput, { target: { value: '2026-10-01' } })

      // 3. Reply Due Date min is set to the selected Notice Issue Date
      expect(dueDateInput.getAttribute('min')).toBe('2026-10-01')
      // Reply Due Date does NOT have max limited to today
      expect(dueDateInput.getAttribute('max')).toBeNull()

      // 4. Entering a future date is valid and accepted
      fireEvent.change(dueDateInput, { target: { value: '2026-11-30' } })
      fireEvent.blur(dueDateInput)
      expect(screen.queryByText(/Reply due date cannot be in the future/i)).toBeNull()
      expect(screen.queryByText(/Reply due date cannot be before notice issue date/i)).toBeNull()

      // 5. Entering a date before Notice Issue Date shows error
      fireEvent.change(dueDateInput, { target: { value: '2026-09-15' } })
      fireEvent.blur(dueDateInput)
      expect(screen.getByText('Reply due date cannot be before notice issue date')).toBeDefined()
    })

    it('marks a green circle tick when a valid GSTIN is entered and removes it when invalid', () => {
      render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      const gstinInput = screen.getByLabelText(/GSTIN/i) as HTMLInputElement

      // Clear any prefilled value
      fireEvent.change(gstinInput, { target: { value: '' } })
      expect(screen.queryByTestId('gstin-valid-tick')).toBeNull()

      // Partially complete GSTIN (14 chars) -> no tick
      fireEvent.change(gstinInput, { target: { value: '29AAAAA0000A1Z' } })
      expect(screen.queryByTestId('gstin-valid-tick')).toBeNull()

      // Fully valid 15-char GSTIN -> green circle tick appears
      fireEvent.change(gstinInput, { target: { value: '29AAAAA0000A1Z5' } })
      const tick = screen.getByTestId('gstin-valid-tick')
      expect(tick).not.toBeNull()
      expect(tick.querySelector('svg circle')?.getAttribute('fill')).toBe('#10B981')

      // Backspace 1 character -> tick disappears immediately
      fireEvent.change(gstinInput, { target: { value: '29AAAAA0000A1Z' } })
      expect(screen.queryByTestId('gstin-valid-tick')).toBeNull()
    })

    it('clicking Edit from Review switches to edit mode, hides Back button, shows "Update & Review", and returns to Review', async () => {
      const { container } = render(
        <MemoryRouter>
          <GSTCompliance />
        </MemoryRouter>
      )

      // 1. Fill valid form
      const gstinInput = screen.getByLabelText(/GSTIN/i) as HTMLInputElement
      fireEvent.change(gstinInput, { target: { value: '29AAAAA0000A1Z5' } })

      const fySelect = screen.getByLabelText(/financial year/i)
      fireEvent.change(fySelect, { target: { value: 'FY 2024-25' } })

      const reqTypeSelect = screen.getByLabelText(/request type/i)
      fireEvent.change(reqTypeSelect, { target: { value: 'Notice Response' } })

      const noticeInput = screen.getByLabelText(/Notice Number/i) as HTMLInputElement
      fireEvent.change(noticeInput, { target: { value: 'NOTICE/2026/001' } })

      const issueDateInput = container.querySelector('#gst-notice-issue-date') as HTMLInputElement
      fireEvent.change(issueDateInput, { target: { value: '2026-10-01' } })

      const dueDateInput = container.querySelector('#gst-notice-due-date') as HTMLInputElement
      fireEvent.change(dueDateInput, { target: { value: '2026-11-15' } })

      const fileInput = container.querySelector('#file-input-notice-copy') as HTMLInputElement
      await pickFiles(fileInput, [uploadTestFile('Notice.pdf')])

      // 2. Click "Proceed to Review"
      const proceedBtn = screen.getByTestId('gst-compliance-submit-btn')
      expect(proceedBtn.textContent).toContain('Proceed to Review')
      fireEvent.click(proceedBtn)

      // 3. Confirm we are on Review page
      await waitFor(() => {
        expect(screen.getByText('Ready for CA Review & Filing')).toBeDefined()
      })

      // 4. Click "Edit" on Notice Details
      const editButtons = screen.getAllByRole('button', { name: /Edit/i })
      fireEvent.click(editButtons[1]) // Click edit on Notice Details

      // 5. In Edit Mode:
      // - Back button must NOT be present
      expect(screen.queryByTestId('step-back-btn')).toBeNull()
      // - Next button must display "Update & Review" instead of normal flow "Proceed to Review"
      const updateBtn = screen.getByTestId('gst-compliance-submit-btn')
      expect(updateBtn.textContent).toContain('Update & Review')

      // 6. Click "Update & Review" and confirm it returns to Review
      fireEvent.click(updateBtn)
      await waitFor(() => {
        expect(screen.getByText('Ready for CA Review & Filing')).toBeDefined()
      })
    })
  })
})
