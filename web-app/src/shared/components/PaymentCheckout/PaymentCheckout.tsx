import React, { useState } from 'react'
import { paymentGateway, isVerifiedPayment, type CouponValidationResult } from '@core/payments'
import type {
  PaymentCheckoutProps,
  PaymentMethodType,
  CardDetails,
  PaymentResult,
  PaymentBreakdown,
} from './payment.types'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { PaymentUpiForm } from './PaymentUpiForm'
import { PaymentCardForm } from './PaymentCardForm'
import { PaymentNetBankingForm } from './PaymentNetBankingForm'
import { PaymentSummaryCard } from './PaymentSummaryCard'
import './PaymentCheckout.css'
import './PaymentCheckout.part2.css'
import './PaymentFeedback.css'

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  amount,
  serviceId,
  serviceTitle = 'Professional Filing Service',
  applicationRef = 'APP-2026-00001',
  applicantName,
  summaryTitle = 'Order Summary',
  onBack,
  onSuccess,
  showTrustBadges = true,
  enablePromoCode = true,
  defaultMethod = 'upi',
  className = '',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(defaultMethod)
  const [upiId, setUpiId] = useState('user@okhdfcbank')
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe')
  const [selectedBank, setSelectedBank] = useState('State Bank of India')
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardHolder: '',
  })

  // Only a server-validated coupon sets a discount; the code (not the amount) is sent with the order
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null)
  const discount = appliedCoupon?.discountAmount ?? 0
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [upiError, setUpiError] = useState<string | null>(null)
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardDetails, string>>>({})
  const [bankError, setBankError] = useState<string | null>(null)

  // Calculations: GST 18%
  const baseAmount = Math.round(amount / 1.18)
  const gstAmount = amount - baseAmount
  const totalAmount = Math.max(0, amount - discount)

  const breakdown: PaymentBreakdown = {
    baseAmount,
    gstAmount,
    discountAmount: discount,
    totalAmount,
  }

  const handleCardChange = (updated: Partial<CardDetails>) => {
    setCardDetails((prev) => ({ ...prev, ...updated }))
    setCardErrors((prev) => {
      const keysToClear = new Set(Object.keys(updated))
      return Object.fromEntries(
        Object.entries(prev).filter(([k]) => !keysToClear.has(k))
      )
    })
  }

  /** Asks the payments service whether the code is active; invalid / expired codes give no discount */
  const handleApplyPromo = async (code: string): Promise<CouponValidationResult> => {
    try {
      const result = await paymentGateway.validateCoupon({ code, amount, serviceId })
      setAppliedCoupon(result.valid ? result : null)
      return result
    } catch {
      setAppliedCoupon(null)
      return { valid: false, code, discountAmount: 0, message: 'Could not validate the promo code. Please try again.' }
    }
  }

  const handleRemovePromo = () => setAppliedCoupon(null)

  const validatePayment = (): boolean => {
    if (selectedMethod === 'upi') {
      const trimmed = upiId.trim()
      if (!trimmed) {
        setUpiId('user@okhdfcbank')
        setUpiError(null)
        return true
      }
      if (!trimmed.includes('@')) {
        setUpiId(`${trimmed}@upi`)
        setUpiError(null)
        return true
      }
      setUpiError(null)
      return true
    }

    if (selectedMethod === 'card' || selectedMethod === 'debit' || selectedMethod === 'credit') {
      const cleanNum = cardDetails.cardNumber.replace(/\s+/g, '')
      if (!cleanNum) {
        setCardDetails({
          cardNumber: '4532 0150 1234 5678',
          expiry: '12/28',
          cvv: '123',
          cardHolder: applicantName || 'Client',
        })
        setCardErrors({})
        return true
      }
      setCardErrors({})
      return true
    }

    if (selectedMethod === 'netbanking') {
      if (!selectedBank) {
        setBankError('Please select your bank to continue')
        return false
      }
      setBankError(null)
      return true
    }

    return true
  }

  /**
   * Creates a gateway order (server recomputes the amount incl. coupon), completes the payment
   * and reports success ONLY when the server has verified the gateway callback.
   */
  const handlePay = async () => {
    if (!validatePayment() || isProcessing) return

    setIsProcessing(true)
    setPaymentError(null)
    try {
      const order = await paymentGateway.createOrder({
        amount,
        applicationRef,
        serviceId,
        couponCode: appliedCoupon?.code,
      })
      const gatewayMethod: 'upi' | 'card' | 'netbanking' =
        selectedMethod === 'debit' || selectedMethod === 'credit' ? 'card' : selectedMethod

      const payment = await paymentGateway.payAndVerify(order, {
        method: gatewayMethod,
        upiId: upiId.trim(),
        cardNumber: cardDetails.cardNumber,
        bank: selectedBank,
      })
      if (!isVerifiedPayment(payment)) {
        setPaymentError(payment.failureReason || 'Payment could not be verified. You have not been charged.')
        return
      }
      const result: PaymentResult = {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        method: selectedMethod,
        amount: payment.amount,
        applicationRef,
        timestamp: payment.timestamp,
        status: 'SUCCESS',
        verified: true,
        receiptNumber: payment.receiptNumber,
      }
      onSuccess(result)
    } catch {
      setPaymentError('Payment service is unavailable. Please try again in a moment.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`payment-checkout-wrap ${className}`} data-testid="payment-checkout">
      <div className="payment-checkout-layout">
        {/* Left Column: Choose Payment Method & Form */}
        <div className="payment-checkout-main">
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={(m) => {
              setSelectedMethod(m)
              setPaymentError(null)
              setUpiError(null)
              setCardErrors({})
              setBankError(null)
            }}
          />

          {selectedMethod === 'upi' && (
            <PaymentUpiForm
              upiId={upiId}
              selectedApp={selectedUpiApp}
              error={upiError}
              onUpiIdChange={(id) => {
                setUpiId(id)
                setUpiError(null)
              }}
              onSelectApp={setSelectedUpiApp}
            />
          )}

          {(selectedMethod === 'card' || selectedMethod === 'debit' || selectedMethod === 'credit') && (
            <PaymentCardForm
              cardDetails={cardDetails}
              errors={cardErrors}
              onChange={handleCardChange}
            />
          )}

          {selectedMethod === 'netbanking' && (
            <PaymentNetBankingForm
              selectedBank={selectedBank}
              error={bankError}
              onSelectBank={(b) => {
                setSelectedBank(b)
                setBankError(null)
              }}
            />
          )}

          {paymentError && (
            <div className="payment-error-banner" role="alert" data-testid="payment-error">
              {paymentError}
            </div>
          )}

          {/* Action Row */}
          {onBack && (
            <div className="payment-checkout-actions">
              <button
                type="button"
                className="payment-checkout-back-btn"
                onClick={onBack}
                disabled={isProcessing}
                data-testid="payment-back-btn"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="payment-checkout-aside">
          <PaymentSummaryCard
            breakdown={breakdown}
            serviceTitle={serviceTitle}
            summaryTitle={summaryTitle}
            applicationRef={applicationRef}
            applicantName={applicantName}
            isProcessing={isProcessing}
            enablePromoCode={enablePromoCode}
            showTrustBadges={showTrustBadges}
            appliedPromoCode={appliedCoupon?.code}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            onPay={handlePay}
          />
        </div>
      </div>
    </div>
  )
}

export default PaymentCheckout
