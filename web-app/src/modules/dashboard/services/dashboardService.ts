import { env, routePaths } from '@core/config'
import { authStorage } from '@core/auth'
import { userStorage } from '@core/storage/userStorage'
import { formatCurrency } from '@shared/utils'

import { dashboardApi } from '../api/dashboardApi'
import type { DashboardSummary, QuickService, RecentApplication, PendingTask } from '../types/dashboard.types'

export const quickServices: QuickService[] = [
  {
    id: 'gst',
    label: 'GST',
    description: 'Registration, monthly and quarterly filing, amendments, compliance and certificates.',
    to: routePaths.gst.root,
    icon: '📄',
    price: '₹2,500',
    priceUnit: 'per period',
  },
  {
    id: 'itr',
    label: 'ITR & TDS',
    description: 'Income tax returns for every profile, TDS refunds, revised returns and notice replies.',
    to: routePaths.itr.root,
    icon: '📊',
    price: '₹3,000',
    priceUnit: 'from',
  },
  {
    id: 'loans',
    label: 'Loans',
    description: 'Business, personal, home, property and vehicle finance with a live EMI calculator.',
    to: routePaths.loans,
    icon: '$',
    price: '1%',
    priceUnit: 'processing',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Health, life, motor and commercial coverage tailored to your business and family.',
    to: routePaths.insurance,
    icon: '☂',
    price: 'Custom',
    priceUnit: 'quotes',
  },
  {
    id: 'company',
    label: 'Company',
    description: 'Private limited, LLP, OPC incorporation, MSME Udyam, trademark and compliance.',
    to: routePaths.incorporation.root,
    icon: '🏢',
    price: '₹4,999',
    priceUnit: 'from',
  },
]

export const buildUserDashboardSummary = (): DashboardSummary => {
  const user = authStorage.getUser()
  const applications = userStorage.getUserApplications()
  const drafts = userStorage.getAllDrafts()

  const draftApps: RecentApplication[] = drafts.map((d) => {
    const prefix = d.serviceId
      .replace(/^gst-/, 'GST-')
      .replace(/^itr-/, 'ITR-')
      .toUpperCase()
    const code = `DRAFT-${prefix}-${String(d.savedTimestamp || Date.now()).slice(-4)}`

    return {
      id: `draft-${d.serviceId}`,
      code,
      title: d.serviceTitle,
      meta: d.savedAt || `Step ${d.currentStep} of ${d.totalSteps}`,
      statusLabel: 'Draft',
      statusTone: 'info',
      progress: Math.round((d.currentStep / d.totalSteps) * 100),
      icon: d.serviceId.includes('gst') ? '📄' : d.serviceId.includes('itr') ? '📊' : '🏢',
      to: d.resumeRoute,
    }
  })

  const combinedRecentApps = [...draftApps, ...applications]
  const activeApps = applications.filter((a) => a.statusLabel !== 'Completed')
  const completedApps = applications.filter((a) => a.statusLabel === 'Completed')

  // Dynamic payment due calculation
  // For TDS refund: include only when charges are finalized and paymentStatus is 'Pending'
  const pendingPaymentApps = applications.filter((app) => {
    const isTds = (app.title || '').toLowerCase().includes('tds') || (app.code || '').startsWith('TDS-')
    if (isTds) {
      return Boolean(app.chargesFinalized && app.paymentStatus === 'Pending' && app.finalizedCharges?.total)
    }
    return app.paymentStatus === 'Pending' && Boolean(app.finalizedCharges?.total)
  })

  const totalPaymentDue = pendingPaymentApps.reduce((sum, app) => {
    return sum + (app.finalizedCharges?.total || 0)
  }, 0)

  const pendingPaymentTasks: PendingTask[] = pendingPaymentApps.map((app) => ({
    id: `pay-${app.code || app.id}`,
    title: `Payment Due: ${app.title}`,
    meta: `${app.code || app.id} · Due amount: ${formatCurrency(app.finalizedCharges?.total || 0)}`,
    statusLabel: 'Payment Due',
    statusTone: 'danger',
    actionLabel: 'Pay Now',
    actionTo: `${routePaths.applicationTrack(app.code || app.id)}?tab=payments`,
    icon: '💳',
    iconTone: 'danger',
  }))

  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'there'

  const message =
    activeApps.length === 0
      ? `Welcome to TaxEdge, ${firstName}! Your account is active. Choose a service below to begin your GST, ITR, or loan application.`
      : `You have ${activeApps.length} active application(s) in progress. Your documents and filings are up to date.`

  return {
    brief: {
      dateLabel,
      message,
      activeApplications: applications.length,
      paymentDue: formatCurrency(totalPaymentDue),
    },
    deadline: null,
    stats: [
      {
        id: 'active',
        label: 'Active applications',
        value: String(applications.length),
        hint: activeApps.length > 0 ? `${activeApps.length} in progress` : 'No active applications',
        tone: 'info',
        icon: '🗎',
      },
      {
        id: 'pending-docs',
        label: 'Pending documents',
        value: '0',
        hint: 'All documents clear',
        tone: 'success',
        icon: '✓',
      },
      {
        id: 'payment-due',
        label: 'Payment due',
        value: formatCurrency(totalPaymentDue),
        hint: totalPaymentDue > 0 ? `${pendingPaymentApps.length} payment(s) pending` : 'No dues pending',
        tone: totalPaymentDue > 0 ? 'danger' : 'success',
        icon: '₹',
      },
      {
        id: 'completed',
        label: 'Completed services',
        value: String(completedApps.length),
        hint: completedApps.length > 0 ? `${completedApps.length} completed` : 'Get started today',
        tone: 'info',
        icon: '✓',
      },
    ],
    recentApplications: combinedRecentApps,
    pendingTasks: pendingPaymentTasks,
    upcomingDeadlinesList: userStorage.getUserDeadlines(),
    recentActivity: [],
    upcomingDeadlines: [],
  }
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (env.enableMocks) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return buildUserDashboardSummary()
    }
    return dashboardApi.getSummary()
  },
}
