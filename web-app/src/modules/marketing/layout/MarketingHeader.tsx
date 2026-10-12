import { Link, NavLink } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { classNames } from '@shared/utils'
import { CtaLink } from '../components/CtaLink/CtaLink'
import { MarketingBrand } from '../components/MarketingBrand/MarketingBrand'
import { MARKETING_AUTH_CTA, MARKETING_NAV_LINKS } from '../data/marketingContent'
import { useMarketingHeader } from '../hooks/useMarketingHeader'
import type { MarketingNavLink } from '../types/marketing.types'
import './MarketingHeader.css'

const MOBILE_MENU_ID = 'mk-mobile-menu'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  classNames('mk-header__link', isActive && 'mk-header__link--active')

/** Hash links (/#services) use Link so they never look "active" on every home visit */
const renderNavLink = (link: MarketingNavLink, onNavigate: () => void) =>
  link.to.includes('#') ? (
    <Link key={link.id} to={link.to} className="mk-header__link" onClick={onNavigate}>
      {link.label}
    </Link>
  ) : (
    <NavLink key={link.id} to={link.to} className={navLinkClass} onClick={onNavigate} end>
      {link.label}
    </NavLink>
  )

export const MarketingHeader = () => {
  const { isMenuOpen, isScrolled, closeMenu, toggleMenu } = useMarketingHeader()

  const navItems = MARKETING_NAV_LINKS.map((link) => renderNavLink(link, closeMenu))

  const loginAction = (
    <CtaLink to={MARKETING_AUTH_CTA.login.to} variant="light" size="sm" onClick={closeMenu}>
      {MARKETING_AUTH_CTA.login.label}
    </CtaLink>
  )

  const primaryAction = (
    <CtaLink to={MARKETING_AUTH_CTA.register.to} size="sm" icon={<ArrowRight />} onClick={closeMenu}>
      {MARKETING_AUTH_CTA.register.label}
    </CtaLink>
  )

  return (
    <header className={classNames('mk-header', isScrolled && 'mk-header--scrolled', isMenuOpen && 'mk-header--open')}>
      <div className="mk-container mk-header__bar">
        <MarketingBrand tone="dark" onNavigate={closeMenu} />

        <nav className="mk-header__nav" aria-label="Main">
          {navItems}
        </nav>

        <div className="mk-header__actions">
          {loginAction}
          {primaryAction}
        </div>

        <button
          type="button"
          className="mk-header__toggle"
          aria-expanded={isMenuOpen}
          aria-controls={MOBILE_MENU_ID}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div id={MOBILE_MENU_ID} className="mk-header__drawer" hidden={!isMenuOpen}>
        <nav className="mk-header__drawer-nav" aria-label="Mobile">
          {navItems}
        </nav>
        <div className="mk-header__drawer-actions">
          {loginAction}
          {primaryAction}
        </div>
      </div>
    </header>
  )
}
