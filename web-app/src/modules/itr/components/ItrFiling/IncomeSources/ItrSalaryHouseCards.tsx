import React from 'react'
import { FieldInfoTooltip } from '@shared/components'
import {
  type SalaryDetails,
  type HousePropertyDetails,
  sanitizeEmployerName,
  validateEmployerName,
  sanitizeIncomeAmount,
} from '../itrFiling.constants'
import './ItrIncomeSourceCards.css'

/* ==========================================================================
   1. Salary Income Card
   ========================================================================== */
export interface ItrSalaryIncomeCardProps {
  salaryDetails: SalaryDetails
  onSalaryDetailsChange: (details: SalaryDetails) => void
  onToggle: () => void
  showErrors?: boolean
}

export const ItrSalaryIncomeCard: React.FC<ItrSalaryIncomeCardProps> = ({
  salaryDetails,
  onSalaryDetailsChange,
  onToggle,
  showErrors = false,
}) => {
  const handleSalaryChange = (field: keyof SalaryDetails, val: string) => {
    onSalaryDetailsChange({ ...salaryDetails, [field]: val })
  }

  const employerNameError = showErrors ? validateEmployerName(salaryDetails.employerName) : null
  const grossSalaryError = showErrors && !salaryDetails.grossSalary?.trim() ? 'Gross Salary is required' : null
  const exemptAllowancesError =
    showErrors && !salaryDetails.exemptAllowances?.trim() ? 'Exempt Allowances is required' : null
  const tdsDeductedError = showErrors && !salaryDetails.tdsDeducted?.trim() ? 'TDS Deducted is required' : null

  return (
    <div className="itr-salary-card" id="itr-salary-income" data-section="salary">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">💼</div>
          <div className="itr-salary-card__titles">
            <div className="itr-salary-card__title-row">
              <h3 className="itr-salary-card__title">Salary Income</h3>
              <FieldInfoTooltip
                title="Salary Income Information"
                ariaLabel="Salary Income field guide"
                iconSize={18}
                description="Enter your total salary (before deductions), any tax-exempt allowances (e.g., HRA, LTA), and TDS deducted by your employer."
              />
            </div>
            <p className="itr-salary-card__sub">Employer Form 16, payslips, TDS credits</p>
          </div>
        </div>
        <div
          className="itr-salary-checkbox-wrap"
          onClick={onToggle}
          title="Toggle Salary Income"
          role="checkbox"
          aria-checked={true}
          tabIndex={0}
        >
          <div className="itr-checkbox-custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="salary-employer-name">
          Employer Legal Name <span className="itr-required-star">*</span>
        </label>
        <input
          id="salary-employer-name"
          type="text"
          maxLength={75}
          className={`itr-input-text ${employerNameError ? 'itr-input-text--error' : ''}`}
          placeholder="Enter employer legal name (letters and . only)"
          value={salaryDetails.employerName}
          onChange={(e) => handleSalaryChange('employerName', sanitizeEmployerName(e.target.value))}
        />
        {employerNameError && <span className="itr-field-error-text">{employerNameError}</span>}
      </div>

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="salary-gross-amount">
            Gross Salary (Annual) <span className="itr-required-star">*</span>
          </label>
          <div className={`itr-input-currency-wrap ${grossSalaryError ? 'itr-input-currency-wrap--error' : ''}`}>
            <span className="itr-currency-prefix">₹</span>
            <input
              id="salary-gross-amount"
              type="text"
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter gross salary"
              value={salaryDetails.grossSalary}
              onChange={(e) => handleSalaryChange('grossSalary', sanitizeIncomeAmount(e.target.value))}
            />
          </div>
          {grossSalaryError && <span className="itr-field-error-text">{grossSalaryError}</span>}
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="salary-exempt-amount">
            Exempt Allowances <span className="itr-required-star">*</span>
          </label>
          <div className={`itr-input-currency-wrap ${exemptAllowancesError ? 'itr-input-currency-wrap--error' : ''}`}>
            <span className="itr-currency-prefix">₹</span>
            <input
              id="salary-exempt-amount"
              type="text"
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter exempt allowances"
              value={salaryDetails.exemptAllowances}
              onChange={(e) => handleSalaryChange('exemptAllowances', sanitizeIncomeAmount(e.target.value))}
            />
          </div>
          {exemptAllowancesError && <span className="itr-field-error-text">{exemptAllowancesError}</span>}
        </div>
      </div>

      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="salary-tds-amount">
          TDS Deducted by Employer <span className="itr-required-star">*</span>
        </label>
        <div className={`itr-input-currency-wrap ${tdsDeductedError ? 'itr-input-currency-wrap--error' : ''}`}>
          <span className="itr-currency-prefix">₹</span>
          <input
            id="salary-tds-amount"
            type="text"
            inputMode="numeric"
            pattern="[1-9][0-9]*"
            maxLength={14}
            className="itr-input-currency"
            placeholder="Enter TDS deducted"
            value={salaryDetails.tdsDeducted}
            onChange={(e) => handleSalaryChange('tdsDeducted', sanitizeIncomeAmount(e.target.value))}
          />
        </div>
        {tdsDeductedError && <span className="itr-field-error-text">{tdsDeductedError}</span>}
      </div>
    </div>
  )
}

/* ==========================================================================
   2. House Property Card
   ========================================================================== */
export interface ItrHousePropertyCardProps {
  housePropertyDetails: HousePropertyDetails
  onHousePropertyDetailsChange: (details: HousePropertyDetails) => void
  onToggle: () => void
  showErrors?: boolean
}

