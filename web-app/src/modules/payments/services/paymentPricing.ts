import { userStorage } from '@core/storage/userStorage'
import type { RecentApplication } from '@modules/dashboard/types/dashboard.types'

/**
 * Domain error representing validation failures during payment processing.
 */
export class PaymentValidationError extends Error {
  readonly field: string

  constructor(field: string, message: string) {
    super(message)
    this.name = 'PaymentValidationError'
    this.field = field
  }
}

/**
 * Domain error representing failures when resolving applications for checkout.
 */
export class ApplicationResolutionError extends Error {
  readonly identifier?: string

  constructor(message: string, identifier?: string) {
    super(message)
    this.name = 'ApplicationResolutionError'
    this.identifier = identifier
  }
}

/**
 * Domain error representing gateway or payment persistence failures.
 */
export class PaymentExecutionError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'PaymentExecutionError'
    this.code = code
  }
}

/**
 * Standard default fees by service keyword.
 * Eliminates nested if-else statements across pages and components.
 */
export const SERVICE_DEFAULT_FEES: Record<string, number> = {
  incorporation: 4999,
  company: 4999,
  business: 4999,
  gst: 2500,
  goods: 2500,
  itr: 1800,
  tds: 1800,
  tax: 1800,
  loan: 1180,
}

export const FALLBACK_SERVICE_FEE = 1800

/**
 * Resolves standard service fee from title using keyword lookup.
 */
export const resolveServiceFee = (title: string = ''): number => {
  const normalized = title.trim().toLowerCase()
  const matchedKey = Object.keys(SERVICE_DEFAULT_FEES).find((k) => normalized.includes(k))
  return matchedKey ? SERVICE_DEFAULT_FEES[matchedKey] : FALLBACK_SERVICE_FEE
}

export interface CheckoutApplicationTarget {
  id?: string
  code?: string
  title?: string
  amount?: number
  meta?: string
  paymentStatus?: string
  finalizedCharges?: { total?: number }
  paymentAmount?: number
}

/**
 * Safely resolves target application for checkout with structured exception handling.
 */
export const resolveCheckoutApplication = (
  id?: string,
  stateApp?: CheckoutApplicationTarget | null
): CheckoutApplicationTarget | null => {
  try {
    if (stateApp) return stateApp

    const allApps = userStorage.getUserApplications()
    if (!allApps || allApps.length === 0) return null

    if (!id) {
      return (allApps.find((a) => a.paymentStatus === 'Pending') || allApps[0] || null) as CheckoutApplicationTarget | null
    }

    const cleanId = id.trim().toLowerCase()
    const found = allApps.find((a) => {
      const codeMatch = a.code?.toLowerCase() === cleanId
      const idMatch = a.id?.toLowerCase() === cleanId
      const metaMatch = Boolean(a.meta?.toLowerCase().includes(cleanId))
      return codeMatch || idMatch || metaMatch
    })

    return (found as CheckoutApplicationTarget) || null
  } catch (error) {
    throw new ApplicationResolutionError(
      `Failed to resolve checkout application: ${error instanceof Error ? error.message : 'Unknown storage error'}`,
      id
    )
  }
}

/**
 * Resolves amount due from application context via an ordered strategy pipeline.
 */
export const resolveCheckoutAmount = (
  application?: CheckoutApplicationTarget | null,
  stateApp?: CheckoutApplicationTarget | null
): number => {
  try {
    // 1. Explicit amount passed in navigation state
    if (typeof stateApp?.amount === 'number' && stateApp.amount > 0) {
      return stateApp.amount
    }

    // 2. Finalized charges breakdown from application object
    if (typeof application?.finalizedCharges?.total === 'number' && application.finalizedCharges.total > 0) {
      return application.finalizedCharges.total
    }

    // 3. Stored paymentAmount or amount on application
    const rawAmt = application?.paymentAmount ?? application?.amount
    if (typeof rawAmt === 'number' && rawAmt > 0) {
      return rawAmt
    }

    // 4. Keyword-based standard catalog fee
    if (application?.title) {
      return resolveServiceFee(application.title)
    }

    return FALLBACK_SERVICE_FEE
  } catch (error) {
    console.warn('Could not compute exact checkout amount, using fallback rate', error)
    return FALLBACK_SERVICE_FEE
  }
}

/**
 * Records payment completion and triggers application synchronization.
 */
export const recordCheckoutPayment = (
  targetCode: string,
  paymentDetails: { paymentId: string; method?: string; amount: number }
): RecentApplication | null => {
  if (!targetCode) {
    throw new PaymentExecutionError('Missing application reference code for payment recording')
  }

  try {
    const updated = userStorage.recordApplicationPayment(targetCode, {
      transactionId: paymentDetails.paymentId,
      paidAmount: paymentDetails.amount,
      paymentMethod: paymentDetails.method,
    })

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taxedge:applications-updated'))
    }

    return updated
  } catch (error) {
    throw new PaymentExecutionError(
      `Failed to record application payment: ${error instanceof Error ? error.message : 'Storage write failed'}`,
      paymentDetails.paymentId
    )
  }
}
