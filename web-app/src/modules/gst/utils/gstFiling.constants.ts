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

/** Checks if the user has entered any text or selected any option */
export const hasUserEnteredFilingData = (
  current?: Partial<FilingPeriodData> | null,
  defaults?: Partial<FilingPeriodData> | null
): boolean => {
  if (!current) return false

  // 1. User selected an option from dropdowns / chips
  if (Boolean(current.financialYear && current.financialYear.trim())) return true
  if (Boolean(current.frequency && current.frequency.trim())) return true
  if (Boolean(current.selectedMonth && current.selectedMonth.trim())) return true
  if (Boolean(current.filingType && current.filingType.trim())) return true
  if (Boolean(current.returnType && current.returnType.trim() && current.returnType !== 'nil')) return true
  if (Boolean(current.calculationMethod && current.calculationMethod.trim())) return true

  // 2. User typed into any input field
  if (Boolean(current.estimatedSales && String(current.estimatedSales).trim())) return true
  if (Boolean(current.estimatedPurchases && String(current.estimatedPurchases).trim())) return true
  if (Boolean(current.estimatedItc && String(current.estimatedItc).trim())) return true
  if (Boolean(current.turnover && String(current.turnover).trim())) return true
  if (Boolean(current.taxAmount && String(current.taxAmount).trim())) return true

  // 3. User changed prefilled GSTIN or Business Name
  if (defaults) {
    const defaultGstin = (defaults.gstin || '').trim().toUpperCase()
    const currentGstin = (current.gstin || '').trim().toUpperCase()
    if (currentGstin && currentGstin !== defaultGstin) return true

    const defaultBiz = (defaults.businessName || '').trim()
    const currentBiz = (current.businessName || '').trim()
    if (currentBiz && currentBiz !== defaultBiz) return true
  }

  return false
}
