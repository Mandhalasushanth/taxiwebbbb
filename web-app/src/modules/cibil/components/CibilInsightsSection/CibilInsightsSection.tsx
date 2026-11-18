import React from 'react'
import { Wallet, CheckCircle2, PieChart, Clock, Search, ArrowRight } from 'lucide-react'
import type { CibilInsightMetric } from '../../types/cibil.types'
import './CibilInsightsSection.css'

export interface CibilInsightsSectionProps {
  userName?: string
  insights: CibilInsightMetric[]
  onViewReport?: () => void
}

const renderInsightIcon = (iconName: string) => {
  switch (iconName) {
    case 'wallet':
      return <Wallet size={20} strokeWidth={2.2} />
    case 'check-circle':
      return <CheckCircle2 size={20} strokeWidth={2.2} />
    case 'pie-chart':
      return <PieChart size={20} strokeWidth={2.2} />
    case 'clock':
      return <Clock size={20} strokeWidth={2.2} />
    case 'search':
    default:
      return <Search size={20} strokeWidth={2.2} />
  }
}

export const CibilInsightsSection: React.FC<CibilInsightsSectionProps> = ({
  userName = 'Member',
  insights,
  onViewReport,
}) => {
  return (
    <section className="cibil-insights-container" aria-label="Credit Score Insights">
      <div className="cibil-insights-header">
        <div className="cibil-insights-header-text">
          <h2 className="cibil-insights-greeting">Hi {userName}!</h2>
          <p className="cibil-insights-subtitle">Here&apos;s what&apos;s affecting your score.</p>
        </div>

        {onViewReport && (
          <button
            type="button"
            className="cibil-view-report-btn"
            onClick={onViewReport}
            aria-label="View Full Credit Report"
          >
            <span>View Full Report</span>
            <ArrowRight size={17} />
          </button>
        )}
      </div>

      <div className="cibil-insights-grid">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`cibil-insight-card cibil-insight-card--${item.cardTheme || 'blue'}`}
          >
            <div
              className={`cibil-insight-icon-box cibil-insight-icon-box--${item.cardTheme || 'blue'}`}
              aria-hidden="true"
            >
              {renderInsightIcon(item.iconName)}
            </div>

            <h3 className="cibil-insight-title">{item.title}</h3>

            <span
              className={`cibil-insight-badge cibil-insight-badge--${item.cardTheme || 'blue'}`}
            >
              {item.valueDisplay}
            </span>

            <p className="cibil-insight-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
export default CibilInsightsSection
