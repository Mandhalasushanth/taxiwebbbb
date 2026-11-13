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

/**
 * Formats a date string (YYYY-MM-DD, DD-MM-YYYY, ISO) or Date object
 * into standard DD-MM-YYYY display format without timezone shifting.
 */
export const formatDisplayDate = (
  value?: string | Date | null,
  fallback = '—'
): string => {
  if (value === undefined || value === null) return fallback

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return fallback
    const day = String(value.getDate()).padStart(2, '0')
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const year = value.getFullYear()
    return `${day}-${month}-${year}`
  }

  const str = String(value).trim()
  if (!str) return fallback

  // Already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str
  }

  // DD-M-YYYY or D-MM-YYYY
  const dmyHyphenMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmyHyphenMatch) {
    return `${dmyHyphenMatch[1].padStart(2, '0')}-${dmyHyphenMatch[2].padStart(2, '0')}-${dmyHyphenMatch[3]}`
  }

  // DD/MM/YYYY or D/M/YYYY
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    return `${slashMatch[1].padStart(2, '0')}-${slashMatch[2].padStart(2, '0')}-${slashMatch[3]}`
  }

  // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    return `${isoMatch[3].padStart(2, '0')}-${isoMatch[2].padStart(2, '0')}-${isoMatch[1]}`
  }

  const d = new Date(str)
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  return str
}

/** Alias for formatDisplayDate */
export const toDisplayDate = (value?: string | Date | null, fallback = ''): string => {
  return formatDisplayDate(value, fallback)
}

/**
 * Converts any date format (DD-MM-YYYY, DD/MM/YYYY, Date) to standard ISO YYYY-MM-DD
 * for native HTML5 <input type="date" /> values.
 */
export const toIsoDate = (value?: string | Date | null): string => {
  if (!value) return ''
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const str = String(value).trim()
  if (!str) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`
  }
  const isoPrefixMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoPrefixMatch) {
    return `${isoPrefixMatch[1]}-${isoPrefixMatch[2].padStart(2, '0')}-${isoPrefixMatch[3].padStart(2, '0')}`
  }
  return str
}

