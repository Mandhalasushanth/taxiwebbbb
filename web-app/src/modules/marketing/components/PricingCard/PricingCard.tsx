import { Check } from 'lucide-react'
import { classNames, formatINR } from '@shared/utils'
import { CtaLink } from '../CtaLink/CtaLink'
import {
  PRICING_PLAN_CTA,
  PRICING_QUOTE_CTA,
  PRICING_UNIT_LABELS,
} from '../../data/marketingPricing'
import type { PricingPlan } from '../../types/marketing.types'
import './PricingCard.css'

const POPULAR_LABEL = 'Most popular'
const QUOTE_LABEL = 'Custom'

export interface PricingCardProps {
  plan: PricingPlan
}

const renderFeature = (feature: string) => (
  <li key={feature} className="mk-price__feature">
    <Check aria-hidden="true" />
    <span>{feature}</span>
  </li>
)

export const PricingCard = ({ plan }: PricingCardProps) => {
  const cta = plan.amount === null ? PRICING_QUOTE_CTA : PRICING_PLAN_CTA
  const priceLabel = plan.amount === null ? QUOTE_LABEL : formatINR(plan.amount)

  return (
    <article className={classNames('mk-price', plan.isPopular && 'mk-price--popular')}>
      {plan.isPopular && <span className="mk-price__badge">{POPULAR_LABEL}</span>}
      <h3 className="mk-price__name">{plan.name}</h3>
      <p className="mk-price__description">{plan.description}</p>
      <p className="mk-price__amount">
        <span className="mk-price__value">{priceLabel}</span>
        <span className="mk-price__unit">{PRICING_UNIT_LABELS[plan.unit]}</span>
      </p>
      <ul className="mk-price__features">{plan.features.map(renderFeature)}</ul>
      <CtaLink to={cta.to} variant={plan.isPopular ? 'primary' : 'outline'} fullWidth>
        {cta.label}
      </CtaLink>
    </article>
  )
}
