import { classNames } from '@shared/utils'
import { MarketingIcon } from '../MarketingIcon/MarketingIcon'
import type { MarketingFeature } from '../../types/marketing.types'
import './FeatureCard.css'

export interface FeatureCardProps {
  feature: MarketingFeature
  /** Optional step number badge (How it works) */
  step?: number
  tone?: 'light' | 'dark'
}

export const FeatureCard = ({ feature, step, tone = 'light' }: FeatureCardProps) => (
  <article className={classNames('mk-feature', `mk-feature--${tone}`)}>
    <div className="mk-feature__top">
      <span className="mk-feature__icon">
        <MarketingIcon name={feature.icon} />
      </span>
      {step !== undefined && <span className="mk-feature__step">{String(step).padStart(2, '0')}</span>}
    </div>
    <h3 className="mk-feature__title">{feature.title}</h3>
    <p className="mk-feature__description">{feature.description}</p>
  </article>
)
