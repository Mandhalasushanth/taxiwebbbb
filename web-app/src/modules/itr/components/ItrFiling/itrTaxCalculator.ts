import type {
  SalaryDetails, HousePropertyDetails, BusinessDetails, CapitalGainsDetails,
  OtherSourcesDetails, DeductionsData,
} from './itrFiling.constants'

export const parseAmount = (val?: string | number | null): number => {
  try {
    if (val === null || val === undefined) return 0
    if (typeof val === 'number') return isNaN(val) ? 0 : val
    const str = String(val).trim()
    if (!str) return 0
    const num = parseFloat(str.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? 0 : num
  } catch {
    return 0
  }
}

export const formatINR = (val: number): string => {
  try {
    return val === 0 ? '₹ 0' : `₹ ${val.toLocaleString('en-IN')}`
  } catch {
    return `₹ ${val}`
  }
}

const OLD_REGIME_SLABS: Array<[number, number, number]> = [
  [250000, 500000, 0.05], [500000, 1000000, 0.20], [1000000, Infinity, 0.30],
]

const NEW_REGIME_SLABS: Array<[number, number, number]> = [
  [400000, 800000, 0.05], [800000, 1200000, 0.10], [1200000, 1600000, 0.15],
  [1600000, 2000000, 0.20], [2000000, 2400000, 0.25], [2400000, Infinity, 0.30],
]

const computeProgressiveSlabTax = (
  taxableIncome: number, slabs: Array<[number, number, number]>, rebateLimit: number
): number => {
  try {
    if (taxableIncome <= rebateLimit) return 0
    const tax = slabs.reduce((acc, [low, high, rate]) => (taxableIncome > low ? acc + (Math.min(taxableIncome, high) - low) * rate : acc), 0)
    return Math.round(tax)
  } catch {
    return 0
  }
}

export function computeOldRegimeTax(taxableIncome: number): number {
  return computeProgressiveSlabTax(taxableIncome, OLD_REGIME_SLABS, 500000)
}

export function computeNewRegimeTax(taxableIncome: number): number {
  return computeProgressiveSlabTax(taxableIncome, NEW_REGIME_SLABS, 1200000)
}

export interface ItrTaxCalculationParams {
  selectedSources?: string[]
  salaryDetails?: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  selectedRegime?: 'new' | 'old' | ''
  deductions?: DeductionsData
}

export interface ItrTaxCalculationResult {
  grossTotalIncome: number
  salaryIncome: number
  hpIncome: number
  bizIncome: number
  cgIncome: number
  otherIncome: number
  stdDeduction: number
  totalChapterVIDeductions: number
  netTaxableIncome: number
  grossTax: number
  cess: number
  totalTaxLiability: number
  tdsCredits: number
  netTaxPayable: number
  refundDue: number
  newRegime: { grossTotalIncome: number; totalDeductions: number; taxableIncome: number; taxPayable: number }
  oldRegime: { grossTotalIncome: number; totalDeductions: number; taxableIncome: number; taxPayable: number }
}

const computeHousePropertyNet = (details?: HousePropertyDetails): number => {
  try {
    if (!details) return 0
    if (details.propertyType === 'self_occupied') return -Math.min(parseAmount(details.homeLoanInterest), 200000)
    const rent = parseAmount(details.annualRentReceived)
    const municipalTax = parseAmount(details.municipalTaxPaid)
    const netAnnualVal = Math.max(0, rent - municipalTax)
    return netAnnualVal - netAnnualVal * 0.3 - parseAmount(details.homeLoanInterest)
  } catch {
    return 0
  }
}

const computeBusinessNet = (details?: BusinessDetails): number => {
  try {
    if (!details) return 0
    const declaredProfit = parseAmount(details.declaredNetProfit)
    if (declaredProfit > 0) return declaredProfit
    const turnover = parseAmount(details.grossTurnover)
    if (turnover <= 0) return 0
    return turnover * (details.reportingMethod === '44ADA' ? 0.5 : 0.08)
  } catch {
    return 0
  }
}

export function calculateItrTax(params: ItrTaxCalculationParams): ItrTaxCalculationResult {
  try {
    const selected = params.selectedSources || []
    const salaryIncome = selected.includes('salary') && params.salaryDetails ? Math.max(0, parseAmount(params.salaryDetails.grossSalary) - parseAmount(params.salaryDetails.exemptAllowances)) : 0
    const hpIncome = selected.includes('house_property') ? computeHousePropertyNet(params.housePropertyDetails) : 0
    const bizIncome = selected.includes('business') ? computeBusinessNet(params.businessDetails) : 0
    const cgIncome = selected.includes('capital_gains') && params.capitalGainsDetails ? parseAmount(params.capitalGainsDetails.stcg) + parseAmount(params.capitalGainsDetails.ltcg) : 0
    const otherIncome = selected.includes('other_sources') && params.otherSourcesDetails ? parseAmount(params.otherSourcesDetails.interestIncome) + parseAmount(params.otherSourcesDetails.dividendIncome) + parseAmount(params.otherSourcesDetails.otherIncome) : 0

    const grossTotalIncome = Math.max(0, salaryIncome + bizIncome + cgIncome + otherIncome + hpIncome)
    const hasSalary = selected.includes('salary') && salaryIncome > 0
    const stdDeductionNew = hasSalary ? Math.min(salaryIncome, 75000) : 0
    const stdDeductionOld = hasSalary ? Math.min(salaryIncome, 50000) : 0

    let section80C = 0, section80D = 0, homeLoan24b = 0
    if (params.deductions) {
      section80C = parseAmount(params.deductions.section80C) || Math.min(
        [params.deductions.epf, params.deductions.ppf, params.deductions.lic, params.deductions.elss, params.deductions.childrenTuition, params.deductions.housingLoanPrincipal]
          .reduce((acc, v) => acc + parseAmount(v), 0), 150000
      )
      section80D = parseAmount(params.deductions.section80D) || Math.min(parseAmount(params.deductions.selfInsurance) + parseAmount(params.deductions.parentInsurance), params.deductions.parentsSeniorCitizen ? 75000 : 50000)
      if (!selected.includes('house_property')) homeLoan24b = Math.min(parseAmount(params.deductions.homeLoanInterest24b), 200000)
    }

    const totalChapterVIDeductions = Math.min(section80C + section80D + homeLoan24b, Math.max(0, grossTotalIncome - stdDeductionOld))
    const taxableNew = Math.max(0, grossTotalIncome - stdDeductionNew)
    const baseTaxNew = computeNewRegimeTax(taxableNew)
    const taxPayableNew = Math.round(baseTaxNew * 1.04)

    const taxableOld = Math.max(0, grossTotalIncome - stdDeductionOld - totalChapterVIDeductions)
    const baseTaxOld = computeOldRegimeTax(taxableOld)
    const taxPayableOld = Math.round(baseTaxOld * 1.04)

    const regime = params.selectedRegime || 'new'
    const activeStdDeduction = regime === 'new' ? stdDeductionNew : stdDeductionOld
    const activeChapterVIDeductions = regime === 'new' ? 0 : totalChapterVIDeductions
    const activeNetTaxableIncome = regime === 'new' ? taxableNew : taxableOld
    const activeGrossTax = regime === 'new' ? baseTaxNew : baseTaxOld
    const activeCess = Math.round(activeGrossTax * 0.04)
    const activeTotalLiability = activeGrossTax + activeCess
    const tdsCredits = selected.includes('salary') && params.salaryDetails ? parseAmount(params.salaryDetails.tdsDeducted) : 0

    return {
      grossTotalIncome, salaryIncome, hpIncome, bizIncome, cgIncome, otherIncome,
      stdDeduction: activeStdDeduction, totalChapterVIDeductions: activeChapterVIDeductions,
      netTaxableIncome: activeNetTaxableIncome, grossTax: activeGrossTax, cess: activeCess,
      totalTaxLiability: activeTotalLiability, tdsCredits,
      netTaxPayable: Math.max(0, activeTotalLiability - tdsCredits), refundDue: Math.max(0, tdsCredits - activeTotalLiability),
      newRegime: { grossTotalIncome, totalDeductions: stdDeductionNew, taxableIncome: taxableNew, taxPayable: taxPayableNew },
      oldRegime: { grossTotalIncome, totalDeductions: stdDeductionOld + totalChapterVIDeductions, taxableIncome: taxableOld, taxPayable: taxPayableOld },
    }
  } catch {
    return {
      grossTotalIncome: 0, salaryIncome: 0, hpIncome: 0, bizIncome: 0, cgIncome: 0, otherIncome: 0,
      stdDeduction: 0, totalChapterVIDeductions: 0, netTaxableIncome: 0, grossTax: 0, cess: 0,
      totalTaxLiability: 0, tdsCredits: 0, netTaxPayable: 0, refundDue: 0,
      newRegime: { grossTotalIncome: 0, totalDeductions: 0, taxableIncome: 0, taxPayable: 0 },
      oldRegime: { grossTotalIncome: 0, totalDeductions: 0, taxableIncome: 0, taxPayable: 0 },
    }
  }
}
