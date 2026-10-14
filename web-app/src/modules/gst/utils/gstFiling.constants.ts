import type { FilingPeriodData } from '@modules/gst/components/GSTFiling'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { CURRENT_FINANCIAL_YEAR, FINANCIAL_YEAR_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'

/** Fresh filing data, prefilled from the user's GST profile and the latest period */
export const getDefaultFilingData = (): FilingPeriodData => {
  const profile = gstProfileService.get()
  return {
    gstin: profile.gstin,
    businessName: profile.tradeName || profile.legalName,
    financialYear: CURRENT_FINANCIAL_YEAR || FINANCIAL_YEAR_OPTIONS[0]?.value || '',
    frequency: 'Monthly',
    selectedMonth: '',
    returnType: 'gstr1',
    baseFee: GST_FEES.filingGstr1,
    filingType: 'regular',
    calculationMethod: 'ca_calculate',
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
