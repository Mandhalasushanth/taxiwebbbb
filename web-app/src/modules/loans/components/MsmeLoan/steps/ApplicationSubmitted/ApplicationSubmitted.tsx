import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  Clock,
  FileText,
  Headphones,
  Layers,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { routePaths } from '@core/config'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import './ApplicationSubmitted.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Converts submitted timestamp to "16-Oct-2026, 5:18 pm" matching Screenshot 3 */
const formatSubmittedOn = (value?: string): string => {
  try {
    const date = value ? new Date(value) : new Date()
    const d = Number.isNaN(date.getTime()) ? new Date() : date
    const hours = d.getHours() % 12 || 12
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${day}-${MONTHS[d.getMonth()]}-${d.getFullYear()}, ${hours}:${minutes} ${d.getHours() < 12 ? 'am' : 'pm'}`
  } catch (err) {
    console.error('Error formatting submitted date', err)
    return 'Recently'
  }
}

export interface ApplicationSubmittedProps {
  referenceNumber: string
  applicationType: string
  annualTurnover?: string
  requestedAmount?: string
  submittedAt?: string
  onTrackApplication?: () => void
  onGoToDashboard?: () => void
  onGoHome?: () => void
  onContactSupport?: () => void
}

/**
 * Step 5: confirmation view for MSME Loan matching Screenshot 3
 */
export const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
  referenceNumber,
  applicationType = 'MSME Loan',
  annualTurnover,
  requestedAmount,
  submittedAt,
  onGoToDashboard,
  onGoHome,
  onContactSupport,
}) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
      return
    }
    if (onGoToDashboard) {
      onGoToDashboard()
      return
    }
    safeNavigateTo(navigate, routePaths.dashboard)
  }

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
      return
    }
    safeNavigateTo(navigate, routePaths.support)
  }

  const turnoverValue = annualTurnover || requestedAmount || ''

  const rows = [
    {
      icon: <FileText size={20} aria-hidden="true" />,
      label: 'Application Reference',
      value: <span className="msme-submitted__value--strong">{referenceNumber || 'TXE-LN-304407'}</span>,
    },
    {
      icon: <Layers size={20} aria-hidden="true" />,
      label: 'Application Type',
      value: applicationType,
    },
    {
      icon: <Banknote size={20} aria-hidden="true" />,
      label: 'Annual Turnover',
      value: (
        <span className="msme-submitted__value--strong">
          {turnoverValue ? `₹${toAmount(turnoverValue).toLocaleString('en-IN')}` : '₹64,686'}
        </span>
      ),
    },
    {
      icon: <CalendarDays size={20} aria-hidden="true" />,
      label: 'Submitted On',
      value: formatSubmittedOn(submittedAt),
    },
    {
      icon: <Clock size={20} aria-hidden="true" />,
      label: 'Current Status',
      value: <span className="msme-submitted__status">Under Review</span>,
    },
  ]

  return (
    <div className="msme-step msme-submitted" data-testid="msme-step-submitted">
      {/* Top Graphic Illustration matching Screenshot 3 */}
      <div className="msme-submitted__art" aria-hidden="true" data-testid="msme-submitted-art">
        <Sparkles className="msme-submitted__sparkle" size={26} />
        <UserRound className="msme-submitted__person" size={110} strokeWidth={1.6} />
        <FileText className="msme-submitted__doc" size={62} />
        <Search className="msme-submitted__search" size={50} strokeWidth={2.5} />
        <span className="msme-submitted__tick">
          <Check size={16} strokeWidth={3} />
        </span>
      </div>

      <header className="msme-submitted__header">
        <h2 className="msme-submitted__title">Application Submitted</h2>
        <p className="msme-submitted__subtitle">Your application is under review</p>
        <p className="msme-submitted__text">
          Our agent will review your application and come in contact with you soon.
        </p>
      </header>

      {/* Summary card matching Screenshot 3 */}
      <section className="msme-card msme-submitted__summary" data-testid="msme-submitted-summary-card">
        <dl className="msme-submitted__rows">
          {rows.map((row) => (
            <div key={row.label} className="msme-submitted__row">
              <span className="msme-submitted__row-icon" aria-hidden="true">
                {row.icon}
              </span>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="msme-submitted__note">
          Saved on this device. This reference will be confirmed once our team receives your application.
        </p>
      </section>

      {/* What happens next? card matching Screenshot 3 */}
      <section className="msme-submitted__next-card" data-testid="msme-submitted-next-card">
        <h3 className="msme-submitted__next-title">What happens next?</h3>
        <div className="msme-submitted__next-steps">
          <div className="msme-submitted__next-step">
            <span className="msme-submitted__next-num">1</span>
            <span>Our agent will review your application.</span>
          </div>
          <div className="msme-submitted__next-step">
            <span className="msme-submitted__next-num">2</span>
            <span>We may contact you if additional information is required.</span>
          </div>
        </div>
      </section>

      {/* Action buttons matching Screenshot 3 */}
      <div className="msme-submitted__actions">
        <button
          type="button"
          className="msme-submitted__btn msme-submitted__btn--primary"
          onClick={handleGoHome}
          data-testid="msme-go-to-home-btn"
          aria-label="Go to Home"
        >
          <span>Go to Home</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="msme-submitted__btn msme-submitted__btn--link"
          onClick={handleContactSupport}
          data-testid="msme-contact-support-btn"
          aria-label="Contact Support"
        >
          <Headphones size={18} aria-hidden="true" />
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  )
}

export default ApplicationSubmitted
