import { FeatureCard } from '../../components/FeatureCard/FeatureCard'
import { Reveal } from '../../components/Reveal/Reveal'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { HOW_IT_WORKS_SECTION, HOW_IT_WORKS_STEPS } from '../../data/marketingContent'
import type { MarketingStep } from '../../types/marketing.types'
import './HowItWorks.css'

const HEADING_ID = 'mk-how-title'
const STAGGER_MS = 100

const renderStep = (step: MarketingStep, index: number) => (
  <li key={step.id} className="mk-how__item">
    <Reveal delayMs={index * STAGGER_MS} className="mk-how__reveal">
      <FeatureCard feature={step} step={step.step} tone="dark" />
    </Reveal>
  </li>
)

export const HowItWorks = () => (
  <section className="mk-section mk-section--navy" aria-labelledby={HEADING_ID}>
    <div className="mk-container">
      <SectionHeading copy={HOW_IT_WORKS_SECTION} headingId={HEADING_ID} tone="dark" />
      <ol className="mk-how__list">{HOW_IT_WORKS_STEPS.map(renderStep)}</ol>
    </div>
  </section>
)
