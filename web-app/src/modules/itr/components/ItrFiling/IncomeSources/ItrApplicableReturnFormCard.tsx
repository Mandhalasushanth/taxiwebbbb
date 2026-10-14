import React from 'react'
import { Sparkles } from 'lucide-react'
import type {
  SalaryDetails,
  HousePropertyDetails,
  BusinessDetails,
  CapitalGainsDetails,
  OtherSourcesDetails,
  ResidentialStatusOption,
  ItrCategoryId,
} from '../itrFiling.constants'

export interface ApplicableReturnFormDetails {
  form: 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4'
  reason: string
  criteria: string[]
}

export function determineApplicableItrForm({
  selectedSources = [],
  selectedCategoryId,
  salaryDetails,
  housePropertyDetails,
  businessDetails,
  capitalGainsDetails,
  residentialStatus,
}: {
  selectedSources?: string[]
  selectedCategoryId?: ItrCategoryId | null
  salaryDetails?: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  residentialStatus?: ResidentialStatusOption
}): ApplicableReturnFormDetails {
  const hasSalary = selectedSources.includes('salary')
  const hasHouse = selectedSources.includes('house_property')
  const hasBusiness = selectedSources.includes('business')
  const hasCapital = selectedSources.includes('capital_gains')
  const hasOther = selectedSources.includes('other_sources')

  // Parse numeric values safely ONLY for currently selected sources
  const grossSalary = hasSalary
    ? parseFloat(salaryDetails?.grossSalary?.replace(/,/g, '') || '0')
    : 0
  const rentReceived = hasHouse
    ? parseFloat(housePropertyDetails?.annualRentReceived?.replace(/,/g, '') || '0')
    : 0
  const totalIncomeOver50L = grossSalary > 5000000 || rentReceived > 5000000

  // F&O is only active if Capital Gains is actively selected
  const hasFoOrIntraday =
    hasCapital &&
    (Boolean(capitalGainsDetails?.assetTypes?.includes('F&O & Intraday Trading')) ||
      (selectedCategoryId === 'trader' &&
        (!capitalGainsDetails?.assetTypes ||
          capitalGainsDetails.assetTypes.length === 0 ||
          capitalGainsDetails.assetTypes.includes('F&O & Intraday Trading'))))

  // Regular books of account for business
  const isRegularBusiness =
    hasBusiness && businessDetails?.reportingMethod === 'regular'

  // If no source is selected yet, provide neutral ITR-1 guideline
  if (selectedSources.length === 0) {
    return {
      form: 'ITR-1',
      reason: 'Select your income sources above to see your applicable return form.',
      criteria: [
        'Resident individual',
        'Select income sources above to determine exact ITR form',
        'Forms ITR-1, ITR-2, ITR-3, or ITR-4 will auto-apply',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 1. ITR-3:
  //    - F&O or Intraday trading activity
  //    - Business + Capital Gains combined (e.g. All sources, or Salary + House + Business + Capital)
  //    - Business with regular books of accounts
  // -------------------------------------------------------------------------
  if (hasFoOrIntraday) {
    return {
      form: 'ITR-3',
      reason: 'Based on your F&O or Intraday trading activity, ITR-3 applies.',
      criteria: [
        'F&O / Intraday trading activity detected (taxed as business income)',
        'Mandatory filing under ITR-3 as per Income Tax Department rules',
        'Resident individual',
      ],
    }
  }

  if (hasBusiness && hasCapital) {
    return {
      form: 'ITR-3',
      reason: 'Based on your F&O or Intraday trading activity, ITR-3 applies.',
      criteria: [
        'Business or profession combined with capital gains declared',
        'Mandatory filing under ITR-3 as per Income Tax Department rules',
        'Resident individual',
      ],
    }
  }

  if (isRegularBusiness) {
    return {
      form: 'ITR-3',
      reason: 'Based on business or professional income with regular books of accounts, ITR-3 applies.',
      criteria: [
        'Business or professional income declared with regular books',
        'Mandatory filing under ITR-3 as per Income Tax Department rules',
        'Resident individual',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 2. ITR-4:
  //    - Business / Profession declared without capital gains
  //    - Covers:
  //        * Business alone
  //        * Salary + Business
  //        * House Property + Business
  //        * Salary + House Property + Business
  //        * Salary + House Property + Business + Other Sources
  // -------------------------------------------------------------------------
  if (hasBusiness) {
    const is44ADA =
      businessDetails?.reportingMethod === '44ADA' || selectedCategoryId === 'professional'
    return {
      form: 'ITR-4',
      reason:
        'Based on presumptive business or professional income under Section 44AD / 44ADA up to ₹50 Lakhs, ITR-4 applies.',
      criteria: [
        is44ADA
          ? 'Presumptive taxation selected (Section 44ADA)'
          : 'Presumptive taxation selected (Section 44AD / 44ADA)',
        'No capital gains or trading income',
        'Total income is within statutory threshold (<= ₹50 Lakhs)',
        'Resident individual status confirmed',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 3. ITR-2:
  //    - Capital Gains selected (without business, without F&O)
  //    - Total gross income exceeds ₹50 Lakhs (e.g. rent > ₹50L or salary > ₹50L)
  //    - Non-resident (NRI / RNOR)
  // -------------------------------------------------------------------------
  if (
    hasCapital ||
    totalIncomeOver50L ||
    residentialStatus === 'nri' ||
    residentialStatus === 'rnor'
  ) {
    if (totalIncomeOver50L) {
      return {
        form: 'ITR-2',
        reason: 'Based on total income exceeding ₹50 Lakhs, ITR-2 applies.',
        criteria: [
          'No business or professional income declared',
          'Total gross income exceeds ₹50 Lakhs',
          'Resident individual status',
        ],
      }
    }
    if (residentialStatus === 'nri' || residentialStatus === 'rnor') {
      return {
        form: 'ITR-2',
        reason: 'Based on non-resident / RNOR residential status, ITR-2 applies.',
        criteria: [
          'Non-resident or RNOR status declared',
          'ITR-1 is not permitted for non-resident status',
          'Mandatory filing under ITR-2',
        ],
      }
    }
    const hasVda = Boolean(hasCapital && capitalGainsDetails?.assetTypes?.includes('Crypto / VDA'))
    return {
      form: 'ITR-2',
      reason: 'Based on your capital gains without business income, ITR-2 applies.',
      criteria: [
        'No business or professional income declared',
        'Capital gains from investments or property declared',
        hasVda
          ? 'Virtual Digital Assets (Crypto / VDA) declared'
          : 'Resident individual status',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 4. ITR-1:
  //    - Salary / Pension
  //    - House Property (single property <= ₹50 Lakhs)
  //    - Other Sources (interest, dividends <= ₹50 Lakhs)
  //    - Combinations of Salary + House Property + Other Sources
  // -------------------------------------------------------------------------
  return {
    form: 'ITR-1',
    reason:
      'Based on your salary and interest income up to ₹50 Lakhs as a resident, ITR-1 applies.',
    criteria: [
      hasOther && !hasSalary && !hasHouse
        ? 'Other sources income declared'
        : hasHouse && !hasSalary
        ? 'Single house property income declared'
        : 'Salary / Pension income declared',
      'No business or professional income declared',
      'No capital gains or trading declared',
      'Resident individual with income <= ₹50 Lakhs',
    ],
  }
}

export interface ItrApplicableReturnFormCardProps {
  selectedSources?: string[]
  selectedCategoryId?: ItrCategoryId | null
  salaryDetails?: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  residentialStatus?: ResidentialStatusOption
}

export const ItrApplicableReturnFormCard: React.FC<ItrApplicableReturnFormCardProps> = (props) => {
  const formInfo = determineApplicableItrForm(props)

  return (
    <div className="itr-applicable-card">
      <div className="itr-applicable-card__header">
        <div className="itr-applicable-card__title-wrap">
          <span className="itr-applicable-card__sparkle" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <h2 className="itr-applicable-card__title">Applicable Return Form</h2>
        </div>
        <span className="itr-applicable-card__badge">{formInfo.form}</span>
      </div>

      <p className="itr-applicable-card__desc">{formInfo.reason}</p>

      <div className="itr-applicable-card__checklist">
        {formInfo.criteria.map((item) => (
          <div key={item} className="itr-applicable-card__check-item">
            <span className="itr-check-circle-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="itr-applicable-card__check-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
