import type { ApplicationStatus, Timestamped } from '@shared/types'

export const GST_BUSINESS_TYPES = [
  'proprietorship',
  'partnership',
  'llp',
  'private_limited',
  'public_limited',
  'huf',
] as const
export type GstBusinessType = (typeof GST_BUSINESS_TYPES)[number]

export const GST_RETURN_TYPES = ['GSTR-1', 'GSTR-3B', 'GSTR-9', 'CMP-08'] as const
export type GstReturnType = (typeof GST_RETURN_TYPES)[number]

export interface GstTimelineEvent {
  id: string
  label: string
  note?: string
  occurredAt: string
  isComplete: boolean
}

export interface GstApplication extends Timestamped {
  id: string
  reference: string
  legalName: string
  tradeName?: string
  businessType: GstBusinessType
  state: string
  pan: string
  gstin?: string
  status: ApplicationStatus
  timeline: GstTimelineEvent[]
}

export interface GstReturn extends Timestamped {
  id: string
  gstin: string
  returnType: GstReturnType
  period: string
  dueOn: string
  taxPayable: number
  status: ApplicationStatus
}

export interface GstRegistrationPayload {
  legalName: string
  tradeName?: string
  businessType: GstBusinessType
  pan: string
  state: string
  turnover: number
  email: string
  mobile: string
}

export interface GstReturnPayload {
  gstin: string
  returnType: GstReturnType
  period: string
  taxableValue: number
  taxPayable: number
}

export interface GstListFilters {
  status?: ApplicationStatus
  search?: string
}
export type GstAmendmentFieldKey =
  | 'business_address'
  | 'business_name'
  | 'authorized_signatory'
  | 'bank_account'
  | 'additional_place'
  | 'contact_details'
  | 'business_constitution'

export interface GstAmendmentPayload {
  gstin: string
  fieldBeingChanged: string
  fieldKey: GstAmendmentFieldKey
  oldValue: string
  newValue: string
  supportingDocumentName?: string
  supportingDocumentFile?: File | null
}

export interface GstAmendmentRecord extends Timestamped {
  id: string
  reference: string
  gstin: string
  fieldBeingChanged: string
  oldValue: string
  newValue: string
  status: ApplicationStatus
  supportingDocument?: string
}

export interface GstCertificatePayload {
  gstin: string
  registeredContact: string
  requestType: string
}

export interface GstCertificateRecord extends Timestamped {
  id: string
  reference: string
  gstin: string
  registeredContact: string
  requestType: string
  status: ApplicationStatus
  downloadUrl?: string
}

export interface PaymentResult {
  transactionId: string
  receiptNumber: string
  method: string
  dateText: string
  applicationRef: string
  amount: number
  /** Set only when the payments service verified the gateway callback */
  verified: boolean
  orderId?: string
}
