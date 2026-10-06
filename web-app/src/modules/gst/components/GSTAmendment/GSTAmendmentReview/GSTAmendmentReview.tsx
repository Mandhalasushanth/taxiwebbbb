import { GSTSaveDraftButton } from '@modules/gst/shared/GSTSaveDraftButton'
import React, { useState } from 'react'
import { getAddressRows, getBankRows, getContactRows, getSignatoryRows, type RowItem } from './getComparisonRows'
import './GSTAmendmentReview.css'

export interface AddressDetailsItem {
  address: string
  city: string
  district?: string
  state?: string
  pinCode: string
  natureOfPremises?: string
}

export interface BankDetailsItem {
  bankName: string
  accountNumber: string
  confirmAccountNumber?: string
  ifscCode: string
  accountType: string
}

export interface SignatoryDetailsItem {
  name: string
  designation: string
  pan: string
  mobile: string
  dob?: string
  email: string
}

export interface ContactDetailsItem {
  mobile: string
  email: string
}

interface GSTAmendmentReviewProps {
  gstin?: string
  sectionTitle?: string
  amendmentType?: 'core' | 'non_core'
  currentValue?: string
  requestedValue?: string
  currentAddressDetails?: AddressDetailsItem
  requestedAddressDetails?: AddressDetailsItem
  currentBankDetails?: BankDetailsItem
  requestedBankDetails?: BankDetailsItem
  currentSignatoryDetails?: SignatoryDetailsItem
  requestedSignatoryDetails?: SignatoryDetailsItem
  currentContactDetails?: ContactDetailsItem
  requestedContactDetails?: ContactDetailsItem
  fileName?: string
  fileSizeText?: string
  uploadDateText?: string
  isSubmitting?: boolean
  onBack: () => void
  onSaveDraft?: () => void
  onSubmit: () => void
  onEdit?: () => void
}

export const GSTAmendmentReview: React.FC<GSTAmendmentReviewProps> = ({
  gstin = '29AAAAA0000F1Z2',
  sectionTitle = 'Legal Business Name',
  amendmentType = 'core',
  currentValue: _currentValue,
  requestedValue,
  currentAddressDetails: _currentAddressDetails,
  requestedAddressDetails,
  currentBankDetails: _currentBankDetails,
  requestedBankDetails,
  currentSignatoryDetails: _currentSignatoryDetails,
  requestedSignatoryDetails,
  currentContactDetails: _currentContactDetails,
  requestedContactDetails,
  fileName = 'RESUME FINAL (1).pdf',
  fileSizeText = '0.1 MB',
  isSubmitting = false,
  onBack,
  onSubmit,
  onSaveDraft,
  onEdit,
}) => {
  const [isDeclared, setIsDeclared] = useState(false)
  const [declarationError, setDeclarationError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDeclared) {
      setDeclarationError(true)
      return
    }
    setDeclarationError(false)
    onSubmit()
  }

  const amendmentTypeLabel = amendmentType === 'core' ? 'Core Field' : 'Non-Core Field'
  const isAdditionalPlace = sectionTitle === 'Additional Place of Business'

  const requestedRows: RowItem[] | null = requestedContactDetails
    ? getContactRows(requestedContactDetails)
    : requestedSignatoryDetails
    ? getSignatoryRows(requestedSignatoryDetails, true)
    : requestedBankDetails
    ? getBankRows(requestedBankDetails, true)
    : requestedAddressDetails
    ? getAddressRows(requestedAddressDetails, isAdditionalPlace, true)
    : null

  return (
    <div className="gst-amend-review-container">
      {/* Header */}
      <div className="gst-amend-review-header-flex">
        <div className="gst-amend-review-icon-circle" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h1 className="gst-amend-review-title">Review Amendment</h1>
          <p className="gst-amend-review-subtitle">Confirm details before submission</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Card 1: Meta Information Card */}
        <div className="gst-amend-review-meta-box">
          <div className="gst-amend-review-meta-row">
            <span className="gst-amend-review-meta-label">Amendment Type</span>
            <span className="gst-amend-review-meta-val">{amendmentTypeLabel}</span>
          </div>
          <div className="gst-amend-review-meta-divider" />
          <div className="gst-amend-review-meta-row">
            <span className="gst-amend-review-meta-label">Section</span>
            <span className="gst-amend-review-meta-val">{sectionTitle}</span>
          </div>
          <div className="gst-amend-review-meta-divider" />
          <div className="gst-amend-review-meta-row">
            <span className="gst-amend-review-meta-label">Target GSTIN</span>
            <span className="gst-amend-review-meta-val">{gstin}</span>
          </div>
        </div>

        {/* Card 2: Requested Changes Card */}
        <div className="gst-amend-requested-card">
          <div className="gst-amend-requested-header">
            <span className="gst-amend-requested-title">REQUESTED CHANGES</span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="gst-amend-requested-edit-btn"
                aria-label="Edit requested changes"
              >
                Edit
              </button>
            )}
          </div>
          {requestedRows ? (
            <div className="gst-amend-requested-rows">
              {requestedRows.map((row, idx) => (
                <div key={row.label}>
                  <div className="gst-amend-requested-row">
                    <span className="gst-amend-requested-label">{row.label}</span>
                    <span className="gst-amend-requested-val">{row.value}</span>
                  </div>
                  {idx < requestedRows.length - 1 && <div className="gst-amend-requested-divider" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="gst-amend-requested-row">
              <span className="gst-amend-requested-label">{sectionTitle}</span>
              <span className="gst-amend-requested-val">{requestedValue || '—'}</span>
            </div>
          )}
        </div>

        {/* Card 3: Attached Proof Card */}
        <div className="gst-amend-proof-card">
          <h3 className="gst-amend-proof-card-title">Attached Proof</h3>
          <div className="gst-amend-proof-row">
            <span className="gst-amend-proof-name" title={fileName}>{fileName}</span>
            <span className="gst-amend-proof-size">{fileSizeText}</span>
          </div>
        </div>

        {/* Card 4: Declaration Checkbox Box */}
        <div
          className={`gst-amend-declaration-box ${declarationError ? 'has-error' : ''}`}
          onClick={() => {
            setIsDeclared(!isDeclared)
            if (declarationError) setDeclarationError(false)
          }}
        >
          <div className="gst-amend-declaration-check-wrap">
            <input
              type="checkbox"
              id="gst-amend-declaration-checkbox"
              checked={isDeclared}
              onChange={(e) => {
                setIsDeclared(e.target.checked)
                if (declarationError) setDeclarationError(false)
              }}
              className="gst-amend-declaration-checkbox"
            />
          </div>
          <label
            htmlFor="gst-amend-declaration-checkbox"
            className="gst-amend-declaration-text"
            onClick={(e) => e.stopPropagation()}
          >
            I hereby declare that the information provided above is true and correct to the best of my knowledge, and I authorise TaxEdge to submit this amendment request on my behalf.
          </label>
        </div>

        {declarationError && (
          <span className="gst-amend-declaration-error-msg">
            Please accept the declaration before submitting your request.
          </span>
        )}

        {/* Unified Bottom Action Bar matching application desktop layout */}
        <div className="gst-amend-review-actions-bar">
          <button type="button" onClick={onBack} className="gst-amend-review-back-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="gst-amend-review-actions-right">
            {onSaveDraft && <GSTSaveDraftButton onClick={onSaveDraft} />}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gst-amend-submit-main-btn"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Amendment'}</span>
              {!isSubmitting && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-amend-btn-arrow">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default GSTAmendmentReview
