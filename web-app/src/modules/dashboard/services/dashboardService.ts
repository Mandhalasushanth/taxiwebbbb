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
  // Active applications = active submitted applications + incomplete drafts
  const activeSubmittedApps = applications.filter(
    (a) => a.statusLabel !== 'Completed' && (a as any).status !== 'Completed'
  )
  const activeCount = activeSubmittedApps.length + drafts.length
  // Pending documents: calculated strictly from submitted applications (drafts excluded)
  const pendingDocsCount = activeSubmittedApps.reduce((sum, a) => {
    if (Array.isArray((a as any).documents) && (a as any).documents.length > 0) {
      const pending = (a as any).documents.filter(
        (d: any) => d?.status === 'Pending' || d?.status === 'pending'
      ).length
      return sum + pending
    }
    // Each active submitted application under verification has pending documents
    return sum + 1
  }, 0)
  const completedApps = applications.filter(
    (a) => a.statusLabel === 'Completed' || (a as any).status === 'Completed'
  )
  const completedCount = completedApps.length
  // Dynamic payment due calculation matching mobile app
  const pendingPaymentApps = applications.filter((app) => {
    const isPending =
      app.paymentStatus === 'Pending' ||
      (app as any).paymentStatus === 'Charges Pending'
    if (!isPending) return false

    const isTds =
      (app.title || '').toLowerCase().includes('tds') ||
      (app.code || '').startsWith('TDS-')
    if (isTds) {
      return Boolean(app.chargesFinalized && app.finalizedCharges?.total)
    }
    return Boolean(app.finalizedCharges?.total || (app as any).paymentAmount)
  })
  const totalPaymentDue = pendingPaymentApps.reduce((sum, app) => {
    return sum + (app.finalizedCharges?.total || (app as any).paymentAmount || 0)
  }, 0)
  const pendingPaymentTasks: PendingTask[] = pendingPaymentApps.map((app) => ({
    id: `pay-${app.code || app.id}`,
    title: `Payment Due: ${app.title}`,
    meta: `${app.code || app.id} · Due amount: ${formatCurrency(app.finalizedCharges?.total || (app as any).paymentAmount || 0)}`,
    statusLabel: 'Payment Due',
    statusTone: 'danger',
    actionLabel: 'Pay Now',
    actionTo: `/payments/checkout/${app.code || app.id}`,
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
    activeCount === 0
      ? `Welcome to TaxEdge, ${firstName}! Your account is active. Choose a service below to begin your GST, ITR, or loan application.`
      : `You have ${activeCount} active application(s) in progress. Your documents and filings are up to date.`
  return {
    brief: {
      dateLabel,
      message,
      activeApplications: activeCount,
      pendingDocuments: pendingDocsCount,
      paymentDue: totalPaymentDue > 0 ? `₹${totalPaymentDue.toLocaleString('en-IN')}` : '₹0',
      completedServices: completedCount,
    },
    deadline: null,
    stats: [
      {
        id: 'active',
        label: 'Active Applications',
        value: String(activeCount),
        hint: activeCount > 0 ? `${activeCount} in progress` : 'No active applications',
        tone: 'info',
        icon: '🗎',
      },
      {
        id: 'pending-docs',
        label: 'Pending Documents',
        value: String(pendingDocsCount),
        hint: pendingDocsCount > 0 ? `${pendingDocsCount} documents pending` : 'All documents clear',
        tone: 'warning',
        icon: '✓',
      },
      {
        id: 'payment-due',
        label: 'Payment Due',
        value: totalPaymentDue > 0 ? `₹${totalPaymentDue.toLocaleString('en-IN')}` : '₹0',
        hint: totalPaymentDue > 0 ? `${pendingPaymentApps.length} payment(s) pending` : 'No dues pending',
        tone: totalPaymentDue > 0 ? 'danger' : 'success',
        icon: '₹',
      },
      {
        id: 'completed',
        label: 'Completed Services',
        value: String(completedCount),
        hint: completedCount > 0 ? `${completedCount} completed` : 'Get started today',
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
    if (!env.enableMocks) {
      try {
        const response = await dashboardApi.getSummary()
        if (response) {
          return response
        }
      } catch {
        // Fall back to user storage calculation
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
    return buildUserDashboardSummary()
  },
}