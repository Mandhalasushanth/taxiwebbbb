import { formatINR } from '@shared/utils'

/** "16 Sep 2026, 12:40 PM" from an ISO timestamp (or now when missing/invalid) */
export const formatGstDateTime = (iso?: string): string => {
  const date = iso ? new Date(iso) : new Date()
  const valid = Number.isNaN(date.getTime()) ? new Date() : date
  const datePart = valid.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timePart = valid.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

/** "₹1,499" from a number */
export const formatRupees = (amount: number): string => formatINR(amount)

/** Client-side reference until the backend issues one, e.g. "GST-CAN-2026-48213" */
export const generateGstReference = (prefix: string): string =>
  `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`
