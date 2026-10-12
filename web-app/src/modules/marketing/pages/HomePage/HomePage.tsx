import { MARKETING_PAGE_META } from '../../data/marketingContent'
import { usePageMeta } from '../../hooks/usePageMeta'
import { CtaBanner } from '../../sections/CtaBanner/CtaBanner'
import { DeadlineCountdown } from '../../sections/DeadlineCountdown/DeadlineCountdown'
import { PersonaFinder } from '../../sections/PersonaFinder/PersonaFinder'
import { FaqSection } from '../../sections/FaqSection/FaqSection'
import { HeroSection } from '../../sections/HeroSection/HeroSection'
import { HowItWorks } from '../../sections/HowItWorks/HowItWorks'
import { ServicesGrid } from '../../sections/ServicesGrid/ServicesGrid'
import { StatsBand } from '../../sections/StatsBand/StatsBand'
import { Testimonials } from '../../sections/Testimonials/Testimonials'
import { TrustStrip } from '../../sections/TrustStrip/TrustStrip'
import { WhyChooseUs } from '../../sections/WhyChooseUs/WhyChooseUs'

/** Marketing home ("/"): built from independent section blocks */
export const HomePage = () => {
  usePageMeta(MARKETING_PAGE_META.home)

  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ServicesGrid />
      <PersonaFinder />
      <HowItWorks />
      <DeadlineCountdown />
      <WhyChooseUs />
      <StatsBand />
      <Testimonials />
      <FaqSection />
      <CtaBanner />
    </>
  )
}

export default HomePage
