import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'
import { useAppStore } from '@store/index'
import { getApplicationTrackerData } from '../../data/applicationTrackerData'
import type { ApplicationTrackerData } from '../../data/applicationTrackerData'
import './ApplicationTrackerView.css'

export type TrackerTab = 'overview' | 'status' | 'documents' | 'payments' | 'chat'

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="app-tracker-check-icon">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

interface ChatMessage {
  id: string
  sender: 'ca' | 'user' | 'system'
  text: string
  timestamp: string
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

  // Manager charge formulation
  const [mgrServiceFee, setMgrServiceFee] = useState('847')
  const [mgrGovFees, setMgrGovFees] = useState('0')
  const [mgrOtherFees, setMgrOtherFees] = useState('0')
  const [mgrSuccess, setMgrSuccess] = useState('')
  const [mgrError, setMgrError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // In-app chat messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-sys-1',
      sender: 'system',
      text: `Application #${data?.appId || 'ITR-2026-91842'} registered on ${data?.appliedDate || '13 Oct 2026'}. Documents received for verification.`,
      timestamp: 'Today, 10:15 AM',
    },
    {
      id: 'm-ca-1',
      sender: 'ca',
      text: `Hello ${data?.customerEntity || 'Sagarika'}! Welcome to TaxEdge. We have received your ITR submission and uploaded certificates. Our tax executive team is currently verifying your documents and Form 26AS/AIS. If you have any questions or additional files, please message us here anytime!`,
      timestamp: 'Today, 10:16 AM',
    },
  ])
  const [chatInput, setChatInput] = useState('')

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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg: ChatMessage = {
      id: `m-u-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      timestamp: 'Just now',
    }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')

    // Auto simulated executive reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m-ca-${Date.now()}`,
        sender: 'ca',
        text: 'Thank you for your message. Our CA team has noted your query and will update you shortly.',
        timestamp: 'Just now',
      }
      setChatMessages((prev) => [...prev, replyMsg])
    }, 1200)
  }

  const handleQuickQuestion = (question: string) => {
    setChatInput(question)
  }

  const handleUploadClick = (docId: string) => {
    setData((prev) => {
      if (!prev) return null
      const updatedDocs = prev.documents.map((doc) =>
        doc.id === docId
          ? { ...doc, status: 'uploaded' as const, fileHash: `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-4a09-9160-2f...` }
          : doc
      )
      return {
        ...prev,
        documents: updatedDocs,
        documentsUploadedCount: updatedDocs.filter((d) => d.status === 'uploaded').length,
      }
    })
  }

  const tabTitles: Record<TrackerTab, { pageHeader: string; title: string; subtitle: string }> = {
    overview: {
      pageHeader: 'Application Details',
      title: data.title,
      subtitle: `${data.customerEntity} · ${data.appliedDate}`,
    },
    status: {
      pageHeader: 'Application Status',
      title: data.currentStageTitle,
      subtitle: `Assigned CA: ${data.assignedCA} · Target: ${data.expectedCompletion}`,
    },
    documents: {
      pageHeader: 'Required Documents',
      title: 'Document Uploads',
      subtitle: `${data.documentsUploadedCount} of ${data.totalDocumentsCount} documents uploaded`,
    },
    payments: {
      pageHeader: 'Payment Details',
      title: 'Invoice & Fees',
      subtitle: `Total: ${data.paymentSummary.totalAmount} · Status: ${data.paymentSummary.paymentStatus}`,
    },
    chat: {
      pageHeader: 'Support & Advisory',
      title: 'Chat with CA',
      subtitle: `Assigned CA: ${data.assignedCA} · Support Hours: Mon-Sat 9am-6pm`,
    },
  }

  const { pageHeader, title: bannerTitle, subtitle: bannerSubtitle } = tabTitles[activeTab]

  return (
    <div className="app-tracker-web-page">
      {/* 1. HERO HEADER */}
      <header className="app-tracker-web-header">
        <div className="app-tracker-web-header__container">
          <div className="app-tracker-web-header__top-row">
            <div className="app-tracker-web-header__meta-row">
              <button
                type="button"
                className="app-tracker-web-back-btn"
                onClick={() => navigate(routePaths.applications)}
                title="Back to Applications"
                aria-label="Back to Applications"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back</span>
              </button>
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
              <span className="app-tracker-web-stage-pill__val">{data.currentStageTitle}</span>
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
            <span className="app-tracker-web-tab__badge">Step 2/8</span>
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
            <span className="app-tracker-web-tab__badge app-tracker-web-tab__badge--pending">{data.paymentSummary.paymentStatus}</span>
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
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="app-tracker-web-overview-layout">
              {/* Left Column: Application Info & Assigned Executive */}
              <div className="app-tracker-overview-left">
                {/* 1. Application Info Card */}
                <section className="app-tracker-card" aria-label="Application Info">
                  <div className="app-tracker-card__header">
                    <div className="app-tracker-card__header-text">
                      <span className="app-tracker-info-circle-icon">ⓘ</span>
                      <h3 className="app-tracker-card__title">Application Info</h3>
                    </div>
                  </div>
                  <div className="app-tracker-field-list">
                    {data.infoFields.map((f, i) => (
                      <div key={i} className="app-tracker-field-row">
                        <span className="app-tracker-field-label">{f.label}</span>
                        <span className={`app-tracker-field-value ${f.isHighlight ? 'app-tracker-field-value--highlight' : ''}`}>
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Assigned Executive Card */}
                <section className="app-tracker-card app-tracker-assigned-card" aria-label="Assigned Executive">
                  <div className="app-tracker-assigned-inner">
                    <div className="app-tracker-assigned-left">
                      <div className="app-tracker-assigned-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <div className="app-tracker-assigned-info">
                        <span className="app-tracker-assigned-label">ASSIGNED EXECUTIVE</span>
                        <span className="app-tracker-assigned-name">{data.assignedCA}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="app-tracker-chat-pill-btn"
                      onClick={() => setActiveTab('chat')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Chat with CA</span>
                    </button>
                  </div>
                </section>
              </div>

              {/* Right Column: Contact Support & Quick CTA */}
              <div className="app-tracker-overview-right">
                <section className="app-tracker-card app-tracker-support-card" aria-label="Contact Support">
                  <div className="app-tracker-card__header app-tracker-card__header--support">
                    <div className="app-tracker-card__header-text">
                      <span className="app-tracker-support-headphone-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                        </svg>
                      </span>
                      <h3 className="app-tracker-card__title">Contact Support</h3>
                    </div>
                  </div>
                  <p className="app-tracker-support-desc">
                    Need help with your application? Our CA team is available Mon-Sat 9am-6pm.
                  </p>

                  <div className="app-tracker-support-channels">
                    <a href="tel:+918800123456" className="app-tracker-channel-row">
                      <div className="app-tracker-channel-left">
                        <div className="app-tracker-channel-icon app-tracker-channel-icon--phone">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div className="app-tracker-channel-info">
                          <span className="app-tracker-channel-label">Call Us</span>
                          <span className="app-tracker-channel-val">+91 8800 123 456</span>
                        </div>
                      </div>
                      <span className="app-tracker-channel-chevron">›</span>
                    </a>

                    <a href="https://wa.me/918800123456" target="_blank" rel="noopener noreferrer" className="app-tracker-channel-row">
                      <div className="app-tracker-channel-left">
                        <div className="app-tracker-channel-icon app-tracker-channel-icon--whatsapp">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </div>
                        <div className="app-tracker-channel-info">
                          <span className="app-tracker-channel-label">WhatsApp Support</span>
                          <span className="app-tracker-channel-val">Chat with a CA Now</span>
                        </div>
                      </div>
                      <span className="app-tracker-channel-chevron">›</span>
                    </a>

                    <a href="mailto:support@taxedge.in" className="app-tracker-channel-row">
                      <div className="app-tracker-channel-left">
                        <div className="app-tracker-channel-icon app-tracker-channel-icon--email">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <div className="app-tracker-channel-info">
                          <span className="app-tracker-channel-label">Email Support</span>
                          <span className="app-tracker-channel-val">support@taxedge.in</span>
                        </div>
                      </div>
                      <span className="app-tracker-channel-chevron">›</span>
                    </a>

                    <button type="button" className="app-tracker-channel-row app-tracker-channel-row--btn" onClick={() => setActiveTab('chat')}>
                      <div className="app-tracker-channel-left">
                        <div className="app-tracker-channel-icon app-tracker-channel-icon--ticket">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="13" y2="13" />
                          </svg>
                        </div>
                        <div className="app-tracker-channel-info">
                          <span className="app-tracker-channel-label">In-App Support Ticket</span>
                          <span className="app-tracker-channel-val">Chat with TaxEdge Support</span>
                        </div>
                      </div>
                      <span className="app-tracker-channel-chevron">›</span>
                    </button>
                  </div>
                </section>

                {/* Prominent Web CTA Button */}
                <button
                  type="button"
                  className="app-tracker-orange-cta-btn"
                  onClick={() => setActiveTab('chat')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Chat with CA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STATUS */}
          {activeTab === 'status' && (
            <div className="app-tracker-web-status-pane">
              <section className="app-tracker-card" aria-label="Status Timeline">
                <div className="app-tracker-card__header">
                  <div className="app-tracker-card__header-text">
                    <span className="app-tracker-timeline-header-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </svg>
                    </span>
                    <h3 className="app-tracker-card__title">Status Timeline</h3>
                  </div>
                  <div className="app-tracker-card__header-meta">
                    Target Date: <strong>{data.expectedCompletion}</strong>
                  </div>
                </div>

                <div className="app-tracker-timeline">
                  {data.timelineSteps.map((step, idx) => {
                    const isLast = idx === data.timelineSteps.length - 1
                    return (
                      <div key={step.stepNumber} className={`app-tracker-timeline-item app-tracker-timeline-item--${step.status}`}>
                        <div className="app-tracker-timeline-marker-col">
                          <div className={`app-tracker-timeline-circle app-tracker-timeline-circle--${step.status}`}>
                            {step.status === 'completed' ? <CheckSvg /> : <span>{step.stepNumber}</span>}
                          </div>
                          {!isLast && (
                            <div className={`app-tracker-timeline-line ${step.status === 'completed' ? 'app-tracker-timeline-line--completed' : ''}`} />
                          )}
                        </div>

                        <div className="app-tracker-timeline-content">
                          <div className="app-tracker-timeline-text">
                            <h4 className={`app-tracker-timeline-title app-tracker-timeline-title--${step.status}`}>
                              {step.title}
                            </h4>
                            <p className="app-tracker-timeline-desc">{step.description}</p>
                          </div>
                          {step.timestamp && <span className="app-tracker-timeline-time">{step.timestamp}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <div className="app-tracker-status-bottom-bar">
                <button
                  type="button"
                  className="app-tracker-orange-cta-btn"
                  onClick={() => setActiveTab('chat')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Chat with CA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="app-tracker-web-documents-pane">
              <section className="app-tracker-card" aria-label="Required Documents">
                <div className="app-tracker-card__header">
                  <div className="app-tracker-card__header-text">
                    <span className="app-tracker-folder-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    <h3 className="app-tracker-card__title">Required Documents</h3>
                  </div>
                  <span className="app-tracker-doc-count-badge">
                    {data.documentsUploadedCount} of {data.totalDocumentsCount} uploaded
                  </span>
                </div>

                <div className="app-tracker-doc-grid">
                  {data.documents.map((doc) => (
                    <div key={doc.id} className="app-tracker-doc-row">
                      <div className="app-tracker-doc-left">
                        <div className={`app-tracker-doc-icon-box app-tracker-doc-icon-box--${doc.status}`}>
                          {doc.status === 'uploaded' ? <CheckSvg /> : <span>📄</span>}
                        </div>
                        <div className="app-tracker-doc-info">
                          <span className="app-tracker-doc-name">{doc.name}</span>
                          {doc.fileHash && <span className="app-tracker-doc-hash">{doc.fileHash}</span>}
                        </div>
                      </div>

                      <div className="app-tracker-doc-right">
                        {doc.status === 'uploaded' ? (
                          <div className="app-tracker-doc-badge-uploaded">
                            <CheckSvg />
                            <span>Uploaded</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="app-tracker-doc-btn-upload"
                            onClick={() => handleUploadClick(doc.id)}
                          >
                            <span>Upload File</span> ☁
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="app-tracker-status-bottom-bar">
                <button
                  type="button"
                  className="app-tracker-orange-cta-btn"
                  onClick={() => setActiveTab('chat')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Chat with CA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (() => {
            const isTdsApplication = Boolean(
              data.title.toLowerCase().includes('tds') ||
              data.appId.startsWith('TDS-') ||
              (data.category === 'ITR' && data.title.toLowerCase().includes('refund'))
            )
            const isChargesPending = isTdsApplication && (data.paymentSummary.paymentStatus === 'Charges Pending' || !data.chargesFinalized)
            const isPaid = data.paymentSummary.paymentStatus === 'Paid'
            const computedGst = Math.round(Number(mgrServiceFee || 0) * 0.18)
            const computedTotal = Number(mgrServiceFee || 0) + Number(mgrGovFees || 0) + computedGst + Number(mgrOtherFees || 0)

            const handleFinalizeCharges = (e: React.FormEvent) => {
              e.preventDefault()
              setMgrError('')
              setMgrSuccess('')

              const sFee = Number(mgrServiceFee)
              const gFee = Number(mgrGovFees)
              const oFee = Number(mgrOtherFees || 0)

              if (isNaN(sFee) || sFee < 0) {
                setMgrError('Please enter a valid positive Service Fee.')
                return
              }
              if (isNaN(gFee) || gFee < 0) {
                setMgrError('Please enter a valid positive Government Fee.')
                return
              }

              const total = sFee + gFee + computedGst + oFee
              if (total <= 0) {
                setMgrError('Total payable amount must be greater than ₹0.')
                return
              }

              const updated = userStorage.finalizeApplicationCharges(data.appId, {
                serviceFee: sFee,
                govFees: gFee,
                gst: computedGst,
                otherCharges: oFee,
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
              <div className="app-tracker-web-payments-grid">
                {/* Payment Summary */}
                <section className="app-tracker-card" aria-label="Payment Summary">
                  <div className="app-tracker-card__header">
                    <div className="app-tracker-card__header-text">
                      <span className="app-tracker-credit-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </span>
                      <h3 className="app-tracker-card__title">Payment Summary</h3>
                    </div>
                  </div>

                  {isChargesPending && (
                    <div
                      className="app-tracker-charges-pending-alert"
                      data-testid="tds-charges-pending-banner"
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        margin: '16px 20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        color: '#92400e',
                        fontSize: '13px',
                        lineHeight: '1.4',
                      }}
                    >
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>⏳</span>
                      <div>
                        <strong style={{ display: 'block', color: '#b45309', marginBottom: '2px' }}>
                          Charges are being finalized
                        </strong>
                        <span>
                          Charges are being finalized after the review of your application. The payment amount will be available here once confirmed.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="app-tracker-field-list">
                    <div className="app-tracker-field-row">
                      <span className="app-tracker-field-label">Service Fee</span>
                      <span className="app-tracker-field-value">{data.paymentSummary.serviceFee}</span>
                    </div>
                    <div className="app-tracker-field-row">
                      <span className="app-tracker-field-label">Government Fees</span>
                      <span className="app-tracker-field-value">{data.paymentSummary.govFees}</span>
                    </div>
                    <div className="app-tracker-field-row">
                      <span className="app-tracker-field-label">Platform GST (18%)</span>
                      <span className="app-tracker-field-value">{data.paymentSummary.gst}</span>
                    </div>
                    <div className="app-tracker-field-row">
                      <span className="app-tracker-field-label">Payment Date</span>
                      <span className="app-tracker-field-value">{data.paymentSummary.paymentDate}</span>
                    </div>
                    <div className="app-tracker-field-row app-tracker-field-row--total">
                      <span className="app-tracker-field-label app-tracker-field-label--total">Total Amount</span>
                      <span className={`app-tracker-field-value ${isChargesPending ? '' : 'app-tracker-field-value--total-orange'}`}>
                        {data.paymentSummary.totalAmount}
                      </span>
                    </div>
                    <div className="app-tracker-field-row">
                      <span className="app-tracker-field-label">Payment Status</span>
                      <span
                        className={`app-tracker-pending-pill ${
                          isPaid
                            ? 'app-tracker-pending-pill--paid'
                            : isChargesPending
                            ? 'app-tracker-pending-pill--warning'
                            : ''
                        }`}
                        style={
                          isPaid
                            ? { background: '#dcfce7', color: '#15803d' }
                            : isChargesPending
                            ? { background: '#fef3c7', color: '#b45309' }
                            : undefined
                        }
                        data-testid="tracker-payment-status"
                      >
                        {data.paymentSummary.paymentStatus}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Payment Actions & Verification Policy */}
                <section className="app-tracker-card app-tracker-payment-action-card" aria-label="Payment Actions">
                  <div className="app-tracker-card__header">
                    <h3 className="app-tracker-card__title">Invoice &amp; Actions</h3>
                  </div>
                  <div className="app-tracker-payment-action-content">
                    {isChargesPending ? (
                      <>
                        <p className="app-tracker-payment-action-desc">
                          Our compliance team and Chartered Accountant are assessing your deductions and documents. Once the manager approves the final service charges, you can pay directly from this tab.
                        </p>
                        <div className="app-tracker-payment-action-btns">
                          <button
                            type="button"
                            className="app-tracker-pay-now-btn"
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed', background: '#94a3b8' }}
                            data-testid="tds-pay-now-disabled-btn"
                          >
                            <span>Pay Now (Charges Pending)</span>
                          </button>
                        </div>
                      </>
                    ) : isPaid ? (
                      <>
                        <div
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                            color: '#065f46',
                            fontSize: '13px',
                          }}
                        >
                          <strong>Payment Confirmed ✓</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                            Transaction Reference: {data.paymentSummary.transactionId}
                          </p>
                        </div>
                        <div className="app-tracker-payment-action-btns">
                          <button
                            type="button"
                            className="app-tracker-pay-now-btn"
                            disabled
                            style={{ opacity: 0.7, cursor: 'default', background: '#059669' }}
                            data-testid="tds-paid-complete-btn"
                          >
                            <span>Paid ✓ ({data.paymentSummary.totalAmount})</span>
                          </button>
                          <button
                            type="button"
                            className="app-tracker-download-inv-btn"
                            onClick={() => pushToast(`Receipt downloaded for ${data.appId}`, 'info')}
                            data-testid="tds-download-receipt-btn"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download Payment Receipt</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="app-tracker-payment-action-desc">
                          Your service charges have been finalized by the manager. Complete your payment securely to continue processing.
                        </p>
                        <div className="app-tracker-payment-action-btns">
                          <button
                            type="button"
                            className="app-tracker-pay-now-btn"
                            onClick={handlePayNow}
                            disabled={isProcessingPayment}
                            data-testid="tds-pay-now-btn"
                          >
                            <span>{isProcessingPayment ? 'Processing Payment...' : `Pay Total (${data.paymentSummary.totalAmount})`}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="app-tracker-download-inv-btn"
                            onClick={() => pushToast(`Proforma invoice downloaded for ${data.appId}`, 'info')}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download Proforma Invoice</span>
                          </button>
                        </div>
                      </>
                    )}
                    <div className="app-tracker-payment-secure-badge">
                      <span>🔒 100% Secure &amp; Compliant Payment Gateway</span>
                    </div>
                  </div>
                </section>

                {/* Manager Charge Finalization Card (Available for TDS Refund when charges pending or manager review) */}
                {isTdsApplication && !isPaid && (
                  <section
                    className="app-tracker-card app-tracker-manager-charge-card"
                    aria-label="Manager Charge Determination"
                    data-testid="manager-charge-finalization-card"
                    style={{ gridColumn: '1 / -1', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  >
                    <div className="app-tracker-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="app-tracker-card__header-text">
                        <span style={{ fontSize: '18px', marginRight: '8px' }}>⚖️</span>
                        <h3 className="app-tracker-card__title">Manager Review &amp; Charge Determination</h3>
                      </div>
                      <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        {isManagerOrAdmin ? 'Authorized Manager Desk' : 'Manager / Staff Desk'}
                      </span>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475569' }}>
                        CA review has verified all documentation. As authorized manager, determine the applicable charge components for application <strong>{data.appId}</strong>. Once published, the amount will be immediately payable by the customer.
                      </p>

                      <form onSubmit={handleFinalizeCharges} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                        <div>
                          <label htmlFor="mgr-service-fee" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Service Fee (₹) *
                          </label>
                          <input
                            id="mgr-service-fee"
                            type="number"
                            min="0"
                            value={mgrServiceFee}
                            onChange={(e) => setMgrServiceFee(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
                            data-testid="mgr-service-fee-input"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="mgr-gov-fees" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Government Fees (₹)
                          </label>
                          <input
                            id="mgr-gov-fees"
                            type="number"
                            min="0"
                            value={mgrGovFees}
                            onChange={(e) => setMgrGovFees(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
                            data-testid="mgr-gov-fees-input"
                          />
                        </div>

                        <div>
                          <label htmlFor="mgr-other-fees" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Other Charges (₹)
                          </label>
                          <input
                            id="mgr-other-fees"
                            type="number"
                            min="0"
                            value={mgrOtherFees}
                            onChange={(e) => setMgrOtherFees(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
                            data-testid="mgr-other-fees-input"
                          />
                        </div>

                        <div>
                          <label htmlFor="mgr-gst" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Platform GST (18%)
                          </label>
                          <input
                            id="mgr-gst"
                            type="text"
                            readOnly
                            value={`₹${computedGst}`}
                            style={{ width: '100%', padding: '8px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#64748b' }}
                            data-testid="mgr-gst-display"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Calculated Total Payable
                          </label>
                          <div style={{ padding: '8px 12px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '6px', fontSize: '15px', fontWeight: 700, color: '#c2410c' }} data-testid="mgr-total-display">
                            ₹{computedTotal.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                          <button
                            type="submit"
                            style={{ background: '#f97316', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                            data-testid="mgr-finalize-charges-btn"
                          >
                            Finalize &amp; Publish Charges
                          </button>
                          {mgrSuccess && (
                            <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }} data-testid="mgr-success-msg">
                              ✓ {mgrSuccess}
                            </span>
                          )}
                          {mgrError && (
                            <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }} data-testid="mgr-error-msg">
                              ⚠ {mgrError}
                            </span>
                          )}
                        </div>
                      </form>
                    </div>
                  </section>
                )}
              </div>
            )
          })()}

          {/* TAB 5: CHAT WITH CA */}
          {activeTab === 'chat' && (
            <div className="app-tracker-web-chat-pane">
              <section className="app-tracker-card app-tracker-chat-card" aria-label="Live CA Support Desk">
                <div className="app-tracker-chat-header">
                  <div className="app-tracker-chat-header-user">
                    <div className="app-tracker-chat-avatar">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span className="app-tracker-chat-online-badge" />
                    </div>
                    <div>
                      <h3 className="app-tracker-chat-name">TaxEdge CA Advisory Desk</h3>
                      <p className="app-tracker-chat-status">
                        <span>Application #{data.appId}</span> • <span>Assigned: {data.assignedCA}</span>
                      </p>
                    </div>
                  </div>
                  <div className="app-tracker-chat-hours">
                    <span>🕒 Mon-Sat 9am–6pm</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="app-tracker-chat-messages">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`app-tracker-chat-msg app-tracker-chat-msg--${msg.sender}`}>
                      {msg.sender === 'system' ? (
                        <div className="app-tracker-chat-sys-bubble">
                          <span>{msg.text}</span>
                        </div>
                      ) : (
                        <div className="app-tracker-chat-bubble">
                          <p className="app-tracker-chat-msg-text">{msg.text}</p>
                          <span className="app-tracker-chat-msg-time">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Prompts */}
                <div className="app-tracker-chat-quick-chips">
                  <span className="app-tracker-chat-chip-label">Quick Questions:</span>
                  <button
                    type="button"
                    className="app-tracker-chat-chip"
                    onClick={() => handleQuickQuestion('When will my ITR filing be completed?')}
                  >
                    When will my ITR be filed?
                  </button>
                  <button
                    type="button"
                    className="app-tracker-chat-chip"
                    onClick={() => handleQuickQuestion('Do I need to upload Form 16 or any other documents?')}
                  >
                    Need any additional documents?
                  </button>
                  <button
                    type="button"
                    className="app-tracker-chat-chip"
                    onClick={() => handleQuickQuestion('How do I complete the pending payment?')}
                  >
                    Payment assistance
                  </button>
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="app-tracker-chat-input-form">
                  <input
                    type="text"
                    className="app-tracker-chat-input"
                    placeholder="Type your message or inquiry for the CA..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="app-tracker-chat-send-btn"
                    disabled={!chatInput.trim()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Send</span>
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Floating / Sticky Mobile/Tablet Bottom Bar */}
      <aside className="app-tracker-mobile-footer-bar" aria-label="Quick Actions">
        <button
          type="button"
          className="app-tracker-orange-cta-btn"
          onClick={() => setActiveTab('chat')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat with CA</span>
        </button>
      </aside>
    </div>
  )
}

export default ApplicationTrackerView
