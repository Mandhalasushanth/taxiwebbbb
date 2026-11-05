import { FinsolzBrand } from '@shared/components'
import React from 'react'
import { Navigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import { SignInCard } from '../../components/SignInCard/SignInCard'
import './Login.css'

const FEATURE_BADGES = [
  { icon: '/assets/images/badge-secure.png', alt: 'Secure', title: 'Secure & Reliable', desc: 'Your data is always protected' },
  { icon: '/assets/images/badge-fast.png', alt: 'Fast', title: 'Fast & Easy', desc: 'Complete your tasks in minutes' },
  { icon: '/assets/images/badge-support.png', alt: 'Support', title: 'Expert Support', desc: 'Dedicated tax professionals' },
]

export const Login: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={routePaths.dashboard} replace />
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
  )
}

export default Login
