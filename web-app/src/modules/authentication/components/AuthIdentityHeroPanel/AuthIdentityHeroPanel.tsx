import React from 'react'
import { FinsolzBrand } from '@shared/components'
import './AuthIdentityHeroPanel.css'

export const AuthIdentityHeroPanel: React.FC = () => {
  return (
    <div className="identity-hero">
      {/* Background Skyscraper Silhouette & Lit Typography */}
      <div className="identity-hero__bg-building" aria-hidden="true">
        <div className="identity-hero__bg-text">
          <span>PEOPLE</span>
          <br />
          <span>PROCESS</span>
          <br />
          <span>TECHNOLOGY</span>
          <br />
          <span>A BRIGHTER</span>
          <br />
          <span>TOMORROW</span>
        </div>
      </div>

      {/* 1. Top Header Bar with Real Finsolz Logo */}
      <div className="identity-hero__top-bar">
        <div className="identity-hero__brand">
          <div className="identity-hero__logo-box">
            <img src="/finsolz-icon.png" alt="Finsolz" className="identity-hero__logo-img" />
          </div>
          <FinsolzBrand size="md" align="center" taglineTone="light" />
        </div>
      </div>

      {/* 2. Main Headline */}
      <div className="identity-hero__intro">


        <h1 className="identity-hero__headline">
          Your Identity
          <span className="identity-hero__headline-orange">Our Expertise</span>
        </h1>
      </div>

      {/* 3. Center Visual: Seamless 3D Pedestal Stage with Floating Badges */}
      <div className="identity-hero__visual-stage">
        <div className="identity-hero__pedestal-glow" aria-hidden="true" />

        <div className="identity-hero__pedestal-wrapper">
          <img
            src="/assets/images/pan-aadhaar-pedestal.jpg"
            alt="Finsolz PAN and Aadhaar Secure Verification Pedestal"
            className="identity-hero__pedestal-img"
          />

          {/* Left Floating Badge: Auto-fill Your Returns */}
          <div className="identity-hero__badge identity-hero__badge--left">
            <span className="identity-hero__badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
            <div>
              <span>Auto-fill</span>
              <br />
              <span>Your Returns</span>
            </div>
          </div>

          {/* Right Top Floating Badge: Access AIS & TIS Data */}
          <div className="identity-hero__badge identity-hero__badge--right-top">
            <span className="identity-hero__badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <div>
              <span>Access AIS</span>
              <br />
              <span>& TIS Data</span>
            </div>
          </div>

          {/* Right Bottom Floating Badge: Secure & Private */}
          <div className="identity-hero__badge identity-hero__badge--right-bottom">
            <span className="identity-hero__badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </span>
            <div>
              <span>Secure</span>
              <br />
              <span>& Private</span>
            </div>
          </div>
        </div>
      </div>


      {/* 5. Bottom Row: Protection Promise */}
      <div className="identity-hero__bottom-row">
        <div className="identity-hero__protection">
          <div className="identity-hero__shield-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div className="identity-hero__protection-text">
            <span className="identity-hero__protection-title">Your financial information stays protected.</span>
            <span className="identity-hero__protection-sub">Secure. Private. Built for compliance.</span>
          </div>
        </div>
      </div>

      {/* 6. Smooth Sweeping Orange Corner Wave */}
      <svg className="identity-hero__corner-wave" viewBox="0 0 320 140" fill="none" aria-hidden="true">
        <path d="M0 140V50C60 75 140 110 320 140H0Z" fill="url(#heroOrangeWaveGrad)" />
        <defs>
          <linearGradient id="heroOrangeWaveGrad" x1="0" y1="50" x2="320" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A1A" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
