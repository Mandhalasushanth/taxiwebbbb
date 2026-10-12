import { PageHero } from '../../components/PageHero/PageHero'
import { Reveal } from '../../components/Reveal/Reveal'
import { ABOUT_HERO, ABOUT_STORY, ABOUT_VALUES, ABOUT_VALUES_SECTION } from '../../data/marketingAbout'
import { MARKETING_PAGE_META } from '../../data/marketingContent'
import { usePageMeta } from '../../hooks/usePageMeta'
import { CtaBanner } from '../../sections/CtaBanner/CtaBanner'
import { HowItWorks } from '../../sections/HowItWorks/HowItWorks'
import { StatsBand } from '../../sections/StatsBand/StatsBand'
import { WhyChooseUs } from '../../sections/WhyChooseUs/WhyChooseUs'
import './AboutPage.css'

const HEADING_ID = 'mk-about-title'
const STORY_HEADING_ID = 'mk-about-story'
const VALUES_HEADING_ID = 'mk-about-values'

const renderParagraph = (paragraph: string) => (
  <p key={paragraph} className="mk-about__paragraph">
    {paragraph}
  </p>
)

export const AboutPage = () => {
  usePageMeta(MARKETING_PAGE_META.about)

  return (
    <>
      <PageHero copy={ABOUT_HERO} headingId={HEADING_ID} />

      <section className="mk-section mk-about" aria-labelledby={STORY_HEADING_ID}>
        <div className="mk-container mk-about__grid">
          <Reveal className="mk-about__copy">
            <h2 id={STORY_HEADING_ID} className="mk-about__title">
              {ABOUT_STORY.title}
            </h2>
            {ABOUT_STORY.paragraphs.map(renderParagraph)}
          </Reveal>
          <Reveal className="mk-about__visual" delayMs={120}>
            <img src={ABOUT_STORY.imageSrc} alt={ABOUT_STORY.imageAlt} className="mk-about__image" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <StatsBand />
      <WhyChooseUs copy={ABOUT_VALUES_SECTION} features={ABOUT_VALUES} headingId={VALUES_HEADING_ID} />
      <HowItWorks />
      <CtaBanner />
    </>
  )
}

export default AboutPage
