import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import './GSTCertificateSubmitted.css'

interface GSTCertificateSubmittedProps {
  applicationId?: string
  gstin?: string
  requestType?: string
  onBackToForm: () => void
  onAllForms?: () => void
}

/**
 * Screen 2: GST Certificate Ready (REG-06)
 * Replicates the mobile screen 2 reference with the 3 navigation actions
 * (Go to Dashboard, My Applications, Chat with CA) using TaxEdge color codes.
 */
export const GSTCertificateSubmitted: React.FC<GSTCertificateSubmittedProps> = ({
  applicationId = 'CRT-192842',
  gstin = '29AAAAA0000A1Z4',
}) => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)

  // Register in userStorage so it shows up in "My Applications"
  useEffect(() => {
    try {
      const existing = userStorage.getUserApplications()
      const alreadyPresent = existing.some((a) => a.code === applicationId)
      if (!alreadyPresent) {
        userStorage.saveUserApplication({
          id: `app-cert-${Date.now()}`,
          code: applicationId,
          title: 'GST Certificate (REG-06)',
          meta: `${gstin} · Form REG-06`,
          statusLabel: 'Generated & Saved',
          statusTone: 'success',
          progress: 100,
          icon: '📜',
          to: `/applications`,
        })
      }
    } catch {
      // storage fallback
    }
  }, [applicationId, gstin])

  const handleShareOrDownload = () => {
    // Generate simulated download
    const link = document.createElement('a')
    link.href = '#download-cert'
    link.download = `GST-Certificate-${gstin}.pdf`
    pushToast(`Certificate GST-Certificate-${gstin}.pdf saved successfully!`, 'success')

    if (navigator.share) {
      navigator.share({
        title: 'GST Registration Certificate (REG-06)',
        text: `GST Certificate for ${gstin}`,
        url: window.location.href,
      }).catch(() => {})
    }
  }

  const handleGoToDashboard = () => {
    navigate(routePaths.dashboard)
  }

  const handleMyApplications = () => {
    navigate(routePaths.applications)
  }

  const handleChatWithCa = () => {
    navigate(routePaths.support)
  }

  return (
    <div className="gst-cert-ready-container">
      {/* ── Top Bar Header ── */}
      <div className="gst-cert-ready-top-bar">
        <h2 className="gst-cert-top-title">GST Certificate (REG-06)</h2>
        <div className="gst-cert-taxedge-pill">TaxEdge</div>
      </div>

      {/* ── Hero Certificate Illustration ── */}
      <div className="gst-cert-ready-hero" aria-hidden="true">
        <div className="gst-cert-ready-slot-wrap">
          {/* Paper emerging from slot */}
          <div className="gst-cert-ready-paper">
            <span className="gst-cert-ready-paper-text">GST</span>
            <div className="gst-cert-ready-paper-lines">
              <span className="gst-cert-ready-paper-line" />
              <span className="gst-cert-ready-paper-line gst-cert-ready-paper-line--short" />
            </div>
          </div>
          {/* Base Slot Platform */}
          <div className="gst-cert-ready-slot">
            <div className="gst-cert-ready-slot-inner" />
          </div>
          {/* Circular Badge Checkmark in center */}
          <div className="gst-cert-ready-check-badge">
            <svg viewBox="0 0 24 24" className="gst-cert-ready-check-svg" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Title & Subtitle ── */}
      <div className="gst-cert-ready-text-block">
        <h1 className="gst-cert-ready-title">Certificate Ready!</h1>
        <p className="gst-cert-ready-subtitle">
          Your official <strong>Form GST REG-06</strong> certificate has been generated successfully.
        </p>
      </div>

      {/* ── Summary Details Card ── */}
      <div className="gst-cert-ready-card">
        {/* Row 1: GSTIN */}
        <div className="gst-cert-ready-row">
          <div className="gst-cert-ready-row-left">
            <div className="gst-cert-ready-icon-box">
              <svg viewBox="0 0 24 24" className="gst-cert-ready-row-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" />
              </svg>
            </div>
            <span className="gst-cert-ready-label">GSTIN</span>
          </div>
          <span className="gst-cert-ready-value">{gstin}</span>
        </div>

        <div className="gst-cert-ready-divider" />

        {/* Row 2: Form */}
        <div className="gst-cert-ready-row">
          <div className="gst-cert-ready-row-left">
            <div className="gst-cert-ready-icon-box">
              <svg viewBox="0 0 24 24" className="gst-cert-ready-row-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="gst-cert-ready-label">Form</span>
          </div>
          <span className="gst-cert-ready-value">Form GST REG-06</span>
        </div>

        <div className="gst-cert-ready-divider" />

        {/* Row 3: Status */}
        <div className="gst-cert-ready-row">
          <div className="gst-cert-ready-row-left">
            <div className="gst-cert-ready-icon-box gst-cert-ready-icon-box--green">
              <svg viewBox="0 0 24 24" className="gst-cert-ready-row-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="gst-cert-ready-label">Status</span>
          </div>
          <span className="gst-cert-ready-status-pill">Generated &amp; Saved</span>
        </div>
      </div>

      {/* ── Primary Action: Share / Save Certificate ── */}
      <button
        type="button"
        className="gst-cert-btn-outline-blue"
        onClick={handleShareOrDownload}
      >
        <svg viewBox="0 0 24 24" className="gst-cert-btn-share-icon" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share / Save Certificate</span>
      </button>

      {/* ── Replacement Bottom Actions (Dashboard, My Applications, Chat with CA) ── */}
      <div className="gst-cert-ready-bottom-actions">
        {/* 1. Go to Dashboard */}
        <button
          type="button"
          className="gst-cert-btn-nav gst-cert-btn-nav--dashboard"
          onClick={handleGoToDashboard}
        >
          <svg viewBox="0 0 24 24" className="gst-cert-nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Go to Dashboard</span>
        </button>

        {/* 2. My Applications */}
        <button
          type="button"
          className="gst-cert-btn-nav gst-cert-btn-nav--applications"
          onClick={handleMyApplications}
        >
          <svg viewBox="0 0 24 24" className="gst-cert-nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>My Applications</span>
        </button>

        {/* 3. Chat with CA */}
        <button
          type="button"
          className="gst-cert-btn-nav gst-cert-btn-nav--chat"
          onClick={handleChatWithCa}
        >
          <svg viewBox="0 0 24 24" className="gst-cert-nav-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat with CA</span>
        </button>
      </div>
    </div>
  )
}

export default GSTCertificateSubmitted
