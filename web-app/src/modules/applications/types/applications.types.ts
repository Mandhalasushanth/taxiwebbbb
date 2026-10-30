import type { ApplicationStatus } from '@shared/types'

export type ApplicationCategory =
  | 'All'
  | 'GST'
  | 'ITR'
  | 'Loans'
  | 'Company Registration'
  | 'Business'
  | 'Insurance'

export type ApplicationOverviewFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_VERIFICATION'

export interface ApplicationsItem {
  id: string
  reference: string
  title: string
  category: 'GST' | 'ITR' | 'Loans' | 'Company Registration' | 'Business' | 'Insurance'
  status: ApplicationStatus | string
  statusLabel: string
  date: string
  tag?: string
  amount?: number
  to?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApplicationsFilters {
  category?: ApplicationCategory
  overviewStatus?: ApplicationOverviewFilter
  search?: string
}

export interface ApplicationOverviewStats {
  total: number
  inProgress: number
  completed: number
  underVerification: number
}
