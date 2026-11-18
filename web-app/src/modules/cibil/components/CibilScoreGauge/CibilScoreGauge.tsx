import React, { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getCibilCategory } from '../../types/cibil.types'
import './CibilScoreGauge.css'

interface CibilScoreGaugeProps {
  score: number
  minScore?: number
  maxScore?: number
}

export const CibilScoreGauge: React.FC<CibilScoreGaugeProps> = ({
  score,
  minScore = 300,
  maxScore = 900,
}) => {
  const category = getCibilCategory(score)
  const clampedScore = Math.min(Math.max(score, minScore), maxScore)
  const scoreFraction = (clampedScore - minScore) / (maxScore - minScore)
  // -90deg is full left (minScore), +90deg is full right (maxScore)
  const targetAngle = -90 + scoreFraction * 180

  const [displayScore, setDisplayScore] = useState(minScore)
  const [needleAngle, setNeedleAngle] = useState(-90)

  useEffect(() => {
    // 1. Move needle to target angle
    const needleTimer = setTimeout(() => {
      setNeedleAngle(targetAngle)
    }, 100)

    // 2. Count up the score number smoothly
    const startTime = Date.now()
    const duration = 1200
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic progression
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(minScore + (clampedScore - minScore) * eased)
      setDisplayScore(current)

      if (progress >= 1) {
        clearInterval(interval)
      }
    }, 20)

    return () => {
      clearTimeout(needleTimer)
      clearInterval(interval)
    }
  }, [clampedScore, targetAngle, minScore])

  return (
    <div className="cibil-gauge-card" data-testid="cibil-score-gauge">
      <h2 className="cibil-gauge-title">CIBIL Score</h2>

      <div className="cibil-gauge-viewport">
        <svg className="cibil-gauge-svg" viewBox="0 0 320 160">
          <defs>
            <linearGradient id="cibilArcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="22%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="78%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>

          {/* Background Track (Muted Grey Semicircle) */}
          <path
            d="M 35 145 A 125 125 0 0 1 285 145"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored Semicircle Arc */}
          <path
            d="M 35 145 A 125 125 0 0 1 285 145"
            fill="none"
            stroke="url(#cibilArcGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Animated Indicator on the Arc */}
          <g
            className="cibil-gauge-needle"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '160px 145px',
            }}
          >
            {/* Sleek dart/arrowhead pointing towards the indicator dot on the arc */}
            <path
              d="M 160 25 L 151 47 L 160 43 L 169 47 Z"
              fill="#0F172A"
            />
            {/* Circle indicator sitting directly on the arc band */}
            <circle
              cx="160"
              cy="20"
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
          </g>
        </svg>

        {/* Center Score Number inside the arc */}
        <div className="cibil-gauge-center-content">
          <span className="cibil-gauge-score-num">{displayScore}</span>
        </div>
      </div>

      {/* Content Below the Arc: / 900 and Category Badge */}
      <div className="cibil-gauge-bottom-content">
        <span className="cibil-gauge-score-max">/ {maxScore}</span>
        <div
          className="cibil-gauge-category-badge"
          style={{
            backgroundColor: category.bgLight,
            color: category.color,
            borderColor: category.borderColor,
          }}
        >
          <CheckCircle2 size={13} strokeWidth={2.6} />
          <span>{category.label}</span>
        </div>
      </div>

      {/* Min & Max Labels */}
      <div className="cibil-gauge-minmax-row">
        <span className="cibil-gauge-minmax-label">Min {minScore}</span>
        <span className="cibil-gauge-minmax-label">Max {maxScore}</span>
      </div>
    </div>
  )
}
export default CibilScoreGauge
