import { useMemo } from 'react'
import { authStorage } from '@core/auth'
import { GST_COMPANY } from '@modules/gst/constants/gstBusiness.constants'
import { formatCurrency } from '@shared/utils'
import type { PaymentResult } from '@modules/gst/types/gst.types'
import { useAppStore } from '@store/index'
import { GSTReceiptSummaryCard } from './GSTReceiptSummaryCard'
import { GSTReceiptSidebar } from './GSTReceiptSidebar'
import './GSTFilingReceipt.css'
import './GSTFilingReceipt.sidebar.css'

interface GSTFilingReceiptProps {
  details: PaymentResult
  onBack: () => void
}

export const GSTFilingReceipt = ({ details, onBack }: GSTFilingReceiptProps) => {
  const pushToast = useAppStore((state) => state.pushToast)
  const user = useMemo(() => authStorage.getUser(), [])

  const handleDownload = () => {
    pushToast('Receipt downloaded as PDF', 'success')
  }

  const baseFee = Math.round(details.amount / 1.18)
  const cgst = Math.round(baseFee * 0.09)
  const sgst = details.amount - baseFee - cgst
  const defaultDateText = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    []
  )

  return (
    <div className="gst-receipt-wrapper">
      {/* 1. Top Transaction Summary */}
      <GSTReceiptSummaryCard details={details} />

      {/* 2. Main 2-Column Grid: Invoice on Left, Sidebar on Right */}
      <div className="gst-receipt-main-layout">
        <div className="gst-receipt-card" id="printable-tax-receipt">
          {/* Header with Navy Brand Gradient */}
          <div className="gst-receipt-card__header">
            <div className="gst-receipt-brand-row">
              <div className="gst-receipt-brand-left">
                <div className="gst-receipt-brand-mark">{GST_COMPANY.shortName}</div>
                <div>
                  <h2 className="gst-receipt-brand-name">{GST_COMPANY.legalName}</h2>
                  <p className="gst-receipt-brand-gstin">GSTIN {GST_COMPANY.gstin} · {GST_COMPANY.location}</p>
                </div>
              </div>
              <div className="gst-receipt-brand-right">
                <span className="gst-receipt-type-tag">TAX INVOICE</span>
                <span className="gst-receipt-inv-num">{details.receiptNumber}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="gst-receipt-card__body">
            {/* Metadata Columns */}
            <div className="gst-receipt-meta-grid">
              <div className="gst-receipt-meta-col">
                <span className="gst-receipt-eyebrow">BILLED TO</span>
                <h4 className="gst-receipt-customer-name">{user?.fullName || 'Assessee'}</h4>
                <p className="gst-receipt-customer-addr">
                  {user?.businessName || user?.fullName || 'Registered Entity'}<br />
                  {user?.city ? `${user.city}, ${user.state || ''}` : 'Registered Address on File'}
                </p>
              </div>

              <div className="gst-receipt-meta-col gst-receipt-meta-col--right">
                <span className="gst-receipt-eyebrow">INVOICE DETAILS</span>
                <div className="gst-receipt-info-row">
                  <span className="gst-receipt-info-k">Date:</span>
                  <span className="gst-receipt-info-v">
                    {details.dateText || defaultDateText}
                  </span>
                </div>
                <div className="gst-receipt-info-row">
                  <span className="gst-receipt-info-k">Customer ID:</span>
                  <span className="gst-receipt-info-v">{user?.id ? user.id.slice(0, 12).toUpperCase() : 'TE-CUS'}</span>
                </div>
                <div className="gst-receipt-info-row">
                  <span className="gst-receipt-info-k">Application:</span>
                  <span className="gst-receipt-info-v">{details.applicationRef}</span>
                </div>
                <div className="gst-receipt-info-row">
                  <span className="gst-receipt-info-k">Place of Supply:</span>
                  <span className="gst-receipt-info-v">{user?.state || '—'}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="gst-receipt-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>SAC</th>
                  <th className="gst-receipt-num">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="gst-receipt-item-title">GST Return Filing — August 2026</div>
                    <div className="gst-receipt-item-desc">Professional fee for preparation and filing of GSTR-1 &amp; GSTR-3B</div>
                  </td>
                  <td className="gst-receipt-sac">998231</td>
                  <td className="gst-receipt-num"><b>{formatCurrency(baseFee)}</b></td>
                </tr>
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div className="gst-receipt-totals-box">
              <div className="gst-receipt-totals-row">
                <span className="gst-receipt-totals-k">Taxable value</span>
                <span className="gst-receipt-totals-v">{formatCurrency(baseFee)}</span>
              </div>
              <div className="gst-receipt-totals-row">
                <span className="gst-receipt-totals-k">CGST @ 9%</span>
                <span className="gst-receipt-totals-v">{formatCurrency(cgst)}</span>
              </div>
              <div className="gst-receipt-totals-row">
                <span className="gst-receipt-totals-k">SGST @ 9%</span>
                <span className="gst-receipt-totals-v">{formatCurrency(sgst)}</span>
              </div>
              <div className="gst-receipt-totals-row gst-receipt-totals-row--grand">
                <span className="gst-receipt-totals-grand-k">Total paid</span>
                <span className="gst-receipt-totals-grand-v">{formatCurrency(details.amount)}</span>
              </div>
            </div>

            {/* Payment Info Footer */}
            <div className="gst-receipt-payment-footer">
              <div>
                <span className="gst-receipt-eyebrow">PAYMENT DETAILS</span>
                <div className="gst-receipt-pay-method">{details.method ? `${details.method.toUpperCase()} · Paid` : 'Online Payment'}</div>
                <div className="gst-receipt-pay-txn">{details.transactionId}</div>
              </div>
              <span className="gst-receipt-paid-badge">
                <span className="gst-receipt-badge-dot" /> Paid in full
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Next Steps & Support */}
        <GSTReceiptSidebar />
      </div>

      {/* 3. Bottom Action Buttons */}
      <div className="gst-receipt-bottom-bar">
        <button type="button" className="gst-receipt-btn-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="gst-receipt-top-actions">
          <button type="button" className="gst-receipt-btn-primary" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-receipt-icon-sm">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default GSTFilingReceipt
