import React, { useMemo, useState } from 'react'
import { StepActionBar } from '@shared/components'
import { calculateItrTax, type ItrTaxCalculationResult } from '../itrTaxCalculator'
import {
  ItrFilingHeaderStepper, type SalaryDetails, type HousePropertyDetails,
  type BusinessDetails, type CapitalGainsDetails, type OtherSourcesDetails, type DeductionsData,
} from '../itrFiling.constants'
import './ItrRegimeDeductionsView.css'

export type { DeductionsData }

const REGIME_OPTIONS: Array<{ id: 'new' | 'old'; name: string; tag: string; bullets: string[] }> = [
  {
    id: 'new', name: 'New Tax Regime (Default)', tag: 'AY 2026-2027 Slabs',
    bullets: ['Lower tax slab rates across income brackets.', 'Standard deduction of ₹75,000 for salaried employees automatically applied.', 'Section 87A rebate covers taxable income up to ₹7,00,000 (tax liability is ₹0).'],
  },
  {
    id: 'old', name: 'Old Tax Regime', tag: 'With Deductions',
    bullets: ['Standard deduction of ₹50,000 for salaried employees.', 'Claim 80C deductions (EPF, PPF, LIC, ELSS, Housing loan principal up to ₹1.5L).', 'Claim 80D health insurance & 24(b) home loan interest (up to ₹2L).'],
  },
]

const SECTION_80C_FIELDS: Array<{ id: string; label: string; placeholder: string; field: keyof DeductionsData }> = [
  { id: 'ded-epf', label: 'EPF (Employee Provident)', placeholder: 'Enter EPF amount', field: 'epf' },
  { id: 'ded-ppf', label: 'PPF (Public Provident)', placeholder: 'Enter PPF amount', field: 'ppf' },
  { id: 'ded-lic', label: 'Life Insurance (LIC)', placeholder: 'Enter LIC premium', field: 'lic' },
  { id: 'ded-elss', label: 'ELSS Tax-Saving Funds', placeholder: 'Enter ELSS amount', field: 'elss' },
  { id: 'ded-tuition', label: 'Children Tuition Fees', placeholder: 'Enter tuition fees', field: 'childrenTuition' },
  { id: 'ded-hlp', label: 'Housing Loan Principal', placeholder: 'Enter principal repaid', field: 'housingLoanPrincipal' },
]

export interface ItrRegimeCompareTableProps { calculation: ItrTaxCalculationResult }

export const ItrRegimeCompareTable: React.FC<ItrRegimeCompareTableProps> = ({ calculation }) => {
  const formatInr = (num: number): string => {
    try {
      return num.toLocaleString('en-IN')
    } catch {
      return String(num)
    }
  }

  const oldStdDed = calculation.oldRegime.grossTotalIncome > 0 && calculation.salaryIncome > 0 ? Math.min(calculation.salaryIncome, 50000) : 0

  return (
    <div className="itr-step-card">
      <div className="itr-compare-header">
        <div className="itr-compare-title-wrap"><span className="itr-compare-icon" aria-hidden="true">🔄</span><h2 className="itr-compare-title">Compare Tax Regimes</h2></div>
        <span className="itr-badge-ay">AY 2026-2027</span>
      </div>
      <p className="itr-compare-desc">Compare your estimated tax computation between the New and Old Tax Regimes for AY 2026-2027 before finalizing your selection.</p>
      <div className="itr-table-container">
        <table className="itr-compare-table" aria-label="Tax Regime Comparison Table">
          <thead>
            <tr>
              <th scope="col">TAX PARAMETER</th>
              <th scope="col" className="itr-table-col-right">NEW REGIME</th>
              <th scope="col" className="itr-table-col-right">OLD REGIME</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Gross Total Income</td><td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.grossTotalIncome)}</td><td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.grossTotalIncome)}</td></tr>
            <tr><td>Standard Deduction</td><td className="itr-table-col-right">- ₹ {formatInr(calculation.newRegime.totalDeductions)}</td><td className="itr-table-col-right">- ₹ {formatInr(oldStdDed)}</td></tr>
            <tr><td>Chapter VI-A Deductions</td><td className="itr-table-col-right itr-text-not-applicable">Not Applicable</td><td className="itr-table-col-right">- ₹ {formatInr(calculation.totalChapterVIDeductions)}</td></tr>
            <tr><td>Net Taxable Income</td><td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.taxableIncome)}</td><td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.taxableIncome)}</td></tr>
            <tr><td>Estimated Tax Liability</td><td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.taxPayable)}</td><td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.taxPayable)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface CurrencyInputProps {
  id: string
  placeholder: string
  field: keyof DeductionsData
  value: string
  onChange: (field: keyof DeductionsData, val: string | boolean) => void
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ id, placeholder, field, value, onChange }) => (
  <div className="itr-input-currency-wrap">
    <span className="itr-currency-prefix">₹</span>
    <input id={id} type="text" inputMode="numeric" maxLength={14} className="itr-input-currency" placeholder={placeholder} value={value} onChange={(e) => onChange(field, e.target.value.replace(/[^0-9,]/g, ''))} />
  </div>
)

