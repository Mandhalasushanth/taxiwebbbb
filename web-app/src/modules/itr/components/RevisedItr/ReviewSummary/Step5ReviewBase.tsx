import React from 'react'
import { authStorage } from '@core/auth'
import type {
  OriginalReturnDetails,
  DocumentTypeId,
  UploadedDocument,
} from '../../../types/revisedItr.types'
import { calculateTaxLiability } from '../../../validation/revisedItrValidation'
import './Step5ReviewBase.css'

export interface Step5ReviewBaseProps {
  ackNumber: string
  selectedAy: string
  returnDetails: OriginalReturnDetails | null
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  revisedGross: number
  revisedTaxable: number
  revisedDeductions: number
  children: React.ReactNode
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void
}

export const Step5ReviewBase: React.FC<Step5ReviewBaseProps> = ({
  ackNumber,
  selectedAy,
  returnDetails,
  uploadedDocuments,
  revisedGross,
  revisedTaxable,
  revisedDeductions,
  children,
  onEditStep,
}) => {
  const uploadedCount = Object.keys(uploadedDocuments).length
  const user = authStorage.getUser()

  const personalInfo = returnDetails?.personalInfo || {
    fullName: user?.fullName || 'Assessee',
    pan: user?.pan ? `XXXXX${user.pan.slice(-4)}` : '—',
    dob: user?.dob || '—',
    mobile: user?.mobile || '—',
    email: user?.email || '—',
    address: user?.addressLine1 ? `${user.addressLine1}, ${user.city || ''}` : '—',
  }

  const formatInr = (val: number | string | undefined): string => {
    if (val === undefined || val === null || val === '') return '—'
    const num = typeof val === 'string' ? Number(val.replace(/[^0-9.-]+/g, '')) : val
    if (isNaN(num)) return '—'
    return '₹' + num.toLocaleString('en-IN')
  }

  const originalGross = returnDetails?.salaryOriginal || 0
  const grossDiff = revisedGross - originalGross

  const originalTaxable = returnDetails?.taxableOriginal || 0
  const taxableDiff = revisedTaxable - originalTaxable

  const originalDeductions = Math.max(0, originalGross - originalTaxable)
  const deductionsDiff = revisedDeductions - originalDeductions

  const originalTaxAndCess = calculateTaxLiability(originalTaxable)
  const revisedTaxAndCess = calculateTaxLiability(revisedTaxable)
  const taxDiff = revisedTaxAndCess - originalTaxAndCess

  const originalTaxesPaid = 31200
  const revisedTaxesPaid = 31200
  const taxesPaidDiff = 0

  const originalRefund = Math.max(0, originalTaxesPaid - originalTaxAndCess)
  const netBalance = revisedTaxesPaid - revisedTaxAndCess
  const isRefund = netBalance >= 0
  const refundDiff = netBalance - originalRefund

  const renderDiff = (diff: number) => {
    if (diff === 0) return <span>—</span>
    const isPositive = diff > 0
    return (
      <span className={isPositive ? 'diff-orange' : 'diff-red'}>
        {isPositive ? '+' : ''}
        {formatInr(diff)}
      </span>
    )
  }

  return (
    <div className="step5-review-revised-itr">
      <div className="step5-title-wrap">
        <h2 className="step5-main-heading">Review Revised ITR</h2>
        <p className="step5-sub-heading">Review your updated details before proceeding to payment.</p>
      </div>

      <div className="step5-content-grid">
        <div className="step5-col-left">
          {/* 1. Original Return */}
          <div className="step5-review-card">
            <div className="card-header-row">
              <h3 className="card-title">Original Return</h3>
              <button
                type="button"
                className="edit-pill-btn"
                onClick={() => onEditStep(1)}
                aria-label="Edit Original Return"
              >
                Edit
              </button>
            </div>
            <div className="card-rows-list">
              <div className="summary-row"><span className="row-key">Ack Number</span><span className="row-val font-mono">{ackNumber || '987654321012345'}</span></div>
              <div className="summary-row"><span className="row-key">Assessment Year</span><span className="row-val">{selectedAy || 'AY 2025-26'}</span></div>
              <div className="summary-row"><span className="row-key">ITR Form</span><span className="row-val">{returnDetails?.itrForm || 'ITR-1'}</span></div>
              <div className="summary-row"><span className="row-key">Gross Total Income</span><span className="row-val">{returnDetails?.grossTotalIncome || '₹8,12,400'}</span></div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="step5-review-card">
            <div className="card-header-row">
              <h3 className="card-title">Personal Information</h3>
              <button
                type="button"
                className="edit-pill-btn"
                onClick={() => onEditStep(1)}
                aria-label="Edit Personal Information"
              >
                Edit
              </button>
            </div>
            <div className="card-rows-list">
              <div className="summary-row"><span className="row-key">Full Name</span><span className="row-val">{personalInfo.fullName}</span></div>
              <div className="summary-row"><span className="row-key">PAN</span><span className="row-val font-mono">{personalInfo.pan}</span></div>
              <div className="summary-row"><span className="row-key">Date of Birth</span><span className="row-val">{personalInfo.dob}</span></div>
              <div className="summary-row"><span className="row-key">Mobile</span><span className="row-val font-mono">{personalInfo.mobile}</span></div>
              <div className="summary-row"><span className="row-key">Email</span><span className="row-val">{personalInfo.email}</span></div>
              <div className="summary-row"><span className="row-key">Address</span><span className="row-val row-val-address">{personalInfo.address}</span></div>
            </div>
          </div>

          {/* 3. Changes Card */}
          <div className="step5-review-card">
            <div className="card-header-row">
              <h3 className="card-title">Changes</h3>
              <button
                type="button"
                className="edit-pill-btn"
                onClick={() => onEditStep(3)}
                aria-label="Edit Changes"
              >
                Edit
              </button>
            </div>
            <div className="card-rows-list">
              {children}
            </div>
          </div>

          {/* 4. Documents Card */}
          <div className="step5-review-card">
            <div className="card-header-row">
              <h3 className="card-title">Documents</h3>
              <button
                type="button"
                className="edit-pill-btn"
                onClick={() => onEditStep(4)}
                aria-label="Edit Uploaded Documents"
              >
                Edit
              </button>
            </div>
            <div className="card-rows-list">
              <div className="summary-row"><span className="row-key">Uploaded Count</span><span className="row-val">{uploadedCount || 3} of 6 documents</span></div>
              <div className="summary-row"><span className="row-key">Verification Status</span><span className="row-val row-val-status">Ready for CA Review</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Tax Summary */}
        <div className="step5-col-right">
          <div className="step5-tax-summary-card">
            <div className="card-header-row">
              <h3 className="card-title">Tax Summary</h3>
            </div>
            <div className="tax-breakdown-list">
              {/* Gross total income */}
              <div className="tax-item-block">
                <span className="tax-item-label">Gross total income</span>
                <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(originalGross)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(revisedGross)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(grossDiff)}</span></div>
              </div>

              {/* Deductions */}
              <div className="tax-item-block">
                <span className="tax-item-label">Deductions</span>
                <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(originalDeductions)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(revisedDeductions)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(deductionsDiff)}</span></div>
              </div>

              {/* Taxable income */}
              <div className="tax-item-block">
                <span className="tax-item-label">Taxable income</span>
                <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(originalTaxable)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(revisedTaxable)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(taxableDiff)}</span></div>
              </div>

              {/* Tax + cess */}
              <div className="tax-item-block">
                <span className="tax-item-label">Tax + cess</span>
                <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(originalTaxAndCess)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(revisedTaxAndCess)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(taxDiff)}</span></div>
              </div>

              {/* Taxes paid */}
              <div className="tax-item-block">
                <span className="tax-item-label">Taxes paid</span>
                <div className="tax-item-row"><span className="tax-sub-label">Original</span><span className="tax-sub-val">{formatInr(originalTaxesPaid)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Revised</span><span className="tax-sub-val">{formatInr(revisedTaxesPaid)}</span></div>
                <div className="tax-item-row"><span className="tax-sub-label">Change</span><span className="tax-sub-val tax-change-val">{renderDiff(taxesPaidDiff)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Highlight Card */}
      <div className={`step5-refund-highlight-card ${!isRefund ? 'tax-payable' : ''}`}>
        <div className="refund-card-top-content">
          <div className="refund-left-content">
            <div className="refund-badge-pill">
              <span className="refund-symbol-circle">₹</span>
              <span className="refund-badge-text">{isRefund ? 'Revised Refund' : 'Tax Payable'}</span>
            </div>
            <div className="refund-hero-amount">{formatInr(Math.abs(netBalance))}</div>
          </div>

          <div className="refund-stats-rows">
            <div className="refund-stat-row">
              <span className="refund-stat-label">Original Refund</span>
              <span className="refund-stat-val">{formatInr(originalRefund)}</span>
            </div>
            <div className="refund-stat-row">
              <span className="refund-stat-label">Change</span>
              <span className="refund-stat-val">
                {refundDiff > 0 ? '+' : ''}
                {formatInr(refundDiff)}
              </span>
            </div>
          </div>
        </div>
        <p className="refund-disclaimer-note">Preliminary calculation. Final result depends on the filed return and Income Tax Department processing.</p>
      </div>
    </div>
  )
}
