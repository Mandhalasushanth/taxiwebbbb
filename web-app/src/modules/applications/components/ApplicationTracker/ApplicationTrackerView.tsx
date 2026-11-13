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
import { openGstDocumentPreview, downloadGstDocument } from '@modules/gst/utils/gstDocumentPreview'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import { resolveDraftResumeRoute } from '../../utils/draftRouting'
import './ApplicationTrackerView.css'

export type TrackerTab = 'overview' | 'status' | 'documents' | 'payments' | 'chat'

export interface ApplicationDocumentItem {
  id?: string
  name: string
  fileName?: string
  meta: string
  date?: string
  url?: string
  file?: File | Blob | null
  status?: 'uploaded' | 'pending' | 'requested' | 'rejected'
  rejectionReason?: string
  requestMessage?: string
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

  useEffect(() => {
    resetScrollToTop()
  }, [appId])

  // Draft Applications = Resume Application: redirect directly to service home page
  useEffect(() => {
    if (!appId) return
    const cleanId = appId.trim().toLowerCase()
    const isDraft =
      cleanId.startsWith('draft-') ||
      cleanId.startsWith('draft') ||
      cleanId.includes('draft')

    if (isDraft) {
      const drafts = userStorage.getAllDrafts()
      const matchedDraft = drafts.find((d) => {
        const prefix = d.serviceId.replace(/^gst-/, 'GST-').replace(/^itr-/, 'ITR-').toUpperCase()
        const code = `DRAFT-${prefix}-${String(d.savedTimestamp || '').slice(-4)}`.toLowerCase()
        return (
          code === cleanId ||
          cleanId === `draft-${d.serviceId}` ||
          (d.serviceId && cleanId.includes(d.serviceId))
        )
      })

      const targetRoute = matchedDraft?.resumeRoute || resolveDraftResumeRoute(matchedDraft || cleanId)
      navigate(targetRoute, { replace: true, state: { resumeDraft: true } })
    }
  }, [appId, navigate])

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
  const isProcessingPayment = false

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
      subtitle: `${data.documentsUploadedCount} of ${data.totalDocumentsCount} documents uploaded`,
    },
    payments: {
      pageHeader: 'Payment Summary',
      title: data.title,
      subtitle: 'Fee & Payment Details',
    },
    chat: {
      pageHeader: 'Support Chat',
      title: 'Finsolz Support',
      subtitle: 'Online · replies in a few minutes',
    },
  }

  const { pageHeader, title: bannerTitle, subtitle: bannerSubtitle } = tabTitles[activeTab]

  const currentStepIndex = data.timelineSteps.findIndex((s) => s.status === 'current')
  const completedStepCount = data.timelineSteps.filter((s) => s.status === 'completed').length
  const activeStepNum = currentStepIndex >= 0
    ? currentStepIndex + 1
    : completedStepCount === data.timelineSteps.length
    ? data.timelineSteps.length
    : Math.min(completedStepCount + 1, data.timelineSteps.length || 1)
  const totalSteps = data.timelineSteps.length || 1

  const getDocumentMetaFallback = (name: string): string => {
    const n = name.toLowerCase()
    if (n.includes('pan')) return 'Statutory & Compliance · IMAGE / PDF · 0.61 MB'
    if (n.includes('aadhaar')) return 'Statutory & Compliance · IMAGE / PDF · 0.72 MB'
    if (n.includes('business registration') || n.includes('coi') || n.includes('partnership')) return 'Statutory & Compliance · IMAGE / PDF · 1.80 MB'
    if (n.includes('address') || n.includes('premises')) return 'Statutory & Compliance · IMAGE / PDF · 2.51 MB'
    if (n.includes('bank') || n.includes('cheque') || n.includes('passbook')) return 'Financial Document · IMAGE / PDF · 2.32 MB'
    if (n.includes('photo')) return 'Statutory & Compliance · IMAGE · 2.26 MB'
    if (n.includes('sales')) return 'Sales & Outward Supplies · IMAGE / PDF · 2.45 MB'
    if (n.includes('credit')) return 'Sales & Outward Supplies · IMAGE / PDF · 1.15 MB'
    if (n.includes('debit')) return 'Sales & Outward Supplies · IMAGE / PDF · 1.05 MB'
    if (n.includes('irn') || n.includes('e-invoice')) return 'Sales & Outward Supplies · JSON / PDF · 1.30 MB'
    if (n.includes('eway') || n.includes('e-way')) return 'Sales & Outward Supplies · PDF · 1.25 MB'
    if (n.includes('purchase')) return 'Purchases & Input Tax · IMAGE / PDF · 2.80 MB'
    if (n.includes('gstr2b') || n.includes('gstr-2b')) return 'Purchases & Input Tax · JSON / PDF · 1.10 MB'
    if (n.includes('expense')) return 'Purchases & Input Tax · IMAGE / PDF · 1.65 MB'
    if (n.includes('return')) return 'Banking & Reconciliation · PDF · 2.15 MB'
    if (n.includes('ack') || n.includes('acknowledgement')) return 'Banking & Reconciliation · PDF · 0.85 MB'
    if (n.includes('statement') || n.includes('salary') || n.includes('slips') || n.includes('26as')) return 'Financial Document · PDF · 3.10 MB'
    return 'Statutory & Compliance · IMAGE / PDF · 1.45 MB'
  }

  const displayDocuments: ApplicationDocumentItem[] = (data.documents && data.documents.length > 0)
    ? data.documents.map((d, i) => {
        const rawDocs = (data.rawApplication as any)?.documents as any[] | undefined
        const matchedRawDoc = rawDocs?.find(
          (rd: any) =>
            rd.id === d.id ||
            rd.name?.toLowerCase() === d.name?.toLowerCase() ||
            (d.name?.toLowerCase().includes('pan') && rd.name?.toLowerCase().includes('pan')) ||
            (d.name?.toLowerCase().includes('aadhaar') && rd.name?.toLowerCase().includes('aadhaar')) ||
            (d.name?.toLowerCase().includes('address') && rd.name?.toLowerCase().includes('address')) ||
            (d.name?.toLowerCase().includes('bank') && rd.name?.toLowerCase().includes('bank')) ||
            (d.name?.toLowerCase().includes('photo') && rd.name?.toLowerCase().includes('photo')) ||
            (d.name?.toLowerCase().includes('sales') && rd.name?.toLowerCase().includes('sales')) ||
            (d.name?.toLowerCase().includes('purchase') && rd.name?.toLowerCase().includes('purchase'))
        ) || rawDocs?.[i]

        const resolvedFile =
          matchedRawDoc?.file ||
          (d as any).file ||
          (d.id ? gstUploadedFiles.get(d.id) : undefined) ||
          (matchedRawDoc?.fileName ? gstUploadedFiles.get(matchedRawDoc.fileName) : undefined) ||
          (matchedRawDoc?.name ? gstUploadedFiles.get(matchedRawDoc.name) : undefined) ||
          (d.name ? gstUploadedFiles.get(d.name) : undefined) ||
          (d.id ? gstUploadedFiles.get(`filing_${d.id}`) : undefined) ||
          (data.title.includes('Amendment') ? gstUploadedFiles.get('amendment_file') : undefined) ||
          gstUploadedFiles.find({ id: d.id, fileName: matchedRawDoc?.fileName, title: d.name })

        const fileName =
          matchedRawDoc?.fileName ||
          (d as any).fileName ||
          (resolvedFile instanceof File ? resolvedFile.name : undefined)

        return {
          id: d.id || `doc-${i + 1}`,
          name: d.name,
          fileName,
          meta: matchedRawDoc?.meta || (d as any).meta || getDocumentMetaFallback(d.name),
          date: matchedRawDoc?.date || (d as any).date || data.appliedDate || '3 Nov 2026',
          url: matchedRawDoc?.url || (d as any).url || (d as any).fileHash,
          file: resolvedFile,
          status: matchedRawDoc?.status || d.status || 'uploaded',
          rejectionReason: matchedRawDoc?.rejectionReason || (d as any).rejectionReason,
          requestMessage: matchedRawDoc?.requestMessage || (d as any).requestMessage,
        }
      })
    : []

  // Include any extra documents explicitly requested by CA / manager if not already in list
  const extraRequested = (
    ((data.rawApplication as any)?.requestedDocuments ||
      (data.rawApplication as any)?.caRequestedDocuments) as any[] | undefined
  )
  if (Array.isArray(extraRequested)) {
    extraRequested.forEach((rd, idx) => {
      const alreadyPresent = displayDocuments.some(
        (dd) => dd.id === rd.id || dd.name.toLowerCase() === (rd.name || '').toLowerCase()
      )
      if (!alreadyPresent) {
        displayDocuments.unshift({
          id: rd.id || `req-doc-${idx + 1}`,
          name: rd.name || 'Requested Document',
          meta: rd.reason || rd.meta || 'Requested by CA · Pending submission',
          date: rd.date || data.appliedDate,
          status: (rd.status as any) || 'requested',
          rejectionReason: rd.reason || rd.rejectionReason,
          requestMessage: rd.message || rd.requestMessage,
        })
      }
    })
  }

  const handleUploadRequestedDoc = (doc: ApplicationDocumentItem, file: File) => {
    const fileKey = doc.id || `doc-${Date.now()}`
    gstUploadedFiles.set(fileKey, file)

    const rawApps = userStorage.getUserApplications()
    const appIndex = rawApps.findIndex((a) => a.id === data.appId || a.code === data.appId)
    if (appIndex >= 0) {
      const app = rawApps[appIndex]
      const docs = Array.isArray((app as any).documents) ? [...(app as any).documents] : []
      const docIdx = docs.findIndex(
        (d: any) => d.id === doc.id || d.name?.toLowerCase() === doc.name.toLowerCase()
      )
      const newDocEntry = {
        id: fileKey,
        name: doc.name,
        status: 'uploaded' as const,
        fileName: file.name,
        meta: `${(file.size / (1024 * 1024)).toFixed(2)} MB · Uploaded`,
        date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      }
      if (docIdx >= 0) {
        docs[docIdx] = { ...docs[docIdx], ...newDocEntry }
      } else {
        docs.push(newDocEntry)
      }

      let reqDocs = (app as any).requestedDocuments
      if (Array.isArray(reqDocs)) {
        reqDocs = reqDocs.filter(
          (r: any) => r.id !== doc.id && r.name?.toLowerCase() !== doc.name.toLowerCase()
        )
      }
      let caReqDocs = (app as any).caRequestedDocuments
      if (Array.isArray(caReqDocs)) {
        caReqDocs = caReqDocs.filter(
          (r: any) => r.id !== doc.id && r.name?.toLowerCase() !== doc.name.toLowerCase()
        )
      }

      const updatedApp = {
        ...app,
        documents: docs,
        requestedDocuments: reqDocs,
        caRequestedDocuments: caReqDocs,
        pendingDocumentsCount: Math.max(0, ((app as any).pendingDocumentsCount || 1) - 1),
      }
      userStorage.saveUserApplication(updatedApp)
      setData(getApplicationTrackerData(appId))
      pushToast(`Document "${doc.name}" uploaded successfully!`, 'success')
    }
  }

  const isAwaitingVerification =
    data.paymentSummary.paymentStatus === 'Awaiting Verification' ||
    data.paymentSummary.totalAmount === 'Not Assigned'

  const isTdsApplication = Boolean(
    data.title.toLowerCase().includes('tds') ||
    data.appId.startsWith('TDS-') ||
    (data.category === 'ITR' && data.title.toLowerCase().includes('refund'))
  )
  const isChargesPending = isTdsApplication && (data.paymentSummary.paymentStatus === 'Charges Pending' || !data.chargesFinalized)
  const isPaid = !isAwaitingVerification && !isChargesPending

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
    navigate(`/payments/checkout/${data.appId}`)
  }

  const isCertificateApplication = Boolean(
    data.title.toLowerCase().includes('certificate') ||
    data.appId.toLowerCase().includes('cert') ||
    data.appId.startsWith('GST-CRT')
  )

  const isApproved = Boolean(
    data.rawApplication?.statusLabel === 'Approved' ||
    data.rawApplication?.statusLabel === 'Completed' ||
    (data.rawApplication as any)?.managerApproved === true
  )

  const handleManagerApproveCertificate = () => {
    const rawApps = userStorage.getUserApplications()
    const appIndex = rawApps.findIndex((a) => a.id === data.appId || a.code === data.appId)
    const gstinVal = (data.filingFields?.find((f) => f.label === 'GSTIN')?.value) || '29AAAAA0000A1Z5'

    const updatedDocs = [
      {
        id: 'REG-06',
        name: 'Registration Certificate (REG-06)',
        fileName: `GST-REG-06-${gstinVal}.pdf`,
        status: 'uploaded',
        meta: 'Official Government Copy · Form GST REG-06 · Ready for Download',
        date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      },
      {
        id: 'd2',
        name: 'Taxpayer Verification Record',
        fileName: `Verification-Record-${gstinVal}.pdf`,
        status: 'uploaded',
        meta: '1.2 MB · Verified',
        date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      },
    ]

    if (appIndex >= 0) {
      const app = rawApps[appIndex]
      const updatedApp = {
        ...app,
        statusLabel: 'Approved',
        statusTone: 'success' as const,
        progress: 100,
        documents: updatedDocs,
        managerApproved: true,
        managerApprovedAt: new Date().toISOString(),
      }
      userStorage.saveUserApplication(updatedApp)
    } else {
      userStorage.saveUserApplication({
        id: `app-${data.appId}`,
        code: data.appId,
        title: 'GST Certificate (REG-06)',
        meta: `${gstinVal} · Download Certificate`,
        statusLabel: 'Approved',
        statusTone: 'success',
        progress: 100,
        icon: '📜',
        to: routePaths.applicationTrack(data.appId),
        documents: updatedDocs,
        managerApproved: true,
      })
    }

    setData(getApplicationTrackerData(appId))
    pushToast('GST Certificate approved! The document is now ready for download.', 'success')
  }

  const handleManagerRevertVerification = () => {
    const rawApps = userStorage.getUserApplications()
    const appIndex = rawApps.findIndex((a) => a.id === data.appId || a.code === data.appId)
    const gstinVal = (data.filingFields?.find((f) => f.label === 'GSTIN')?.value) || '29AAAAA0000A1Z5'

    const updatedDocs = [
      {
        id: 'REG-06',
        name: 'Registration Certificate (REG-06)',
        fileName: `GST-REG-06-${gstinVal}.pdf`,
        status: 'pending',
        meta: 'Under Verification · In Progress',
        date: 'Today',
      },
      {
        id: 'd2',
        name: 'Taxpayer Verification Record',
        fileName: `Verification-Record-${gstinVal}.pdf`,
        status: 'uploaded',
        meta: '1.2 MB · Verified',
        date: 'Today',
      },
    ]

    if (appIndex >= 0) {
      const app = rawApps[appIndex]
      const updatedApp = {
        ...app,
        statusLabel: 'Under Verification',
        statusTone: 'warning' as const,
        progress: 35,
        documents: updatedDocs,
        managerApproved: false,
      }
      userStorage.saveUserApplication(updatedApp)
    }

    setData(getApplicationTrackerData(appId))
    pushToast('Application reverted to Under Verification.', 'info')
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
            <span className="app-tracker-web-tab__badge">Step {activeStepNum}/{totalSteps}</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'documents' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span>Documents</span>
            <span className="app-tracker-web-tab__badge">{data.documentsUploadedCount}/{data.totalDocumentsCount}</span>
          </button>
          <button
            type="button"
            className={`app-tracker-web-tab ${activeTab === 'payments' ? 'app-tracker-web-tab--active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span>Payments</span>
            <span
              className={`app-tracker-web-tab__badge ${
                isAwaitingVerification
                  ? 'app-tracker-web-tab__badge--awaiting'
                  : isPaid
                  ? 'app-tracker-web-tab__badge--paid'
                  : 'app-tracker-web-tab__badge--pending'
              }`}
            >
              {data.paymentSummary.paymentStatus || (isAwaitingVerification ? 'Awaiting Verification' : isPaid ? 'Paid' : 'Pending')}
            </span>
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
          {/* Manager Action Banner for GST Certificate Verification */}
          {isCertificateApplication && (
            <div
              className="app-tracker-clean-card"
              style={{
                borderLeft: '4px solid #f97316',
                marginBottom: '16px',
                background: '#fffaf0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        background: '#ea580c',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Manager Review & Action
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: isApproved ? '#16a34a' : '#ea580c',
                        fontWeight: 700,
                      }}
                    >
                      Document Status: {isApproved ? 'Approved & Ready for Download' : 'Under Verification'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    {isApproved
                      ? 'The manager has approved this request. The applicant can download Form GST REG-06 now.'
                      : 'This application is under verification. Once approved by the manager, Form GST REG-06 will be available for download.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={handleManagerApproveCertificate}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Approve Certificate & Mark Ready</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManagerRevertVerification}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#64748b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span>Revert to Under Verification</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
              onPreviewDoc={(doc) => {
                openGstDocumentPreview({
                  id: doc.id,
                  title: doc.name,
                  fileName: doc.fileName || doc.name,
                  file: doc.file,
                  fileUrl: doc.url,
                })
              }}
              onDownloadDoc={(doc) => {
                downloadGstDocument({
                  id: doc.id,
                  title: doc.name,
                  fileName: doc.fileName || doc.name,
                  file: doc.file,
                  fileUrl: doc.url,
                })
              }}
              onUploadDoc={handleUploadRequestedDoc}
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
                  title="Finsolz Support"
                  subtitle="Online · replies in a few minutes"
                  placeholder="Type your message..."
                  embedded
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ApplicationTrackerView
