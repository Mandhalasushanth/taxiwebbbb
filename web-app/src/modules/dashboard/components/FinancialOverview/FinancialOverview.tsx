import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import type { DashboardStat } from '../../types/dashboard.types'
import './FinancialOverview.css'

export interface FinancialOverviewProps {
  stats?: DashboardStat[]
  activeCount?: number
  pendingDocsCount?: number
  paymentDue?: string
  completedCount?: number
}

// 1. Folder Icon (Active Applications)
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="financial-card__svg">
    <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8H5v-2h14v2zm0-4H5V8h14v2z" />
  </svg>
)

// 2. Documents Icon (Pending Documents)
const DocumentsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="financial-card__svg">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
  </svg>
)

// 3. Payment / Credit Card Icon (Payment Due)
const CreditCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="financial-card__svg">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
)

// 4. Completed / Checkmark Box Icon (Completed Services)
const CheckboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="financial-card__svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

export const FinancialOverview = ({
  stats = [],
  activeCount,
  pendingDocsCount,
  paymentDue,
  completedCount,
}: FinancialOverviewProps) => {
  // Extract dynamic values or fallback
  const activeStat = stats.find((s) => s.id === 'active')
  const pendingDocsStat = stats.find((s) => s.id === 'pending-docs')
  const paymentDueStat = stats.find((s) => s.id === 'payment-due')
  const completedStat = stats.find((s) => s.id === 'completed')

  const pendingPaymentApp = userStorage.getUserApplications().find((a) => {
    return a.paymentStatus === 'Pending'
  })

  const paymentDueLink = pendingPaymentApp
    ? `/payments/checkout/${pendingPaymentApp.code || pendingPaymentApp.id}`
    : routePaths.payments

  const items = [
    {
      id: 'active-applications',
      label: 'Active Applications',
      value: activeCount !== undefined ? String(activeCount) : activeStat?.value ?? '0',
      tone: 'green',
      icon: <FolderIcon />,
      to: routePaths.applications,
    },
    {
      id: 'pending-documents',
      label: 'Pending Documents',
      value: pendingDocsCount !== undefined ? String(pendingDocsCount) : pendingDocsStat?.value ?? '0',
      tone: 'orange',
      icon: <DocumentsIcon />,
      to: routePaths.documents,
    },
    {
      id: 'payment-due',
      label: 'Payment Due',
      value: paymentDue ?? (paymentDueStat?.value?.startsWith('₹') ? paymentDueStat.value : `₹${paymentDueStat?.value ?? '0'}`),
      tone: 'red',
      icon: <CreditCardIcon />,
      to: paymentDueLink,
    },
    {
      id: 'completed-services',
      label: 'Completed Services',
      value: completedCount !== undefined ? String(completedCount) : completedStat?.value ?? '0',
      tone: 'blue',
      icon: <CheckboxIcon />,
      to: routePaths.applications,
    },
  ]

  return (
    <section className="financial-overview" aria-label="Your Financial Overview">
      <div className="financial-overview__header">
        <h2 className="financial-overview__title">Your Financial Overview</h2>
        <Link to={routePaths.applications} className="financial-overview__view-all">
          View All &rarr;
        </Link>
      </div>

      <div className="financial-overview__grid">
        {items.map((item) => (
          <Link key={item.id} to={item.to} className="financial-card">
            <div className="financial-card__top">
              <span className="financial-card__label">{item.label}</span>
              <div className={`financial-card__icon-wrap financial-card__icon-wrap--${item.tone}`}>
                {item.icon}
              </div>
            </div>

            <div className="financial-card__bottom">
              <span className={`financial-card__value financial-card__value--${item.tone}`}>
                {item.value}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FinancialOverview
