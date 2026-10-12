import { FeatureCard } from '../../components/FeatureCard/FeatureCard'
import { Reveal } from '../../components/Reveal/Reveal'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { WHY_CHOOSE_FEATURES, WHY_CHOOSE_SECTION } from '../../data/marketingContent'
import type { MarketingFeature, MarketingSectionCopy } from '../../types/marketing.types'

const HEADING_ID = 'mk-why-title'
const STAGGER_MS = 80

export interface WhyChooseUsProps {
  copy?: MarketingSectionCopy
  features?: MarketingFeature[]
  headingId?: string
}

const renderFeature = (feature: MarketingFeature, index: number) => (
  <Reveal key={feature.id} delayMs={index * STAGGER_MS}>
    <FeatureCard feature={feature} />
  </Reveal>
)

/** Feature grid; About page reuses it with its own values copy */
export const WhyChooseUs = ({
  copy = WHY_CHOOSE_SECTION,
  features = WHY_CHOOSE_FEATURES,
  headingId = HEADING_ID,
}: WhyChooseUsProps) => (
  <section className="mk-section mk-section--surface" aria-labelledby={headingId}>
    <div className="mk-container">
      <SectionHeading copy={copy} headingId={headingId} />
      <div className="mk-grid mk-grid--4">{features.map(renderFeature)}</div>
    </div>
  </section>
)
