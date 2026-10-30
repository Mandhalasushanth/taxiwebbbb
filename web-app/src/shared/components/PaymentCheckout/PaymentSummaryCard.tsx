import React, { useState } from 'react'
import { FileText, ArrowRight } from 'lucide-react'
import type { CouponValidationResult } from '@core/payments'
import type { PaymentBreakdown } from './payment.types'
import { formatCurrency } from '@shared/utils'

interface PaymentSummaryCardProps {
  breakdown: PaymentBreakdown
  serviceTitle?: string
  summaryTitle?: string
  applicationRef?: string
  applicantName?: string
  isProcessing: boolean
  enablePromoCode?: boolean
  showTrustBadges?: boolean
  /** Code currently applied (validated by the payments service) */
  appliedPromoCode?: string
  onApplyPromo?: (code: string) => Promise<CouponValidationResult>
  onRemovePromo?: () => void
  onPay: () => void
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  breakdown,
  serviceTitle = 'Service Filing',
  summaryTitle = 'Order Summary',
  applicationRef,
  applicantName,
  isProcessing,
  enablePromoCode = true,
  showTrustBadges = true,
  appliedPromoCode,
  onApplyPromo,
  onRemovePromo,
  onPay,
}) => {
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isCheckingPromo, setIsCheckingPromo] = useState(false)
  const promoApplied = Boolean(appliedPromoCode)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = promoInput.trim().toUpperCase()
    if (!code || !onApplyPromo || isCheckingPromo) return
    setIsCheckingPromo(true)
    setPromoError(null)
    try {
      const result = await onApplyPromo(code)
      if (result.valid) setPromoInput('')
      else setPromoError(result.message)
    } finally {
      setIsCheckingPromo(false)
    }
  }

  const handleRemove = () => {
    setPromoError(null)
    onRemovePromo?.()
  }

  return (
    <div className="payment-summary-wrapper">
      {/* 1. Header aligned with left section title */}
      <h3 className="payment-section-title">{summaryTitle}</h3>

      <aside className="payment-summary-card" data-testid="payment-summary-card">
        {/* 2. Service Row with Icon & Reference */}
        <div className="payment-summary-service-row">
          <div className="payment-summary-icon-box">
            <FileText size={20} className="payment-summary-file-icon" />
          </div>
          <div className="payment-summary-service-col">
            <span className="payment-summary-service-name">{serviceTitle}</span>
            {applicationRef && (
              <span className="payment-summary-service-ref">• {applicationRef}</span>
            )}
            {applicantName && !applicationRef && (
              <span className="payment-summary-service-ref">• {applicantName}</span>
            )}
          </div>
        </div>

      {/* 3. Fee Breakdown List */}
      <div className="payment-summary-calc-list">
        <div className="payment-summary-calc-row">
          <span className="payment-summary-calc-label">Professional Fee</span>
          <span className="payment-summary-calc-val">{formatCurrency(breakdown.baseAmount)}</span>
        </div>

        <div className="payment-summary-calc-row">
          <span className="payment-summary-calc-label">GST (18%)</span>
          <span className="payment-summary-calc-val">{formatCurrency(breakdown.gstAmount)}</span>
        </div>

        <div className="payment-summary-calc-row">
          <span className="payment-summary-calc-label">Discount</span>
          <span className="payment-summary-calc-val">
            {breakdown.discountAmount > 0
              ? `-${formatCurrency(breakdown.discountAmount)}`
              : '₹0'}
          </span>
        </div>
      </div>

      {/* Optional Promo Code Input */}
      {enablePromoCode && !promoApplied && (
        <form className="payment-promo-form" onSubmit={handleApply} noValidate>
          <input
            type="text"
            className={`payment-promo-input ${promoError ? 'payment-input--error' : ''}`}
            placeholder="Promo code"
            value={promoInput}
            maxLength={20}
            onChange={(e) => {
              setPromoInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              setPromoError(null)
            }}
            aria-label="Promo code"
          />
          <button
            type="submit"
            className="payment-promo-btn"
            disabled={!promoInput.trim() || isCheckingPromo}
          >
            {isCheckingPromo ? '…' : 'Apply'}
          </button>
        </form>
      )}

      {promoError && (
        <p className="payment-field-error payment-promo-error" role="alert">
          {promoError}
        </p>
      )}

      {promoApplied && breakdown.discountAmount > 0 && (
        <div className="payment-promo-success">
          <span>
            {appliedPromoCode} applied! Saved {formatCurrency(breakdown.discountAmount)}
          </span>
          {onRemovePromo && (
            <button
              type="button"
              className="payment-promo-remove"
              onClick={handleRemove}
              disabled={isProcessing}
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* 4. Total Amount Banner matching Image */}
      <div className="payment-summary-total-banner">
        <span className="payment-summary-total-label">Total Amount</span>
        <span className="payment-summary-total-value" data-testid="payment-total-amount">
          {formatCurrency(breakdown.totalAmount)}
        </span>
      </div>

      {/* 5. Complete Payment Action Button */}
      <button
        type="button"
        className="payment-pay-btn"
        onClick={onPay}
        disabled={isProcessing}
        data-testid="payment-pay-now-btn"
      >
        {isProcessing ? (
          <>
            <span className="payment-btn-spinner" aria-hidden="true" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <span>Pay {formatCurrency(breakdown.totalAmount)}</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>

      {/* Trust reassurance */}
      {showTrustBadges && (
        <div className="payment-summary-trust-sub">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <span>100% Secure & RBI Regulated</span>
        </div>
      )}
      </aside>
    </div>
  )
}
