import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Clock,
  FileText,
  Headphones,
  Layers,
  LayoutDashboard,
} from 'lucide-react'
import { routePaths } from '@core/config'
import { safeNavigateTo } from '@modules/loans/utils/loanMarketplace.utils'
import { toAmount } from '@modules/loans/validation/commonLoanValidation'
import './ApplicationSubmitted.css'

const NEXT_STEPS = [
  'Our agent will review your application.',
  'We may contact you if additional information is required.',
  'You will be contacted with the next update.',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Converts submitted timestamp to "15 Oct 2026, 10:29 am" matching screenshot */
const formatSubmittedOn = (value?: string): string => {
  try {
    const date = value ? new Date(value) : new Date()
    const d = Number.isNaN(date.getTime()) ? new Date() : date
    const hours = d.getHours() % 12 || 12
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${d.getHours() < 12 ? 'am' : 'pm'}`
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
}

/** Step 5: confirmation view modeled after Business & Working Capital and matching user screenshots */
export const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
  referenceNumber,
  applicationType,
  requestedAmount,
  submittedAt,
}) => {
  const navigate = useNavigate()

  const rows = [
    {
      icon: <FileText size={20} aria-hidden="true" />,
      label: 'Application Reference',
      value: referenceNumber || '—',
    },
    {
      icon: <Layers size={20} aria-hidden="true" />,
      label: 'Application Type',
      value: applicationType,
    },
    {
      icon: <Banknote size={20} aria-hidden="true" />,
      label: 'Requested Amount',
      value: requestedAmount ? `₹${toAmount(requestedAmount).toLocaleString('en-IN')}` : '—',
    },
    {
      icon: <CalendarDays size={20} aria-hidden="true" />,
      label: 'Submitted On',
      value: formatSubmittedOn(submittedAt),
    },
    {
      icon: <Clock size={20} aria-hidden="true" />,
      label: 'Current Status',
      value: <span className="pl-submitted__status">Under Review</span>,
    },
  ]

  return (
    <div className="pl-step pl-submitted" data-testid="pl-step-submitted">
      <header className="pl-submitted__header">
        <h2 className="pl-submitted__title">Application Submitted</h2>
        <p className="pl-submitted__subtitle">Your application is under review</p>
        <p className="pl-submitted__text">
          Our agent will review your application and come in contact with you soon.
        </p>
      </header>

      <section className="pl-card pl-submitted__summary" data-testid="pl-submitted-summary-card">
        <dl className="pl-submitted__rows">
          {rows.map((row) => (
            <div key={row.label} className="pl-submitted__row">
              <span className="pl-submitted__row-icon" aria-hidden="true">
                {row.icon}
              </span>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="pl-submitted__note">
          Saved on this device. This reference will be confirmed once our team receives your application.
        </p>
      </section>

      <section className="pl-submitted__next" data-testid="pl-submitted-next-steps">
        <h3 className="pl-submitted__next-title">What happens next?</h3>
        <ol className="pl-submitted__next-list">
          {NEXT_STEPS.map((step, index) => (
            <li key={step}>
              <span className="pl-submitted__next-num">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="pl-submitted__actions">
        <button
          type="button"
          className="pl-submitted__btn pl-submitted__btn--primary"
          onClick={() => safeNavigateTo(navigate, routePaths.dashboard)}
          data-testid="pl-go-to-dashboard-btn"
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          <span>Go to Dashboard</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="pl-submitted__btn pl-submitted__btn--link"
          onClick={() => safeNavigateTo(navigate, routePaths.support)}
          data-testid="pl-contact-support-btn"
        >
          <Headphones size={18} aria-hidden="true" />
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  )
}

export default ApplicationSubmitted
