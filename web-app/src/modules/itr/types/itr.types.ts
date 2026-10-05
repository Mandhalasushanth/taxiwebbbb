import type { ApplicationStatus, Timestamped } from '@shared/types'

export type ItrViewKey =
  | 'overview'
  | 'track-my-return'
  | 'itr-filing'
  | 'tds-refund'
  | 'previous-year-itr'
  | 'revised-itr'
  | 'tax-notice-assistance'

export interface ItrStatCard {
  id: string
  label: string
  value: string
  subtext: string
  icon: string
}

export interface ItrServiceCard {
  id: string
  title: string
  description: string
  pricing: string
  timeline: string
  icon: 'bar' | 'rupee' | 'clock' | 'document' | 'warning'
  viewKey: ItrViewKey
  accentTag?: string
}

export interface ItrApplicationItem {
  id: string
  title: string
  reference: string
  entityType: string
  formType: string
  caAssigned: string
  statusLabel: string
  statusTone: 'warning' | 'success' | 'info' | 'critical'
  progressPercentage: number
  amountCredited?: number
  updatedAt: string
}

export interface TdsEstimatorValues {
  totalTdsDeducted: number
  estimatedRefund: number
  taxEdgeFee: number
  salaryTds?: number
  interestTds?: number
  contractorTds?: number
}

export interface ItrItem extends Timestamped {
  id: string
  reference: string
  title: string
  status: ApplicationStatus
  amount?: number
}

export interface ItrFilters {
  status?: ApplicationStatus
  search?: string
}
