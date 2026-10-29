import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import type { RecentApplication, UpcomingDeadlineItem } from '../../types/dashboard.types'
import './DashboardOverviewGrid.css'

export interface DashboardOverviewGridProps {
  applications?: RecentApplication[]
  deadlines?: UpcomingDeadlineItem[]
}

// Icons for Card Headers
const HeaderDocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overview-card__header-svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

const HeaderCalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overview-card__header-svg">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// Inner Empty State Icons
const EmptyDocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="overview-card__empty-svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const EmptyCalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="overview-card__empty-svg">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="15" r="1.5" />
  </svg>
)

export const DashboardOverviewGrid = ({
  applications = [],
  deadlines = [],
}: DashboardOverviewGridProps) => {
  const displayedApplications = applications.slice(0, 3)

  return (
    <section className="dashboard-overview-grid" aria-label="Dashboard Overview">
      {/* 1. Upcoming Deadlines */}
      <div className="overview-card">
        <div className="overview-card__header">
          <div className="overview-card__header-left">
            <div className="overview-card__header-icon-wrap">
              <HeaderCalendarIcon />
            </div>
            <div>
              <h3 className="overview-card__title">Upcoming Deadlines</h3>
              <p className="overview-card__subtitle">Stay ahead with important tax dates</p>
            </div>
          </div>
        </div>

        <div className="overview-card__body">
          {deadlines.length > 0 ? (
            <div className="overview-card__list">
              {deadlines.map((d) => (
                <div key={d.id} className="overview-card__item">
                  <div className="overview-card__item-left">
                    <span className="overview-card__item-title">{d.title}</span>
                    <span className="overview-card__item-meta">{d.dueLabel}</span>
                  </div>
                  <span className={`overview-card__badge overview-card__badge--${d.daysTone}`}>
                    {d.daysText}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overview-card__empty-box">
              <div className="overview-card__empty-icon-wrap">
                <EmptyCalendarIcon />
              </div>
              <h4 className="overview-card__empty-title">No upcoming deadlines</h4>
              <p className="overview-card__empty-desc">
                Your relevant tax deadlines will appear here based on your services and applications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Recent Applications */}
      <div className="overview-card">
        <div className="overview-card__header">
          <div className="overview-card__header-left">
            <div className="overview-card__header-icon-wrap">
              <HeaderDocIcon />
            </div>
            <div>
              <h3 className="overview-card__title">Recent Applications</h3>
              <p className="overview-card__subtitle">Track and manage all your applications</p>
            </div>
          </div>
          <Link
            className="overview-card__view-all"
            to={routePaths.applications}
            aria-label="View all applications"
          >
            <span>View All</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="overview-card__body">
          {applications.length > 0 ? (
            <div className="overview-card__list">
              {displayedApplications.map((app) => (
                <Link key={app.id} to={app.to} className="overview-card__item">
                  <div className="overview-card__item-header">
                    <span className="overview-card__item-code">{app.code}</span>
                    <span className={`overview-card__badge overview-card__badge--${app.statusTone}`}>
                      {app.statusLabel}
                    </span>
                  </div>
                  <span className="overview-card__item-title">{app.title}</span>
                  <div className="overview-card__item-footer">
                    <span className="overview-card__item-meta">{app.meta}</span>
                    <span className="overview-card__item-view-details">
                      View Details <span aria-hidden="true">&gt;</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="overview-card__empty-box">
              <div className="overview-card__empty-icon-wrap">
                <EmptyDocIcon />
              </div>
              <h4 className="overview-card__empty-title">You haven&apos;t started any applications yet</h4>
              <p className="overview-card__empty-desc">
                Explore our services and get started with your tax and financial journey today.
              </p>
              <a href="#quick-services" className="overview-card__empty-btn">
                <span>Browse Services</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardOverviewGrid
