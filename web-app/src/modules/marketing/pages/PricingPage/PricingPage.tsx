import { classNames } from '@shared/utils'
import { PageHero } from '../../components/PageHero/PageHero'
import { PricingCard } from '../../components/PricingCard/PricingCard'
import { MARKETING_PAGE_META } from '../../data/marketingContent'
import { PRICING_CATEGORIES, PRICING_GST_NOTE, PRICING_SECTION } from '../../data/marketingPricing'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useRovingTabs } from '../../hooks/useRovingTabs'
import { CtaBanner } from '../../sections/CtaBanner/CtaBanner'
import { FaqSection } from '../../sections/FaqSection/FaqSection'
import type { PricingCategory } from '../../types/marketing.types'
import './PricingPage.css'

const HEADING_ID = 'mk-pricing-title'
const PANEL_ID = 'mk-pricing-panel'
const tabId = (categoryId: string) => `mk-pricing-tab-${categoryId}`

export const PricingPage = () => {
  usePageMeta(MARKETING_PAGE_META.pricing)
  const { activeIndex, onKeyDown, getTabProps } = useRovingTabs(PRICING_CATEGORIES.length)
  const activeCategory = PRICING_CATEGORIES[activeIndex]

  const renderTab = (category: PricingCategory, index: number) => (
    <button
      key={category.id}
      {...getTabProps(index)}
      id={tabId(category.id)}
      aria-controls={PANEL_ID}
      className={classNames('mk-pricing__tab', index === activeIndex && 'mk-pricing__tab--active')}
    >
      {category.label}
    </button>
  )

  return (
    <>
      <PageHero copy={PRICING_SECTION} headingId={HEADING_ID} />

      <section className="mk-section mk-pricing" aria-label="Pricing plans">
        <div className="mk-container">
          <div className="mk-pricing__tabs" role="tablist" aria-label="Service category" onKeyDown={onKeyDown}>
            {PRICING_CATEGORIES.map(renderTab)}
          </div>

          <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(activeCategory.id)} className="mk-pricing__panel">
            <div className="mk-grid mk-grid--3">
              {activeCategory.plans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>

          <p className="mk-pricing__note">{PRICING_GST_NOTE}</p>
        </div>
      </section>

      <FaqSection />
      <CtaBanner />
    </>
  )
}

export default PricingPage
