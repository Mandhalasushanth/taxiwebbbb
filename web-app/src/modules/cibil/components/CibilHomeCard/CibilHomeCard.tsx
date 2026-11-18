import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ShieldCheck, FileText, ArrowRight } from 'lucide-react'
import { routePaths } from '@core/config'
import './CibilHomeCard.css'

export const CibilHomeCard: React.FC = () => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate((routePaths as Record<string, any>).cibil || '/cibil')
  }

  return (
    <section
      className="cibil-home-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label="Check your free CIBIL Score"
      data-testid="cibil-home-card"
    >
      <div className="cibil-home-card__left">
        {/* Speedometer-style CIBIL icon */}
        <div className="cibil-home-card__gauge-icon" aria-hidden="true">
          <svg viewBox="0 0 100 65" width="68" height="44" fill="none">
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="30%" stopColor="#F97316" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <path
              d="M 12 55 A 38 38 0 0 1 88 55"
              stroke="url(#gaugeGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Gauge Needle */}
            <line
              x1="50"
              y1="55"
              x2="72"
              y2="28"
              stroke="#082B59"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="55" r="5" fill="#082B59" />
            <circle cx="50" cy="55" r="2" fill="#FFFFFF" />
          </svg>
        </div>

        <div>
          <div className="cibil-home-card__title-row">
            <h2 className="cibil-home-card__title">CIBIL Score</h2>
            <span className="cibil-home-card__free-badge">Free</span>
          </div>
          <p className="cibil-home-card__subtitle">Check your free credit score instantly</p>
        </div>
      </div>

      <div className="cibil-home-card__middle">
        <div className="cibil-home-card__feature">
          <span className="cibil-home-card__feature-icon">
            <Zap size={18} />
          </span>
          <span className="cibil-home-card__feature-text">Quick Check</span>
        </div>

        <div className="cibil-home-card__feature">
          <span className="cibil-home-card__feature-icon">
            <ShieldCheck size={18} />
          </span>
          <span className="cibil-home-card__feature-text">100% Secure</span>
        </div>

        <div className="cibil-home-card__feature">
          <span className="cibil-home-card__feature-icon">
            <FileText size={18} />
          </span>
          <span className="cibil-home-card__feature-text">No Impact on Score</span>
        </div>
      </div>

      <button
        type="button"
        className="cibil-home-card__btn"
        onClick={(e) => {
          e.stopPropagation()
          handleCardClick()
        }}
        aria-label="Check Score"
      >
        <span>Check Score</span>
        <ArrowRight size={16} />
      </button>
    </section>
  )
}
export default CibilHomeCard
