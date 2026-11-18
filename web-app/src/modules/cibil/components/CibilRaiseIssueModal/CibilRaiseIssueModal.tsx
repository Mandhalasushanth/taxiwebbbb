import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import './CibilRaiseIssueModal.css'

export interface CibilDisputePayload {
  issueType: string
  description: string
}

export interface CibilDisputeResult {
  success: boolean
  ticketId?: string
  message?: string
}

export interface CibilRaiseIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateSupport: () => void
  onSubmitDispute?: (data: CibilDisputePayload) => Promise<CibilDisputeResult>
}

export const CibilRaiseIssueModal: React.FC<CibilRaiseIssueModalProps> = ({
  isOpen,
  onClose,
  onNavigateSupport,
  onSubmitDispute,
}) => {
  const [issueType, setIssueType] = useState('incorrect_account')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<CibilDisputeResult | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = onSubmitDispute
        ? await onSubmitDispute({ issueType, description })
        : {
            success: false,
            message:
              'Bureau dispute submission service is not yet connected by the backend team. Please connect with Finsolz Support for dispute filing.',
          }

      if (response.success && response.ticketId) {
        setSubmissionResult({
          success: true,
          ticketId: response.ticketId,
          message: response.message,
        })
      } else {
        setSubmissionResult({
          success: false,
          message:
            response.message ||
            'Bureau dispute submission service is not yet connected by the backend team. Please connect with Finsolz Support for dispute filing.',
        })
      }
    } catch (err: any) {
      setSubmissionResult({
        success: false,
        message: err?.message || 'Failed to submit dispute. Please connect with Finsolz Support.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setSubmissionResult(null)
    setIsSubmitting(false)
    setDescription('')
    onClose()
  }

  return (
    <div
      className="cibil-modal-backdrop"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cibil-issue-modal-title"
    >
      <div className="cibil-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cibil-modal-header">
          <h2 id="cibil-issue-modal-title" className="cibil-modal-title">
            Raise a CIBIL Dispute / Issue
          </h2>
          <button
            type="button"
            className="cibil-modal-close-btn"
            onClick={handleResetAndClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {submissionResult?.success ? (
          <div className="cibil-issue-success-box">
            <div className="cibil-issue-success-icon">
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              Issue Submitted Successfully
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '340px' }}>
              Ticket <strong>#{submissionResult.ticketId}</strong> has been registered. Our financial
              compliance desk will follow up with TransUnion CIBIL within 48 business hours.
            </p>
            <button
              type="button"
              className="cibil-modal-btn-primary"
              style={{ marginTop: '12px' }}
              onClick={handleResetAndClose}
            >
              Done
            </button>
          </div>
        ) : submissionResult && !submissionResult.success ? (
          <div className="cibil-issue-unconfirmed-box" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div
              className="cibil-issue-unavail-icon"
              style={{
                display: 'inline-flex',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '50%',
                color: '#d97706',
                marginBottom: '12px',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              Backend Connection In Progress
            </h3>
            <p style={{ margin: '8px 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
              {submissionResult.message}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="cibil-modal-btn-primary"
                onClick={() => {
                  handleResetAndClose()
                  onNavigateSupport()
                }}
              >
                Chat with Support
              </button>
              <button
                type="button"
                className="cibil-modal-close-btn"
                style={{ padding: '8px 16px' }}
                onClick={() => setSubmissionResult(null)}
              >
                Back to Form
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="cibil-issue-modal-body">
              <div className="cibil-issue-field">
                <label htmlFor="issue-type" className="cibil-issue-label">
                  Issue Category
                </label>
                <select
                  id="issue-type"
                  className="cibil-issue-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="incorrect_account">Unrecognized loan or credit card on report</option>
                  <option value="incorrect_payment">Payment marked as overdue erroneously</option>
                  <option value="wrong_enquiry">Unauthorized credit enquiry reported</option>
                  <option value="outdated_info">Closed account still reflecting as active</option>
                  <option value="other">Other score or reporting discrepancy</option>
                </select>
              </div>

              <div className="cibil-issue-field">
                <label htmlFor="issue-desc" className="cibil-issue-label">
                  Dispute Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="issue-desc"
                  className="cibil-issue-textarea"
                  rows={4}
                  placeholder="Please describe the discrepancy in your credit record with relevant bank/account numbers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Need immediate real-time assistance? You can also{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose()
                    onNavigateSupport()
                  }}
                  style={{
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  chat with Finsolz Support 24/7
                </button>
                .
              </p>
            </div>

            <div className="cibil-modal-footer">
              <button
                type="button"
                className="cibil-modal-close-btn"
                style={{ padding: '8px 16px', marginRight: '8px' }}
                onClick={handleResetAndClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cibil-modal-btn-primary"
                disabled={!description.trim() || isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Dispute'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
export default CibilRaiseIssueModal
