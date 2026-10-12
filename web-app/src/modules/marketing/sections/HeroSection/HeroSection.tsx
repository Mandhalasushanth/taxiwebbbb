import { ArrowRight, CircleCheck } from 'lucide-react'
import { CtaLink } from '../../components/CtaLink/CtaLink'
import { MarketingIcon } from '../../components/MarketingIcon/MarketingIcon'
import { MARKETING_HERO } from '../../data/marketingContent'
import { HERO_FLOATING_CARDS, HERO_ROTATING_WORDS } from '../../data/marketingInteractive'
import { useTypewriter } from '../../hooks/useTypewriter'
import { resetPointer, trackPointer } from '../../utils/motion'
import './HeroSection.css'

const HEADING_ID = 'mk-hero-title'

const renderPoint = (point: string) => (
  <li key={point} className="mk-hero__point">
    <CircleCheck aria-hidden="true" />
    <span>{point}</span>
  </li>
)

const renderFloatingCard = (card: (typeof HERO_FLOATING_CARDS)[number]) => (
  <div key={card.id} className={`mk-hero__float mk-hero__float--${card.position}`} aria-hidden="true">
    <span className="mk-hero__float-icon">
      <MarketingIcon name={card.icon} />
    </span>
    <span className="mk-hero__float-text">
      <span className="mk-hero__float-title">{card.title}</span>
      <span className="mk-hero__float-value">{card.value}</span>
    </span>
  </div>
)

export const HeroSection = () => {
  const hero = MARKETING_HERO
  const typedWord = useTypewriter(HERO_ROTATING_WORDS)

  return (
    <section className="mk-hero" aria-labelledby={HEADING_ID}>
      <div className="mk-hero__glow mk-hero__glow--orange" aria-hidden="true" />
      <div className="mk-hero__glow mk-hero__glow--blue" aria-hidden="true" />
      <div className="mk-hero__grid-lines" aria-hidden="true" />

      <div className="mk-container mk-hero__grid">
        <div className="mk-hero__copy">
          <span className="mk-hero__eyebrow">
            <span className="mk-hero__pulse" aria-hidden="true" />
            {hero.eyebrow}
          </span>

          <h1 id={HEADING_ID} className="mk-hero__title">
            <span className="mk-hero__title-main">{hero.title}</span>
            {/* Screen readers get the static word; the typewriter is visual only */}
            <span className="u-visually-hidden">{hero.highlight}</span>
            <span className="mk-hero__title-accent" aria-hidden="true">
              {typedWord}
              <span className="mk-hero__caret" />
            </span>
          </h1>

          <p className="mk-hero__subtitle">{hero.subtitle}</p>

          <div className="mk-hero__actions">
            <CtaLink to={hero.primaryCta.to} size="lg" icon={<ArrowRight />}>
              {hero.primaryCta.label}
            </CtaLink>
            <CtaLink to={hero.secondaryCta.to} size="lg" variant="light">
              {hero.secondaryCta.label}
            </CtaLink>
          </div>

          <ul className="mk-hero__points">{hero.points.map(renderPoint)}</ul>
        </div>

        <div className="mk-hero__visual" onPointerMove={trackPointer} onPointerLeave={resetPointer}>
          <div className="mk-hero__visual-ring" aria-hidden="true" />
          <div className="mk-hero__tilt">
            <img
              src={hero.imageSrc}
              alt={hero.imageAlt}
              className="mk-hero__image"
              width={1024}
              height={682}
              fetchPriority="high"
            />
            {HERO_FLOATING_CARDS.map(renderFloatingCard)}
          </div>
        </div>
      </div>
    </section>
  )
}