export interface ItrOldRegimeDeductionsFormProps {
  claimDeductions: boolean | null
  setClaimDeductions: (val: boolean) => void
  deductions: DeductionsData
  onChange: (field: keyof DeductionsData, val: string | boolean) => void
}

export const ItrOldRegimeDeductionsForm: React.FC<ItrOldRegimeDeductionsFormProps> = ({
  claimDeductions, setClaimDeductions, deductions, onChange,
}) => (
  <>
    <div className="itr-step-card">
      <h3 className="itr-ded-main-title">Do you want to claim deductions?</h3>
      <p className="itr-ded-main-desc">Under the Old Tax Regime, you can declare Section 80C, 80D, and 24(b) to reduce your taxable income.</p>
      <div className="itr-toggle-group">
        <button type="button" className={`itr-toggle-btn ${claimDeductions === true ? 'itr-toggle-btn--active' : ''}`} onClick={() => setClaimDeductions(true)}>Yes, Claim Deductions</button>
        <button type="button" className={`itr-toggle-btn ${claimDeductions === false ? 'itr-toggle-btn--active' : ''}`} onClick={() => setClaimDeductions(false)}>No Deductions to Claim</button>
      </div>
    </div>

    {claimDeductions === true && (
      <div className="itr-step-card">
        <div className="itr-ded-card-header">
          <div className="itr-ded-card-title-row"><span className="itr-ded-shield-icon">🛡</span><h3 className="itr-ded-card-title">Structured Deductions (Old Regime)</h3></div>
          <p className="itr-ded-card-desc">Enter eligible investments and insurance expenses to claim tax deductions.</p>
        </div>

        <div className="itr-ded-section">
          <div className="itr-ded-section-header"><span className="itr-ded-section-label">Section 80C Investments</span><span className="itr-ded-section-cap">Capped at ₹1,50,000</span></div>
          <div className="itr-grid-2col">
            {SECTION_80C_FIELDS.map((item) => (
              <div key={item.id} className="itr-form-group">
                <label className="itr-form-label" htmlFor={item.id}>{item.label}</label>
                <CurrencyInput id={item.id} placeholder={item.placeholder} field={item.field} value={String(deductions[item.field] || '')} onChange={onChange} />
              </div>
            ))}
          </div>
        </div>

        <div className="itr-ded-section">
          <div className="itr-ded-section-header"><span className="itr-ded-section-label">Section 80D Health Insurance</span><span className="itr-ded-section-cap">Up to ₹25k / ₹50k</span></div>
          <div className="itr-form-group"><label className="itr-form-label" htmlFor="ded-self-ins">Self, Spouse &amp; Dependent Children</label><CurrencyInput id="ded-self-ins" placeholder="Max 25,000" field="selfInsurance" value={deductions.selfInsurance || ''} onChange={onChange} /></div>
          <div className="itr-form-group"><label className="itr-form-label" htmlFor="ded-parent-ins">Parents Health Insurance</label><CurrencyInput id="ded-parent-ins" placeholder="Max 25,000 (50k for senior)" field="parentInsurance" value={deductions.parentInsurance || ''} onChange={onChange} /></div>
          <div className="itr-ded-toggle-row" onClick={() => onChange('parentsSeniorCitizen', !deductions.parentsSeniorCitizen)}>
            <span className="itr-ded-toggle-label">Are your parents Senior Citizens (60+)?</span>
            <div className={`itr-ded-toggle-switch ${deductions.parentsSeniorCitizen ? 'itr-ded-toggle-switch--on' : ''}`}><div className="itr-ded-toggle-thumb" /></div>
          </div>
        </div>

        <div className="itr-ded-section">
          <div className="itr-ded-section-header"><span className="itr-ded-section-label">Section 24(b) Home Loan Interest</span><span className="itr-ded-section-cap">Max ₹2,00,000</span></div>
          <div className="itr-form-group"><label className="itr-form-label" htmlFor="ded-hli">Home Loan Interest Paid</label><CurrencyInput id="ded-hli" placeholder="Interest paid on self-occupied property" field="homeLoanInterest24b" value={deductions.homeLoanInterest24b || ''} onChange={onChange} /></div>
        </div>

        <button type="button" className="itr-btn-add-other-ded"><span>＋</span> Add Other Deduction (80G, 80CCD, 80TTA)</button>
      </div>
    )}
  </>
)

export interface ItrRegimeDeductionsViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  /** Opened with "Edit" from the review: the main button reads "Update & Review" */
  isEditMode?: boolean
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

const hasAnyDeductionValue = (deductions: DeductionsData, trimCheck = false): boolean => {
  try {
    const keys: Array<keyof DeductionsData> = [
      'epf', 'ppf', 'lic', 'elss', 'childrenTuition', 'housingLoanPrincipal',
      'selfInsurance', 'parentInsurance', 'homeLoanInterest24b', 'otherDeductions',
    ]
    return keys.some((k) => {
      const val = deductions[k]
      return typeof val === 'string' && (trimCheck ? Boolean(val.trim()) : Boolean(val))
    })
  } catch {
    return false
  }
}

export const ItrRegimeDeductionsView: React.FC<ItrRegimeDeductionsViewProps> = ({
  onBack, onNext, onSaveDraft, isEditMode = false, selectedSources = [], salaryDetails, housePropertyDetails,
  businessDetails, capitalGainsDetails, otherSourcesDetails, selectedRegime, onRegimeChange,
  deductions, onDeductionsChange,
}) => {
  const [claimDeductions, setClaimDeductions] = useState<boolean | null>(() => hasAnyDeductionValue(deductions) ? true : null)

  const calculation = useMemo(
    () => calculateItrTax({
      selectedSources, salaryDetails, housePropertyDetails, businessDetails,
      capitalGainsDetails, otherSourcesDetails, selectedRegime, deductions,
    }),
    [selectedSources, salaryDetails, housePropertyDetails, businessDetails, capitalGainsDetails, otherSourcesDetails, selectedRegime, deductions]
  )

  const handleChange = (field: keyof DeductionsData, val: string | boolean) => {
    try {
      onDeductionsChange({ ...deductions, [field]: val })
    } catch {
      // Fallback
    }
  }

  const isRegimeDeductionsValid = Boolean(
    selectedRegime === 'new' ||
      (selectedRegime === 'old' && ((claimDeductions === true && hasAnyDeductionValue(deductions, true)) || claimDeductions === false))
  )

  return (
    <div className="itr-step-view-container">
      <ItrFilingHeaderStepper currentStepId={3} />
      <ItrRegimeCompareTable calculation={calculation} />

      <div className="itr-step-card">
        <div className="itr-sources-header"><h2 className="itr-sources-title">Your Regime Selection</h2></div>
        <div className="itr-regime-options" role="radiogroup" aria-label="Tax Regime Selection">
          {REGIME_OPTIONS.map((option) => {
            const isSelected = selectedRegime === option.id
            return (
              <div key={option.id} className={`itr-regime-card ${isSelected ? 'itr-regime-card--selected' : ''}`} onClick={() => onRegimeChange(option.id)} role="radio" aria-checked={isSelected} tabIndex={0}>
                <div className="itr-regime-card__top">
                  <div className="itr-regime-radio-title"><div className="itr-radio-outer">{isSelected && <div className="itr-radio-inner" />}</div><span className="itr-regime-name">{option.name}</span></div>
                  <span className="itr-regime-tag">{option.tag}</span>
                </div>
                <ul className="itr-regime-bullets">{option.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              </div>
            )
          })}
        </div>
      </div>

      {selectedRegime === 'old' && <ItrOldRegimeDeductionsForm claimDeductions={claimDeductions} setClaimDeductions={setClaimDeductions} deductions={deductions} onChange={handleChange} />}
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
        isEditMode={isEditMode}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isRegimeDeductionsValid}
      />
    </div>
  )
}

export default ItrRegimeDeductionsView
