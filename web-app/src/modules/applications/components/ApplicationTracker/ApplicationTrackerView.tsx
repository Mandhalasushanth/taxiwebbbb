import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { routePaths } from '@core/config'
import { getApplicationTrackerData } from '../../data/applicationTrackerData'
import type { ApplicationTrackerData } from '../../data/applicationTrackerData'
import './ApplicationTrackerView.css'

export type TrackerTab = 'overview' | 'status' | 'documents' | 'payments'

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="app-tracker-check-icon">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const ApplicationTrackerView: React.FC<{ customId?: string }> = ({ customId }) => {
  const { id: routeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const appId = customId || routeId || ''

  const [activeTab, setActiveTab] = useState<TrackerTab>('overview')
  const [data, setData] = useState<ApplicationTrackerData | null>(() => getApplicationTrackerData(appId))

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

  const handleOpenSupport = () => {
    navigate(`${routePaths.support}?appId=${encodeURIComponent(data.appId)}&service=${encodeURIComponent(data.title)}`)
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

  const tabTitles: Record<TrackerTab, [string, string]> = {
    overview: [data.title, `${data.customerEntity} · ${data.appliedDate}`],
    status: [data.currentStageTitle, data.currentStageSubtitle],
    documents: ['Document Uploads', `${data.documentsUploadedCount} of ${data.totalDocumentsCount} documents uploaded`],
    payments: ['Invoice & Fees', `Total: ${data.paymentSummary.totalAmount} · Status: ${data.paymentSummary.paymentStatus}`],
  }

  const [bannerTitle, bannerSubtitle] = tabTitles[activeTab]

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

            <button type="button" className="app-tracker-web-support-btn" onClick={handleOpenSupport} title="Get help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="app-tracker-headphone-icon">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              <span>Need Help? Support</span>
            </button>
          </div>

          <div className="app-tracker-web-header__headline-row">
            <div>
              <h1 className="app-tracker-web-title">{bannerTitle}</h1>
              <p className="app-tracker-web-subtitle">{bannerSubtitle}</p>
            </div>
            <div className="app-tracker-web-stage-pill">
              <span className="app-tracker-web-stage-pill__label">Current Stage</span>
              <span className="app-tracker-web-stage-pill__val">{data.currentStageTitle}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <div className="app-tracker-web-container">
        <nav className="app-tracker-web-tabs" aria-label="Tracker Navigation Tabs">
          <button type="button" className={`app-tracker-web-tab ${activeTab === 'overview' ? 'app-tracker-web-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span>📋 Overview</span>
          </button>
          <button type="button" className={`app-tracker-web-tab ${activeTab === 'status' ? 'app-tracker-web-tab--active' : ''}`} onClick={() => setActiveTab('status')}>
            <span>🔀 Status</span>
            <span className="app-tracker-web-tab__badge">Step {data.timelineSteps.findIndex((s) => s.status === 'current') + 1 || 1}/{data.timelineSteps.length}</span>
          </button>
          <button type="button" className={`app-tracker-web-tab ${activeTab === 'documents' ? 'app-tracker-web-tab--active' : ''}`} onClick={() => setActiveTab('documents')}>
            <span>📁 Documents</span>
            <span className="app-tracker-web-tab__badge">{data.documentsUploadedCount}/{data.totalDocumentsCount}</span>
          </button>
          <button type="button" className={`app-tracker-web-tab ${activeTab === 'payments' ? 'app-tracker-web-tab--active' : ''}`} onClick={() => setActiveTab('payments')}>
            <span>💳 Payments</span>
            <span className="app-tracker-web-tab__badge app-tracker-web-tab__badge--green">{data.paymentSummary.paymentStatus}</span>
          </button>
        </nav>

        {/* 3. TAB CONTENT PANES */}
        <main className="app-tracker-web-content">
          {activeTab === 'overview' && (
            <div className="app-tracker-web-overview-grid">
              <section className="app-tracker-card" aria-label="Application Info">
                <div className="app-tracker-card__header">
                  <span className="app-tracker-card__title">ⓘ Application Info</span>
                </div>
                <div className="app-tracker-field-list">
                  {data.infoFields.map((f, i) => (
                    <div key={i} className="app-tracker-field-row">
                      <span className="app-tracker-field-label">{f.label}</span>
                      <span className={`app-tracker-field-value ${f.isHighlight ? 'app-tracker-field-value--highlight' : ''}`}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="app-tracker-card" aria-label={data.filingFieldsHeader}>
                <div className="app-tracker-card__header">
                  <span className="app-tracker-card__title">📄 {data.filingFieldsHeader}</span>
                </div>
                <div className="app-tracker-field-list">
                  {data.filingFields.map((f, i) => (
                    <div key={i} className="app-tracker-field-row">
                      <span className="app-tracker-field-label">{f.label}</span>
                      <span className={`app-tracker-field-value ${f.isHighlight ? 'app-tracker-field-value--orange' : ''}`}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="app-tracker-web-status-pane">
              <section className="app-tracker-card" aria-label="Status Timeline">
                <div className="app-tracker-card__header">
                  <div className="app-tracker-card__header-text">
                    <h3 className="app-tracker-card__title">🔀 Verification & Filing Progress</h3>
                  </div>
                  <div className="app-tracker-card__header-meta">Target Date: <strong>23 Sep 2026</strong></div>
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
                          {!isLast && <div className={`app-tracker-timeline-line ${step.status === 'completed' ? 'app-tracker-timeline-line--completed' : ''}`} />}
                        </div>

                        <div className="app-tracker-timeline-content">
                          <div className="app-tracker-timeline-text">
                            <h4 className={`app-tracker-timeline-title app-tracker-timeline-title--${step.status}`}>{step.title}</h4>
                            <p className="app-tracker-timeline-desc">{step.description}</p>
                          </div>
                          {step.timestamp && <span className="app-tracker-timeline-time">{step.timestamp}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="app-tracker-web-documents-pane">
              <section className="app-tracker-card" aria-label="Required Documents">
                <div className="app-tracker-card__header">
                  <h3 className="app-tracker-card__title">📁 Documents Checklist</h3>
                  <span className="app-tracker-doc-count-badge">{data.documentsUploadedCount} of {data.totalDocumentsCount} Verified</span>
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
                          <div className="app-tracker-doc-badge-uploaded"><CheckSvg /><span>Uploaded</span></div>
                        ) : (
                          <button type="button" className="app-tracker-doc-btn-upload" onClick={() => handleUploadClick(doc.id)}>
                            <span>Upload File</span> ☁
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="app-tracker-web-payments-grid">
              <section className="app-tracker-card" aria-label="Payment Summary">
                <div className="app-tracker-card__header">
                  <h3 className="app-tracker-card__title">💳 Invoice Breakdown</h3>
                </div>
                <div className="app-tracker-field-list">
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Service Fee</span><span className="app-tracker-field-value">{data.paymentSummary.serviceFee}</span></div>
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Government Fees</span><span className="app-tracker-field-value">{data.paymentSummary.govFees}</span></div>
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Platform GST (18%)</span><span className="app-tracker-field-value">{data.paymentSummary.gst}</span></div>
                  <div className="app-tracker-field-row app-tracker-field-row--total">
                    <span className="app-tracker-field-label app-tracker-field-label--total">Total Amount</span>
                    <span className="app-tracker-field-value app-tracker-field-value--total-orange">{data.paymentSummary.totalAmount}</span>
                  </div>
                </div>
              </section>

              <section className="app-tracker-card" aria-label="Transaction Details">
                <div className="app-tracker-card__header">
                  <h3 className="app-tracker-card__title">🧾 Transaction Receipt</h3>
                </div>
                <div className="app-tracker-field-list">
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Transaction ID</span><span className="app-tracker-field-value app-tracker-field-value--mono">{data.paymentSummary.transactionId}</span></div>
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Payment Method</span><span className="app-tracker-field-value">{data.paymentSummary.paymentMethod}</span></div>
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Payment Date</span><span className="app-tracker-field-value">{data.paymentSummary.paymentDate}</span></div>
                  <div className="app-tracker-field-row"><span className="app-tracker-field-label">Payment Status</span><span className="app-tracker-paid-pill">{data.paymentSummary.paymentStatus}</span></div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ApplicationTrackerView
