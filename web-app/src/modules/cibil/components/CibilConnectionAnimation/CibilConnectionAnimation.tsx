import React from 'react'
import { ShieldCheck, ChevronRight } from 'lucide-react'
import './CibilConnectionAnimation.css'

interface CibilConnectionAnimationProps {
  stage: 'connecting' | 'fetching'
}

export const CibilConnectionAnimation: React.FC<CibilConnectionAnimationProps> = ({ stage }) => {
  return (
    <div className="cibil-anim-overlay" role="status" aria-live="polite" data-testid="cibil-connection-animation">
      <div className="cibil-anim-card">
        {/* Nodes and Animated Bridge */}
        <div className="cibil-anim-nodes-row">
          {/* CIBIL Logo (Left) */}
          <div className="cibil-anim-node" title="TransUnion CIBIL">
            <div className="cibil-anim-cibil-text">
              <span className="cibil-anim-cibil-sub">TRANSUNION</span>
              <span className="cibil-anim-cibil-main">CIBIL</span>
            </div>
          </div>

          {/* Dotted Track with Traveling Particles */}
          <div className="cibil-anim-track-wrap" aria-hidden="true">
            <div className="cibil-anim-track-line" />
            <div className="cibil-anim-particle-stream">
              <span className="cibil-anim-particle cibil-anim-particle--1">
                <ChevronRight size={18} strokeWidth={2.8} />
              </span>
              <span className="cibil-anim-particle cibil-anim-particle--2">
                <ChevronRight size={18} strokeWidth={2.8} />
              </span>
              <span className="cibil-anim-particle cibil-anim-particle--3">
                <ChevronRight size={18} strokeWidth={2.8} />
              </span>
            </div>
          </div>

          {/* Finsolz Logo (Right) */}
          <div className="cibil-anim-node" title="Finsolz">
            <img
              src="/finsolz-icon.png"
              alt="Finsolz"
              className="cibil-anim-finsolz-logo"
            />
          </div>
        </div>

        {/* Dynamic Titles */}
        <h2 className="cibil-anim-status-title">
          {stage === 'connecting' ? 'Connecting to Finsolz...' : 'Fetching your credit score...'}
        </h2>
        <p className="cibil-anim-status-desc">
          {stage === 'connecting'
            ? 'Establishing secure encrypted connection to credit bureau'
            : 'Retrieving latest CIBIL credit insights and account history'}
        </p>

        {/* Circular Radar Fetching Spinner */}
        <div className="cibil-anim-radar-wrap" aria-hidden="true">
          <svg className="cibil-anim-radar-svg" width="56" height="56" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#e2e8f0"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="38 100"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Security Assurance Badge */}
        <div className="cibil-anim-security-badge">
          <span className="cibil-anim-security-icon">
            <ShieldCheck size={14} />
          </span>
          <span>256-Bit SSL Encrypted Bureau Verification</span>
        </div>
      </div>
    </div>
  )
}
export default CibilConnectionAnimation
