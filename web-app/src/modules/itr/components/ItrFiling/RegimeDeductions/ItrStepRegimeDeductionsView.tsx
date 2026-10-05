import React, { useMemo, useState } from 'react'
import { StepActionBar } from '@shared/components'
import { calculateItrTax } from '../itrTaxCalculator'
import { ItrStepHeaderStepper } from '../ItrStepHeaderStepper'
import { ItrOldRegimeDeductionsForm } from './ItrOldRegimeDeductionsForm'
import { ItrRegimeCompareTable } from './ItrRegimeCompareTable'
import type {
  SalaryDetails,
  HousePropertyDetails,
  BusinessDetails,
  CapitalGainsDetails,
  OtherSourcesDetails,
  DeductionsData,
} from '../itrFiling.constants'
import './ItrStepRegimeDeductionsView.css'

export type { DeductionsData }

/* ==========================================================================
   2. Regime Cards Selector
   ========================================================================== */
interface ItrRegimeCardsSelectorProps {
  selectedRegime: 'new' | 'old' | ''
  onRegimeChange: (regime: 'new' | 'old') => void
}

const ItrRegimeCardsSelector: React.FC<ItrRegimeCardsSelectorProps> = ({
  selectedRegime,
  onRegimeChange,
}) => (
  <div className="itr-step-card">
    <div className="itr-sources-header">
      <h2 className="itr-sources-title">Your Regime Selection</h2>
    </div>

    <div className="itr-regime-options" role="radiogroup" aria-label="Tax Regime Selection">
      {/* New Tax Regime */}
      <div
        className={`itr-regime-card ${selectedRegime === 'new' ? 'itr-regime-card--selected' : ''}`}
        onClick={() => onRegimeChange('new')}
        role="radio"
        aria-checked={selectedRegime === 'new'}
        tabIndex={0}
      >
        <div className="itr-regime-card__top">
          <div className="itr-regime-radio-title">
            <div className="itr-radio-outer">
              {selectedRegime === 'new' && <div className="itr-radio-inner" />}
            </div>
            <span className="itr-regime-name">New Tax Regime (Default)</span>
          </div>
          <span className="itr-regime-tag">AY 2026-2027 Slabs</span>
        </div>
        <ul className="itr-regime-bullets">
          <li>Lower tax slab rates across income brackets.</li>
          <li>Standard deduction of ₹75,000 for salaried employees automatically applied.</li>
          <li>Section 87A rebate covers taxable income up to ₹7,00,000 (tax liability is ₹0).</li>
        </ul>
      </div>

      {/* Old Tax Regime */}
      <div
        className={`itr-regime-card ${selectedRegime === 'old' ? 'itr-regime-card--selected' : ''}`}
        onClick={() => onRegimeChange('old')}
        role="radio"
        aria-checked={selectedRegime === 'old'}
        tabIndex={0}
      >
        <div className="itr-regime-card__top">
          <div className="itr-regime-radio-title">
            <div className="itr-radio-outer">
              {selectedRegime === 'old' && <div className="itr-radio-inner" />}
            </div>
            <span className="itr-regime-name">Old Tax Regime</span>
          </div>
          <span className="itr-regime-tag">With Deductions</span>
        </div>
        <ul className="itr-regime-bullets">
          <li>Standard deduction of ₹50,000 for salaried employees.</li>
          <li>Claim 80C deductions (EPF, PPF, LIC, ELSS, Housing loan principal up to ₹1.5L).</li>
          <li>Claim 80D health insurance &amp; 24(b) home loan interest (up to ₹2L).</li>
        </ul>
      </div>
    </div>
  </div>
)

/* ==========================================================================
   3. Main Step 3 View
   ========================================================================== */
export interface ItrStepRegimeDeductionsViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  selectedSources?: string[]
  salaryDetails: SalaryDetails
  housePropertyDetails?: HousePropertyDetails
  businessDetails?: BusinessDetails
  capitalGainsDetails?: CapitalGainsDetails
  otherSourcesDetails?: OtherSourcesDetails
  selectedRegime: 'new' | 'old' | ''
  onRegimeChange: (regime: 'new' | 'old') => void
  deductions: DeductionsData
  onDeductionsChange: (deductions: DeductionsData) => void
}

export const ItrStepRegimeDeductionsView: React.FC<ItrStepRegimeDeductionsViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  selectedSources = [],
  salaryDetails,
  housePropertyDetails,
  businessDetails,
  capitalGainsDetails,
  otherSourcesDetails,
  selectedRegime,
  onRegimeChange,
  deductions,
  onDeductionsChange,
}) => {
  const hasExistingDeductions = Boolean(
    deductions.epf ||
    deductions.ppf ||
    deductions.lic ||
    deductions.elss ||
    deductions.childrenTuition ||
    deductions.housingLoanPrincipal ||
    deductions.selfInsurance ||
    deductions.parentInsurance ||
    deductions.homeLoanInterest24b ||
    deductions.otherDeductions
  )

  const [claimDeductions, setClaimDeductions] = useState<boolean | null>(
    hasExistingDeductions ? true : null
  )

  const calculation = useMemo(() => {
    return calculateItrTax({
      selectedSources,
      salaryDetails,
      housePropertyDetails,
      businessDetails,
      capitalGainsDetails,
      otherSourcesDetails,
      selectedRegime,
      deductions,
    })
  }, [
    selectedSources,
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    selectedRegime,
    deductions,
  ])

  const handleChange = (field: keyof DeductionsData, val: string | boolean) => {
    onDeductionsChange({ ...deductions, [field]: val })
  }

  const hasDeductionsFilled = Boolean(
    deductions.epf?.trim() ||
    deductions.ppf?.trim() ||
    deductions.lic?.trim() ||
    deductions.elss?.trim() ||
    deductions.childrenTuition?.trim() ||
    deductions.housingLoanPrincipal?.trim() ||
    deductions.selfInsurance?.trim() ||
    deductions.parentInsurance?.trim() ||
    deductions.homeLoanInterest24b?.trim() ||
    deductions.otherDeductions?.trim()
  )

  const isStep3Valid = Boolean(
    selectedRegime === 'new' ||
    (selectedRegime === 'old' &&
      ((claimDeductions === true && hasDeductionsFilled) || claimDeductions === false))
  )

  return (
    <div className="itr-step-view-container">
      <ItrStepHeaderStepper currentStepId={3} />

      <ItrRegimeCompareTable calculation={calculation} />

      <ItrRegimeCardsSelector
        selectedRegime={selectedRegime}
        onRegimeChange={onRegimeChange}
      />

      {selectedRegime === 'old' && (
        <ItrOldRegimeDeductionsForm
          claimDeductions={claimDeductions}
          setClaimDeductions={setClaimDeductions}
          deductions={deductions}
          onChange={handleChange}
        />
      )}

      {selectedRegime === 'new' && (
        <div className="itr-regime-info-box">
          <div className="itr-regime-info-icon" aria-hidden="true">ℹ</div>
          <div className="itr-regime-info-text">
            <strong>Deductions Under New Tax Regime</strong>
            Most Chapter VI-A deductions (Section 80C, 80D, 24b) are not available under the New Tax Regime. Eligible salaried taxpayers receive the applicable standard deduction of ₹75,000 automatically.
          </div>
        </div>
      )}

      <StepActionBar
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isStep3Valid}
      />
    </div>
  )
}

export default ItrStepRegimeDeductionsView
