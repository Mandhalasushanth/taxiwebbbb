import React, { useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { useAuthStore, useAppStore } from '@store/index'
import { PaymentCheckout } from '@shared/components/PaymentCheckout'
import type { PaymentResult } from '@shared/components/PaymentCheckout/payment.types'
import './PaymentCheckoutPage.css'

export const PaymentCheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const pushToast = useAppStore((state) => state.pushToast)

  const stateApp = (location.state as { application?: { id?: string; code?: string; title?: string; amount?: number } })?.application

  // Resolve application from userStorage, state, or default
  const application = useMemo(() => {
    if (stateApp) return stateApp
    const allApps = userStorage.getUserApplications()
    if (!id) {
      return allApps.find((a) => a.paymentStatus === 'Pending') || allApps[0] || null
    }
    const cleanId = id.trim().toLowerCase()
    return (
      allApps.find(
        (a) =>
          a.code?.toLowerCase() === cleanId ||
          a.id?.toLowerCase() === cleanId ||
          (a.meta && a.meta.toLowerCase().includes(cleanId))
      ) || null
    )
  }, [id, stateApp])

  // Resolve amount to pay
  const amount = useMemo(() => {
    if (typeof stateApp?.amount === 'number' && stateApp.amount > 0) {
      return stateApp.amount
    }
    const appWithCharges = application as unknown as {
      finalizedCharges?: { total?: number }
      paymentAmount?: number
      amount?: number
      title?: string
    }
    if (appWithCharges?.finalizedCharges?.total) {
      return appWithCharges.finalizedCharges.total
    }
    const rawAmt = appWithCharges?.paymentAmount || appWithCharges?.amount
    if (typeof rawAmt === 'number' && rawAmt > 0) {
      return rawAmt
    }
    if (appWithCharges?.title) {
      const t = appWithCharges.title.toLowerCase()
      if (t.includes('gst')) return 2344
      if (t.includes('itr') || t.includes('tds')) return 1800
      if (t.includes('loan')) return 1180
      if (t.includes('company') || t.includes('incorporation')) return 4999
    }
    return 1800
  }, [application, stateApp])

  const appReference = application?.code || id || 'APP-2026-0001'
  const appTitle = application?.title || 'TaxEdge Filing Service'
  const applicantName = user?.fullName || 'Client'

  const handleSuccess = (result: PaymentResult) => {
    // Update local storage so that payments and dashboard reflect the paid status immediately
    const targetCode = application?.code || id || ''
    if (targetCode) {
      userStorage.recordApplicationPayment(targetCode, {
        transactionId: result.paymentId,
        paidAmount: amount,
        paymentMethod: result.method,
      })
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new Event('taxedge:applications-updated'))
      } catch {
        // Safe fallback
      }
    }

    pushToast(`Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`, 'success')
    navigate(routePaths.paymentReceipt(result.paymentId || targetCode || 'latest'))
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
