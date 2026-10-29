import React, { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  Receipt,
  Clock,
  FileText,
  ChevronRight,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { routePaths } from '@core/config'
import { authStorage } from '@core/auth'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import { useApplications } from '@modules/applications'
import type { PaymentResult } from '@shared/components/PaymentCheckout/payment.types'
import { PaymentQuickLinksModal } from './components/PaymentQuickLinksModal'
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal'
import './Payments.css'

export interface PaymentItem {
  id: string
  code: string
  title: string
  date: string
  amount: number
  paymentStatus: 'Paid' | 'Pending'
  paidAt?: string
  transactionId?: string
}

const getServiceFee = (title: string = ''): number => {
  const t = title.toLowerCase()
  if (t.includes('gst') || t.includes('goods')) return 2500
  if (t.includes('itr') || t.includes('tax') || t.includes('tds')) return 1800
  if (t.includes('loan')) return 1130
  if (t.includes('incorporation') || t.includes('company') || t.includes('business')) return 5000
  return 2500
}

export const Payments: React.FC = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const { data: apiApplications } = useApplications()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Modals state
  const [checkoutApp, setCheckoutApp] = useState<PaymentItem | null>(null)
  const [activeModal, setActiveModal] = useState<'history' | 'receipts' | null>(null)

  const user = authStorage.getUser()

  // Consolidate applications from userStorage and API
  const allApplications = useMemo<PaymentItem[]>(() => {
    // refreshTrigger forces re-read from localStore
    void refreshTrigger
    const localApps = userStorage.getUserApplications()
    const mappedLocal: PaymentItem[] = localApps.map((app) => {
      const isPaid =
        app.paymentStatus === 'Paid' ||
        Boolean(app.paidAt) ||
        Boolean(app.transactionId) ||
        app.statusLabel === 'Completed' ||
        app.statusTone === 'success'

      const amount =
        app.finalizedCharges?.total ||
        (typeof app.finalizedCharges?.serviceFee === 'number'
          ? (app.finalizedCharges.serviceFee + (app.finalizedCharges.gst || 0))
          : 0) ||
        getServiceFee(app.title)

      return {
        id: app.id,
        code: app.code || app.id,
        title: app.title || 'TaxEdge Service',
        date: app.paidAt || 'Recently submitted',
        amount,
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        paidAt: app.paidAt,
        transactionId: app.transactionId,
      }
    })

    const seenCodes = new Set(mappedLocal.map((a) => a.code))

    // Include any API applications not already mapped
    const additionalFromApi: PaymentItem[] = (apiApplications || [])
      .filter((apiApp) => !seenCodes.has(apiApp.reference) && !seenCodes.has(apiApp.id))
      .map((apiApp) => {
        const isPaid =
          apiApp.status === 'COMPLETED' ||
          apiApp.statusLabel === 'Completed'

        const amount = typeof apiApp.amount === 'number' && apiApp.amount > 0
          ? apiApp.amount
          : getServiceFee(apiApp.title)

        return {
          id: apiApp.id,
          code: apiApp.reference || apiApp.id,
          title: apiApp.title || 'TaxEdge Service',
          date: apiApp.date || 'Recently submitted',
          amount,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
        }
      })

    return [...mappedLocal, ...additionalFromApi]
  }, [apiApplications, refreshTrigger])

  // Calculations matching mobile app PaymentOverviewScreen
  const paidApps = useMemo(
    () => allApplications.filter((app) => app.paymentStatus === 'Paid'),
    [allApplications]
  )

  const pendingApps = useMemo(
    () => allApplications.filter((app) => app.paymentStatus === 'Pending' && app.amount > 0),
    [allApplications]
  )

  const totalPaid = useMemo(
    () => paidApps.reduce((sum, app) => sum + (Number(app.amount) || 0), 0),
    [paidApps]
  )

  const pendingAmount = useMemo(
    () => pendingApps.reduce((sum, app) => sum + (Number(app.amount) || 0), 0),
    [pendingApps]
  )

  const totalTransactions = paidApps.length + pendingApps.length

  const handlePayNow = useCallback((app: PaymentItem) => {
    setCheckoutApp(app)
  }, [])

  const handlePaymentSuccess = useCallback(
    (result: PaymentResult) => {
      if (!checkoutApp) return

      const todayFormatted = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date())

      const localApps = userStorage.getUserApplications()
      const existing = localApps.find((a) => a.id === checkoutApp.id || a.code === checkoutApp.code)

      if (existing) {
        userStorage.saveUserApplication({
          ...existing,
          paymentStatus: 'Paid',
          statusLabel: 'Payment Received',
          paidAt: todayFormatted,
          transactionId: result.paymentId || result.receiptNumber || `TXN${Date.now().toString().slice(-8)}`,
        })
      } else {
        userStorage.saveUserApplication({
          id: checkoutApp.id,
          code: checkoutApp.code,
          title: checkoutApp.title,
          meta: 'India',
          statusLabel: 'Payment Received',
          statusTone: 'success',
          progress: 50,
          icon: '📄',
          to: routePaths.applicationTrack(checkoutApp.code),
          paymentStatus: 'Paid',
          paidAt: todayFormatted,
          transactionId: result.paymentId || result.receiptNumber || `TXN${Date.now().toString().slice(-8)}`,
        })
      }

      pushToast?.(
        `Payment of ₹${checkoutApp.amount.toLocaleString('en-IN')} received successfully!`,
        'success'
      )
      setCheckoutApp(null)
      setRefreshTrigger((prev) => prev + 1)
    },
    [checkoutApp, pushToast]
  )

  const handleExploreServices = () => {
    navigate(routePaths.allServices)
  }

  return (
    <div className="payments-page" data-testid="payments-page">
      {/* Page Heading */}
      <header className="payments-page__header">
        <h1 className="payments-page__title">Manage your payments</h1>
        <p className="payments-page__subtitle">
          View dues, payments and receipts in one place.
        </p>
      </header>

      {/* 1. Payment Overview Card */}
      <section className="payments-overview-card" aria-label="Payment Overview">
        <div className="payments-overview-card__header">
          <div className="payments-overview-card__icon-box">
            <CreditCard className="payments-overview-card__icon" size={18} />
          </div>
          <h2 className="payments-overview-card__title">Payment Overview</h2>
        </div>

        <div className="payments-overview-card__stats">
          <div className="payments-overview-card__col">
            <span className="payments-overview-card__stat-label">Total Paid</span>
            <span className="payments-overview-card__stat-value">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="payments-overview-card__col payments-overview-card__col--divider">
            <span className="payments-overview-card__stat-label">Pending</span>
            <span
              className={`payments-overview-card__stat-value ${
                pendingAmount > 0 ? 'payments-overview-card__stat-value--warning' : ''
              }`}
            >
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="payments-overview-card__col payments-overview-card__col--divider">
            <span className="payments-overview-card__stat-label">Transactions</span>
            <span className="payments-overview-card__stat-value">{totalTransactions}</span>
          </div>
        </div>
      </section>

      {/* 2. Dues Section: Empty State or Pending Payments */}
      <section className="payments-section" aria-label="Dues Section">
        {pendingApps.length === 0 ? (
          <div className="payments-empty-dues-card" data-testid="empty-dues-card">
            <div className="payments-empty-dues-card__icon-box">
              <Receipt className="payments-empty-dues-card__icon" size={24} />
            </div>
            <div className="payments-empty-dues-card__content">
              <h3 className="payments-empty-dues-card__title">No payments yet</h3>
              <p className="payments-empty-dues-card__subtitle">
                Your service payments and receipts will appear here after you apply for a service.
              </p>
              <button
                type="button"
                className="payments-empty-dues-card__button"
                onClick={handleExploreServices}
              >
                <span>Explore Services</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="payments-pending-container">
            <h2 className="payments-section__title">Pending Payments</h2>
            <div className="payments-pending-list">
              {pendingApps.map((app) => (
                <div key={app.id} className="payments-pending-card" data-testid={`pending-card-${app.id}`}>
                  <div className="payments-pending-card__header">
                    <h3 className="payments-pending-card__service-name">{app.title}</h3>
                    <span className="payments-pending-card__badge">Payment Due</span>
                  </div>

                  <p className="payments-pending-card__meta">
                    Application #{app.code} • {app.date}
                  </p>

                  <div className="payments-pending-card__footer">
                    <div>
                      <span className="payments-pending-card__amount-label">Amount Due</span>
                      <p className="payments-pending-card__amount-value">
                        ₹{Number(app.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="payments-pending-card__pay-btn"
                      onClick={() => handlePayNow(app)}
                    >
                      <span>Pay Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Payment Activity Section */}
      <section className="payments-section" aria-label="Payment Activity Section">
        <h2 className="payments-section__title">Payment Activity</h2>

        {paidApps.length === 0 ? (
          <div className="payments-empty-activity-box" data-testid="empty-activity-box">
            <div className="payments-empty-activity-box__icon-box">
              <Receipt className="payments-empty-activity-box__icon" size={32} />
            </div>
            <h3 className="payments-empty-activity-box__title">Nothing to show yet</h3>
            <p className="payments-empty-activity-box__subtitle">
              Completed and pending payments will appear here.
            </p>
          </div>
        ) : (
          <div className="payments-activity-list" data-testid="activity-list">
            {paidApps.map((app) => (
              <div key={app.id} className="payments-activity-card">
                <div className="payments-activity-card__left">
                  <h3 className="payments-activity-card__title">{app.title}</h3>
                  <p className="payments-activity-card__meta">
                    App #{app.code} • {app.paidAt || app.date}
                  </p>
                </div>
                <div className="payments-activity-card__right">
                  <div className="payments-activity-card__amount-group">
                    <span className="payments-activity-card__amount">
                      ₹{Number(app.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="payments-activity-card__badge">Paid ✓</span>
                  </div>
                  <Link
                    to={routePaths.paymentReceipt(app.code || app.id)}
                    className="payments-activity-card__receipt-link"
                  >
                    <span>View Receipt</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Quick Links Section */}
      <section className="payments-section" aria-label="Quick Links Section">
        <h2 className="payments-section__title">Quick Links</h2>

        <div className="payments-quick-links-card">
          <button
            type="button"
            className="payments-quick-link-row"
            onClick={() => setActiveModal('history')}
            data-testid="quick-link-history"
          >
            <div className="payments-quick-link-row__icon-box">
              <Clock size={20} className="payments-quick-link-row__icon" />
            </div>
            <span className="payments-quick-link-row__text">Payment History</span>
            <ChevronRight size={18} className="payments-quick-link-row__chevron" />
          </button>

          <div className="payments-quick-links-card__divider" />

          <button
            type="button"
            className="payments-quick-link-row"
            onClick={() => setActiveModal('receipts')}
            data-testid="quick-link-receipts"
          >
            <div className="payments-quick-link-row__icon-box">
              <FileText size={20} className="payments-quick-link-row__icon" />
            </div>
            <span className="payments-quick-link-row__text">Invoices & Receipts</span>
            <ChevronRight size={18} className="payments-quick-link-row__chevron" />
          </button>
        </div>
      </section>

      {/* Quick Links Dialog Modal */}
      <PaymentQuickLinksModal
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        paidApps={paidApps}
        totalPaid={totalPaid}
      />

      {/* Pay Now Checkout Modal */}
      <PaymentCheckoutModal
        checkoutApp={checkoutApp}
        onClose={() => setCheckoutApp(null)}
        onSuccess={handlePaymentSuccess}
        applicantName={user?.fullName || 'Client'}
      />
    </div>
  )
}

export default Payments
