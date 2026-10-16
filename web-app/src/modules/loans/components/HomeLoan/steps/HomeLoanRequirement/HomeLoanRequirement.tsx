import React from 'react'
import { Home } from 'lucide-react'
import type { HomeLoanStepProps } from '@modules/loans/types/homeLoan.types'
import { InlineSelect } from '../InlineSelect'
import { LOAN_PURPOSE_OPTIONS, PROPERTY_STATUS_OPTIONS } from '../../homeLoan.constants'

/**
 * Step 2: Home Loan Requirement
 * Captures Requested Loan Amount, Loan Purpose, Property Status, and Approximate Property Value.
 */
export const HomeLoanRequirement: React.FC<HomeLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 9)
      if (!numeric) {
        onChange({ requestedLoanAmount: '', loanAmount: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ requestedLoanAmount: formatted, loanAmount: formatted })
    } catch (err) {
      console.error('Error formatting loan amount', err)
    }
  }

  const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
      if (!numeric) {
        onChange({ approximatePropertyValue: '', estimatedPropertyCost: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ approximatePropertyValue: formatted, estimatedPropertyCost: formatted })
    } catch (err) {
      console.error('Error formatting property value', err)
    }
  }

  return (
    <div className="hl-step" data-testid="hl-step-requirement">
      <section className="hl-card" aria-labelledby="hl-requirement-title">
        <div className="hl-card__header">
          <span className="hl-card__icon hl-card__icon--navy">
            <Home size={20} aria-hidden="true" />
          </span>
          <h2 id="hl-requirement-title" className="hl-card__title">
            Tell us about your home loan
          </h2>
        </div>
        <p className="hl-card__subtitle">
          Specify your loan requirement, property status and estimated property value.
        </p>

        {/* 1. Requested Loan Amount */}
        <div className="hl-field">
          <label className="hl-field__label" htmlFor="hl-requested-amount">
            Requested Loan Amount <span className="hl-required">*</span>
          </label>
          <div className="hl-input-prefix-wrap">
            <span className="hl-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="hl-requested-amount"
              className={`hl-field__input hl-input-with-prefix${errors.requestedLoanAmount ? ' hl-field__input--error' : ''}`}
              placeholder="e.g. 25,00,000"
              inputMode="numeric"
              value={data.requestedLoanAmount}
              aria-invalid={Boolean(errors.requestedLoanAmount) || undefined}
              aria-describedby={errors.requestedLoanAmount ? 'hl-requested-amount-error' : undefined}
              onChange={handleAmountChange}
            />
          </div>
          {errors.requestedLoanAmount && (
            <p id="hl-requested-amount-error" className="hl-field__error" role="alert">
              {errors.requestedLoanAmount}
            </p>
          )}
        </div>

        {/* 2. What do you need the loan for? */}
        <InlineSelect
          id="hl-loan-purpose"
          label="What do you need the loan for?"
          placeholder="Select purpose"
          options={LOAN_PURPOSE_OPTIONS}
          value={data.loanPurpose}
          onChange={(loanPurpose) => onChange({ loanPurpose, propertyIntent: loanPurpose })}
          error={errors.loanPurpose}
        />

        {/* 3. Property Status */}
        <InlineSelect
          id="hl-property-status"
          label="Property Status"
          placeholder="Select property status"
          options={PROPERTY_STATUS_OPTIONS}
          value={data.propertyStatus}
          onChange={(propertyStatus) => onChange({ propertyStatus, propertyStage: propertyStatus })}
          error={errors.propertyStatus}
        />

        {/* 4. Approximate Property Value */}
        <div className="hl-field">
          <label className="hl-field__label" htmlFor="hl-property-value">
            Approximate Property Value <span className="hl-required">*</span>
          </label>
          <div className="hl-input-prefix-wrap">
            <span className="hl-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="hl-property-value"
              className={`hl-field__input hl-input-with-prefix${errors.approximatePropertyValue ? ' hl-field__input--error' : ''}`}
              placeholder="e.g. 40,00,000"
              inputMode="numeric"
              value={data.approximatePropertyValue}
              aria-invalid={Boolean(errors.approximatePropertyValue) || undefined}
              aria-describedby={errors.approximatePropertyValue ? 'hl-property-value-error' : undefined}
              onChange={handlePropertyValueChange}
            />
          </div>
          {errors.approximatePropertyValue && (
            <p id="hl-property-value-error" className="hl-field__error" role="alert">
              {errors.approximatePropertyValue}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomeLoanRequirement
