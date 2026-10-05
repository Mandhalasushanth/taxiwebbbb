export type GatewayMethod = 'upi' | 'card' | 'netbanking'

export interface CouponValidationRequest {
  code: string
  /** Order amount before discount (₹, incl. GST) */
  amount: number
  serviceId?: string
}

export interface CouponValidationResult {
  valid: boolean
  code: string
  /** Discount the server allows for this amount (₹); 0 when invalid */
  discountAmount: number
  message: string
}

export interface CreateOrderRequest {
  amount: number
  applicationRef: string
  serviceId?: string
  /** The client sends only the code: the server recomputes the discount */
  couponCode?: string
}

export interface PaymentOrder {
  orderId: string
  /** Amount the gateway will charge after the server-side discount */
  payableAmount: number
  discountAmount: number
}

/** What the customer entered for the chosen method (never stored) */
export interface PaymentInstrument {
  method: GatewayMethod
  upiId?: string
  cardNumber?: string
  bank?: string
}

export interface VerifiedPayment {
  status: 'SUCCESS' | 'FAILED'
  /** True only when the gateway confirmed the payment (callback / webhook signature checked) */
  verified: boolean
  orderId: string
  paymentId: string
  amount: number
  receiptNumber: string
  method: GatewayMethod
  timestamp: string
  failureReason?: string
}
