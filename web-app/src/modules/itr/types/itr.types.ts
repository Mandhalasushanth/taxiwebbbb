import type { ApplicationStatus, Timestamped } from '@shared/types'

export type ItrViewKey =
  | 'overview'
  | 'track-my-return'
  | 'itr-filing'
  | 'tds-refund'
  | 'previous-year-itr'
  | 'revised-itr'
  | 'tax-notice-assistance'

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
