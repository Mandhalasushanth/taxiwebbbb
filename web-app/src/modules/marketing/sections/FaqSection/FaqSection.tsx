import { routePaths } from '@core/config'
import { FaqAccordion } from '../../components/FaqAccordion/FaqAccordion'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { FAQ_SECTION, MARKETING_FAQS } from '../../data/marketingContent'
import './FaqSection.css'

const HEADING_ID = 'mk-faq-title'

export const FaqSection = () => (
  <section
    id={routePaths.marketing.faqAnchor}
    className="mk-section mk-section--surface"
    aria-labelledby={HEADING_ID}
  >
    <div className="mk-container mk-faq-section">
      <SectionHeading copy={FAQ_SECTION} headingId={HEADING_ID} align="start" />
      <FaqAccordion items={MARKETING_FAQS} />
    </div>
  </section>
)
