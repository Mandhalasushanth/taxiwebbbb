import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { classNames } from '@shared/utils'
import { CtaLink } from '../../components/CtaLink/CtaLink'
import { MarketingIcon } from '../../components/MarketingIcon/MarketingIcon'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { MARKETING_SERVICES } from '../../data/marketingContent'
import { MARKETING_PERSONAS, PERSONA_SECTION } from '../../data/marketingInteractive'
import { useRovingTabs } from '../../hooks/useRovingTabs'
import type { MarketingPersona, MarketingService } from '../../types/marketing.types'
import './PersonaFinder.css'

const HEADING_ID = 'mk-persona-title'
const PANEL_ID = 'mk-persona-panel'
const ITEM_STAGGER_MS = 90
const tabId = (personaId: string) => `mk-persona-tab-${personaId}`

const SERVICES_BY_ID = new Map(MARKETING_SERVICES.map((service) => [service.id, service]))

const servicesFor = (persona: MarketingPersona): MarketingService[] =>
  persona.serviceIds
    .map((id) => SERVICES_BY_ID.get(id))
    .filter((service): service is MarketingService => Boolean(service))

const renderRecommendation = (service: MarketingService, index: number) => (
  <li key={service.id} className="mk-persona__service" style={{ animationDelay: `${index * ITEM_STAGGER_MS}ms` }}>
    <img src={service.iconSrc} alt="" className="mk-persona__service-icon" width={48} height={48} loading="lazy" />
    <span className="mk-persona__service-text">
      <span className="mk-persona__service-title">{service.title}</span>
      <span className="mk-persona__service-tags">{service.highlights.join(' · ')}</span>
    </span>
  </li>
)

/** Interactive profile picker that recommends the most relevant services */
export const PersonaFinder = () => {
  const { activeIndex, onKeyDown, getTabProps } = useRovingTabs(MARKETING_PERSONAS.length)
  const persona = MARKETING_PERSONAS[activeIndex]
  const recommendations = useMemo(() => servicesFor(persona), [persona])

  const renderTab = (item: MarketingPersona, index: number) => (
    <button
      key={item.id}
      {...getTabProps(index)}
      id={tabId(item.id)}
      aria-controls={PANEL_ID}
      className={classNames('mk-persona__tab', index === activeIndex && 'mk-persona__tab--active')}
    >
      <MarketingIcon name={item.icon} />
      <span>{item.label}</span>
    </button>
  )

  return (
    <section className="mk-section mk-section--surface mk-persona" aria-labelledby={HEADING_ID}>
      <div className="mk-container">
        <SectionHeading copy={PERSONA_SECTION} headingId={HEADING_ID} />

        <div className="mk-persona__tabs" role="tablist" aria-label="Your profile" onKeyDown={onKeyDown}>
          {MARKETING_PERSONAS.map(renderTab)}
        </div>

        {/* key re-mounts the panel so its entrance animation replays on every switch */}
        <div
          key={persona.id}
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={tabId(persona.id)}
          className="mk-persona__panel"
        >
          <div className="mk-persona__intro">
            <h3 className="mk-persona__headline">{persona.headline}</h3>
            <p className="mk-persona__description">{persona.description}</p>
            <CtaLink to={persona.cta.to} icon={<ArrowRight />}>
              {persona.cta.label}
            </CtaLink>
          </div>
          <ul className="mk-persona__services" aria-label="Recommended services">
            {recommendations.map(renderRecommendation)}
          </ul>
        </div>
      </div>
    </section>
  )
}
