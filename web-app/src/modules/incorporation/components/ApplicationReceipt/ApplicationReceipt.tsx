import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { getEntityStructureLabel, getProposedCompanyName } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './ApplicationReceipt.css'

export const ApplicationReceipt: React.FC = () => {
  const navigate = useNavigate()
  const { formData } = useIncorporationFlow()

  const companyType = formData.companyType || 'pvt_ltd'
  const entityStructure = getEntityStructureLabel(companyType, { full: true })
  const companyName = getProposedCompanyName(companyType, formData.companyDetails?.firstPreferredName)
  const applicationId = formData.applicationId || 'INC-2026-89421'
  const transactionId = formData.transactionId || 'TXN-96771922'

  const applicationDate = formData.applicationDate || '18 Sep 2026'

  const paymentModeMap: Record<string, string> = {
    upi: 'UPI',
    netbanking: 'Net Banking',
  }
  const paymentMode = formData.paymentMethod ? (paymentModeMap[formData.paymentMethod] || 'UPI') : 'UPI'

  const totalAmount = formData.paidAmount ? `₹${Number(formData.paidAmount).toLocaleString('en-IN')}` : '₹7,399'

  const handleDownloadPdf = () => {
    window.print()
  }

  return (
    <div className="app-receipt-page">
      {/* Top Progress Tracker */}
      <div className="app-receipt-stepbar">
        <span className="app-receipt-stepbar__badge">Step 11 of 11</span>
        <span className="app-receipt-stepbar__text">Application Receipt</span>
        <div className="app-receipt-stepbar__line">
          <div className="app-receipt-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <div className="app-receipt-header">
        <h1 className="app-receipt-header__title">TaxEdge Application & Payment Receipt</h1>
        <p className="app-receipt-header__subtitle">
          This receipt confirms successful submission to TaxEdge and payment received for application processing.
        </p>
      </div>

      {/* Receipt Card */}
      <section className="app-receipt-card">
        {/* Card Header */}
        <div className="app-receipt-card__top">
          <div className="app-receipt-card__brand">
            <h2 className="app-receipt-card__company">TaxEdge Fin Solutions</h2>
            <span className="app-receipt-card__sub">Corporate Incorporation Desk</span>
          </div>
          <span className="app-receipt-badge">RECEIPT</span>
        </div>

        <div className="app-receipt-divider" />

        {/* Rows */}
        <div className="app-receipt-body">
          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Application Reference ID</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{applicationId}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Proposed Company Name</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{companyName}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Company Legal Structure</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{entityStructure}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Application Date</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{applicationDate}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Transaction ID</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{transactionId}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Payment Mode</span>
            <span className="app-receipt-row__val app-receipt-row__val--bold">{paymentMode}</span>
          </div>

          <div className="app-receipt-spacer" />

          <div className="app-receipt-row app-receipt-row--total">
            <span className="app-receipt-row__label app-receipt-row__label--total">Total Amount Paid</span>
            <span className="app-receipt-row__val app-receipt-row__val--total">{totalAmount}</span>
          </div>

          <div className="app-receipt-row">
            <span className="app-receipt-row__label">Payment Status</span>
            <span className="app-receipt-status-badge">Paid</span>
          </div>
        </div>
      </section>

      {/* Bottom Action Buttons */}
      <div className="app-receipt-actions">
        <button
          type="button"
          className="app-receipt-btn-back"
          onClick={() => navigate(routePaths.incorporation.applicationTracking)}
        >
          &larr; Back
        </button>

        <button
          type="button"
          className="app-receipt-btn-download"
          onClick={handleDownloadPdf}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download PDF Receipt</span>
        </button>

        <button
          type="button"
          className="app-receipt-btn-dashboard"
          onClick={() => navigate(routePaths.dashboard)}
        >
          Go to Dashboard &rarr;
        </button>
      </div>
    </div>
  )
}

export default ApplicationReceipt
