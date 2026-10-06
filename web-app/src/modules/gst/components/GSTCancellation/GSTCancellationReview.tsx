import { GSTSaveDraftButton } from '@modules/gst/shared/GSTSaveDraftButton'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React, { useState } from 'react'
import { orNotAvailable } from '@modules/gst/services/gstProfileService'
import { GSTCancellationStepper } from './GSTCancellationStepper'
import type { CancellationFormData } from './GSTCancellationCard'
import './GSTCancellationReview.css'

interface GSTCancellationReviewProps {
  formData: CancellationFormData
  isSubmitting?: boolean
  onBack: () => void
  onSaveDraft?: () => void
  onSubmit: () => void
  onEdit?: () => void
}


export const GSTCancellationReview: React.FC<GSTCancellationReviewProps> = ({
  formData,
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

  const fileName = orNotAvailable(formData.file?.name)
  const fileSize = formatGstFileSize(formData.file?.size ?? 0)

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return orNotAvailable('')
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="gst-canc-review-container">
      {/* Page Title */}
      <div className="gst-canc-review-header">
        <h1 className="gst-canc-review-title">Review Cancellation</h1>
        <p className="gst-canc-review-subtitle">
          Confirm application details before submission
        </p>
      </div>

      <GSTCancellationStepper
        currentStep={2}
        onStepClick={(step) => {
          if (step === 1) onBack()
        }}
      />

      <form onSubmit={handleSubmit} noValidate>
        {/* Top 2-Column Grid */}
        <div className="gst-canc-review-grid">
          {/* Left Column: Application Summary Card */}
          <div className="gst-canc-summary-card">
            <div className="gst-canc-summary-card-header">
              <div className="gst-canc-summary-header-left">
                <span className="gst-canc-summary-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                <h3 className="gst-canc-summary-card-title">Application Summary</h3>
              </div>
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="gst-canc-edit-btn"
                  aria-label="Edit Application Details"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-canc-edit-icon">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="gst-canc-summary-rows">
              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Form</span>
                <span className="gst-canc-summary-val font-bold">REG-16 (Cancellation)</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">GSTIN</span>
                <span className="gst-canc-summary-val font-bold">{orNotAvailable(formData.gstin)}</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Reason for Cancellation</span>
                <span className="gst-canc-summary-val font-bold">{orNotAvailable(formData.reason)}</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Date Cancellation Is Sought</span>
                <span className="gst-canc-summary-val font-bold">{formatDateDisplay(formData.cancellationDate)}</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Details of Closing Stock & Input Tax Reversal</span>
                <span className="gst-canc-summary-val font-bold">{orNotAvailable(formData.closingStockDetails)}</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Pending Dues / Liabilities</span>
                <span className="gst-canc-summary-val font-bold">{formData.pendingLiabilities || 'Nil'}</span>
              </div>

              <div className="gst-canc-summary-row">
                <span className="gst-canc-summary-label">Last GSTR-3B Filed ARN / Period</span>
                <span className="gst-canc-summary-val font-bold">{orNotAvailable(formData.lastGstr3bFiled)}</span>
              </div>

              <div className="gst-canc-summary-row gst-canc-doc-row">
                <span className="gst-canc-summary-label">Supporting Document</span>
                <div className="gst-canc-doc-val">
                  <span className="gst-canc-paperclip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </span>
                  <span className="gst-canc-doc-name" title={fileName}>{fileName}</span>
                  <span className="gst-canc-doc-size">({fileSize})</span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Declaration Card */}
        <div
          className={`gst-canc-review-declaration-card ${declarationError ? 'has-error' : ''}`}
          onClick={() => {
            setIsDeclared(!isDeclared)
            if (declarationError) setDeclarationError(false)
          }}
        >
          <input
            type="checkbox"
            id="gst-canc-review-declaration"
            checked={isDeclared}
            onChange={(e) => {
              setIsDeclared(e.target.checked)
              if (declarationError) setDeclarationError(false)
            }}
            className="gst-canc-review-checkbox"
          />
          <label htmlFor="gst-canc-review-declaration" className="gst-canc-review-declaration-label" onClick={(e) => e.stopPropagation()}>
            I declare that the information provided above is true and correct, and I authorise TaxEdge Fin Solutions to file Form REG-16 on my behalf. <span className="gst-canc-star">*</span>
          </label>
        </div>

        {declarationError && (
          <span className="gst-canc-error-msg">
            Please accept the declaration before submitting your application.
          </span>
        )}

        {/* Bottom Actions Row */}
        <div className="gst-canc-review-actions-row">
          <button type="button" onClick={onBack} className="gst-canc-back-pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="gst-actions-group">
            {onSaveDraft && <GSTSaveDraftButton onClick={onSaveDraft} />}
            <button type="submit" disabled={isSubmitting} className="gst-canc-submit-orange-btn">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default GSTCancellationReview
