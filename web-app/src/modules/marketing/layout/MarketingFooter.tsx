import { Link } from 'react-router-dom'
import { MarketingBrand } from '../components/MarketingBrand/MarketingBrand'
import { MarketingIcon } from '../components/MarketingIcon/MarketingIcon'
import {
  MARKETING_BRAND,
  MARKETING_CONTACT_CHANNELS,
  MARKETING_FOOTER_GROUPS,
} from '../data/marketingContent'
import type { MarketingContactChannel, MarketingFooterGroup } from '../types/marketing.types'
import './MarketingFooter.css'

/** Only channels people can act on (call / email) are listed in the footer */
const FOOTER_CHANNELS = MARKETING_CONTACT_CHANNELS.filter((channel) => Boolean(channel.href))

const renderGroup = (group: MarketingFooterGroup) => (
  <div key={group.id} className="mk-footer__group">
    <h3 className="mk-footer__group-title">{group.title}</h3>
    <ul className="mk-footer__list">
      {group.links.map((link) => (
        <li key={link.id}>
          <Link to={link.to} className="mk-footer__link">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const renderChannel = (channel: MarketingContactChannel) => (
  <li key={channel.id}>
    <a href={channel.href} className="mk-footer__contact">
      <MarketingIcon name={channel.icon} />
      <span>{channel.value}</span>
    </a>
  </li>
)

export const MarketingFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mk-footer">
      <div className="mk-container mk-footer__grid">
        <div className="mk-footer__about">
          <MarketingBrand tone="dark" />
          <p className="mk-footer__description">{MARKETING_BRAND.description}</p>
          <ul className="mk-footer__contacts">{FOOTER_CHANNELS.map(renderChannel)}</ul>
        </div>
        {MARKETING_FOOTER_GROUPS.map(renderGroup)}
      </div>

      <div className="mk-container mk-footer__bottom">
        <p>
          © {year} {MARKETING_BRAND.legalName}. All rights reserved.
        </p>
        <p className="mk-footer__tagline">{MARKETING_BRAND.tagline}</p>
      </div>
    </footer>
  )
}