export const ItrHousePropertyCard: React.FC<ItrHousePropertyCardProps> = ({
  housePropertyDetails,
  onHousePropertyDetailsChange,
  onToggle,
  showErrors = false,
}) => {
  const handleHousePropertyChange = (field: keyof HousePropertyDetails, val: string) => {
    onHousePropertyDetailsChange({ ...housePropertyDetails, [field]: val })
  }

  const rentError =
    showErrors && housePropertyDetails.propertyType === 'let_out' && !housePropertyDetails.annualRentReceived?.trim()
      ? 'Annual Rent Received is required'
      : null
  const municipalTaxError =
    showErrors && housePropertyDetails.propertyType === 'let_out' && !housePropertyDetails.municipalTaxPaid?.trim()
      ? 'Municipal Tax Paid is required'
      : null
  const homeLoanError =
    showErrors && !housePropertyDetails.homeLoanInterest?.trim()
      ? 'Home Loan Interest Paid is required'
      : null

  return (
    <div className="itr-salary-card" id="itr-house-property" data-section="house_property">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">🏠</div>
          <div className="itr-salary-card__titles">
            <div className="itr-salary-card__title-row">
              <h3 className="itr-salary-card__title">House Property</h3>
              <FieldInfoTooltip
                title="House Property Information"
                ariaLabel="Property income field guide"
                iconSize={18}
                description="Provide details of your house property, including whether it is self-occupied or rented, and the home loan interest paid (if applicable)."
              />
            </div>
            <p className="itr-salary-card__sub">Self-occupied home loan or rental income</p>
          </div>
        </div>
        <div
          className="itr-salary-checkbox-wrap"
          onClick={onToggle}
          title="Toggle House Property"
          role="checkbox"
          aria-checked={true}
          tabIndex={0}
        >
          <div className="itr-checkbox-custom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Property Type Toggle */}
      <div className="itr-form-group">
        <label className="itr-form-label">
          Property Classification <span className="itr-required-star">*</span>
        </label>
        <div className="itr-toggle-group">
          <button
            type="button"
            className={`itr-toggle-btn ${housePropertyDetails.propertyType === 'self_occupied' ? 'itr-toggle-btn--active' : ''}`}
            onClick={() => handleHousePropertyChange('propertyType', 'self_occupied')}
          >
            Self-Occupied
          </button>
          <button
            type="button"
            className={`itr-toggle-btn ${housePropertyDetails.propertyType === 'let_out' ? 'itr-toggle-btn--active' : ''}`}
            onClick={() => handleHousePropertyChange('propertyType', 'let_out')}
          >
            Let-Out (Rented)
          </button>
        </div>
      </div>

      {/* Let-Out specific fields: Annual Rent Received & Municipal Tax Paid (Row 1 side-by-side) */}
      {housePropertyDetails.propertyType === 'let_out' && (
        <div className="itr-grid-2col">
          <div className="itr-form-group">
            <label className="itr-form-label" htmlFor="hp-rent">
              Annual Rent Received <span className="itr-required-star">*</span>
            </label>
            <div className={`itr-input-currency-wrap ${rentError ? 'itr-input-currency-wrap--error' : ''}`}>
              <span className="itr-currency-prefix">₹</span>
              <input
                id="hp-rent"
                type="text"
                inputMode="numeric"
                pattern="[1-9][0-9]*"
                maxLength={14}
                className="itr-input-currency"
                placeholder="Enter annual rent received"
                value={housePropertyDetails.annualRentReceived}
                onChange={(e) => handleHousePropertyChange('annualRentReceived', sanitizeIncomeAmount(e.target.value))}
              />
            </div>
            {rentError && <span className="itr-field-error-text">{rentError}</span>}
          </div>
          <div className="itr-form-group">
            <label className="itr-form-label" htmlFor="hp-tax">
              Municipal Tax Paid <span className="itr-required-star">*</span>
            </label>
            <div className={`itr-input-currency-wrap ${municipalTaxError ? 'itr-input-currency-wrap--error' : ''}`}>
              <span className="itr-currency-prefix">₹</span>
              <input
                id="hp-tax"
                type="text"
                inputMode="numeric"
                pattern="[1-9][0-9]*"
                maxLength={14}
                className="itr-input-currency"
                placeholder="Enter municipal tax paid"
                value={housePropertyDetails.municipalTaxPaid}
                onChange={(e) => handleHousePropertyChange('municipalTaxPaid', sanitizeIncomeAmount(e.target.value))}
              />
            </div>
            {municipalTaxError && <span className="itr-field-error-text">{municipalTaxError}</span>}
          </div>
        </div>
      )}

      {/* Home Loan Interest Paid (Sec 24b) */}
      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="hp-loan-interest">
          Home Loan Interest Paid (Sec 24b) <span className="itr-required-star">*</span>
        </label>
        <div className={`itr-input-currency-wrap ${homeLoanError ? 'itr-input-currency-wrap--error' : ''}`}>
          <span className="itr-currency-prefix">₹</span>
          <input
            id="hp-loan-interest"
            type="text"
            inputMode="numeric"
            pattern="[1-9][0-9]*"
            maxLength={14}
            className="itr-input-currency"
            placeholder={housePropertyDetails.propertyType === 'self_occupied' ? 'Max ₹2,00,000 for self-occupied' : 'Enter home loan interest'}
            value={housePropertyDetails.homeLoanInterest}
            onChange={(e) => handleHousePropertyChange('homeLoanInterest', sanitizeIncomeAmount(e.target.value))}
          />
        </div>
        {homeLoanError && <span className="itr-field-error-text">{homeLoanError}</span>}
      </div>
    </div>
  )
}