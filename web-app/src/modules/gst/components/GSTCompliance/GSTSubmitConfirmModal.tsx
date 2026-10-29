import React from 'react'
import { orNotAvailable } from '@modules/gst/services/gstProfileService'
import './GSTSubmitConfirmModal.css'

interface GSTSubmitConfirmModalProps {
  isOpen: boolean
  requestType: string
  gstin: string
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export const GSTSubmitConfirmModal: React.FC<GSTSubmitConfirmModalProps> = ({
  isOpen,
  requestType,
  gstin,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="gst-confirm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gst-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gst-confirm-icon-wrapper">
          <div className="gst-confirm-icon-badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="36"
              height="36"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        <h3 className="gst-confirm-title">Submit GST Compliance Request?</h3>

        <p className="gst-confirm-desc">
          Are you sure you want to submit this <strong>{requestType || 'GST Compliance'}</strong> request for GSTIN{' '}
          <strong>{orNotAvailable(gstin)}</strong>?
          <br />
          Our CA team will immediately begin processing.
        </p>

        <div className="gst-confirm-actions">
          <button
            type="button"
            className="gst-confirm-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="gst-confirm-btn-submit"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GSTSubmitConfirmModal
