import React, { useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAuthStore, useAppStore } from '@store/index'
import { PaymentCheckout } from '@shared/components/PaymentCheckout'
import type { PaymentResult } from '@shared/components/PaymentCheckout/payment.types'
import {
  resolveCheckoutApplication,
  resolveCheckoutAmount,
  recordCheckoutPayment,
  ApplicationResolutionError,
  PaymentExecutionError,
  type CheckoutApplicationTarget,
} from '../../services/paymentPricing'
import './PaymentCheckoutPage.css'

export const PaymentCheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const pushToast = useAppStore((state) => state.pushToast)

  const stateApp = (location.state as { application?: CheckoutApplicationTarget })?.application

  // Resolve application with structured exception handling
  const application = useMemo(() => {
    try {
      return resolveCheckoutApplication(id, stateApp)
    } catch (err) {
      if (err instanceof ApplicationResolutionError) {
        console.warn(err.message)
      }
      return null
    }
  }, [id, stateApp])

  // Resolve amount due via centralized pricing pipeline
  const amount = useMemo(() => {
    return resolveCheckoutAmount(application, stateApp)
  }, [application, stateApp])

  const appReference = application?.code || id || 'APP-2026-0001'
  const appTitle = application?.title || 'Finsolz Filing Service'
  const applicantName = user?.fullName || 'Client'
  const isAlreadyPaid = application?.paymentStatus === 'Paid'

  const handleSuccess = (result: PaymentResult) => {
    const targetCode = application?.code || id || result.applicationRef || ''
    try {
      recordCheckoutPayment(targetCode, {
        paymentId: result.paymentId,
        method: result.method,
        amount,
      })

      pushToast(`Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`, 'success')
      navigate(routePaths.paymentReceipt(result.paymentId || targetCode || 'latest'))
    } catch (error) {
      const message =
        error instanceof PaymentExecutionError
          ? error.message
          : 'Payment succeeded, but could not update local records.'
      pushToast(message, 'error')
      navigate(routePaths.paymentReceipt(result.paymentId || targetCode || 'latest'))
    }
  }

  // Prevent duplicate payment attempts if application is already paid
  if (isAlreadyPaid) {
    return (
      <div className="payment-checkout-page" data-testid="payment-checkout-page">
        <main className="payment-checkout-page__body">
          <div className="payment-checkout-completed-card" data-testid="payment-already-completed-card">
            <div className="payment-checkout-completed-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="payment-checkout-completed-title">Payment Already Completed</h2>
            <p className="payment-checkout-completed-desc">
              This application (<strong>{appReference}</strong>) has already been successfully paid.
            </p>
            <div className="payment-checkout-completed-details">
              <div className="payment-checkout-detail-row">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{appTitle}</span>
              </div>
              <div className="payment-checkout-detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className="payment-status-badge payment-status-badge--paid">Paid</span>
              </div>
              {application?.paidAt && (
                <div className="payment-checkout-detail-row">
                  <span className="detail-label">Paid On:</span>
                  <span className="detail-value">{application.paidAt}</span>
                </div>
              )}
              {application?.transactionId && (
                <div className="payment-checkout-detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{application.transactionId}</span>
                </div>
              )}
            </div>
            <div className="payment-checkout-completed-actions">
              <button
                type="button"
                className="payment-completed-btn payment-completed-btn--receipt"
                onClick={() => navigate(routePaths.paymentReceipt(application?.transactionId || appReference))}
                data-testid="payment-view-receipt-btn"
              >
                View Receipt
              </button>
              <button
                type="button"
                className="payment-completed-btn payment-completed-btn--secondary"
                onClick={() => navigate(routePaths.payments)}
                data-testid="payment-back-to-payments-btn"
              >
                Go to Payments
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="payment-checkout-page" data-testid="payment-checkout-page">
      {/* Main Checkout Area with Payment Methods & Order Summary */}
      <main className="payment-checkout-page__body">
        <PaymentCheckout
          amount={amount}
          serviceId={application?.id || 'service-filing'}
          serviceTitle={appTitle}
          applicationRef={appReference}
          applicantName={applicantName}
          summaryTitle="Order Summary"
          onSuccess={handleSuccess}
          showTrustBadges={true}
          enablePromoCode={true}
        />
      </main>
    </div>
  )
}

export default PaymentCheckoutPage
