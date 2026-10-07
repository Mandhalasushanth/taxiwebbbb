import { routePaths } from '@core/config'

export interface NavItem {
  label: string
  to: string
  icon: string
  iconImg?: string
  /** Optional key into the badge map DashboardLayout builds from live data. */
  badgeKey?: 'applications' | 'notifications'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: routePaths.dashboard, icon: '⌂' },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Incorporation', to: routePaths.incorporation.root, icon: '🏢' },
      { label: 'GST', to: routePaths.gst.root, icon: '%' },
      { label: 'ITR & TDS', to: routePaths.itr.root, icon: '₹' },
      { label: 'Projects', to: '#projects', icon: '📋' },
      { label: 'Loans', to: routePaths.loans, icon: '◈' },
      { label: 'Insurance', to: routePaths.insurance, icon: '☂' },
      { label: 'Business', to: routePaths.business.root, icon: '💼' },
    ],
  },
  {
    title: 'My account',
    items: [
      { label: 'Applications', to: routePaths.applications, icon: '☰', badgeKey: 'applications' },
      { label: 'Document Vault', to: routePaths.documents, icon: '🗎' },
      { label: 'Payments', to: routePaths.payments, icon: '⇄' },
      { label: 'Notifications', to: routePaths.notifications, icon: '🔔', badgeKey: 'notifications' },
      { label: 'Support Chat', to: routePaths.support, icon: '💬' },
      { label: 'Profile', to: routePaths.profile, icon: '☺' },
    ],
  },
]
