import { ArrowRight } from 'lucide-react'
import { CtaLink } from '../../components/CtaLink/CtaLink'
import { CTA_BANNER } from '../../data/marketingContent'
import './CtaBanner.css'

const HEADING_ID = 'mk-cta-title'

export const CtaBanner = () => (
  <section className="mk-section mk-cta-banner" aria-labelledby={HEADING_ID}>
    <div className="mk-container">
      <div className="mk-cta-banner__card">
        <div className="mk-cta-banner__copy">
          <h2 id={HEADING_ID} className="mk-cta-banner__title">
            {CTA_BANNER.title}
          </h2>
          <p className="mk-cta-banner__subtitle">{CTA_BANNER.subtitle}</p>
        </div>
        <div className="mk-cta-banner__actions">
          <CtaLink to={CTA_BANNER.primaryCta.to} size="lg" icon={<ArrowRight />}>
            {CTA_BANNER.primaryCta.label}
          </CtaLink>
          <CtaLink to={CTA_BANNER.secondaryCta.to} size="lg" variant="light">
            {CTA_BANNER.secondaryCta.label}
          </CtaLink>
        </div>
      </div>
    </div>
  </section>
)
