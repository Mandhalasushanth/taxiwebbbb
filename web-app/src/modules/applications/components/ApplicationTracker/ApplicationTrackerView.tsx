import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'
import { useAppStore } from '@store/index'
import { resetScrollToTop } from '@shared/components'
import { CommonChatSupport } from '@modules/customerSupport'
import { getApplicationTrackerData } from '../../data/applicationTrackerData'
import type { ApplicationTrackerData } from '../../data/applicationTrackerData'
import { ApplicationOverviewTab } from './tabs/ApplicationOverviewTab'
import { ApplicationStatusTab } from './tabs/ApplicationStatusTab'
import { ApplicationDocumentsTab } from './tabs/ApplicationDocumentsTab'
import { ApplicationPaymentsTab } from './tabs/ApplicationPaymentsTab'
import { DocumentPreviewModal } from './tabs/DocumentPreviewModal'
import './ApplicationTrackerView.css'

export type TrackerTab = 'overview' | 'status' | 'documents' | 'payments' | 'chat'

export interface ApplicationDocumentItem {
  id?: string
  name: string
  meta: string
  date?: string
  url?: string
}

export const ApplicationTrackerView: React.FC<{ customId?: string }> = ({ customId }) => {
  const { id: routeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appId = customId || routeId || ''

  const initialTab = (searchParams.get('tab') as TrackerTab) || 'overview'
  const [activeTab, setActiveTab] = useState<TrackerTab>(
    ['overview', 'status', 'documents', 'payments', 'chat'].includes(initialTab) ? initialTab : 'overview'
  )
  const [data, setData] = useState<ApplicationTrackerData | null>(() => getApplicationTrackerData(appId))
  const pushToast = useAppStore((state) => state.pushToast)
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocumentItem | null>(null)

  useEffect(() => {
    resetScrollToTop()
  }, [appId])

  // Sync state if appId changes
  useEffect(() => {
    setData(getApplicationTrackerData(appId))
  }, [appId])

  // Sync tab if URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TrackerTab
    if (tabParam && ['overview', 'status', 'documents', 'payments', 'chat'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const currentUser = authStorage.getUser()
  const isManagerOrAdmin = Boolean(
    currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  )

  // Manager charge formulation (for TDS applications)
  const [mgrServiceFee, setMgrServiceFee] = useState('847')
  const [mgrGovFees, setMgrGovFees] = useState('0')
  const [mgrSuccess, setMgrSuccess] = useState('')
  const [mgrError, setMgrError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  if (!data) {
    return (
      <div className="app-tracker-web-page">
        <div className="app-tracker-web-container app-tracker-web-container--empty">
          <div className="app-tracker-empty-card">
            <div className="app-tracker-empty-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="app-tracker-empty-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h2 className="app-tracker-empty-title">No Application Details Found</h2>
            <p className="app-tracker-empty-desc">
              {appId
                ? `No application record matching "${appId}" was found in your local data.`
                : 'No application is currently selected or submitted in your local records.'}
            </p>
            <div className="app-tracker-empty-actions">
              <button
                type="button"
                className="app-tracker-empty-btn app-tracker-empty-btn--primary"
                onClick={() => navigate(routePaths.dashboard)}
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                className="app-tracker-empty-btn app-tracker-empty-btn--secondary"
                onClick={() => navigate({ pathname: routePaths.dashboard, hash: routePaths.dashboardServicesAnchor })}
              >
                Browse Services
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabTitles: Record<TrackerTab, { pageHeader: string; title: string; subtitle: string }> = {
    overview: {
      pageHeader: 'Application Details',
      title: data.title,
      subtitle: `${data.customerEntity} · ${data.appliedDate}`,
    },
    status: {
      pageHeader: 'Application Status',
      title: data.title,
      subtitle: `Target Completion: ${data.expectedCompletion}`,
    },
    documents: {
      pageHeader: 'Uploaded Documents',
      title: data.title,
      subtitle: '4 of 4 documents uploaded',
    },
    payments: {
      pageHeader: 'Payment Summary',
      title: data.title,
      subtitle: 'Fee & Payment Details',
    },
    chat: {
      pageHeader: 'Support Chat',
      title: 'TaxEdge Support',
      subtitle: 'Online · replies in a few minutes',
    },
  }

  const { pageHeader, title: bannerTitle, subtitle: bannerSubtitle } = tabTitles[activeTab]

  // Prepared 4 documents matching Screenshot 3
  const defaultDocsConfig: ApplicationDocumentItem[] = [
    {
      id: 'doc-1',
      name: 'Sales Invoices / Register',
      meta: 'Sales & Outward Supplies · IMAGE · 6.55 MB',
      date: data.appliedDate || '28 Oct 2026',
    },
    {
      id: 'doc-2',
      name: 'Purchase Invoices / Register',
      meta: 'Purchases & Input Tax · IMAGE · 6.55 MB',
      date: data.appliedDate || '28 Oct 2026',
    },
    {
      id: 'doc-3',
      name: 'Bank Statement / Passbook',
      meta: 'Banking & Reconciliation · IMAGE · 6.55 MB',
      date: data.appliedDate || '28 Oct 2026',
    },
    {
      id: 'doc-4',
      name: 'Other Supporting Documents',
      meta: 'Statutory & Compliance · IMAGE · 6.55 MB',
      date: data.appliedDate || '28 Oct 2026',
    },
  ]

  const displayDocuments: ApplicationDocumentItem[] = data.documents && data.documents.length >= 4
    ? data.documents.map((d, i) => ({
        id: d.id,
        name: d.name,
        meta: defaultDocsConfig[i]?.meta || 'Uploaded Document · IMAGE · 6.55 MB',
        date: data.appliedDate || '28 Oct 2026',
      }))
    : defaultDocsConfig

  const isTdsApplication = Boolean(
    data.title.toLowerCase().includes('tds') ||
    data.appId.startsWith('TDS-') ||
    (data.category === 'ITR' && data.title.toLowerCase().includes('refund'))
  )
  const isChargesPending = isTdsApplication && (data.paymentSummary.paymentStatus === 'Charges Pending' || !data.chargesFinalized)
  const isPaid = !isChargesPending

  const computedGst = Math.round(Number(mgrServiceFee || 0) * 0.18)
  const computedTotal = Number(mgrServiceFee || 0) + Number(mgrGovFees || 0) + computedGst

  const handleFinalizeCharges = (e: React.FormEvent) => {
    e.preventDefault()
    setMgrError('')
    setMgrSuccess('')

    const sFee = Number(mgrServiceFee)
    const gFee = Number(mgrGovFees)

    if (isNaN(sFee) || sFee < 0) {
      setMgrError('Please enter a valid positive Service Fee.')
      return
    }
    if (isNaN(gFee) || gFee < 0) {
      setMgrError('Please enter a valid positive Government Fee.')
      return
    }

    const total = sFee + gFee + computedGst
    if (total <= 0) {
      setMgrError('Total payable amount must be greater than ₹0.')
      return
    }

    const updated = userStorage.finalizeApplicationCharges(data.appId, {
      serviceFee: sFee,
      govFees: gFee,
      gst: computedGst,
      total,
      finalizedAt: new Date().toISOString(),
      finalizedBy: currentUser?.fullName ? `${currentUser.fullName} (${currentUser.role})` : 'Priya Nair (Manager)',
    })

    if (updated) {
      setData(getApplicationTrackerData(appId))
      setMgrSuccess(`Charges of ₹${total.toLocaleString('en-IN')} successfully finalized and published.`)
      pushToast(`Charges of ₹${total.toLocaleString('en-IN')} published for ${data.appId}!`, 'success')
    } else {
      setMgrError('Could not update application charges in local storage.')
    }
  }

  const handlePayNow = () => {
    if (isPaid || !data) return
    setIsProcessingPayment(true)

    setTimeout(() => {
      const totalAmount = data.finalizedCharges?.total || 999
      const txnId = `TXN-${Date.now().toString().slice(-6)}`

      userStorage.recordApplicationPayment(data.appId, {
        transactionId: txnId,
        paidAmount: totalAmount,
        paymentMethod: 'UPI / NetBanking',
      })

      setData(getApplicationTrackerData(appId))
      setIsProcessingPayment(false)
      pushToast(`Payment of ₹${totalAmount.toLocaleString('en-IN')} completed successfully!`, 'success')
    }, 600)
  }

  return (
    <div className="app-tracker-web-page">
      {/* 1. HERO HEADER */}
      <header className="app-tracker-web-header">
        <div className="app-tracker-web-header__container">
          <div className="app-tracker-web-header__top-row">
            <div className="app-tracker-web-header__meta-row">
              <span className="app-tracker-web-ref-badge">APPLICATION #{data.appId}</span>
              <span className="app-tracker-web-dot">•</span>
              <span className="app-tracker-web-service-tag">{data.category} Service</span>
            </div>

            <button
              type="button"
              className="app-tracker-web-header-chat-btn"
              onClick={() => setActiveTab('chat')}
              title="Chat with CA"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Chat with CA</span>
            </button>
          </div>

          <div className="app-tracker-web-header__headline-row">
            <div>
              <span className="app-tracker-web-category-header">{pageHeader}</span>
              <h1 className="app-tracker-web-title">{bannerTitle}</h1>
              <p className="app-tracker-web-subtitle">{bannerSubtitle}</p>
            </div>
            <div className="app-tracker-web-stage-pill">
              <span className="app-tracker-web-stage-pill__label">Current Stage</span>
              <span className="app-tracker-web-stage-pill__val">Submitted</span>
              <span className="app-tracker-web-stage-pill__target">Target: {data.expectedCompletion}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <div className="app-tracker-web-container">
        <nav className="app-tracker-web-tabs" aria-label="Tracker Navigation Tabs">
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'overview' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'status' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <span>Status</span>
            <span className="app-tracker-web-tab__badge">Step 2/4</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'documents' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span>Documents</span>
            <span className="app-tracker-web-tab__badge">4/4</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'payments' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span>Payments</span>
            <span className="app-tracker-web-tab__badge app-tracker-web-tab__badge--paid">Paid</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'chat' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span>Chat with CA</span>
            <span className="app-tracker-web-tab__dot" title="Online" />
          </button>
        </nav>

        {/* 3. TAB CONTENT PANES */}
        <main className="app-tracker-web-content">
          {activeTab === 'overview' && (
            <ApplicationOverviewTab data={data} onNavigateToChat={() => setActiveTab('chat')} />
          )}

          {activeTab === 'status' && (
            <ApplicationStatusTab data={data} />
          )}

          {activeTab === 'documents' && (
            <ApplicationDocumentsTab
              documents={displayDocuments}
              appliedDate={data.appliedDate}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
            />
          )}

          {activeTab === 'payments' && (
            <ApplicationPaymentsTab
              data={data}
              isPaid={isPaid}
              isProcessingPayment={isProcessingPayment}
              handlePayNow={handlePayNow}
              isManagerOrAdmin={isManagerOrAdmin}
              isTdsApplication={isTdsApplication}
              mgrServiceFee={mgrServiceFee}
              setMgrServiceFee={setMgrServiceFee}
              mgrGovFees={mgrGovFees}
              setMgrGovFees={setMgrGovFees}
              handleFinalizeCharges={handleFinalizeCharges}
              computedTotal={String(computedTotal)}
              mgrSuccess={mgrSuccess}
              mgrError={mgrError}
            />
          )}

          {activeTab === 'chat' && (
            <div className="app-tracker-web-tab-content">
              <div className="app-tracker-clean-card app-tracker-common-chat-card">
                <CommonChatSupport
                  appId={data.appId}
                  title="TaxEdge Support"
                  subtitle="Online · replies in a few minutes"
                  placeholder="Type your message..."
                  embedded
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  )
}

export default ApplicationTrackerView
