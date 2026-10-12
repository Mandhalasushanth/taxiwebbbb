import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { routePaths } from '@core/config'
import { Reveal } from '../../components/Reveal/Reveal'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { MARKETING_SERVICES, SERVICES_SECTION } from '../../data/marketingContent'
import type { MarketingService } from '../../types/marketing.types'
import { trackPointer } from '../../utils/motion'
import './ServicesGrid.css'

const HEADING_ID = 'mk-services-title'
const STAGGER_MS = 70
const SERVICE_CTA_LABEL = 'Get started'

const renderService = (service: MarketingService, index: number) => (
  <Reveal key={service.id} delayMs={index * STAGGER_MS}>
    <Link
      to={routePaths.auth.login}
      className="mk-service"
      aria-label={`${service.title}: ${SERVICE_CTA_LABEL}`}
      onPointerMove={trackPointer}
    >
      <img src={service.iconSrc} alt="" className="mk-service__icon" width={64} height={64} loading="lazy" />
      <h3 className="mk-service__title">{service.title}</h3>
      <p className="mk-service__description">{service.description}</p>
      <ul className="mk-service__tags">
        {service.highlights.map((highlight) => (
          <li key={highlight} className="mk-service__tag">
            {highlight}
          </li>
        ))}
      </ul>
      <span className="mk-service__cta">
        {SERVICE_CTA_LABEL}
        <ArrowRight aria-hidden="true" />
      </span>
    </Link>
  </Reveal>
)

/** Services offered in the app; every card leads to sign-in */
export const ServicesGrid = () => (
  <section
    id={routePaths.marketing.servicesAnchor}
    className="mk-section mk-services"
    aria-labelledby={HEADING_ID}
  >
    <div className="mk-container">
      <SectionHeading copy={SERVICES_SECTION} headingId={HEADING_ID} />
      <div className="mk-services__grid">{MARKETING_SERVICES.map(renderService)}</div>
    </div>
  </section>
)
