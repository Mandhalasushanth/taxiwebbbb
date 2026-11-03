import type { FilingPeriodData } from '../components/GSTFiling/GSTFilingPeriod/GSTFilingPeriod'

export interface TaxComputationItem {
  particulars: string
  amount: number | null
}

export interface DocumentSummaryItem {
  id: string
  label: string
  completed: number
  total: number
  type: 'required' | 'if_applicable' | 'recommended' | 'optional'
  status?: 'verified' | 'not_added' | 'not_applicable' | 'pending'
  statusText?: string
}

export interface ReviewDetailsData {
  gstin: string
  businessName: string
  financialYear: string
  filingPeriod: string
  scheme: string
  frequency: string
  filingType: string
  returnForm: string
  calculationMethod?: string
  attachedDocsCount: number
}

const DEFAULT_REVIEW_DETAILS = {
  scheme: 'Regular Scheme',
  frequency: 'Monthly',
  filingType: 'Regular Return',
  returnForm: 'combo',
}

const TAX_COMPUTATION_LABELS = ['Gross Taxable Turnover', 'Output GST', 'Eligible ITC (GSTR-2B)']

/**
 * Tax figures are computed by the TaxEdge CA from the uploaded documents, so they are
 * shown as pending (null) until then. A nil return has no liability.
 */
export const getTaxComputationRows = (isNilReturn: boolean): { items: TaxComputationItem[]; netLiability: number | null } => ({
  items: TAX_COMPUTATION_LABELS.map((particulars) => ({ particulars, amount: isNilReturn ? 0 : null })),
  netLiability: isNilReturn ? 0 : null,
})

export const WHAT_HAPPENS_NEXT_STEPS = [
  { step: 1, text: 'Review your details and tax computation' },
  { step: 2, text: 'Submit your filing application' },
  { step: 3, text: 'We will file your GST return with the government' },
  { step: 4, text: 'You will receive a confirmation and ARN' },
]

export interface ReconciledTaxFigures {
  turnover: number
  purchases: number
  outputGst: number
  eligibleItc: number
  netLiability: number
}

export const getReconciledTaxComputation = (
  filingData?: Partial<FilingPeriodData>
): ReconciledTaxFigures => {
  if (filingData?.filingType === 'nil' || filingData?.returnType === 'nil') {
    return {
      turnover: 0,
      purchases: 0,
      outputGst: 0,
      eligibleItc: 0,
      netLiability: 0,
    }
  }

  const rawSales = filingData?.estimatedSales ? Number(filingData.estimatedSales.replace(/,/g, '')) : NaN
  const turnover = !isNaN(rawSales) && rawSales >= 0
    ? rawSales
    : (filingData?.calculationMethod === 'estimated_figures' ? 0 : 866598)

  const rawPurchases = filingData?.estimatedPurchases ? Number(filingData.estimatedPurchases.replace(/,/g, '')) : NaN
  const purchases = !isNaN(rawPurchases) && rawPurchases >= 0
    ? rawPurchases
    : (filingData?.calculationMethod === 'estimated_figures' ? 0 : 452300)

  const outputGst = Math.round(turnover * 0.18)

  const rawItc = filingData?.estimatedItc ? Number(filingData.estimatedItc.replace(/,/g, '')) : NaN
  const eligibleItc = !isNaN(rawItc) && rawItc >= 0
    ? rawItc
    : (filingData?.calculationMethod === 'estimated_figures' ? 0 : 78976)

  const netLiability = Math.max(0, outputGst - eligibleItc)

  return {
    turnover,
    purchases,
    outputGst,
    eligibleItc,
    netLiability,
  }
}

export const getResolvedReviewDetails = (
  filingData?: Partial<FilingPeriodData>,
  attachedDocsCount?: number
): ReviewDetailsData => {
  const isNil = filingData?.filingType === 'nil' || (filingData?.filingType !== 'regular' && filingData?.returnType === 'nil')

  // Format financial year (e.g. FY 2025-26 or FY 2023-24)
  const rawFy = filingData?.financialYear?.trim() || '2025-26'
  const fyClean = rawFy.replace(/^FY\s*/i, '')
  const financialYear = `FY ${fyClean}`

  // Format filing frequency (e.g. Annual, Monthly, Quarterly)
  const rawFreq = filingData?.frequency?.trim() || 'Monthly'
  const frequency = rawFreq.charAt(0).toUpperCase() + rawFreq.slice(1).toLowerCase()

  // Format filing period (matching Image 1 & Image 2)
  let period = filingData?.selectedMonth?.trim() || ''
  if (frequency.toLowerCase() === 'annual' || !period) {
    period = `FY ${fyClean} (Full Year Return)`
  } else if (!period.includes('20')) {
    const startYearMatch = fyClean.match(/\d{4}/)
    const startYear = startYearMatch ? startYearMatch[0] : '2025'
    period = `${period} ${startYear}`
  }

  // Return Form (e.g. GSTR-3B or GSTR-1)
  const rawForm = (filingData?.returnType?.toLowerCase() || '') === 'nil'
    ? 'gstr1'
    : (filingData?.returnType?.toLowerCase() || (isNil ? 'gstr1' : 'gstr3b'))
  const returnForm = rawForm === 'gstr1' ? 'GSTR-1' : 'GSTR-3B'

  // Tax Calculation Method
  const calculationMethod = filingData?.calculationMethod === 'ca_calculate'
    ? 'Let TaxEdge CA calculate from documents'
    : 'Self-estimated figures'

  return {
    gstin: filingData?.gstin?.trim() || '29AAAAA0000A1Z5',
    businessName: filingData?.businessName?.trim() || 'Shree Deshmukh Traders',
    financialYear,
    filingPeriod: period,
    scheme: DEFAULT_REVIEW_DETAILS.scheme,
    frequency,
    filingType: isNil ? 'Nil Return' : 'Regular Return',
    returnForm,
    calculationMethod,
    attachedDocsCount: isNil ? 0 : (attachedDocsCount !== undefined ? attachedDocsCount : 0),
  }
}
