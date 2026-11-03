import type { FilingPeriodData } from '@modules/gst/components/GSTFiling'
import { gstProfileService } from '@modules/gst/services/gstProfileService'

/** Fresh filing data with unselected/empty defaults for the user to choose */
export const getDefaultFilingData = (): FilingPeriodData => {
  const profile = gstProfileService.get()
  return {
    gstin: profile.gstin,
    businessName: profile.tradeName || profile.legalName,
    financialYear: '',
    frequency: '',
    selectedMonth: '',
    returnType: '',
    baseFee: 0,
    filingType: '',
    calculationMethod: '',
    estimatedSales: '',
    estimatedPurchases: '',
    estimatedItc: '',
  }
}

export const STEP_LABELS: Record<number, string> = {
  1: 'Period Selection',
  2: 'Upload Documents',
  3: 'Review & Figures',
}
