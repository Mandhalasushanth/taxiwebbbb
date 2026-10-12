import { useMemo } from 'react'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { appConfig } from '@core/config'
import { CtaLink } from '../../components/CtaLink/CtaLink'
import { COMPLIANCE_DEADLINE_RULES, DEADLINES_COPY } from '../../data/marketingInteractive'
import { useNow } from '../../hooks/useNow'
import { daysUntil, getCountdownParts, getUpcomingDeadlines } from '../../utils/complianceDeadlines'
import type { CountdownParts } from '../../utils/complianceDeadlines'
import type { ComplianceDeadline } from '../../types/marketing.types'
import './DeadlineCountdown.css'

const HEADING_ID = 'mk-deadlines-title'
const URGENT_DAYS = 3

const COUNTDOWN_UNITS: Array<{ key: keyof CountdownParts; label: string }> = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Mins' },
  { key: 'seconds', label: 'Secs' },
]

const dateFormatter = new Intl.DateTimeFormat(appConfig.defaultLocale, { day: '2-digit', month: 'short', year: 'numeric' })

const pad = (value: number): string => String(value).padStart(2, '0')

const daysLabel = (days: number): string => {
  if (days === 0) return 'Due today'
  return days === 1 ? '1 day left' : `${days} days left`
}

const renderUnit = (parts: CountdownParts) => (unit: (typeof COUNTDOWN_UNITS)[number]) => (
  <div key={unit.key} className="mk-deadlines__unit">
    <span className="mk-deadlines__unit-value">{pad(parts[unit.key])}</span>
    <span className="mk-deadlines__unit-label">{unit.label}</span>
  </div>
)

const renderDeadline = (now: Date) => (deadline: ComplianceDeadline) => {
  const days = daysUntil(deadline.dueDate, now)
  return (
    <li key={deadline.id} className="mk-deadlines__item">
      <span className="mk-deadlines__category">{deadline.category}</span>
      <span className="mk-deadlines__item-title">{deadline.title}</span>
      <span className="mk-deadlines__item-meta">
        <time dateTime={deadline.dueDate.toISOString()}>{dateFormatter.format(deadline.dueDate)}</time>
        <span className={days <= URGENT_DAYS ? 'mk-deadlines__days mk-deadlines__days--urgent' : 'mk-deadlines__days'}>
          {daysLabel(days)}
        </span>
      </span>
    </li>
  )
}

/** Live countdown to the next statutory due date, computed from today's date */
export const DeadlineCountdown = () => {
  const now = useNow()
  // Recompute the list only when the calendar day changes, not every second
  const dayKey = now.toDateString()
  const deadlines = useMemo(
    () => getUpcomingDeadlines(COMPLIANCE_DEADLINE_RULES, DEADLINES_COPY.listSize, new Date(dayKey)),
    [dayKey],
  )
  const [next] = deadlines
  if (!next) return null

  const parts = getCountdownParts(next.dueDate, now)

  return (
    <section className="mk-section mk-deadlines" aria-labelledby={HEADING_ID}>
      <div className="mk-container mk-deadlines__card">
        <div className="mk-deadlines__main">
          <span className="mk-deadlines__eyebrow">
            <CalendarClock aria-hidden="true" />
            {DEADLINES_COPY.eyebrow}
          </span>
          <h2 id={HEADING_ID} className="mk-deadlines__title">
            {DEADLINES_COPY.title}
          </h2>
          <p className="mk-deadlines__next">
            {DEADLINES_COPY.nextLabel} <strong>{next.title}</strong>
          </p>
          <div className="mk-deadlines__timer" role="timer" aria-label={`${daysLabel(parts.days)} for ${next.title}`}>
            {COUNTDOWN_UNITS.map(renderUnit(parts))}
          </div>
          <CtaLink to={DEADLINES_COPY.ctaTo} icon={<ArrowRight />}>
            {DEADLINES_COPY.ctaLabel}
          </CtaLink>
        </div>
        <ul className="mk-deadlines__list">{deadlines.map(renderDeadline(now))}</ul>
      </div>
    </section>
  )
}
