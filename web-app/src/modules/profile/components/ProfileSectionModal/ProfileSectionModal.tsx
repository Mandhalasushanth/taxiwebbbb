import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useApplications } from '@modules/applications'
import type { ApplicationsItem } from '@modules/applications/types/applications.types'
import './ProfileSectionModal.css'

export type ProfileModalType = 'gst' | 'itr' | 'loans'

export interface ProfileSectionModalProps {
  isOpen: boolean
  onClose: () => void
  modalType: ProfileModalType | null
}

interface ModalConfig {
  headerTitle: string
  emptyTitle: string
  emptySubtitle: string
  ctaText: string
  ctaRoute: string
  icon: React.ReactNode
  iconBg: string
  filter: (app: ApplicationsItem) => boolean
}

const GstReceiptIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ItrIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
)

const LoanIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MODAL_CONFIGS: Record<ProfileModalType, ModalConfig> = {
  gst: {
    headerTitle: 'GST Details',
    emptyTitle: 'GST Details',
    emptySubtitle:
      'GST registration details, return filing records, and compliance summaries will be available here once you apply for GST services or connect your GSTIN.',
    ctaText: 'Apply for GST Registration',
    ctaRoute: routePaths.gst.root,
    icon: <GstReceiptIcon />,
    iconBg: '#f1ecfe',
    filter: (app) => (app.category || '').toUpperCase() === 'GST',
  },
  itr: {
    headerTitle: 'ITR History',
    emptyTitle: 'No ITR Filings Yet',
    emptySubtitle:
      'Your Income Tax Return history, filed returns, and acknowledgment receipts will appear here once you file your taxes.',
    ctaText: 'File ITR Now',
    ctaRoute: routePaths.itr.root,
    icon: <ItrIcon />,
    iconBg: '#fef0e6',
    filter: (app) => (app.category || '').toUpperCase() === 'ITR',
  },
  loans: {
    headerTitle: 'Loan History',
    emptyTitle: 'No Loan Applications Yet',
    emptySubtitle:
      'Your applied loan products, sanction letters, and application progression will appear here once you apply for a loan.',
    ctaText: 'Explore Loan Products',
    ctaRoute: routePaths.loans,
    icon: <LoanIcon />,
    iconBg: '#eaf1fe',
    filter: (app) => (app.category || '').toUpperCase() === 'LOANS',
  },
}

export const ProfileSectionModal: React.FC<ProfileSectionModalProps> = ({
  isOpen,
  onClose,
  modalType,
}) => {
  const navigate = useNavigate()
  const { data: applications } = useApplications()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !modalType || !MODAL_CONFIGS[modalType]) return null

  const config = MODAL_CONFIGS[modalType]
  const matchingApps = (applications || []).filter(config.filter)

  const handleCta = () => {
    onClose()
    navigate(config.ctaRoute)
  }

  const handleViewAllApps = () => {
    onClose()
    navigate(routePaths.applications)
  }

  return (
    <div
      className="profile-section-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-testid="profile-section-modal"
    >
      <div
        className="profile-section-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-section-modal__header">
          <h2 className="profile-section-modal__title">{config.headerTitle}</h2>
          <button
            type="button"
            className="profile-section-modal__close-icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        {matchingApps.length === 0 ? (
          <div className="profile-section-modal__empty-state">
            <div
              className="profile-section-modal__icon-circle"
              style={{ backgroundColor: config.iconBg }}
            >
              {config.icon}
            </div>

            <h3 className="profile-section-modal__empty-heading">
              {config.emptyTitle}
            </h3>

            <p className="profile-section-modal__empty-desc">
              {config.emptySubtitle}
            </p>

            <div className="profile-section-modal__actions">
              <button
                type="button"
                className="profile-section-modal__btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="profile-section-modal__btn-primary"
                onClick={handleCta}
              >
                <span>{config.ctaText}</span>
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="profile-section-modal__apps-list">
              {matchingApps.map((app) => (
                <div key={app.id} className="profile-section-modal__app-item">
                  <div className="profile-section-modal__app-row">
                    <span className="profile-section-modal__app-title">
                      {app.title || config.headerTitle}
                    </span>
                    <span className="profile-section-modal__app-status">
                      {app.statusLabel || app.status}
                    </span>
                  </div>
                  <div className="profile-section-modal__app-date">
                    Ref: {app.reference || app.id} • {app.date || 'Active'}
                  </div>
                </div>
              ))}
            </div>

            <div className="profile-section-modal__actions">
              <button
                type="button"
                className="profile-section-modal__btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="profile-section-modal__btn-primary"
                onClick={handleViewAllApps}
              >
                <span>View in Applications</span>
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
