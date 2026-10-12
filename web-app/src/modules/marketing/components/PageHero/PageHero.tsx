import { SectionHeading } from '../SectionHeading/SectionHeading'
import type { MarketingSectionCopy } from '../../types/marketing.types'
import './PageHero.css'

export interface PageHeroProps {
  copy: MarketingSectionCopy
  headingId: string
}

/** Compact navy banner that opens Pricing / About / Contact (the page's h1) */
export const PageHero = ({ copy, headingId }: PageHeroProps) => (
  <section className="mk-page-hero" aria-labelledby={headingId}>
    <div className="mk-container">
      <SectionHeading copy={copy} headingId={headingId} tone="dark" as="h1" />
    </div>
  </section>
)
