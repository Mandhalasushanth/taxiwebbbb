import React from 'react'
import { X, FileQuestion } from 'lucide-react'
import type { CibilFullReportData } from '../../types/cibil.types'
import './CibilReportModal.css'

interface CibilReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportData?: CibilFullReportData
  isReportAvailable: boolean
}

export const CibilReportModal: React.FC<CibilReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  isReportAvailable,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="cibil-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cibil-report-modal-title"
    >
      <div
        className="cibil-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cibil-modal-header">
          <h2 id="cibil-report-modal-title" className="cibil-modal-title">
            Detailed Credit Report
          </h2>
          <button
            type="button"
            className="cibil-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cibil-modal-body">
          {!isReportAvailable || !reportData ? (
            <div className="cibil-report-unavailable">
              <div className="cibil-report-unavail-icon">
                <FileQuestion size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                Full Report Not Available
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '360px' }}>
                Your summary score and metrics are active, but the comprehensive credit
                trade-line report is not provided by the bureau for this cycle.
              </p>
            </div>
          ) : (
            <>
              {/* Bureau & User Metadata */}
              <div className="cibil-report-summary-bar">
                <div className="cibil-report-summary-item">
                  <span className="cibil-report-summary-label">Bureau</span>
                  <span className="cibil-report-summary-value">{reportData.bureauName}</span>
                </div>
                <div className="cibil-report-summary-item">
                  <span className="cibil-report-summary-label">Report ID</span>
                  <span className="cibil-report-summary-value">{reportData.reportId}</span>
                </div>
                <div className="cibil-report-summary-item">
                  <span className="cibil-report-summary-label">Generated</span>
                  <span className="cibil-report-summary-value">{reportData.generatedDate}</span>
                </div>
                <div className="cibil-report-summary-item">
                  <span className="cibil-report-summary-label">Masked PAN</span>
                  <span className="cibil-report-summary-value">{reportData.panMasked}</span>
                </div>
              </div>

              {/* Accounts Breakdown Header */}
              <h3 className="cibil-report-accounts-title">
                Active Credit Accounts ({reportData.openAccounts} Open, {reportData.closedAccounts} Closed)
              </h3>

              {/* Account Cards */}
              {reportData.accounts.map((acc, idx) => (
                <div key={idx} className="cibil-report-account-card">
                  <div className="cibil-report-acc-header">
                    <h4 className="cibil-report-acc-type">{acc.accountType}</h4>
                    <span className="cibil-report-acc-status">{acc.status}</span>
                  </div>

                  <div className="cibil-report-acc-grid">
                    <div className="cibil-report-acc-cell">
                      <span className="cibil-report-acc-label">Institution</span>
                      <span className="cibil-report-acc-val">{acc.institutionMasked}</span>
                    </div>
                    <div className="cibil-report-acc-cell">
                      <span className="cibil-report-acc-label">Current Balance</span>
                      <span className="cibil-report-acc-val">{acc.currentBalance}</span>
                    </div>
                    <div className="cibil-report-acc-cell">
                      <span className="cibil-report-acc-label">Sanctioned Amount</span>
                      <span className="cibil-report-acc-val">{acc.sanctionedAmount || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="cibil-modal-footer">
          <button
            type="button"
            className="cibil-modal-btn-primary"
            onClick={onClose}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  )
}
export default CibilReportModal
