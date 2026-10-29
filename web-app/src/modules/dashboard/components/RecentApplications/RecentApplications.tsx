import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import type { RecentApplication } from '../../types/dashboard.types'
import './RecentApplications.css'

export interface RecentApplicationsProps {
  applications?: RecentApplication[]
}

export const RecentApplications = ({ applications = [] }: RecentApplicationsProps) => {
  if (!applications.length) return null

  const displayedApplications = applications.slice(0, 3)

  return (
    <section className="recent-apps" aria-labelledby="recent-apps-heading">
      <div className="recent-apps__header">
        <div>
          <h2 className="recent-apps__title" id="recent-apps-heading">Recent applications</h2>
          <p className="recent-apps__subtitle">Live status across GST, ITR and loans.</p>
        </div>
        <Link className="recent-apps__view-all" to={routePaths.applications}>
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="recent-apps__list">
        {displayedApplications.map((app) => (
          <Link className="recent-app-card" key={app.id} to={app.to}>
            <div className="recent-app-card__left">
              <span className="recent-app-card__icon" aria-hidden="true">{app.icon}</span>
              <div className="recent-app-card__info">
                <h3 className="recent-app-card__title">{app.title}</h3>
                <p className="recent-app-card__meta">
                  <span className="recent-app-card__code">{app.code}</span> · {app.meta}
                </p>
              </div>
            </div>

            <div className="recent-app-card__right">
              <span className={`recent-app-card__badge recent-app-card__badge--${app.statusTone}`}>
                <span className="recent-app-card__badge-dot" aria-hidden="true">●</span>
                {app.statusLabel}
              </span>

              <div className="recent-app-card__progress-wrap">
                <div className="recent-app-card__progress-bar">
                  <div className={`recent-app-card__progress-fill recent-app-card__progress-fill--${app.progress}`} />
                </div>
                <span className="recent-app-card__progress-text">{app.progress}% complete</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
