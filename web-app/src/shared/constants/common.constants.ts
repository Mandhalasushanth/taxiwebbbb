import type {
  ApplicationStatus,
  PaymentStatus,
  ServiceType,
  StatusTone,
} from '../types/common.types'

/** Backend enums are the source of truth; these turn them into display copy. */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MANAGER_REVIEW: 'Manager review',
  QUERY_RAISED: 'Query raised',
  QUERY_RESOLVED: 'Query resolved',
  READY_FOR_ASSIGNMENT: 'Ready for assignment',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export const STATUS_TONES: Record<ApplicationStatus, StatusTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  MANAGER_REVIEW: 'info',
  QUERY_RAISED: 'warning',
  QUERY_RESOLVED: 'info',
  READY_FOR_ASSIGNMENT: 'warning',
  ASSIGNED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PARTIAL: 'Part paid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
}

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusTone> = {
  UNPAID: 'danger',
  PARTIAL: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  GST: 'GST',
  ITR: 'Income tax',
  LOAN: 'Loans',
  INSURANCE: 'Insurance',
  REGISTRATION: 'Registration',
  ACCOUNTS: 'Accounts',
}

import { CANONICAL_INDIAN_STATES_AND_UTS } from '../services/indianStates'

export const INDIAN_STATES = CANONICAL_INDIAN_STATES_AND_UTS

export const REGEX = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/,
  mobile: /^[6-9]\d{9}$/,
  aadhaar: /^[0-9]{12}$/,
  aadhaarMasked: /^\d{4}$/,
  pincode: /^[1-9][0-9]{5}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  bankAcc: /^\d{9,18}$/,
  /**
   * Local part: dot-separated atoms (no leading, trailing or consecutive dots).
   * Domain: dot-separated labels that do not start/end with "-", ending in a 2+ letter TLD.
   */
  email: /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/,
  /** Company CIN, e.g. U12345MH2020PTC123456 */
  cin: /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/,
  /** LLP identification number, e.g. AAB-1234 */
  llpin: /^[A-Z]{3}-\d{4}$/,
} as const

/** RFC 5321 limits on total address and local-part length */
export const EMAIL_LIMITS = { maxLength: 254, maxLocalLength: 64 } as const
