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
  LayoutDashboard,
  Search,
  Sparkles,
  UserRound,
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

/** → "14-Oct-2026, 5:20 pm" */
const formatSubmittedOn = (value?: string) => {
  const date = value ? new Date(value) : new Date()
  const d = Number.isNaN(date.getTime()) ? new Date() : date
  const hours = d.getHours() % 12 || 12
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}-${MONTHS[d.getMonth()]}-${d.getFullYear()}, ${hours}:${minutes} ${d.getHours() < 12 ? 'am' : 'pm'}`
}

export interface ApplicationSubmittedProps {
  referenceNumber: string
  applicationType: string
  requestedAmount: string
  submittedAt?: string
  onTrackApplication?: () => void
}

/** Step 5: confirmation shown once the application has been sent */
export const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
  referenceNumber,
  applicationType,
  requestedAmount,
  submittedAt,
}) => {
  const navigate = useNavigate()

  const rows = [
    { icon: <FileText size={20} />, label: 'Application Reference', value: referenceNumber || '—' },
    { icon: <Layers size={20} />, label: 'Application Type', value: applicationType },
    { icon: <Banknote size={20} />, label: 'Requested Amount', value: `₹${toAmount(requestedAmount).toLocaleString('en-IN')}` },
    { icon: <CalendarDays size={20} />, label: 'Submitted On', value: formatSubmittedOn(submittedAt) },
    {
      icon: <Clock size={20} />,
      label: 'Current Status',
      value: <span className="bwc-submitted__status">Under Review</span>,
    },
  ]

  return (
    <div className="bwc-step bwc-submitted" data-testid="bwc-step-submitted">
      <div className="bwc-submitted__art" aria-hidden="true">
        <Sparkles className="bwc-submitted__sparkle" size={28} />
        <UserRound className="bwc-submitted__person" size={110} strokeWidth={1.6} />
        <FileText className="bwc-submitted__doc" size={64} />
        <Search className="bwc-submitted__search" size={52} strokeWidth={2.5} />
        <span className="bwc-submitted__tick">
          <Check size={18} strokeWidth={3} />
        </span>
      </div>

      <header className="bwc-submitted__header">
        <h2 className="bwc-submitted__title">Application Submitted</h2>
        <p className="bwc-submitted__subtitle">Your application is under review</p>
        <p className="bwc-submitted__text">Our agent will review your application and come in contact with you soon.</p>
      </header>

      <section className="bwc-card bwc-submitted__summary">
        <dl className="bwc-submitted__rows">
          {rows.map((row) => (
            <div key={row.label} className="bwc-submitted__row">
              <span className="bwc-submitted__row-icon" aria-hidden="true">
                {row.icon}
              </span>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="bwc-submitted__note">
          Saved on this device. This reference will be confirmed once our team receives your application.
        </p>
      </section>

      <section className="bwc-submitted__next">
        <h3 className="bwc-submitted__next-title">What happens next?</h3>
        <ol className="bwc-submitted__next-list">
          {NEXT_STEPS.map((step, index) => (
            <li key={step}>
              <span className="bwc-submitted__next-num">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="bwc-submitted__actions">
        <button
          type="button"
          className="bwc-submitted__btn bwc-submitted__btn--primary"
          onClick={() => safeNavigateTo(navigate, routePaths.dashboard)}
          data-testid="bwc-go-to-dashboard-btn"
          aria-label="Go to Dashboard"
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          <span>Go to Dashboard</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="bwc-submitted__btn bwc-submitted__btn--link"
          onClick={() => safeNavigateTo(navigate, routePaths.support)}
          data-testid="bwc-customer-support-btn"
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
