export interface ServicePill {
  id: string
  label: string
  iconType: 'gst' | 'itr' | 'loan' | 'compliance' | 'tds'
}

export interface OverviewItem {
  id: string
  iconType: 'bank' | 'document' | 'wallet'
  title: string
  badgeLabel?: string
  badgeType?: 'success' | 'info'
  highlightText?: string
  subText?: string
}

export interface BottomStat {
  id: string
  iconType: 'returns' | 'loans' | 'rating'
  value: string
  label: string
}

export interface MetricCardData {
  id: string
  iconType: 'applications' | 'calendar' | 'documents'
  count: string
  label: string
}

export interface TrustBadgeData {
  id: string
  iconType: 'shield' | 'expert' | 'process'
  label: string
}

export const GET_STARTED_SERVICES: ServicePill[] = [
  { id: 'gst', label: 'GST Registration', iconType: 'gst' },
  { id: 'itr', label: 'ITR Filing', iconType: 'itr' },
  { id: 'loans', label: 'Business Loans', iconType: 'loan' },
  { id: 'compliance', label: 'Compliance', iconType: 'compliance' },
  { id: 'tds', label: 'TDS Refunds', iconType: 'tds' },
]

export const FINANCIAL_OVERVIEW_ITEMS: OverviewItem[] = [
  {
    id: 'gst-app',
    iconType: 'bank',
    title: 'GST-2026-00118',
    badgeLabel: 'ARN Generated',
    badgeType: 'success',
  },
  {
    id: 'itr-app',
    iconType: 'document',
    title: 'ITR-2026-00074',
    badgeLabel: 'Tax Calculation',
    badgeType: 'info',
  },
  {
    id: 'refund-est',
    iconType: 'wallet',
    title: 'Refund estimate',
    highlightText: '₹18,420',
    subText: 'Estimated refund',
  },
]

export const GET_STARTED_STATS: BottomStat[] = [
  {
    id: 'returns',
    iconType: 'returns',
    value: '12,400+',
    label: 'Returns filed',
  },
  {
    id: 'loans',
    iconType: 'loans',
    value: '₹86Cr+',
    label: 'Loans facilitated',
  },
  {
    id: 'rating',
    iconType: 'rating',
    value: '4.8/5',
    label: 'Customer rating',
  },
]

export const SIGN_IN_METRIC_CARDS: MetricCardData[] = [
  {
    id: 'active-apps',
    iconType: 'applications',
    count: '3',
    label: 'Active applications',
  },
  {
    id: 'days-due',
    iconType: 'calendar',
    count: '18',
    label: 'Days to GST due',
  },
  {
    id: 'docs-pending',
    iconType: 'documents',
    count: '2',
    label: 'Documents pending',
  },
]

export const SIGN_IN_TRUST_BADGES: TrustBadgeData[] = [
  {
    id: 'secure',
    iconType: 'shield',
    label: '100% Secure & Encrypted',
  },
  {
    id: 'experts',
    iconType: 'expert',
    label: 'Expert CA & Tax Professionals',
  },
  {
    id: 'digital',
    iconType: 'process',
    label: 'End-to-end Digital Process',
  },
]

export const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India (+91)' },
]
