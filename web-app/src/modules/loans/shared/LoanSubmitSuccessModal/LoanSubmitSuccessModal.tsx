import React from 'react'
import './LoanSubmitSuccessModal.css'

export interface LoanSubmitSuccessModalProps {
  isOpen: boolean
  title?: string
  referenceNumber: string
  message?: string
  buttonLabel?: string
  onTrackStatus?: () => void
  onDone?: () => void
}

/**
 * Shared Success Modal displayed upon loan application submission.
 * Reusable across Machinery, Vehicle, Working Capital, MSME, and Project Finance loans.
 */
export const LoanSubmitSuccessModal: React.FC<LoanSubmitSuccessModalProps> = ({
  isOpen,
  title = 'Application Submitted',
  referenceNumber,
  message,
  buttonLabel = 'TRACK STATUS',
  onTrackStatus,
  onDone,
}) => {
  if (!isOpen) return null

  return (
    <div className="loan-submit-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="loan-submit-modal-title">
      <div className="loan-submit-modal-card">
        <h3 id="loan-submit-modal-title" className="loan-submit-modal-title">{title}</h3>
        <p className="loan-submit-modal-body">
          {message || `Your application (Ref: ${referenceNumber}) has been submitted. Our Finsolz Loan Agent will process the application shortly.`}
        </p>
        <div className="loan-submit-modal-actions">
          {onDone && (
            <button
              type="button"
              className="loan-submit-modal-btn loan-submit-modal-btn--done"
              onClick={onDone}
              data-testid="loan-submit-modal-done-btn"
            >
              Done
            </button>
          )}
          {onTrackStatus && (
            <button
              type="button"
              className="loan-submit-modal-btn"
              onClick={onTrackStatus}
              data-testid="loan-submit-modal-track-btn"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanSubmitSuccessModal
