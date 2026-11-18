import React from 'react'
import { ArrowUp, ArrowDown, Minus, Sparkles, Calendar } from 'lucide-react'
import './CibilScoreDeltaCard.css'

interface CibilScoreDeltaCardProps {
  scoreDelta: number | null
  previousScore: number | null
  nextReportDate?: string
  lastUpdatedDate?: string
}

export const CibilScoreDeltaCard: React.FC<CibilScoreDeltaCardProps> = ({
  scoreDelta,
  previousScore,
  nextReportDate,
  lastUpdatedDate,
}) => {
  const isBaseline = scoreDelta === null || previousScore === null
  const isIncrease = !isBaseline && scoreDelta > 0
  const isDecrease = !isBaseline && scoreDelta < 0
  const isUnchanged = !isBaseline && scoreDelta === 0

  return (
    <div className="cibil-delta-wrapper" data-testid="cibil-score-delta">
      {/* Delta Card */}
      {isBaseline && (
        <div className="cibil-delta-card cibil-delta-card--baseline">
          <div className="cibil-delta-icon-box cibil-delta-icon-box--baseline">
            <Sparkles size={20} />
          </div>
          <div className="cibil-delta-content">
            <h3 className="cibil-delta-primary-text cibil-delta-primary-text--baseline">
              Credit score baseline established
            </h3>
            <p className="cibil-delta-secondary-text">
              Regular checks will track your monthly score progress.
            </p>
          </div>
        </div>
      )}

      {isIncrease && (
        <div className="cibil-delta-card cibil-delta-card--increase">
          <div className="cibil-delta-icon-box cibil-delta-icon-box--increase">
            <ArrowUp size={22} strokeWidth={2.5} />
          </div>
          <div className="cibil-delta-content">
            <h3 className="cibil-delta-primary-text cibil-delta-primary-text--increase">
              Your score has increased by +{scoreDelta}
            </h3>
            <p className="cibil-delta-secondary-text">
              Compared to previous score of {previousScore}
            </p>
          </div>
        </div>
      )}

      {isDecrease && (
        <div className="cibil-delta-card cibil-delta-card--decrease">
          <div className="cibil-delta-icon-box cibil-delta-icon-box--decrease">
            <ArrowDown size={22} strokeWidth={2.5} />
          </div>
          <div className="cibil-delta-content">
            <h3 className="cibil-delta-primary-text cibil-delta-primary-text--decrease">
              Your score has decreased by {scoreDelta}
            </h3>
            <p className="cibil-delta-secondary-text">
              Compared to previous score of {previousScore}
            </p>
          </div>
        </div>
      )}

      {isUnchanged && (
        <div className="cibil-delta-card cibil-delta-card--unchanged">
          <div className="cibil-delta-icon-box cibil-delta-icon-box--unchanged">
            <Minus size={22} strokeWidth={2.5} />
          </div>
          <div className="cibil-delta-content">
            <h3 className="cibil-delta-primary-text cibil-delta-primary-text--unchanged">
              Your score remains unchanged
            </h3>
            <p className="cibil-delta-secondary-text">
              Score stable at {previousScore} points.
            </p>
          </div>
        </div>
      )}

      {/* Bureau Refresh Date Notice */}
      <div className="cibil-delta-refresh-notice">
        <Calendar size={18} className="cibil-delta-refresh-icon" />
        <span>
          {nextReportDate
            ? `Next bureau refresh: ${nextReportDate}`
            : lastUpdatedDate
            ? `Last updated: ${lastUpdatedDate}`
            : 'Next bureau refresh: Active'}
        </span>
      </div>
    </div>
  )
}
export default CibilScoreDeltaCard
