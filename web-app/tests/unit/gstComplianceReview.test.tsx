// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
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
        screen.getByText('TaxEdge CA compliance desk will verify your records and prepare the official response.')
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

      expect(screen.getByText('Request Submitted Successfully')).toBeDefined()
      expect(screen.getByText('GSTC-20261028-1234')).toBeDefined()
      expect(
        screen.getByText(
          'Your GST Compliance request has been submitted successfully. Our CA team will review your documents and contact you shortly.'
        )
      ).toBeDefined()
    })
  })

  describe('Full GST Compliance Stepper Integration', () => {
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
  })
})
