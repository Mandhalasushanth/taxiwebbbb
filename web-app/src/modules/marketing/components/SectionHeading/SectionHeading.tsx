import { classNames } from '@shared/utils'
import type { MarketingSectionCopy } from '../../types/marketing.types'
import './SectionHeading.css'

export interface SectionHeadingProps {
  copy: MarketingSectionCopy
  /** id of the heading so the parent <section> can use aria-labelledby */
  headingId: string
  align?: 'center' | 'start'
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
}

export const SectionHeading = ({ copy, headingId, align = 'center', tone = 'light', as = 'h2' }: SectionHeadingProps) => {
  const Heading = as
  return (
    <header className={classNames('mk-heading', `mk-heading--${align}`, `mk-heading--${tone}`)}>
      <span className="mk-heading__eyebrow">{copy.eyebrow}</span>
      <Heading id={headingId} className="mk-heading__title">
        {copy.title}
      </Heading>
      <p className="mk-heading__subtitle">{copy.subtitle}</p>
    </header>
  )
}
