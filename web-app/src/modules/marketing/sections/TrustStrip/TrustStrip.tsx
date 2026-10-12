import { MARKETING_TRUST_BADGES } from '../../data/marketingContent'
import type { MarketingTrustBadge } from '../../types/marketing.types'
import './TrustStrip.css'

const renderBadge = (badge: MarketingTrustBadge) => (
  <li key={badge.id} className="mk-trust__item">
    <span className="mk-trust__icon-box">
      <img src={badge.imageSrc} alt="" className="mk-trust__icon" width={44} height={44} loading="lazy" />
    </span>
    <span className="mk-trust__text">
      <span className="mk-trust__label">{badge.label}</span>
      <span className="mk-trust__description">{badge.description}</span>
    </span>
  </li>
)

/** Floating trust badges overlapping the bottom of the hero (same badges as the login screen) */
export const TrustStrip = () => (
  <div className="mk-container mk-trust">
    <ul className="mk-trust__list" aria-label="Why customers trust us">
      {MARKETING_TRUST_BADGES.map(renderBadge)}
    </ul>
  </div>
)
