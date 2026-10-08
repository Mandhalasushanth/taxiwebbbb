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
  { step: 2, text: 'Approve and proceed to payment' },
  { step: 3, text: 'We will file your GST return with the government' },
  { step: 4, text: 'You will receive a confirmation and ARN' },
]

export interface ReconciledTaxFigures {
  turnover: number
  outputGst: number
  eligibleItc: number
  netLiability: number
}

export const getReconciledTaxComputation = (
  filingData?: Partial<FilingPeriodData>
): ReconciledTaxFigures => {
  if (filingData?.filingType === 'nil') {
    return {
      turnover: 0,
      outputGst: 0,
      eligibleItc: 0,
      netLiability: 0,
    }
  }

  const rawSales = filingData?.estimatedSales ? Number(filingData.estimatedSales.replace(/,/g, '')) : NaN
  const turnover = !isNaN(rawSales) && rawSales > 0 ? rawSales : 866598

  const outputGst = Math.round(turnover * 0.18)

  const rawItc = filingData?.estimatedItc ? Number(filingData.estimatedItc.replace(/,/g, '')) : NaN
  const eligibleItc = !isNaN(rawItc) && rawItc > 0 ? rawItc : 78976

  const netLiability = Math.max(0, outputGst - eligibleItc)

  return {
    turnover,
    outputGst,
    eligibleItc,
    netLiability,
  }
}

export const getResolvedReviewDetails = (
  filingData?: Partial<FilingPeriodData>,
  attachedDocsCount?: number
): ReviewDetailsData => {
  const fy = filingData?.financialYear?.trim() || 'FY 2025-26'
  const startYearMatch = fy.match(/\d{4}/)
  const startYear = startYearMatch ? startYearMatch[0] : '2025'

  let period = filingData?.selectedMonth?.trim() || 'August 2025'
  if (period && !period.includes('20') && startYear) {
    period = `${period} ${startYear}`
  }

  const rawForm = filingData?.returnType?.toLowerCase() || ''
  const returnForm =
    rawForm === 'gstr1'
      ? 'GSTR-1'
      : rawForm === 'gstr3b'
        ? 'GSTR-3B'
        : 'GSTR-3B'

  return {
    gstin: filingData?.gstin?.trim() || '29AAAAA0000A1Z5',
    businessName: filingData?.businessName?.trim() || 'Shree Deshmukh Traders',
    financialYear: fy,
    filingPeriod: period,
    scheme: DEFAULT_REVIEW_DETAILS.scheme,
    frequency: filingData?.frequency?.trim() || DEFAULT_REVIEW_DETAILS.frequency,
    filingType: filingData?.filingType === 'nil' ? 'Nil Return' : DEFAULT_REVIEW_DETAILS.filingType,
    returnForm,
    attachedDocsCount: attachedDocsCount && attachedDocsCount > 0 ? attachedDocsCount : 3,
  }
}

