import React from 'react'
import { Banknote, Home } from 'lucide-react'
import type { PropertyLoanStepProps } from '@modules/loans/types/propertyLoan.types'
import { InlineSelect } from '../InlineSelect'
import { StateSelect } from '@modules/loans/shared/StateSelect'
import {
  CONSTRUCTION_STAGE_OPTIONS,
  PROPERTY_OWNERSHIP_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PURPOSE_OF_LOAN_OPTIONS,
  STATE_OPTIONS,
} from '../../propertyLoan.constants'

/**
 * Step 2: Property & Loan Details
 * Card 1: Loan Requirement (Requested Loan Amount, Purpose of Loan)
 * Card 2: Property Details (Property Type, City, State, PIN Code, Property Ownership)
 */
export const PropertyAndLoanDetails: React.FC<PropertyLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
      if (!numeric) {
        onChange({ requestedLoanAmount: '', requiredAmount: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ requestedLoanAmount: formatted, requiredAmount: formatted })
    } catch (err) {
      console.error('Error formatting loan amount', err)
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z .'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 60)
      onChange({ city: sanitized, propertyCity: sanitized })
    } catch (err) {
      console.error('Error updating city', err)
    }
  }

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
      onChange({ pincode: digits, propertyPincode: digits })
    } catch (err) {
      console.error('Error updating pincode', err)
    }
  }

  return (
    <div className="prop-step" data-testid="prop-step-details">
      {/* 1. Loan Requirement Card */}
      <section className="prop-card" aria-labelledby="prop-loan-requirement-title">
        <div className="prop-card__header">
          <span className="prop-card__icon prop-card__icon--navy">
            <Banknote size={20} aria-hidden="true" />
          </span>
          <h2 id="prop-loan-requirement-title" className="prop-card__title">
            Loan Requirement
          </h2>
        </div>

        {/* Requested Loan Amount */}
        <div className="prop-field">
          <label className="prop-field__label" htmlFor="prop-requested-amount">
            Requested Loan Amount <span className="prop-required">*</span>
          </label>
          <div className="prop-input-prefix-wrap">
            <span className="prop-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="prop-requested-amount"
              className={`prop-field__input prop-input-with-prefix${
                errors.requestedLoanAmount ? ' prop-field__input--error' : ''
              }`}
              placeholder="e.g. 25,00,000"
              inputMode="numeric"
              value={data.requestedLoanAmount || data.requiredAmount || ''}
              aria-invalid={Boolean(errors.requestedLoanAmount) || undefined}
              aria-describedby={errors.requestedLoanAmount ? 'prop-requested-amount-error' : undefined}
              onChange={handleAmountChange}
            />
          </div>
          {errors.requestedLoanAmount && (
            <p id="prop-requested-amount-error" className="prop-field__error" role="alert">
              {errors.requestedLoanAmount}
            </p>
          )}
        </div>

        {/* Purpose of Loan */}
        <InlineSelect
          id="prop-loan-purpose"
          label="Purpose of Loan"
          placeholder="Select purpose"
          options={PURPOSE_OF_LOAN_OPTIONS}
          value={data.loanPurpose}
          onChange={(loanPurpose) =>
            onChange({
              loanPurpose,
              ...(loanPurpose?.includes('Construction') && !data.constructionStage
                ? { constructionStage: 'Planning Stage' }
                : {}),
            })
          }
          error={errors.loanPurpose}
        />

        {/* Construction Stage (conditional for construction purposes) */}
        {(Boolean(data.loanPurpose?.includes('Construction')) || Boolean(data.constructionStage)) && (
          <InlineSelect
            id="prop-construction-stage"
            label="Construction Stage"
            placeholder="Select stage"
            options={CONSTRUCTION_STAGE_OPTIONS}
            value={data.constructionStage || 'Planning Stage'}
            onChange={(constructionStage) => onChange({ constructionStage })}
            error={errors.constructionStage}
          />
        )}
      </section>

      {/* 2. Property Details Card */}
      <section className="prop-card" aria-labelledby="prop-property-details-title">
        <div className="prop-card__header">
          <span className="prop-card__icon prop-card__icon--orange">
            <Home size={20} aria-hidden="true" />
          </span>
          <h2 id="prop-property-details-title" className="prop-card__title">
            Property Details
          </h2>
        </div>

        {/* Property Type */}
        <InlineSelect
          id="prop-property-type"
          label="Property Type"
          placeholder="Select property type"
          options={PROPERTY_TYPE_OPTIONS}
          value={data.propertyType}
          onChange={(propertyType) => onChange({ propertyType })}
          error={errors.propertyType}
        />

        <div className="prop-row">
          {/* City */}
          <div className="prop-field">
            <label className="prop-field__label" htmlFor="prop-city">
              City <span className="prop-required">*</span>
            </label>
            <input
              id="prop-city"
              className={`prop-field__input${errors.city ? ' prop-field__input--error' : ''}`}
              placeholder="e.g. Hyderabad"
              value={data.city || data.propertyCity || ''}
              maxLength={60}
              aria-invalid={Boolean(errors.city) || undefined}
              aria-describedby={errors.city ? 'prop-city-error' : undefined}
              onChange={handleCityChange}
            />
            {errors.city && (
              <p id="prop-city-error" className="prop-field__error" role="alert">
                {errors.city}
              </p>
            )}
          </div>

          {/* PIN Code */}
          <div className="prop-field">
            <label className="prop-field__label" htmlFor="prop-pincode">
              PIN Code <span className="prop-required">*</span>
            </label>
            <input
              id="prop-pincode"
              className={`prop-field__input${errors.pincode ? ' prop-field__input--error' : ''}`}
              placeholder="6-digit PIN code"
              inputMode="numeric"
              value={data.pincode || data.propertyPincode || ''}
              maxLength={6}
              aria-invalid={Boolean(errors.pincode) || undefined}
              aria-describedby={errors.pincode ? 'prop-pincode-error' : undefined}
              onChange={handlePincodeChange}
            />
            {errors.pincode && (
              <p id="prop-pincode-error" className="prop-field__error" role="alert">
                {errors.pincode}
              </p>
            )}
          </div>
        </div>

        {/* State */}
        <StateSelect
          id="prop-state"
          label="State"
          placeholder="Select state / UT"
          options={STATE_OPTIONS}
          value={data.state || data.propertyState || ''}
          onChange={(state) => onChange({ state, propertyState: state })}
          error={errors.state}
        />

        {/* Property Ownership */}
        <InlineSelect
          id="prop-property-ownership"
          label="Property Ownership"
          placeholder="Select ownership"
          options={PROPERTY_OWNERSHIP_OPTIONS}
          value={data.propertyOwnership}
          onChange={(propertyOwnership) => onChange({ propertyOwnership })}
          error={errors.propertyOwnership}
        />
      </section>
    </div>
  )
}

export default PropertyAndLoanDetails
