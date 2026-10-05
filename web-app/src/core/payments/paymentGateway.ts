import { apiClient, apiEndpoints } from '../api'
import { env } from '../config'

import type {
  CouponValidationRequest,
  CouponValidationResult,
  CreateOrderRequest,
  PaymentInstrument,
  PaymentOrder,
  VerifiedPayment,
} from './paymentGateway.types'

/* ------------------------------------------------------------------ *
 * Development mocks — stand in for the payments API while mocks are on.
 * They apply the same rules the backend must enforce, so the UI cannot
 * grant discounts or mark a payment successful on its own.
 * ------------------------------------------------------------------ */

interface MockCoupon {
  kind: 'percent' | 'flat'
  value: number
  expiresOn: string
  minAmount: number
}

const MOCK_ACTIVE_COUPONS: Record<string, MockCoupon> = {
  TAXEDGE10: { kind: 'percent', value: 10, expiresOn: '2027-03-31', minAmount: 0 },
  SAVE10: { kind: 'percent', value: 10, expiresOn: '2027-03-31', minAmount: 0 },
  FLAT100: { kind: 'flat', value: 100, expiresOn: '2027-03-31', minAmount: 500 },
  WELCOME20: { kind: 'percent', value: 20, expiresOn: '2026-01-31', minAmount: 0 },
}

/** UPI handles of real PSP banks; anything else (e.g. name@fakebank) cannot be verified */
const MOCK_KNOWN_UPI_HANDLES = new Set([
  'upi', 'ybl', 'ibl', 'axl', 'paytm', 'apl', 'okaxis', 'okhdfcbank', 'okicici', 'oksbi',
  'icici', 'hdfcbank', 'sbi', 'axisbank', 'kotak', 'freecharge', 'jupiteraxis', 'waaxis',
])

const MOCK_LATENCY_MS = 500
const delay = (ms = MOCK_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const randomId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
const today = () => new Date().toISOString().slice(0, 10)

/** Orders created in this session: the verified amount must match the order, never the UI */
const mockOrders = new Map<string, PaymentOrder>()

const mockValidateCoupon = ({ code, amount }: CouponValidationRequest): CouponValidationResult => {
  const normalized = code.trim().toUpperCase()
  const coupon = MOCK_ACTIVE_COUPONS[normalized]
  if (!coupon) return { valid: false, code: normalized, discountAmount: 0, message: 'Invalid promo code' }
  if (coupon.expiresOn < today()) {
    return { valid: false, code: normalized, discountAmount: 0, message: 'This promo code has expired' }
  }
  if (amount < coupon.minAmount) {
    return { valid: false, code: normalized, discountAmount: 0, message: `This promo code needs a minimum order of ₹${coupon.minAmount}` }
  }
  const raw = coupon.kind === 'percent' ? Math.round((amount * coupon.value) / 100) : coupon.value
  const discountAmount = Math.min(raw, amount)
  return { valid: true, code: normalized, discountAmount, message: 'Promo code applied' }
}

/** Luhn checksum used by every card network */
const passesLuhn = (digits: string): boolean =>
  digits
    .split('')
    .reverse()
    .map(Number)
    .reduce((sum, digit, index) => {
      if (index % 2 === 0) return sum + digit
      const doubled = digit * 2
      return sum + (doubled > 9 ? doubled - 9 : doubled)
    }, 0) % 10 === 0

const mockDeclineReason = (instrument: PaymentInstrument): string | undefined => {
  if (instrument.method === 'upi') {
    const handle = (instrument.upiId ?? '').split('@')[1]?.toLowerCase() ?? ''
    return MOCK_KNOWN_UPI_HANDLES.has(handle) ? undefined : 'UPI ID could not be verified with any bank. Please check and try again.'
  }
  if (instrument.method === 'card') {
    const digits = (instrument.cardNumber ?? '').replace(/\D/g, '')
    return digits.length >= 13 && passesLuhn(digits) ? undefined : 'Card was declined by the issuing bank.'
  }
  return instrument.bank ? undefined : 'Bank authorisation was not completed.'
}

/* ------------------------------------------------------------------ */

/**
 * Payment gateway boundary. Discounts come only from the server, and a payment counts
 * as successful only after the server verifies the gateway callback (`verified: true`).
 */
export const paymentGateway = {
  async validateCoupon(request: CouponValidationRequest): Promise<CouponValidationResult> {
    if (env.enableMocks) {
      await delay()
      return mockValidateCoupon(request)
    }
    return apiClient.post<CouponValidationResult>(apiEndpoints.payments.validateCoupon, request)
  },

  async createOrder(request: CreateOrderRequest): Promise<PaymentOrder> {
    if (env.enableMocks) {
      await delay()
      const discountAmount = request.couponCode
        ? mockValidateCoupon({ code: request.couponCode, amount: request.amount }).discountAmount
        : 0
      const order: PaymentOrder = {
        orderId: randomId('order'),
        payableAmount: Math.max(0, request.amount - discountAmount),
        discountAmount,
      }
      mockOrders.set(order.orderId, order)
      return order
    }
    return apiClient.post<PaymentOrder>(apiEndpoints.payments.createOrder, request)
  },

  /**
   * Completes the payment with the gateway and returns the server-verified outcome.
   * Callers must treat anything other than { status: 'SUCCESS', verified: true } as unpaid.
   */
  async payAndVerify(order: PaymentOrder, instrument: PaymentInstrument): Promise<VerifiedPayment> {
    const base = {
      orderId: order.orderId,
      amount: order.payableAmount,
      method: instrument.method,
      timestamp: new Date().toISOString(),
    }
    if (env.enableMocks) {
      await delay()
      const knownOrder = mockOrders.get(order.orderId)
      const failureReason = knownOrder ? mockDeclineReason(instrument) : 'Unknown payment order.'
      if (failureReason) {
        return { ...base, status: 'FAILED', verified: false, paymentId: '', receiptNumber: '', failureReason }
      }
      mockOrders.delete(order.orderId)
      return {
        ...base,
        amount: knownOrder?.payableAmount ?? order.payableAmount,
        status: 'SUCCESS',
        verified: true,
        paymentId: randomId('pay'),
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      }
    }
    return apiClient.post<VerifiedPayment>(apiEndpoints.payments.verify, {
      orderId: order.orderId,
      method: instrument.method,
      upiId: instrument.upiId,
      bank: instrument.bank,
    })
  },
}

export const isVerifiedPayment = (payment: Pick<VerifiedPayment, 'status' | 'verified'> | null | undefined): boolean =>
  Boolean(payment && payment.status === 'SUCCESS' && payment.verified)
