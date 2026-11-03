import type {
  ApplicationStatus,
  PaymentStatus,
  ServiceType,
  StatusTone,
} from '../types/common.types'
import { CANONICAL_INDIAN_STATES_AND_UTS } from '../services/indianStates'
import { VALIDATION_RULES } from '../validations/validationRules'

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

export const INDIAN_STATES = CANONICAL_INDIAN_STATES_AND_UTS

export const REGEX = {
  pan: VALIDATION_RULES.pan.pattern,
  gstin: VALIDATION_RULES.gstin.pattern,
  mobile: VALIDATION_RULES.mobile.pattern,
  aadhaar: VALIDATION_RULES.aadhaar.pattern,
  aadhaarMasked: /^\d{4}$/,
  pincode: VALIDATION_RULES.pincode.pattern,
  ifsc: VALIDATION_RULES.ifsc.pattern,
  bankAcc: VALIDATION_RULES.accountNumber.pattern,
  email: VALIDATION_RULES.email.pattern,
  name: VALIDATION_RULES.name.pattern,
  address: VALIDATION_RULES.address.pattern,
  city: VALIDATION_RULES.city.pattern,
  /** Company CIN, e.g. U12345MH2020PTC123456 */
  cin: /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/,
  /** LLP identification number, e.g. AAB-1234 */
  llpin: /^[A-Z]{3}-\d{4}$/,
} as const

/** RFC 5321 limits on total address and local-part length */
export const EMAIL_LIMITS = { maxLength: 254, maxLocalLength: 64 } as const
