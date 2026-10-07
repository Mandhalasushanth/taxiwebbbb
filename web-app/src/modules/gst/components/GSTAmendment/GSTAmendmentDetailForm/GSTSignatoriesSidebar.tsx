import React from 'react'
import { UPLOAD_HINT } from '@shared/upload'

export const GSTSignatoriesSidebar: React.FC = () => {
  return (
    <div className="gst-amend-detail-sidebar-col">
      {/* Sidebar Card 1: Accepted proofs */}
      <div className="gst-sig-accepted-proofs-card">
        <div className="gst-sig-card-header">
          <div className="gst-sig-orange-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <h4 className="gst-sig-card-title orange-title">Accepted proofs</h4>
        </div>
        <ul className="gst-sig-proofs-list">
          <li>Letter of Authorisation</li>
          <li>Board Resolution</li>
          <li>Managing Committee Resolution</li>
          <li>Acceptance Letter accompanying the Resolution</li>
          <li>Applicable official appointment / authorisation document</li>
          <li>Other official authorisation document applicable to the entity</li>
        </ul>
      </div>

      {/* Sidebar Card 2: Important Information */}
      <div className="gst-sig-info-card">
        <div className="gst-sig-card-header">
          <div className="gst-sig-blue-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <h4 className="gst-sig-card-title blue-title">Important Information</h4>
        </div>
        <ul className="gst-sig-info-list">
          <li>Currently registered details are read-only and cannot be edited.</li>
          <li>Enter the new authorised signatory details exactly as per the supporting document.</li>
          <li>Upload a valid document from the accepted proofs list.</li>
          <li>Allowed files: {UPLOAD_HINT}.</li>
        </ul>
      </div>
    </div>
  )
}

export default GSTSignatoriesSidebar
