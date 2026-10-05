import React from 'react'
import type { SalaryDetails, HousePropertyDetails } from '../itrFiling.constants'
import './ItrIncomeSourceCards.css'

/* ==========================================================================
   1. Salary Income Card
   ========================================================================== */
export interface ItrSalaryIncomeCardProps {
  salaryDetails: SalaryDetails
  onSalaryDetailsChange: (details: SalaryDetails) => void
  onToggle: () => void
}

export const ItrSalaryIncomeCard: React.FC<ItrSalaryIncomeCardProps> = ({
  salaryDetails,
  onSalaryDetailsChange,
  onToggle,
}) => {
  const handleSalaryChange = (field: keyof SalaryDetails, val: string) => {
    onSalaryDetailsChange({ ...salaryDetails, [field]: val })
  }

  return (
    <div className="itr-salary-card">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">💼</div>
          <div className="itr-salary-card__titles">
            <h3 className="itr-salary-card__title">Salary Income</h3>
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
        <label className="itr-form-label" htmlFor="salary-employer-name">Employer Legal Name</label>
        <input
          id="salary-employer-name"
          type="text"
          className="itr-input-text"
          placeholder="Enter employer name"
          value={salaryDetails.employerName}
          onChange={(e) => handleSalaryChange('employerName', e.target.value)}
        />
      </div>

      <div className="itr-grid-2col">
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="salary-gross-amount">Gross Salary (Annual)</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="salary-gross-amount"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter gross salary"
              value={salaryDetails.grossSalary}
              onChange={(e) => handleSalaryChange('grossSalary', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
        <div className="itr-form-group">
          <label className="itr-form-label" htmlFor="salary-exempt-amount">Exempt Allowances (HRA, LTA)</label>
          <div className="itr-input-currency-wrap">
            <span className="itr-currency-prefix">₹</span>
            <input
              id="salary-exempt-amount"
              type="text"
              inputMode="numeric"
              maxLength={14}
              className="itr-input-currency"
              placeholder="Enter exempt allowances"
              value={salaryDetails.exemptAllowances}
              onChange={(e) => handleSalaryChange('exemptAllowances', e.target.value.replace(/[^0-9,]/g, ''))}
            />
          </div>
        </div>
      </div>

      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="salary-tds-amount">TDS Deducted by Employer</label>
        <div className="itr-input-currency-wrap">
          <span className="itr-currency-prefix">₹</span>
          <input
            id="salary-tds-amount"
            type="text"
            inputMode="numeric"
            maxLength={14}
            className="itr-input-currency"
            placeholder="Enter TDS deducted"
            value={salaryDetails.tdsDeducted}
            onChange={(e) => handleSalaryChange('tdsDeducted', e.target.value.replace(/[^0-9,]/g, ''))}
          />
        </div>
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
}

export const ItrHousePropertyCard: React.FC<ItrHousePropertyCardProps> = ({
  housePropertyDetails,
  onHousePropertyDetailsChange,
  onToggle,
}) => {
  const handleHousePropertyChange = (field: keyof HousePropertyDetails, val: string) => {
    onHousePropertyDetailsChange({ ...housePropertyDetails, [field]: val })
  }

  return (
    <div className="itr-salary-card">
      <div className="itr-salary-card__header">
        <div className="itr-salary-card__left">
          <div className="itr-salary-icon-box" aria-hidden="true">🏠</div>
          <div className="itr-salary-card__titles">
            <h3 className="itr-salary-card__title">House Property</h3>
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
        <label className="itr-form-label">Property Classification</label>
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

      {/* Home Loan Interest */}
      <div className="itr-form-group">
        <label className="itr-form-label" htmlFor="hp-loan-interest">Home Loan Interest Paid (Sec 24b)</label>
        <div className="itr-input-currency-wrap">
          <span className="itr-currency-prefix">₹</span>
          <input
            id="hp-loan-interest"
            type="text"
            inputMode="numeric"
            maxLength={14}
            className="itr-input-currency"
            placeholder={housePropertyDetails.propertyType === 'self_occupied' ? 'Max ₹2,00,000 for self-occupied' : 'Enter home loan interest'}
            value={housePropertyDetails.homeLoanInterest}
            onChange={(e) => handleHousePropertyChange('homeLoanInterest', e.target.value.replace(/[^0-9,]/g, ''))}
          />
        </div>
      </div>

      {/* Let-Out specific fields */}
      {housePropertyDetails.propertyType === 'let_out' && (
        <div className="itr-grid-2col">
          <div className="itr-form-group">
            <label className="itr-form-label" htmlFor="hp-rent">Annual Rent Received</label>
            <div className="itr-input-currency-wrap">
              <span className="itr-currency-prefix">₹</span>
              <input
                id="hp-rent"
                type="text"
                inputMode="numeric"
                maxLength={14}
                className="itr-input-currency"
                placeholder="Enter annual rent received"
                value={housePropertyDetails.annualRentReceived}
                onChange={(e) => handleHousePropertyChange('annualRentReceived', e.target.value.replace(/[^0-9,]/g, ''))}
              />
            </div>
          </div>
          <div className="itr-form-group">
            <label className="itr-form-label" htmlFor="hp-tax">Municipal Tax Paid</label>
            <div className="itr-input-currency-wrap">
              <span className="itr-currency-prefix">₹</span>
              <input
                id="hp-tax"
                type="text"
                inputMode="numeric"
                maxLength={14}
                className="itr-input-currency"
                placeholder="Enter municipal tax paid"
                value={housePropertyDetails.municipalTaxPaid}
                onChange={(e) => handleHousePropertyChange('municipalTaxPaid', e.target.value.replace(/[^0-9,]/g, ''))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
