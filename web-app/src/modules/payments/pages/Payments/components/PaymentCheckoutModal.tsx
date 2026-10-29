import React from 'react'
import { X } from 'lucide-react'
import { PaymentCheckout } from '@shared/components/PaymentCheckout'
import type { PaymentResult } from '@shared/components/PaymentCheckout/payment.types'
import type { PaymentItem } from '../Payments'

export interface PaymentCheckoutModalProps {
  checkoutApp: PaymentItem | null
  onClose: () => void
  onSuccess: (result: PaymentResult) => void
  applicantName?: string
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  checkoutApp,
  onClose,
  onSuccess,
  applicantName = 'Client',
}) => {
  if (!checkoutApp) return null

  return (
    <div className="payments-checkout-overlay" role="dialog" aria-modal="true">
      <div className="payments-checkout-modal">
        <div className="payments-checkout-modal__header">
          <div className="payments-checkout-modal__title-box">
            <h3 className="payments-checkout-modal__title">Complete Payment</h3>
            <p className="payments-checkout-modal__subtitle">
              {checkoutApp.title} (App #{checkoutApp.code})
            </p>
          </div>
          <button
            type="button"
            className="payments-checkout-modal__close-btn"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        <div className="payments-checkout-modal__body">
          <PaymentCheckout
            amount={checkoutApp.amount}
            serviceId={checkoutApp.id}
            serviceTitle={checkoutApp.title}
            applicationRef={checkoutApp.code}
            applicantName={applicantName}
            onBack={onClose}
            onSuccess={onSuccess}
            showTrustBadges={true}
            enablePromoCode={true}
          />
        </div>
      </div>
    </div>
  )
}

