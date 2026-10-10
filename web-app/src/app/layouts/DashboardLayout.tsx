import { Suspense, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { buildProfileCompletionPath } from '@core/auth'
import { initialsOf } from '@shared/utils'
import { CompleteProfileModal, LogoutConfirmModal, LogoutIcon } from '@shared/components'
import { useLogoutConfirm } from '@modules/authentication'
import { useAuthStore, useNotificationStore } from '@store/index'
import { navSections } from './navigation'
import { useDashboardSummary } from '@modules/dashboard'
import { DashboardBreadcrumb } from './DashboardBreadcrumb'
import './DashboardLayout.css'

const MenuIcon = () => (
  <svg className="shell__menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg className="shell__menu-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const BellIcon = () => (
  <svg className="shell__action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const ChatIcon = () => (
  <svg className="shell__action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useLogoutConfirm()
  const location = useLocation()
  const { data } = useDashboardSummary()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedServiceTarget, setSelectedServiceTarget] = useState<string>('')

  useEffect(() => {
    const locState = location.state as { openProfileModal?: boolean; returnTo?: string } | null
    // Pages with their own prompt (e.g. /loans) handle the state themselves; the layout covers the dashboard
    const isDashboard = location.pathname === routePaths.dashboard
    if (isDashboard && locState?.openProfileModal && !user?.isProfileComplete) {
      setSelectedServiceTarget(locState.returnTo || '')
      setIsProfileModalOpen(true)
    }
  }, [location.pathname, location.state, user?.isProfileComplete])

  const handleConfirmCompleteProfile = () => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(selectedServiceTarget), {
      state: { returnTo: selectedServiceTarget, mobile: user?.mobile },
    })
  }

  const currentNav = useMemo(() => {
    const matchedSection = navSections
      .map((section) => {
        const match = section.items
          .filter((i) => !i.to.includes('#'))
          .filter((i) => location.pathname === i.to || location.pathname.startsWith(`${i.to}/`))
          .sort((a, b) => b.to.length - a.to.length)[0]
        return match ? { sectionTitle: section.title, label: match.label } : null
      })
      .find(Boolean)

    return matchedSection || { sectionTitle: 'Overview', label: 'Dashboard' }
  }, [location.pathname])

  const notifications = useNotificationStore((state) => state.notifications)
  const notificationsCount = notifications.length
  const applicationsCount = data?.brief?.activeApplications ?? 0

  const badges: Partial<Record<'applications' | 'notifications', string>> = {
    applications: applicationsCount > 0 ? String(applicationsCount) : undefined,
    notifications: notificationsCount > 0 ? String(notificationsCount) : undefined,
  }

  const customerCode = user ? `TE-CUS-${user.id.slice(-5).toUpperCase()}` : ''

  return (
    <div className="shell">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileNavOpen && (
        <div
          className="shell__backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Fixed on Desktop, Slide-over Drawer on Tablet/Mobile) */}
      <aside
        className={`shell__sidebar${isMobileNavOpen ? ' shell__sidebar--mobile-open' : ''}`}
        aria-label="TaxEdge Dashboard Sidebar"
      >
        <div className="shell__brand-row">
          <NavLink
            className="shell__brand"
            to={routePaths.dashboard}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <div className="shell__brand-logo-box">
              <img src="/assets/images/taxedge-brand-icon.png" alt="TaxEdge" className="shell__brand-logo-img" />
            </div>
            <div className="shell__brand-text">
              <span className="shell__brand-name">TAX<span className="shell__brand-name-accent">EDGE</span></span>
              <span className="shell__brand-tag">FIN SOLUTIONS</span>
            </div>
          </NavLink>

          <button
            type="button"
            className="shell__sidebar-close"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close sidebar navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="shell__nav">
          {navSections.map((section) => (
            <div className="shell__nav-section" key={section.title}>
              <p className="shell__nav-title">{section.title}</p>
              {section.items.map((item) =>
                item.to.includes('#') ? (
                  <a
                    key={item.label}
                    href={item.to}
                    className="shell__nav-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileNavOpen(false)
                      if (location.pathname === routePaths.dashboard) {
                        document.getElementById(routePaths.dashboardServicesAnchor)?.scrollIntoView({ behavior: 'smooth' })
                        return
                      }
                      // From any other page, open the dashboard at its services grid
                      navigate({ pathname: routePaths.dashboard, hash: routePaths.dashboardServicesAnchor })
                    }}
                  >
                    <span className="shell__nav-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === routePaths.dashboard}
                    className={({ isActive }) => `shell__nav-link${isActive ? ' is-active' : ''}`}
                    onClick={() => {
                      setIsMobileNavOpen(false)
                    }}
                  >
                    <span className="shell__nav-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badgeKey && badges[item.badgeKey] && (
                      <span className="shell__nav-badge">{badges[item.badgeKey]}</span>
                    )}
                  </NavLink>
                ),
              )}
            </div>
          ))}
        </nav>

        <div className="shell__sidebar-footer">
          <div className="shell__user">
            <span className="shell__avatar" aria-hidden="true">
              {initialsOf(user?.fullName || 'User')}
            </span>
            <div className="shell__user-meta">
              <span className="shell__user-name">{user?.fullName || 'Guest'}</span>
              {customerCode && <span className="shell__user-code">{customerCode}</span>}
            </div>
          </div>

          <button className="shell__signout" type="button" onClick={logout.requestLogout}>
            <LogoutIcon size={14} /> Log out
          </button>
        </div>
      </aside>

      <div className="shell__main">
        <header className="shell__header">
          <div className="shell__header-left">
            <button
              type="button"
              className="shell__mobile-toggle"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Breadcrumb Navigation across all pages */}
            <DashboardBreadcrumb currentNav={currentNav} />
          </div>

          <div className="shell__header-actions">
            <NavLink className="shell__icon-button" to={routePaths.notifications} aria-label="Notifications" title="Notifications">
              <BellIcon />
              {notificationsCount > 0 && (
                <span className="shell__badge-pill" aria-hidden="true">{notificationsCount}</span>
              )}
            </NavLink>

            <NavLink className="shell__icon-button" to={routePaths.support} aria-label="Chat with support" title="Messages">
              <ChatIcon />
            </NavLink>

            <NavLink className="shell__header-profile" to={routePaths.profile} title="View profile" aria-label="View profile">
              <span className="shell__header-avatar">
                {user?.fullName ? user.fullName.trim().charAt(0).toUpperCase() : 'S'}
              </span>
            </NavLink>
          </div>
        </header>

        <main className="shell__content">
          <Suspense fallback={<div className="shell__loading">Loading...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={logout.isConfirmOpen}
        isLoggingOut={logout.isLoggingOut}
        onConfirm={logout.confirmLogout}
        onCancel={logout.cancelLogout}
      />

      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onCompleteProfile={handleConfirmCompleteProfile}
      />
    </div>
  )
}

export default DashboardLayout
