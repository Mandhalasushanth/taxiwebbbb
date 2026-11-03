import { VALIDATION_MESSAGES } from './validationMessages'

export interface ValidateDobOptions {
  label?: string
  required?: boolean
  minAge?: number
  maxAge?: number
  allowFuture?: boolean
}

/**
 * Parses date string (DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY) or Date object
 * into a valid Date instance, or null if invalid calendar date.
 */
export const parseDate = (value: string | Date | undefined | null): Date | null => {
  if (!value) return null
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  const str = String(value).trim()
  if (!str) return null

  let day: number
  let month: number
  let year: number

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10)
    month = parseInt(dmyMatch[2], 10)
    year = parseInt(dmyMatch[3], 10)
  } else {
    // YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10)
      month = parseInt(ymdMatch[2], 10)
      day = parseInt(ymdMatch[3], 10)
    } else {
      return null
    }
  }

  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 1900 || year > 2100) return null

  // Check actual calendar days in month (handling leap years)
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export const isValidDate = (value: string | Date): boolean => parseDate(value) !== null

/** Calculates completed years of age */
export const calculateAge = (dob: Date, today: Date = new Date()): number => {
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

export const validateDob = (
  value: string | Date | undefined | null,
  options?: ValidateDobOptions | string
): string | null => {
  const opts: ValidateDobOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false

  if (!value || (typeof value === 'string' && !value.trim())) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  const date = parseDate(value)
  if (!date) {
    return VALIDATION_MESSAGES.dob
  }

  const now = new Date()
  // Strip time for clean date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (!opts.allowFuture && compareDate.getTime() > today.getTime()) {
    return VALIDATION_MESSAGES.futureDob
  }

  const age = calculateAge(date, today)

  if (opts.minAge !== undefined && age < opts.minAge) {
    return `Must be at least ${opts.minAge} years old`
  }

  if (opts.maxAge !== undefined && age > opts.maxAge) {
    return `Age cannot exceed ${opts.maxAge} years`
  }

  return null
}

