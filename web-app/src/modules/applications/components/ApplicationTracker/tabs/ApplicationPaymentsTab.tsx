import React from 'react'
import type { ApplicationTrackerData } from '../../../data/applicationTrackerData'

export interface ApplicationPaymentsTabProps {
  data: ApplicationTrackerData
  isPaid: boolean
  isProcessingPayment: boolean
  handlePayNow: () => void
  isManagerOrAdmin: boolean
  isTdsApplication: boolean
  mgrServiceFee: string
  setMgrServiceFee: (val: string) => void
  mgrGovFees: string
  setMgrGovFees: (val: string) => void
  handleFinalizeCharges: (e: React.FormEvent) => void
  computedTotal: string
  mgrSuccess: string | null
  mgrError: string | null
}

export const ApplicationPaymentsTab: React.FC<ApplicationPaymentsTabProps> = ({
  data,
  isPaid,
  isProcessingPayment,
  handlePayNow,
  isManagerOrAdmin,
  isTdsApplication,
  mgrServiceFee,
  setMgrServiceFee,
  mgrGovFees,
  setMgrGovFees,
  handleFinalizeCharges,
  computedTotal,
  mgrSuccess,
  mgrError,
}) => {
  return (
    <div className="app-tracker-web-tab-content">
      {/* Payment Summary Card */}
      <div className="app-tracker-clean-card app-tracker-pay-summary-card">
        <h3 className="app-tracker-card-subtitle" style={{ marginBottom: '16px' }}>Payment Summary</h3>
        <div className="app-tracker-pay-summary-row">
          <div className="app-tracker-pay-summary-left">
            <div className="app-tracker-rupee-circle">₹</div>
            <div>
              <span className="app-tracker-pay-summary-label">Total Amount</span>
              <span className="app-tracker-pay-summary-value">{data.paymentSummary.totalAmount || '₹ 0.00'}</span>
            </div>
          </div>
          <span className="app-tracker-pill-badge app-tracker-pill-badge--completed">Paid</span>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="app-tracker-clean-card">
        <h3 className="app-tracker-card-subtitle">Payment Details</h3>
        <div className="app-tracker-details-list">
          <div className="app-tracker-detail-row">
            <span className="app-tracker-detail-label">Fee Type</span>
            <span className="app-tracker-detail-value">Filing Fee</span>
          </div>
          <div className="app-tracker-detail-row">
            <span className="app-tracker-detail-label">Amount</span>
            <span className="app-tracker-detail-value">{data.paymentSummary.totalAmount || '₹ 0.00'}</span>
          </div>
          <div className="app-tracker-detail-row">
            <span className="app-tracker-detail-label">Payment Mode</span>
            <span className="app-tracker-detail-value">UPI</span>
          </div>
          <div className="app-tracker-detail-row">
            <span className="app-tracker-detail-label">Payment Date</span>
            <span className="app-tracker-detail-value">{data.paymentSummary.paymentDate || data.appliedDate}</span>
          </div>
          <div className="app-tracker-detail-row">
            <span className="app-tracker-detail-label">Transaction ID</span>
            <span className="app-tracker-detail-value app-tracker-detail-value--hash">
              {data.paymentSummary.transactionId && data.paymentSummary.transactionId.length > 10
                ? data.paymentSummary.transactionId
                : `TXNFIL${data.appId.replace(/\D/g, '') || '7026602'}c7e6b4d91a80abd2f1234b9c3`}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status Banner */}
      {isPaid ? (
        <div className="app-tracker-clean-card app-tracker-paid-success-banner">
          <div className="app-tracker-paid-success-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="app-tracker-paid-success-text">Payment completed successfully.</span>
        </div>
      ) : (
        <div className="app-tracker-clean-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>Payment Pending</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Complete payment to expedite CA processing.</p>
          </div>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isProcessingPayment}
            style={{
              padding: '10px 24px',
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessingPayment ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      )}

      {/* Manager Determination Desk (for TDS refunds when authorized) */}
      {isManagerOrAdmin && isTdsApplication && !isPaid && (
        <div className="app-tracker-clean-card" style={{ marginTop: '20px', border: '1px solid #cbd5e1', background: '#f8fafc' }} data-testid="manager-charge-finalization-card">
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#1e293b' }}>Manager Charge Determination</h4>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>Authorized manager desk charge formulation.</p>
          <form onSubmit={handleFinalizeCharges} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label htmlFor="mgr-service-fee" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Service Fee (₹) *</label>
              <input id="mgr-service-fee" type="number" min="0" value={mgrServiceFee} onChange={(e) => setMgrServiceFee(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }} data-testid="mgr-service-fee-input" required />
            </div>
            <div>
              <label htmlFor="mgr-gov-fees" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Government Fees (₹)</label>
              <input id="mgr-gov-fees" type="number" min="0" value={mgrGovFees} onChange={(e) => setMgrGovFees(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }} data-testid="mgr-gov-fees-input" />
            </div>
            <div>
              <button type="submit" style={{ padding: '9px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }} data-testid="mgr-finalize-submit-btn">Publish Charges (₹{computedTotal})</button>
            </div>
          </form>
          {mgrSuccess && <p style={{ color: '#16a34a', fontSize: '13px', marginTop: '10px' }}>{mgrSuccess}</p>}
          {mgrError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>{mgrError}</p>}
        </div>
      )}
    </div>
  )
}
