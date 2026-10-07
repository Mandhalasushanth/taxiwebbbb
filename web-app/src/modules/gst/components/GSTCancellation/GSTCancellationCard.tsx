import { SaveDraftButton } from '@shared/saveDraft'
import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { ServiceDraftModal } from '@shared/saveDraft'
import { useReviewEdit, UPDATE_AND_REVIEW_LABEL } from '@shared/edit'
import { GSTAmendmentProofUpload as GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import { GSTCancellationSubmitted } from './GSTCancellationSubmitted'
import { GSTCancellationFields } from './GSTCancellationFields'
import { GSTCancellationReview } from './GSTCancellationReview'
import { GSTCancellationStepper } from './GSTCancellationStepper'
import { useGSTCancellationForm, type CancellationFormData } from '@modules/gst/hooks/useGSTCancellationForm'
import './GSTCancellationCard.css'

export type { CancellationFormData }

export interface GSTCancellationCardProps {
  onAllForms?: () => void
  onSubmit?: (data: CancellationFormData) => void
}

export const GSTCancellationCard: React.FC<GSTCancellationCardProps> = ({
  onAllForms,
  onSubmit,
}) => {
  const navigate = useNavigate()

  const flow = useGSTCancellationForm({ onSubmit })
  const {
    gstin,
    setGstin,
    reason,
    setReason,
    cancellationDate,
    setCancellationDate,
    pendingLiabilities,
    setPendingLiabilities,
    lastGstr3bFiled,
    setLastGstr3bFiled,
    closingStockDetails,
    setClosingStockDetails,
    selectedFile,
    setSelectedFile,
    finalReturnDeclaration,
    setFinalReturnDeclaration,
    errors,
    clearError,
    handleFileChange,
    handleReviewProceed,
    handleFinalSubmit,
    isReviewing,
    setIsReviewing,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    referenceNumber,
    openDraftModal,
  } = flow

  // "Edit" from the review: shared behaviour (Update & Review / Back return to the review)
  const reviewEdit = useReviewEdit(() => setIsReviewing(true))
  const { isEditMode } = reviewEdit

  if (isSubmitted) {
    return (
      <GSTCancellationSubmitted
        applicationId={referenceNumber}
        gstin={gstin}
        cancellationDate={cancellationDate}
        onBackToForm={() => setIsSubmitted(false)}
        onAllForms={onAllForms ?? (() => navigate(routePaths.gst.root))}
      />
    )
  }

  if (isReviewing) {
    return (
      <>
        <GSTCancellationReview
          formData={{
            gstin: gstin.trim().toUpperCase(),
            reason,
            cancellationDate,
            pendingLiabilities: pendingLiabilities.trim(),
            lastGstr3bFiled: lastGstr3bFiled.trim(),
            closingStockDetails: closingStockDetails.trim(),
            file: selectedFile,
            finalReturnDeclaration,
          }}
          isSubmitting={isSubmitting}
          onBack={() => {
            reviewEdit.cancelEdit()
            setIsReviewing(false)
          }}
          onEdit={() => {
            reviewEdit.startEdit(() => setIsReviewing(false))
          }}
          onSubmit={handleFinalSubmit}
          onSaveDraft={openDraftModal}
        />
        <ServiceDraftModal draft={flow} serviceTitle="GST Cancellation" />
      </>
    )
  }

  return (
    <div className="gst-canc-container">
      <div className="gst-canc-header">
        <h1 className="gst-canc-title">GST Cancellation</h1>
        <p className="gst-canc-subtitle">
          Formally surrender and cancel your GST registration via Form REG-16
        </p>
      </div>

      <GSTCancellationStepper currentStep={1} />

      <form onSubmit={handleReviewProceed} noValidate>
        <div className="gst-canc-info-banner">
          <div className="gst-canc-info-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <span className="gst-canc-info-banner-text">
            Formally surrender and cancel your GST registration via Form REG-16
          </span>
        </div>

        <GSTCancellationFields
          gstin={gstin} setGstin={setGstin}
          reason={reason} setReason={setReason}
          cancellationDate={cancellationDate} setCancellationDate={setCancellationDate}
          pendingLiabilities={pendingLiabilities} setPendingLiabilities={setPendingLiabilities}
          lastGstr3bFiled={lastGstr3bFiled} setLastGstr3bFiled={setLastGstr3bFiled}
          closingStockDetails={closingStockDetails} setClosingStockDetails={setClosingStockDetails}
          errors={errors} clearError={clearError}
        />

        <div className="gst-canc-proof-grid">
          <div className="gst-canc-proof-left">
            <GSTProofUpload
              selectedFile={selectedFile}
              error={errors.file}
              onFileChange={handleFileChange}
              onRemoveFile={(e: React.MouseEvent) => {
                e.stopPropagation()
                setSelectedFile(null)
              }}
            />
          </div>
        </div>

        <div
          className={`gst-canc-declaration-card ${errors.finalReturnDeclaration ? 'has-error' : ''}`}
          onClick={() => {
            setFinalReturnDeclaration(!finalReturnDeclaration)
            clearError('finalReturnDeclaration')
          }}
        >
          <input
            type="checkbox"
            id="gst-canc-final-declaration"
            checked={finalReturnDeclaration}
            onChange={(e) => {
              setFinalReturnDeclaration(e.target.checked)
              clearError('finalReturnDeclaration')
            }}
            className="gst-canc-checkbox"
          />
          <div className="gst-canc-declaration-text">
            <span className="gst-canc-declaration-title">
              Final Return Declaration (GSTR-10) <span className="gst-canc-star">*</span>
            </span>
            <p className="gst-canc-declaration-desc">
              I confirm all outward tax dues are settled and will file final return GSTR-10 within 3 months of cancellation order.
            </p>
          </div>
        </div>
        {errors.finalReturnDeclaration && (
          <span className="gst-canc-error-msg">
            {errors.finalReturnDeclaration}
          </span>
        )}

        <GSTStepErrorBanner message={Object.keys(errors).length > 0 ? GST_STEP_ERROR : null} />

        <div className="gst-canc-actions-row">
          <button
            type="button"
            onClick={isEditMode ? reviewEdit.finishEdit : onAllForms ?? (() => navigate(routePaths.gst.root))}
            className="gst-canc-back-pill-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="form-actions-group">
            <SaveDraftButton onClick={openDraftModal} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="gst-canc-submit-orange-btn"
            >
              {isSubmitting
                ? 'Submitting...'
                : isEditMode
                ? UPDATE_AND_REVIEW_LABEL
                : 'Review Cancellation'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </form>
      <ServiceDraftModal draft={flow} serviceTitle="GST Cancellation" />
    </div>
  )
}

export default GSTCancellationCard
