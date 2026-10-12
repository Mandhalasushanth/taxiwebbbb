import { ContactForm } from '../../components/ContactForm/ContactForm'
import { MarketingIcon } from '../../components/MarketingIcon/MarketingIcon'
import { PageHero } from '../../components/PageHero/PageHero'
import {
  CONTACT_HERO,
  CONTACT_INFO_COPY,
  MARKETING_CONTACT_CHANNELS,
  MARKETING_PAGE_META,
} from '../../data/marketingContent'
import { usePageMeta } from '../../hooks/usePageMeta'
import { FaqSection } from '../../sections/FaqSection/FaqSection'
import type { MarketingContactChannel } from '../../types/marketing.types'
import './ContactPage.css'

const HEADING_ID = 'mk-contact-title'

const renderChannelValue = (channel: MarketingContactChannel) =>
  channel.href ? (
    <a href={channel.href} className="mk-contact__value mk-contact__value--link">
      {channel.value}
    </a>
  ) : (
    <span className="mk-contact__value">{channel.value}</span>
  )

const renderChannel = (channel: MarketingContactChannel) => (
  <li key={channel.id} className="mk-contact__channel">
    <span className="mk-contact__icon">
      <MarketingIcon name={channel.icon} />
    </span>
    <span className="mk-contact__text">
      <span className="mk-contact__label">{channel.label}</span>
      {renderChannelValue(channel)}
    </span>
  </li>
)

export const ContactPage = () => {
  usePageMeta(MARKETING_PAGE_META.contact)

  return (
    <>
      <PageHero copy={CONTACT_HERO} headingId={HEADING_ID} />

      <section className="mk-section mk-contact" aria-label="Contact details and enquiry form">
        <div className="mk-container mk-contact__grid">
          <aside className="mk-contact__info">
            <h2 className="mk-contact__info-title">{CONTACT_INFO_COPY.title}</h2>
            <p className="mk-contact__info-text">{CONTACT_INFO_COPY.text}</p>
            <ul className="mk-contact__channels">{MARKETING_CONTACT_CHANNELS.map(renderChannel)}</ul>
          </aside>
          <ContactForm />
        </div>
      </section>

      <FaqSection />
    </>
  )
}

export default ContactPage
