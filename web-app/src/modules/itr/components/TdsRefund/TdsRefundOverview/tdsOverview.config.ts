import { Activity, Award, Clock, CreditCard, Fingerprint, Wallet, type LucideIcon } from 'lucide-react'
import { ADDITIONAL_DOCUMENTS } from '@modules/itr/utils/tdsRefund.constants'

/** Copy shown on the TDS Refund landing page (first step). */
export const TDS_OVERVIEW_CONTENT = {
  heroTag: 'Income Tax Services',
  title: 'TDS Refund',
  description:
    'Claim excess TDS deducted from your salary, investments, or payments with certified CA verification and live status tracking.',
  featuresTitle: 'Why choose TaxEdge?',
  documentsTitle: 'Documents Required',
  moreLabel: 'More',
  moreModalTitle: 'Additional Documents',
  infoNote: 'Only the documents relevant to your refund claim will be requested in the next steps.',
  startLabel: 'Start TDS Refund',
} as const

export interface TdsOverviewFeature {
  id: string
  title: string
  desc: string
  icon: LucideIcon
}

export const TDS_OVERVIEW_FEATURES: TdsOverviewFeature[] = [
  { id: 'max-refund', title: 'Maximum Refund', desc: 'Identifies all eligible tax credits to maximize refund.', icon: Wallet },
  { id: 'ca-review', title: 'Expert CA Review', desc: 'Verified by certified tax professionals.', icon: Award },
  { id: 'fast-filing', title: 'Fast Filing', desc: 'Prompt verification and swift return submission.', icon: Clock },
  { id: 'live-tracking', title: 'Live Tracking', desc: 'Real-time updates from filing to refund credit.', icon: Activity },
]

export interface TdsOverviewDoc {
  id: string
  label: string
  icon: LucideIcon
}

/** Identity documents shown as cards; everything else opens from "More". */
export const TDS_PRIMARY_DOCS: TdsOverviewDoc[] = [
  { id: 'pan', label: 'PAN Card', icon: CreditCard },
  { id: 'aadhaar', label: 'Aadhaar Card', icon: Fingerprint },
]

export interface TdsMoreDoc {
  name: string
  desc: string
}

/** Listed in the "More" dialog: income proofs first, then the optional supporting documents. */
export const TDS_MORE_DOCS: TdsMoreDoc[] = [
  { name: 'Form 16 / Form 16A', desc: 'TDS certificate from your employer or deductor' },
  { name: 'AIS Statement', desc: 'Annual Information Statement from the Income Tax Portal' },
  { name: 'TIS Statement', desc: 'Taxpayer Information Summary from the Income Tax Portal' },
  { name: 'Bank Statement', desc: 'Statement of the account the refund will be credited to' },
  { name: 'Salary Slip', desc: 'Recent salary slips, if applicable' },
  ...ADDITIONAL_DOCUMENTS,
]
