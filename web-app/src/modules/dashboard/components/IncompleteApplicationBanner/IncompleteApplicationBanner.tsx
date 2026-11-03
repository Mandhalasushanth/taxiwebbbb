import { useNavigate } from 'react-router-dom'
import type { ApplicationDraft } from '@core/storage/userStorage'
import './IncompleteApplicationBanner.css'

export interface IncompleteApplicationBannerProps {
  draft: ApplicationDraft
  colorScheme?: 'orange' | 'navy' | 'application' | 'filing'
  onResume?: () => void
  onDiscard?: (serviceId: string) => void
}

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="incomplete-banner__clock-svg">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="incomplete-banner__arrow-svg">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="incomplete-banner__discard-svg">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const IncompleteApplicationBanner = ({
  draft,
  colorScheme,
  onResume,
  onDiscard,
}: IncompleteApplicationBannerProps) => {
  const navigate = useNavigate()

  const isFiling =
    (draft as { variant?: string }).variant === 'filing' ||
    draft.serviceId.toLowerCase().includes('filing') ||
    draft.serviceTitle.toLowerCase().includes('filing') ||
    draft.serviceId.toLowerCase().includes('return')

  const effectiveScheme = colorScheme
    ? colorScheme === 'navy' || colorScheme === 'filing'
      ? 'navy'
      : 'orange'
    : isFiling
      ? 'navy'
      : 'orange'

  const variantClass =
    effectiveScheme === 'navy'
      ? 'incomplete-banner--filing incomplete-banner--navy'
      : 'incomplete-banner--application incomplete-banner--orange'
  const badgeText = (draft as { badgeLabel?: string }).badgeLabel || (isFiling ? 'INCOMPLETE FILING' : 'INCOMPLETE APPLICATION')
  const ctaText = (draft as { ctaLabel?: string }).ctaLabel || (isFiling ? 'Resume Filing' : 'Resume Application')
  const defaultSubtitle = isFiling
    ? `Step ${draft.currentStep} of ${draft.totalSteps} \u00b7 Continue your return filing`
    : `Step ${draft.currentStep} of ${draft.totalSteps} \u00b7 Pick up right where you left off`
  const subtitle = draft.stepLabel || defaultSubtitle

  const handleResume = () => {
    if (onResume) {
      onResume()
    } else {
      navigate(draft.resumeRoute, { state: { resumeDraft: true, step: draft.currentStep } })
    }
  }

  const handleDiscardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDiscard) {
      onDiscard(draft.serviceId)
    }
  }

  return (
    <section
      className={`incomplete-banner ${variantClass}`}
      onClick={handleResume}
      aria-label={`${badgeText}: ${draft.serviceTitle}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleResume()
        }
      }}
    >
      {/* Top Row: Badge, Saved Time & Discard Action */}
      <div className="incomplete-banner__top">
        <div className="incomplete-banner__badge">
          <ClockIcon />
          <span>{badgeText}</span>
        </div>
        <div className="incomplete-banner__top-right">
          <span className="incomplete-banner__time">
            {draft.savedAt ? (draft.savedAt.startsWith('Saved') ? draft.savedAt : `Saved ${draft.savedAt}`) : 'Saved as Draft'}
          </span>
          {onDiscard && (
            <button
              type="button"
              className="incomplete-banner__discard-btn"
              onClick={handleDiscardClick}
              title="Discard this draft"
              aria-label="Discard this draft"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Middle: Title & Step info */}
      <div className="incomplete-banner__content">
        <h3 className="incomplete-banner__title">{draft.serviceTitle}</h3>
        <p className="incomplete-banner__step-text">{subtitle}</p>
      </div>

      {/* Divider */}
      <div className="incomplete-banner__divider" aria-hidden="true" />

      {/* Bottom: Resume CTA */}
      <div className="incomplete-banner__bottom">
        <span className="incomplete-banner__cta-text">{ctaText}</span>
        <div className="incomplete-banner__circle-btn" aria-hidden="true">
          <ArrowRightIcon />
        </div>
      </div>
    </section>
  )
}

export default IncompleteApplicationBanner
