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

/** Converts submitted timestamp to "16-Oct-2026, 10:30 am" matching Screenshot 3 */
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
  requestedAmount: string
  submittedAt?: string
  onTrackApplication?: () => void
  onGoHome?: () => void
  onContactSupport?: () => void
}

/**
 * Step 5: confirmation view for Machinery Loan matching Screenshot 3 and existing loan patterns
 */
export const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
  referenceNumber,
  applicationType,
  requestedAmount,
  submittedAt,
  onGoHome,
  onContactSupport,
}) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
      return
    }
    safeNavigateTo(navigate, routePaths.root)
  }

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
      return
    }
    safeNavigateTo(navigate, routePaths.support)
  }

  const rows = [
    {
      icon: <FileText size={20} aria-hidden="true" />,
      label: 'Application Reference',
      value: <span className="mach-submitted__value--strong">{referenceNumber || '—'}</span>,
    },
    {
      icon: <Layers size={20} aria-hidden="true" />,
      label: 'Application Type',
      value: applicationType,
    },
    {
      icon: <Banknote size={20} aria-hidden="true" />,
      label: 'Requested Amount',
      value: (
        <span className="mach-submitted__value--strong">
          {requestedAmount ? `₹${toAmount(requestedAmount).toLocaleString('en-IN')}` : '—'}
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
      value: <span className="mach-submitted__status">Under Review</span>,
    },
  ]

  return (
    <div className="mach-step mach-submitted" data-testid="mach-step-submitted">
      {/* Visual illustration badge matching Screenshot 3 */}
      <div className="mach-submitted__art" aria-hidden="true" data-testid="mach-submitted-art">
        <Sparkles className="mach-submitted__sparkle" size={26} />
        <UserRound className="mach-submitted__person" size={110} strokeWidth={1.6} />
        <FileText className="mach-submitted__doc" size={62} />
        <Search className="mach-submitted__search" size={50} strokeWidth={2.5} />
        <span className="mach-submitted__tick">
          <Check size={16} strokeWidth={3} />
        </span>
      </div>

      <header className="mach-submitted__header">
        <h2 className="mach-submitted__title">Application Submitted</h2>
        <p className="mach-submitted__subtitle">Your application is under review</p>
        <p className="mach-submitted__text">
          Our agent will review your application and come in contact with you soon.
        </p>
      </header>

      {/* Summary card */}
      <section className="mach-card mach-submitted__summary" data-testid="mach-submitted-summary-card">
        <dl className="mach-submitted__rows">
          {rows.map((row) => (
            <div key={row.label} className="mach-submitted__row">
              <span className="mach-submitted__row-icon" aria-hidden="true">
                {row.icon}
              </span>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mach-submitted__note">
          Saved on this device. This reference will be confirmed once our team receives your application.
        </p>
      </section>

      {/* What happens next Card matching Screenshot 3 */}
      <section className="mach-submitted__next-card" data-testid="mach-submitted-next-card">
        <h3 className="mach-submitted__next-title">What happens next?</h3>
        <div className="mach-submitted__next-steps">
          <div className="mach-submitted__next-step">
            <span className="mach-submitted__next-num">1</span>
            <span>Our agent will review your application.</span>
          </div>
          <div className="mach-submitted__next-step">
            <span className="mach-submitted__next-num">2</span>
            <span>We may contact you if additional information is required.</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mach-submitted__actions">
        <button
          type="button"
          className="mach-submitted__btn mach-submitted__btn--primary"
          onClick={handleGoHome}
          data-testid="mach-go-to-home-btn"
          aria-label="Go to Home"
        >
          <span>Go to Home</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="mach-submitted__btn mach-submitted__btn--link"
          onClick={handleContactSupport}
          data-testid="mach-contact-support-btn"
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
