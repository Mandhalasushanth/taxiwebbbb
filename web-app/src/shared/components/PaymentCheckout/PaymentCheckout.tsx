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
import './PaymentFeedback.css'

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  amount,
  serviceId,
  serviceTitle = 'Professional Filing Service',
  applicationRef = 'APP-2026-00001',
  applicantName,
  onBack,
  onSuccess,
  showTrustBadges = true,
  enablePromoCode = true,
  defaultMethod = 'upi',
  className = '',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(defaultMethod)
  const [upiId, setUpiId] = useState('')
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay')
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
      if (!upiId.trim()) {
        setUpiError('Please enter your UPI ID')
        return false
      }
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        setUpiError('Enter a valid UPI ID (e.g. mobile@upi or username@bank)')
        return false
      }
      setUpiError(null)
      return true
    }

    if (selectedMethod === 'card') {
      const errors: Partial<Record<keyof CardDetails, string>> = {}
      const cleanNum = cardDetails.cardNumber.replace(/\s+/g, '')
      if (!cleanNum || cleanNum.length < 16) {
        errors.cardNumber = 'Enter a valid 16-digit card number'
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
        errors.expiry = 'Valid MM/YY required'
      }
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'Enter 3 or 4-digit CVV'
      }
      if (!cardDetails.cardHolder.trim()) {
        errors.cardHolder = 'Cardholder name is required'
      }
      setCardErrors(errors)
      return Object.keys(errors).length === 0
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
      const payment = await paymentGateway.payAndVerify(order, {
        method: selectedMethod,
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
        {/* Left Column: Methods & Selected Form */}
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

          {selectedMethod === 'card' && (
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
          <div className="payment-checkout-actions">
            {onBack && (
              <button
                type="button"
                className="payment-checkout-back-btn"
                onClick={onBack}
                disabled={isProcessing}
                data-testid="payment-back-btn"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Summary & Checkout Card */}
        <div className="payment-checkout-aside">
          <PaymentSummaryCard
            breakdown={breakdown}
            serviceTitle={serviceTitle}
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
