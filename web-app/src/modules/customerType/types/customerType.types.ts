import type { ReactNode } from 'react'

export type CustomerTypeId =
  | 'individual'
  | 'proprietorship'
  | 'partnership'
  | 'llp'
  | 'private_limited'
  | 'public_limited'
  | 'huf'
  | 'aop_boi'
  | 'freelancer'
  | 'ngo_trust'
  | 'salaried'
  | 'business'
  | 'company'

export interface CustomerTypeOption {
  id: CustomerTypeId
  title: string
  description: string
  icon: ReactNode
}

export interface CustomerTypeState {
  selectedId: CustomerTypeId
  setSelectedId: (id: CustomerTypeId) => void
}
