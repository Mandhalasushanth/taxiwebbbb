import { FinsolzBrand } from '@shared/components'
import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { resolvePostLoginPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { SignInCard } from '../../components/SignInCard/SignInCard'
import { AccountDeletionScheduledModal } from '../../components/AccountDeletionScheduledModal/AccountDeletionScheduledModal'
import './Login.css'

const ACCOUNT_DELETION_STORAGE_KEY = 'taxedge_account_deletion_scheduled'

const FEATURE_BADGES = [
  { icon: '/assets/images/badge-secure.png', alt: 'Secure', title: 'Secure & Reliable', desc: 'Your data is always protected' },
  { icon: '/assets/images/badge-fast.png', alt: 'Fast', title: 'Fast & Easy', desc: 'Complete your tasks in minutes' },
  { icon: '/assets/images/badge-support.png', alt: 'Support', title: 'Expert Support', desc: 'Dedicated tax professionals' },
]

export const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const isResetFlow = Boolean(
    (location.state as { isResetFlow?: boolean } | null)?.isResetFlow ||
    new URLSearchParams(location.search).get('reset') === 'true'
  )

  const [scheduledDeletionDate, setScheduledDeletionDate] = useState<string | null>(() => {
    try {
      const stored = sessionStorage.getItem(ACCOUNT_DELETION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed?.scheduledDate || null
      }
    } catch {
      // ignore
    }
    return null
  })

  const handleDismissDeletionModal = () => {
    try {
      sessionStorage.removeItem(ACCOUNT_DELETION_STORAGE_KEY)
    } catch {
      // ignore
    }
    setScheduledDeletionDate(null)
  }

  if (isAuthenticated && !isResetFlow) {
    const postLoginTarget = resolvePostLoginPath(location.search, location.state, routePaths.dashboard)
    return <Navigate to={postLoginTarget} replace />
  }
  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-left-overlay" />

      {/* Top Bar */}
      <div className="login-top-brand">
        <img src="/finsolz-icon.png" alt="Finsolz" className="top-brand-icon" />
        <FinsolzBrand size="md" align="center" taglineTone="light" />
      </div>

      <div className="login-top-tagline">
        <span className="tagline-text">SIMPLE • SECURE • COMPLIANT</span>
        <div className="tagline-bar" />
      </div>

      {/* Main 3-Column Stage (Hero, Illustration, Card) */}
      <div className="login-stage">
        {/* Left Hero Section */}
        <section className="login-hero">
          <div className="hero-header">
            <h1 className="hero-title">
              <span className="hero-title-main">Simplifying Taxes for a</span>
              <span className="hero-title-orange">Brighter Tomorrow</span>
            </h1>
            <p className="hero-subtitle">
              Your trusted partner for <span className="subtitle-highlight">GST compliance</span>, filings<br />
              and <span className="subtitle-highlight">business growth</span> — all in one place.
            </p>
          </div>

          <div className="hero-badges">
            {FEATURE_BADGES.map((b) => (
              <div className="feature-badge" key={b.title}>
                <div className="badge-icon-box">
                  <img src={b.icon} alt={b.alt} className="badge-icon-img" />
                </div>
                <div className="badge-text">
                  <span className="badge-title">{b.title}</span>
                  <span className="badge-desc">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-bottom-tag">
            <div className="bottom-tag-bar" />
            <span className="bottom-tag-text">COMPLY • GROW • SUCCEED</span>
          </div>
        </section>

        {/* Middle Illustration */}
        <div className="login-illustration-wrap">
          <div className="illus-glow" />
          <img
            src="/assets/images/tax-journey-illustration.png"
            alt="GST Tax Journey Illustration"
            className="illus-img"
          />
        </div>

        {/* Right Sign-in Card */}
        <aside className="login-card-slot">
          <SignInCard />
        </aside>
      </div>

      {/* Account Deletion Scheduled Success Modal */}
      {scheduledDeletionDate && (
        <AccountDeletionScheduledModal
          isOpen={Boolean(scheduledDeletionDate)}
          scheduledDate={scheduledDeletionDate}
          onDismiss={handleDismissDeletionModal}
        />
      )}
    </div>
  )
}

export default Login
