import type { DashboardBrief } from '../../types/dashboard.types'
import './DashboardHero.css'

export interface DashboardHeroProps {
  userName: string
  brief?: DashboardBrief
}

const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export const DashboardHero = ({ userName }: DashboardHeroProps) => {
  const firstName = userName ? userName.split(' ')[0] : 'User'

  return (
    <section className="dashboard-hero" aria-label="TaxEdge Overview Banner">
      {/* Foreground Content Container with Three Responsive Visual Zones */}
      <div className="dashboard-hero__content">
        {/* Zone 1 (Left): Welcome Heading, Subtitle & Orange Accent Line */}
        <div className="dashboard-hero__left">
          <h1 className="dashboard-hero__greeting">
            {getGreeting()}, {firstName} <span className="dashboard-hero__wave">👋</span>
          </h1>

          <p className="dashboard-hero__question">
            What can we help you with today?
          </p>

          <div className="dashboard-hero__welcome-line" aria-hidden="true" />
        </div>

        {/* Zone 2 (Center): Unobstructed Area for the 3D Tax Illustration in Background */}
        <div className="dashboard-hero__center" aria-hidden="true" />

        {/* Zone 3 (Right): Slogan Quote, Compliance Badge & Orange Accent Line */}
        <div className="dashboard-hero__right">
          <div className="dashboard-hero__quote-block">
            <p className="dashboard-hero__quote-text">
              &ldquo;Simplifying <br />
              Taxes for a <br />
              Brighter Tomorrow&rdquo;
            </p>

            <span className="dashboard-hero__quote-badge">
              100% Compliant &bull; Secure
            </span>

            <div className="dashboard-hero__quote-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardHero
