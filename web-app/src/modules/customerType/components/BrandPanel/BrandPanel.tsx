import type { FC } from 'react'
import { FinsolzBrand } from '@shared/components'
import './BrandPanel.css'

export const BrandPanel: FC = () => {
  return (
    <aside className="brand-panel" aria-label="Finsolz customer type overview">
      {/* Subtle Background Diagonal Lines & Dots */}
      <div className="brand-panel__pattern" aria-hidden="true" />
      <div className="brand-panel__dots brand-panel__dots--top" aria-hidden="true" />
      <div className="brand-panel__dots brand-panel__dots--bottom" aria-hidden="true" />
      <div className="brand-panel__circle-glow" aria-hidden="true" />

      {/* Top Brand Header */}
      <div className="brand-panel__header">
        <div className="brand-panel__logo-tile">
          <img src="/finsolz-icon.png" alt="Finsolz" className="brand-panel__logo-img" />
        </div>
        <FinsolzBrand size="md" align="center" taglineTone="light" />
      </div>

      {/* Main Content */}
      <div className="brand-panel__content">
        <h1 className="brand-panel__heading">
          Your profile sets <br />
          your checklist
        </h1>
        <p className="brand-panel__desc">
          A proprietor uploads different papers than a salaried filer. Pick your type and every
          document checklist in the app adjusts to it automatically.
        </p>

        {/* Feature Highlights Card */}
        <div className="brand-panel__checklist-badge" aria-hidden="true">
          <div className="brand-panel__checklist-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="brand-panel__checklist-text">
            <span className="brand-panel__checklist-title">Tailored Filing Requirements</span>
            <span className="brand-panel__checklist-sub">Customized GST & Income Tax document lists</span>
          </div>
        </div>
      </div>

      {/* Bottom Security Assurance */}
      <div className="brand-panel__footer">
        <div className="brand-panel__guarantee">
          <svg className="brand-panel__lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>End-to-end encrypted · Auto-mapped checklists</span>
        </div>
      </div>
    </aside>
  )
}
