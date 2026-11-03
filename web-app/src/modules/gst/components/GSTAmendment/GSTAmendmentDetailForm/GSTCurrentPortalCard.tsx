import React from 'react'

export interface PortalDetailRow {
  label: string
  value: string
}

export interface GSTCurrentPortalCardProps {
  title?: string
  subtitle?: string
  rows: PortalDetailRow[]
}

export const GSTCurrentPortalCard: React.FC<GSTCurrentPortalCardProps> = ({
  title = 'Currently Registered on Portal',
  subtitle = 'Read-only baseline from GST profile',
  rows,
}) => {
  return (
    <div className="gst-amend-card-box">
      <div className="gst-amend-card-box__header-flex">
        <div className="gst-amend-card-header-icon-box gst-amend-card-header-icon-box--building">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
          </svg>
        </div>
        <div>
          <h3 className="gst-amend-card-box__title">{title}</h3>
          <p className="gst-amend-card-box__subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="gst-amend-readonly-multiline-list">
        {rows.map((row, idx) => (
          <div key={idx} className="gst-amend-readonly-row">
            <span className="gst-amend-readonly-label">{row.label}</span>
            <span className="gst-amend-readonly-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

