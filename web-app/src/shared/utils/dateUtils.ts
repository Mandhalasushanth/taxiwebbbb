const LOCALE = 'en-IN'

export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const relativeTime = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value)
  const diffMs = date.getTime() - Date.now()
  const minutes = Math.round(diffMs / 60_000)
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour')
  return formatter.format(Math.round(hours / 24), 'day')
}

/** Indian financial year label for a date, e.g. "2025-26". */
export const financialYearOf = (value: string | Date = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`
}

/** Returns today's date formatted as YYYY-MM-DD in local time */
export const getTodayIso = (): string => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns the maximum valid Date of Birth for 18+ years formatted as YYYY-MM-DD */
export const getMaxAdultDobIso = (minAge: number = 18): string => {
  const d = new Date()
  const year = d.getFullYear() - minAge
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

