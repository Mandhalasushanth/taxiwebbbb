export interface SelectOption {
  value: string
  label: string
}

const toOption = (value: string): SelectOption => ({ value, label: value })

/** Indian financial year (April–March) that contains the given date, as its starting year */
const fyStartYear = (date: Date): number => (date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1)
const fyLabel = (startYear: number): string => `FY ${startYear}-${String(startYear + 1).slice(-2)}`

const today = new Date()
const currentFyStart = fyStartYear(today)

export const GST_START_YEAR = 2017
export const GST_END_YEAR = 2026

export const CURRENT_FINANCIAL_YEAR = 'FY 2025-26'

/** Financial years from GST inception (FY 2017-18) up to FY 2026-27 (all 10 options) */
export const FINANCIAL_YEAR_OPTIONS: SelectOption[] = Array.from(
  { length: GST_END_YEAR - GST_START_YEAR + 1 },
  (_, index) => toOption(fyLabel(GST_START_YEAR + index))
)

export const FILING_FREQUENCY_OPTIONS = [
  { id: 'Monthly', label: 'Monthly' },
  { id: 'Quarterly', label: 'Quarterly' },
  { id: 'Annual', label: 'Annual' },
]

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/**
 * Months of an Indian Financial Year in chronological order (April to March)
 * along with whether the month falls in the second calendar year.
 */
export const FY_MONTH_CONFIG = [
  { name: 'April', isNextYear: false },
  { name: 'May', isNextYear: false },
  { name: 'June', isNextYear: false },
  { name: 'July', isNextYear: false },
  { name: 'August', isNextYear: false },
  { name: 'September', isNextYear: false },
  { name: 'October', isNextYear: false },
  { name: 'November', isNextYear: false },
  { name: 'December', isNextYear: false },
  { name: 'January', isNextYear: true },
  { name: 'February', isNextYear: true },
  { name: 'March', isNextYear: true },
] as const

/** Parse starting calendar year and ending year from a financial year string like 'FY 2025-26' or '2025-26' */
export const parseFinancialYear = (
  fyString?: string
): { startYear: number; endYear: number; fyShort: string } => {
  const match = fyString?.match(/(\d{4})/)
  const startYear = match ? parseInt(match[1], 10) : (currentFyStart || 2025)
  const endYear = startYear + 1
  const fyShort = fyLabel(startYear)
  return { startYear, endYear, fyShort }
}

/**
 * Monthly period options starting from April (startYear) up to March (endYear).
 * Example for FY 2025-26: 'April 2025', 'May 2025', ... 'March 2026'
 */
export const getMonthlyPeriodOptions = (financialYear?: string): SelectOption[] => {
  const { startYear, endYear } = parseFinancialYear(financialYear)
  return FY_MONTH_CONFIG.map(({ name, isNextYear }) => {
    const year = isNextYear ? endYear : startYear
    return toOption(`${name} ${year}`)
  })
}

/**
 * Quarterly period options for the financial year.
 * Example for FY 2025-26:
 * Q1 (Apr-Jun 2025), Q2 (Jul-Sep 2025), Q3 (Oct-Dec 2025), Q4 (Jan-Mar 2026)
 */
export const getQuarterlyPeriodOptions = (financialYear?: string): SelectOption[] => {
  const { startYear, endYear } = parseFinancialYear(financialYear)
  return [
    `Q1 (Apr-Jun ${startYear})`,
    `Q2 (Jul-Sep ${startYear})`,
    `Q3 (Oct-Dec ${startYear})`,
    `Q4 (Jan-Mar ${endYear})`,
  ].map(toOption)
}

/**
 * Annual period option for the financial year.
 * Example for FY 2025-26: 'FY 2025-26(Full Year Return)'
 */
export const getAnnualPeriodOptions = (financialYear?: string): SelectOption[] => {
  const { fyShort } = parseFinancialYear(financialYear)
  return [toOption(`${fyShort}(Full Year Return)`)]
}

/**
 * Returns dynamic period options based on frequency and selected financial year.
 * Automatically computes correct years without needing hardcoded lists for future years.
 */
export const getPeriodOptionsByFrequencyAndYear = (
  frequency: string,
  financialYear?: string
): SelectOption[] => {
  switch (frequency) {
    case 'Quarterly':
      return getQuarterlyPeriodOptions(financialYear)
    case 'Annual':
      return getAnnualPeriodOptions(financialYear)
    case 'Monthly':
    default:
      return getMonthlyPeriodOptions(financialYear)
  }
}

/**
 * Seamlessly adapts a previously selected period (e.g. 'April 2025' or 'Q1 (Apr-Jun 2025)')
 * to a new financial year (e.g. 'April 2024' or 'Q1 (Apr-Jun 2024)').
 */
export const remapPeriodToFinancialYear = (
  prevPeriod: string,
  newFinancialYear: string,
  frequency: string
): string => {
  if (!prevPeriod) return ''
  const options = getPeriodOptionsByFrequencyAndYear(frequency, newFinancialYear)
  if (options.length === 0) return ''

  if (frequency === 'Annual') {
    return options[0]?.value || ''
  }

  if (frequency === 'Monthly') {
    const monthMatch = prevPeriod.match(/^[A-Za-z]+/)
    if (monthMatch) {
      const monthName = monthMatch[0]
      const matched = options.find((opt) => opt.value.startsWith(monthName))
      if (matched) return matched.value
    }
  }

  if (frequency === 'Quarterly') {
    const quarterMatch = prevPeriod.match(/^Q[1-4]/i)
    if (quarterMatch) {
      const qPrefix = quarterMatch[0].toUpperCase()
      const matched = options.find((opt) => opt.value.startsWith(qPrefix))
      if (matched) return matched.value
    }
  }

  if (options.some((opt) => opt.value === prevPeriod)) {
    return prevPeriod
  }

  return ''
}

/** Default monthly options for current financial year */
export const MONTHLY_PERIOD_OPTIONS: SelectOption[] = getMonthlyPeriodOptions(CURRENT_FINANCIAL_YEAR)

/** Default quarterly options for current financial year */
export const QUARTERLY_PERIOD_OPTIONS: SelectOption[] = getQuarterlyPeriodOptions(CURRENT_FINANCIAL_YEAR)

/** Default annual options for current financial year */
export const ANNUAL_PERIOD_OPTIONS: SelectOption[] = getAnnualPeriodOptions(CURRENT_FINANCIAL_YEAR)

export const RETURN_PERIOD_OPTIONS: SelectOption[] = [
  ...MONTHLY_PERIOD_OPTIONS,
  ...QUARTERLY_PERIOD_OPTIONS,
]

export const RETURN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'gstr1', label: 'GSTR-1 (Outward Supplies)' },
  { value: 'gstr3b', label: 'GSTR-3B (Monthly Summary)' },
]

export const FILING_TYPE_OPTIONS = [
  {
    id: 'regular' as const,
    title: 'Regular Return',
    description: 'File your GST return with actual details',
  },
  {
    id: 'nil' as const,
    title: 'Nil Return',
    description: 'File a nil return if you have no business activity',
  },
]

export const TAX_CALCULATION_METHOD_OPTIONS = [
  {
    id: 'ca_calculate' as const,
    title: 'Let TaxEdge CA calculate from documents',
    description: 'Upload your invoices & GSTR-2B; our CA computes sales, purchases & ITC',
  },
  {
    id: 'estimated_figures' as const,
    title: 'I already have estimated figures (Optional)',
    description: 'Quickly provide estimated sales, purchases, or ITC summary',
  },
]
