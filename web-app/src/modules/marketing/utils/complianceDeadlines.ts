import type { ComplianceDeadline, ComplianceDeadlineRule } from '../types/marketing.types'

const MONTHS_IN_YEAR = 12
const ALL_MONTHS = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => index + 1)

const lastDayOfMonth = (year: number, monthIndex: number): number => new Date(year, monthIndex + 1, 0).getDate()

/** End of the due day (23:59:59) so a deadline stays "today" until midnight */
const dueDateFor = (year: number, monthIndex: number, day: number): Date =>
  new Date(year, monthIndex, Math.min(day, lastDayOfMonth(year, monthIndex)), 23, 59, 59)

/** Next due date of a rule in one of its months, on or after `from` */
const nextOccurrence = (rule: ComplianceDeadlineRule, month: number, from: Date): Date => {
  const thisYear = dueDateFor(from.getFullYear(), month - 1, rule.day)
  return thisYear >= from ? thisYear : dueDateFor(from.getFullYear() + 1, month - 1, rule.day)
}

const earliest = (dates: Date[]): Date => dates.reduce((min, date) => (date < min ? date : min))

const toDeadline = (rule: ComplianceDeadlineRule, from: Date): ComplianceDeadline => ({
  id: rule.id,
  title: rule.title,
  category: rule.category,
  dueDate: earliest((rule.months ?? ALL_MONTHS).map((month) => nextOccurrence(rule, month, from))),
})

/** Upcoming deadlines (soonest first) computed from the rules relative to `from` */
export const getUpcomingDeadlines = (
  rules: ComplianceDeadlineRule[],
  limit: number,
  from: Date = new Date(),
): ComplianceDeadline[] =>
  rules
    .map((rule) => toDeadline(rule, from))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, limit)

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const getCountdownParts = (target: Date, now: Date): CountdownParts => {
  const remaining = Math.max(target.getTime() - now.getTime(), 0)
  return {
    days: Math.floor(remaining / MS_PER_DAY),
    hours: Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((remaining % MS_PER_MINUTE) / MS_PER_SECOND),
  }
}

/** Whole days left, counting today's deadline as 0 */
export const daysUntil = (target: Date, now: Date): number => getCountdownParts(target, now).days
