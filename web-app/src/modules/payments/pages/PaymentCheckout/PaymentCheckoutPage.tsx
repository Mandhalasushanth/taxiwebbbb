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
  const appTitle = application?.title || 'TaxEdge Filing Service'
  const applicantName = user?.fullName || 'Client'

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
