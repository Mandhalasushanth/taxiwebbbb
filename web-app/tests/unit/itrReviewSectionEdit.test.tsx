// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { useReviewEdit, scrollToSection } from '../../src/shared/edit'
import { TdsRefundReview } from '../../src/modules/itr/components/TdsRefund/TdsRefundReview/TdsRefundReview'
import { RevisionReviewSummary } from '../../src/modules/itr/components/RevisedItr/ReviewSummary/RevisionReviewSummary'
import { ReviewResponse } from '../../src/modules/itr/components/TaxNoticeAssistance/ReviewResponse/ReviewResponse'
import { ItrReviewSubmissionView } from '../../src/modules/itr/components/ItrFiling/ReviewSubmission/ItrReviewSubmissionView'

describe('ITR Review Section Edit Redirection Across Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
  })

  describe('useReviewEdit and scrollToSection', () => {
    it('sets edit mode, opens step, and scrolls to section when sectionId provided', () => {
      const goToReview = vi.fn()
      const openStep = vi.fn()
      const { result } = renderHook(() => useReviewEdit(goToReview))

      expect(result.current.isEditMode).toBe(false)

      const div = document.createElement('div')
      div.id = 'target-section-test'
      document.body.appendChild(div)

      act(() => {
        result.current.startEdit(openStep, 'target-section-test')
      })

      expect(result.current.isEditMode).toBe(true)
      expect(openStep).toHaveBeenCalledTimes(1)

      // nextOrReview returns to review instead of next
      const normalNext = vi.fn()
      act(() => {
        result.current.nextOrReview(normalNext)()
      })
      expect(goToReview).toHaveBeenCalledTimes(1)
      expect(normalNext).not.toHaveBeenCalled()
      expect(result.current.isEditMode).toBe(false)

      document.body.removeChild(div)
    })
  })

  describe('ITR Filing Review Section Redirection', () => {
    it('calls onEditStep with correct step and section IDs from review cards', () => {
      const onEditStep = vi.fn()
      const onBack = vi.fn()
      const onSubmit = vi.fn()

      render(
        <ItrReviewSubmissionView
          onBack={onBack}
          onEditStep={onEditStep}
          onSubmit={onSubmit}
          assessmentYear="AY 2026-27"
          residentialStatus="resident"
          filingType="original"
          salaryDetails={{
            employerName: 'Acme Corp',
            grossSalary: '1200000',
            exemptAllowances: '50000',
            tdsDeducted: '80000',
          }}
          selectedSources={['salary', 'house_property']}
          selectedRegime="new"
          deductions={{ section80c: '150000' }}
          uploadedDocs={{}}
        />
      )

      // 1. Edit Filing & Taxpayer Details card header
      const editFilingBtn = screen.getByRole('button', { name: /Edit Filing & Taxpayer Details/i })
      fireEvent.click(editFilingBtn)
      expect(onEditStep).toHaveBeenCalledWith(1, 'itr-filing-options')

      // 2. Edit Summary & Declared Income card header
      const editIncomeHeader = screen.getByRole('button', { name: /Edit Summary & Declared Income/i })
      fireEvent.click(editIncomeHeader)
      expect(onEditStep).toHaveBeenCalledWith(2, 'itr-income-sources')

      // 3. Edit Refund Bank Account card header
      const editBankBtn = screen.getByRole('button', { name: /Edit Refund Bank Account/i })
      fireEvent.click(editBankBtn)
      expect(onEditStep).toHaveBeenCalledWith(1, 'itr-refund-bank-section')

      // 4. Edit Documents card header
      const editDocsBtn = screen.getByRole('button', { name: /Edit Uploaded Documents/i })
      fireEvent.click(editDocsBtn)
      expect(onEditStep).toHaveBeenCalledWith(3, 'itr-documents-checklist')
    })
    it('shows Before we continue attention banner when mandatory documents are missing for selected sources and redirects to document checklist on Upload click', () => {
      const onEditStep = vi.fn()
      const onSubmit = vi.fn()

      const { rerender } = render(
        <ItrReviewSubmissionView
          onBack={vi.fn()}
          onEditStep={onEditStep}
          onSubmit={onSubmit}
          assessmentYear="AY 2026-27"
          residentialStatus="resident"
          filingType="original"
          salaryDetails={{ employerName: '', grossSalary: '', exemptAllowances: '', tdsDeducted: '' }}
          businessDetails={{
            grossTurnover: '80000000',
            declaredNetProfit: '2800000',
            reportingMethod: '44ADA',
          }}
          selectedSources={['business']}
          uploadedDocs={{}}
        />
      )

      // Attention banner should be visible because business source requires mandatory business_turnover
      expect(screen.getByTestId('itr-review-attention-banner')).toBeDefined()
      expect(screen.getByText(/Before we continue: 1 items require your attention/i)).toBeDefined()
      expect(screen.getByText(/1 required documents missing/i)).toBeDefined()

      // Submit button should be disabled
      const submitBtn = screen.getByRole('button', { name: /Submit for CA Review/i })
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true)

      // Even if declared, submit cannot proceed while mandatory documents are missing
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      fireEvent.click(submitBtn)
      expect(onSubmit).not.toHaveBeenCalled()

      // Clicking Upload button redirects to step 3 (Document Checklist)
      const uploadBtn = screen.getByTestId('review-upload-required-docs-btn')
      fireEvent.click(uploadBtn)
      expect(onEditStep).toHaveBeenCalledWith(3, 'itr-documents-checklist')

      // When the mandatory document is uploaded, attention banner disappears
      rerender(
        <ItrReviewSubmissionView
          onBack={vi.fn()}
          onEditStep={onEditStep}
          onSubmit={onSubmit}
          assessmentYear="AY 2026-27"
          residentialStatus="resident"
          filingType="original"
          salaryDetails={{ employerName: '', grossSalary: '', exemptAllowances: '', tdsDeducted: '' }}
          businessDetails={{
            grossTurnover: '80000000',
            declaredNetProfit: '2800000',
            reportingMethod: '44ADA',
          }}
          selectedSources={['business']}
          uploadedDocs={{
            business_turnover: {
              id: 'business_turnover',
              fileName: 'Turnover_Statement.pdf',
              fileSize: '1.2 MB',
              uploadedAt: '10:00 AM',
            },
          }}
        />
      )

      expect(screen.queryByTestId('itr-review-attention-banner')).toBeNull()
    })

  })

  describe('TDS Refund Review Section Redirection', () => {
    it('redirects to respective Step 1 card section when Edit button clicked', () => {
      const onEditStep1 = vi.fn()
      const onBack = vi.fn()
      const onNext = vi.fn()

      render(
        <TdsRefundReview
          onBack={onBack}
          onEditStep1={onEditStep1}
          onNext={onNext}
          profile={{
            fullName: 'Rajesh Sharma',
            pan: 'ABCDE1234F',
            mobile: '9876543210',
            email: 'rajesh@example.com',
            address: 'Mumbai',
          }}
          bankDetails={{
            bankName: 'HDFC Bank',
            accountNumber: '123456789012',
            ifsc: 'HDFC0001234',
            accountHolder: 'Rajesh Sharma',
          }}
          businessDetails={{
            legalName: 'Sharma Traders',
            pan: 'ABCDE1234F',
            mobile: '9876543210',
          }}
        />
      )

      // Edit Personal Details
      fireEvent.click(screen.getByTestId('edit-personal-btn'))
      expect(onEditStep1).toHaveBeenCalledWith('tds-card-personal')

      // Edit Business Details
      fireEvent.click(screen.getByTestId('edit-business-btn'))
      expect(onEditStep1).toHaveBeenCalledWith('tds-card-business')

      // Edit Bank Details
      fireEvent.click(screen.getByTestId('edit-bank-btn'))
      expect(onEditStep1).toHaveBeenCalledWith('tds-card-bank')

      // Edit Documents
      fireEvent.click(screen.getByTestId('edit-documents-btn'))
      expect(onEditStep1).toHaveBeenCalledWith('tds-card-business')
    })
  })

  describe('Revised ITR Review Section Redirection', () => {
    it('passes exact step number and section ID to onEditStep', () => {
      const onEditStep = vi.fn()

      render(
        <RevisionReviewSummary
          selectedReason="missed_income"
          ackNumber="987656789876789"
          selectedAy="AY 2025-26"
          returnDetails={null}
          incomeCorrections={{ salaryIncome: '900000', otherIncome: '', taxableIncome: '' }}
          deductionCorrections={{ section80c: '', section80d: '', homeLoanInterest: '', taxableIncome: '' }}
          bankCorrections={{ accountNumber: '', ifsc: '' }}
          uploadedDocuments={{}}
          onEditStep={onEditStep}
        />
      )

      // Edit Original Return -> Step 1
      fireEvent.click(screen.getByRole('button', { name: /Edit Original Return/i }))
      expect(onEditStep).toHaveBeenCalledWith(1, 'revised-step1-search')

      // Edit Personal Information -> Step 1
      fireEvent.click(screen.getByRole('button', { name: /Edit Personal Information/i }))
      expect(onEditStep).toHaveBeenCalledWith(1, 'revised-step1-details')

      // Edit Reason for Revision -> Step 2
      fireEvent.click(screen.getByRole('button', { name: /Edit Reason for Revision/i }))
      expect(onEditStep).toHaveBeenCalledWith(2, 'revised-step2-reason')

      // Edit Changes -> Step 3
      fireEvent.click(screen.getByRole('button', { name: /Edit Changes/i }))
      expect(onEditStep).toHaveBeenCalledWith(3, 'revised-step3-changes')

      // Edit Uploaded Documents -> Step 4
      fireEvent.click(screen.getByRole('button', { name: /Edit Uploaded Documents/i }))
      expect(onEditStep).toHaveBeenCalledWith(4, 'revised-step4-documents')
    })
  })

  describe('Tax Notice Assistance Review Section Redirection', () => {
    it('redirects to notice details, upload, summary, and supporting docs with IDs', () => {
      const onEditRequest = vi.fn()
      const onEditStep = vi.fn()
      const onApproveAndSubmit = vi.fn()

      render(
        <ReviewResponse
          formData={{
            pan: 'CASPJ4743E',
            assessmentYear: 'AY 2025-26',
            noticeType: 'Section 143(1)(a) - Proposed Adjustment',
            noticeReference: 'CPC/2526/A3/284419260',
            documentFileName: 'Notice_143_1a.pdf',
            supportingDocuments: {},
          }}
          userName="Sagarika Jena"
          onEditRequest={onEditRequest}
          onEditStep={onEditStep}
          onApproveAndSubmit={onApproveAndSubmit}
          isSubmitting={false}
        />
      )

      // Edit Notice Details -> Step 1
      fireEvent.click(screen.getByRole('button', { name: /Edit Notice Details/i }))
      expect(onEditStep).toHaveBeenCalledWith(1, 'notice-step1-info')

      // Edit Uploaded Notice -> Step 2
      fireEvent.click(screen.getByRole('button', { name: /Edit Uploaded Notice/i }))
      expect(onEditStep).toHaveBeenCalledWith(2, 'notice-step2-doc')

      // Edit Notice Summary -> Step 3
      fireEvent.click(screen.getByRole('button', { name: /Edit Notice Summary/i }))
      expect(onEditStep).toHaveBeenCalledWith(3, 'notice-step3-summary')

      // Edit Supporting Documents -> Step 4
      fireEvent.click(screen.getByRole('button', { name: /Edit Supporting Documents/i }))
      expect(onEditStep).toHaveBeenCalledWith(4, 'notice-step4-docs')
    })
  })
})
