export type PaymentMethodType = 'upi' | 'card' | 'netbanking'

export interface CardDetails {
  cardNumber: string
  expiry: string
  cvv: string
  cardHolder: string
}

export interface PaymentResult {
  paymentId: string
  /** Gateway order the payment belongs to */
  orderId?: string
  method: PaymentMethodType
  amount: number
  applicationRef: string
  timestamp: string
  status: 'SUCCESS' | 'FAILED'
  /** True only after server-side verification of the gateway callback */
  verified: boolean
  receiptNumber?: string
}

export interface PaymentBreakdown {
  baseAmount: number
  gstAmount: number
  discountAmount: number
  totalAmount: number
}

export interface PaymentCheckoutProps {
  amount: number
  /** Lets the payments service apply service-specific coupons */
  serviceId?: string
  serviceTitle?: string
  applicationRef?: string
  applicantName?: string
  onBack?: () => void
  onSuccess: (result: PaymentResult) => void
  showTrustBadges?: boolean
  enablePromoCode?: boolean
  defaultMethod?: PaymentMethodType
  className?: string
}
