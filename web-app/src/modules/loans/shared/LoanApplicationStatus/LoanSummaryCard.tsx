import React from 'react'
import { Copy, FileText, Wrench, Clock, Landmark, User } from 'lucide-react'
import './LoanSummaryCard.css'

export interface LoanSummaryCardProps {
  refNumber: string
  loanType: string
  loanAmount: number
  primaryDetailLabel?: string
  primaryDetailValue?: string
  primaryDetailIcon?: React.ReactNode
  equipment?: string
  tenure: string
  disbursementBank: string
  loanAgent: string
  isCopied: boolean
  onCopyRef: () => void
}

/**
 * Loan Summary Card Component
 */
export const LoanSummaryCard: React.FC<LoanSummaryCardProps> = ({
  refNumber,
  loanType,
  loanAmount,
  primaryDetailLabel,
  primaryDetailValue,
  primaryDetailIcon,
  equipment = '—',
  tenure,
  disbursementBank,
  loanAgent,
  isCopied,
  onCopyRef,
}) => {
  const formattedAmount = loanAmount > 0 ? `₹${loanAmount.toLocaleString('en-IN')}` : '—'
  const label = primaryDetailLabel || 'Detail'
  const value = primaryDetailValue || equipment

  return (
    <div className="loan-status-summary-card" data-testid="loan-summary-card">
      {/* Top Section */}
      <div className="loan-status-summary-card__top">
        <div className="loan-status-summary-card__left">
          <div className="loan-status-ref-row">
            <span className="loan-status-ref-text">Ref: {refNumber}</span>
            <button
              type="button"
              className="loan-status-copy-btn"
              onClick={onCopyRef}
              title={isCopied ? 'Copied!' : 'Copy Reference Number'}
              aria-label="Copy Reference Number"
            >
              <Copy size={15} aria-hidden="true" />
              {isCopied && <span className="loan-status-copy-tooltip">Copied!</span>}
            </button>
          </div>

          <h2 className="loan-status-loan-type">{loanType}</h2>
          <div className="loan-status-amount">{formattedAmount}</div>
        </div>

        <div className="loan-status-summary-card__right">
          <div className="loan-status-doc-badge">
            <FileText size={16} aria-hidden="true" />
            <span>Documents Received</span>
          </div>
        </div>
      </div>

      {/* Meta Grid Section */}
      <div className="loan-status-meta-grid">
        {/* Column 1: Primary Detail (Property / Vehicle / Equipment / Purpose) */}
        <div className="loan-status-meta-col">
          <div className="loan-status-meta-icon-tile">
            {primaryDetailIcon || (
              <Wrench size={22} aria-hidden="true" />
            )}
          </div>
          <div className="loan-status-meta-info">
            <span className="loan-status-meta-label">{label}</span>
            <span className="loan-status-meta-value">{value}</span>
          </div>
        </div>

        {/* Column 2: Tenure */}
        <div className="loan-status-meta-col">
          <div className="loan-status-meta-icon-tile">
            <Clock size={22} aria-hidden="true" />
          </div>
          <div className="loan-status-meta-info">
            <span className="loan-status-meta-label">Tenure</span>
            <span className="loan-status-meta-value">{tenure || '—'}</span>
          </div>
        </div>

        {/* Column 3: Disbursement Bank */}
        <div className="loan-status-meta-col">
          <div className="loan-status-meta-icon-tile">
            <Landmark size={22} aria-hidden="true" />
          </div>
          <div className="loan-status-meta-info">
            <span className="loan-status-meta-label">Disbursement Bank</span>
            <span className="loan-status-meta-value">{disbursementBank || '—'}</span>
          </div>
        </div>

        {/* Column 4: Loan Agent */}
        <div className="loan-status-meta-col">
          <div className="loan-status-meta-icon-tile">
            <User size={22} aria-hidden="true" />
          </div>
          <div className="loan-status-meta-info">
            <span className="loan-status-meta-label">Loan Agent</span>
            <span className="loan-status-meta-value">{loanAgent || 'Assigned on Verification'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoanSummaryCard
