import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import './GSTCertificateSubmitted.css'

export interface GSTCertificateSubmittedProps {
  applicationId?: string
  gstin?: string
  businessName?: string
  requestType?: string
  onBackToForm?: (section?: string) => void
  onAllForms?: () => void
  onBackToDashboard?: () => void
  onTrackApplications?: () => void
  onContactSupport?: () => void
}

/**
 * Screen 2: Your Application Under Verification (GST Certificate REG-06)
 * Matches official UI reference (media_1794547476997_75e8091c.jpg).
 */
export const GSTCertificateSubmitted: React.FC<GSTCertificateSubmittedProps> = ({
  applicationId,
  gstin,
  businessName,
  onBackToForm: _onBackToForm,
  onTrackApplications,
}) => {
  const navigate = useNavigate()
  const displayAppId = applicationId || `GST-CRT-${Math.floor(10000 + Math.random() * 90000)}`
  const displayGstin = gstin || '29AAAAA0000A1Z5'
  const displayName = businessName || 'Enterprise Registered Taxpayer'

  const handleTrackClick = () => {
    if (onTrackApplications) {
      onTrackApplications()
    } else {
      navigate(routePaths.applicationTrack(displayAppId))
    }
  }

  return (
    <div className="gst-cert-sub-container">
      {/* ── Central Verification Graphic ── */}
      <div className="gst-cert-sub-hero">
        <div className="gst-cert-sub-icon-wrap">
          <div className="gst-cert-sub-circle-outer" />
          <div className="gst-cert-sub-circle-mid" />
          <div className="gst-cert-sub-badge-blue">
            <svg viewBox="0 0 24 24" className="gst-cert-sub-shield-svg" fill="none" stroke="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#ffffff" />
              <polyline points="9 12 11 14 15 10" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="gst-cert-sub-badge-clock" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="gst-cert-sub-clock-svg" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Heading & Subtitle ── */}
      <div className="gst-cert-sub-headings">
        <h1 className="gst-cert-sub-heading">Your Application Under Verification</h1>
        <p className="gst-cert-sub-subheading">
          After the verification process, your GST certificate will be downloaded.
        </p>
      </div>

      {/* ── Framed Certificate Preview ── */}
      <div className="gst-cert-sub-preview-card" aria-label="Certificate Preview">
        <div className="gst-cert-sub-paper">
          {/* Watermark seal */}
          <div className="gst-cert-sub-watermark" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="140" height="140" fill="none" stroke="currentColor">
              <circle cx="50" cy="50" r="46" strokeWidth="1.5" opacity="0.12" />
              <circle cx="50" cy="50" r="36" strokeWidth="1.2" opacity="0.12" />
              <circle cx="50" cy="50" r="16" strokeWidth="1.5" opacity="0.12" />
              <line x1="50" y1="4" x2="50" y2="96" strokeWidth="0.8" opacity="0.12" />
              <line x1="4" y1="50" x2="96" y2="50" strokeWidth="0.8" opacity="0.12" />
            </svg>
          </div>

          <div className="gst-cert-sub-paper-header">
            {/* National emblem graphic */}
            <div className="gst-cert-sub-emblem" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#1e3a8a">
                <path d="M12 2L9 7h6l-3-5zm-5 6h10l-1 5H8l-1-5zm-1 6h12l-1.5 6H7.5L6 14z" opacity="0.75" />
                <circle cx="12" cy="17" r="1.5" fill="#1e3a8a" />
              </svg>
            </div>
            <div className="gst-cert-sub-paper-gov">Government of India</div>
            <div className="gst-cert-sub-paper-gst">Goods and Services Tax</div>
            <div className="gst-cert-sub-paper-title">Certificate of Registration</div>
          </div>

          {/* Blurred Table Body & QR */}
          <div className="gst-cert-sub-paper-body">
            <div className="gst-cert-sub-paper-rows">
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Registration Number:</span>
                <span className="gst-cert-sub-cell-val">{displayGstin}</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Legal Name:</span>
                <span className="gst-cert-sub-cell-val">{displayName}</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Trade Name:</span>
                <span className="gst-cert-sub-cell-val">{displayName}</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Constitution:</span>
                <span className="gst-cert-sub-cell-val">Proprietorship</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Address:</span>
                <span className="gst-cert-sub-cell-val">Plot No. 42, Industrial Area</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Period of Validity:</span>
                <span className="gst-cert-sub-cell-val">From 01/04/2026 To Regular</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Type of Registration:</span>
                <span className="gst-cert-sub-cell-val">Regular</span>
              </div>
              <div className="gst-cert-sub-row">
                <span className="gst-cert-sub-cell-label">Approving Authority:</span>
                <span className="gst-cert-sub-cell-val">Superintendent, Range-I</span>
              </div>
            </div>

            {/* QR Code Illustration */}
            <div className="gst-cert-sub-qr-box" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="60" height="60" fill="none" stroke="#1e293b" strokeWidth="2.5">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="8" y="8" width="8" height="8" fill="#1e293b" />
                <rect x="28" y="4" width="16" height="16" rx="2" />
                <rect x="32" y="8" width="8" height="8" fill="#1e293b" />
                <rect x="4" y="28" width="16" height="16" rx="2" />
                <rect x="8" y="32" width="8" height="8" fill="#1e293b" />
                <line x1="28" y1="28" x2="36" y2="28" />
                <line x1="28" y1="36" x2="44" y2="36" />
                <line x1="36" y1="44" x2="44" y2="44" />
                <line x1="44" y1="28" x2="44" y2="32" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Button: Track Application ── */}
      <div className="gst-cert-sub-actions">
        <button
          type="button"
          className="gst-cert-sub-btn-track"
          onClick={handleTrackClick}
        >
          <svg viewBox="0 0 24 24" className="gst-cert-sub-btn-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.25" />
          </svg>
          <span>Track Application</span>
        </button>
      </div>
    </div>
  )
}

export default GSTCertificateSubmitted
