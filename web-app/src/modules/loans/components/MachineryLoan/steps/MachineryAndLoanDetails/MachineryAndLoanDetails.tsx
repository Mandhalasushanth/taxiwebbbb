import React from 'react'
import { Banknote, Cog } from 'lucide-react'
import type { MachineryLoanStepProps } from '@modules/loans/types/machineryLoan.types'
import { InlineSelect } from '../InlineSelect'
import {
  MACHINERY_CONDITION_OPTIONS,
  MACHINERY_PURCHASE_TYPE_OPTIONS,
  MACHINERY_TYPE_OPTIONS,
} from '../../machineryLoan.constants'

/**
 * Step 2: Machinery & Loan Details
 * Card 1: Loan Requirement (Requested Loan Amount)
 * Card 2: Machinery Details (Machinery Type, Name/Description, Condition, Purchase Type, Cost, Dealer Name)
 */
export const MachineryAndLoanDetails: React.FC<MachineryLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
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

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
      if (!numeric) {
        onChange({ approximateMachineryCost: '', machineryCost: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ approximateMachineryCost: formatted, machineryCost: formatted })
    } catch (err) {
      console.error('Error formatting machinery cost', err)
    }
  }

  const handleNameDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,/&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 100)
      onChange({ machineryNameDescription: sanitized, machineryName: sanitized })
    } catch (err) {
      console.error('Error updating machinery name/description', err)
    }
  }

  const handleDealerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,/&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 80)
      onChange({ dealerSupplierName: sanitized, dealerName: sanitized })
    } catch (err) {
      console.error('Error updating dealer/supplier name', err)
    }
  }

  const amountError = errors.requestedLoanAmount || errors.loanAmount
  const costError = errors.approximateMachineryCost || errors.machineryCost
  const nameDescError = errors.machineryNameDescription || errors.machineryName
  const dealerError = errors.dealerSupplierName || errors.dealerName
  const purchaseTypeError = errors.machineryPurchaseType || errors.purchaseType

  return (
    <div className="mach-step" data-testid="mach-step-details">
      {/* 1. Loan Requirement Card */}
      <section className="mach-card" aria-labelledby="mach-loan-requirement-title">
        <div className="mach-card__header">
          <span className="mach-card__icon mach-card__icon--navy">
            <Banknote size={20} aria-hidden="true" />
          </span>
          <h2 id="mach-loan-requirement-title" className="mach-card__title">
            Loan Requirement
          </h2>
        </div>

        {/* Requested Loan Amount */}
        <div className="mach-field">
          <label className="mach-field__label" htmlFor="mach-requested-amount">
            Requested Loan Amount <span className="mach-required">*</span>
          </label>
          <div className="mach-input-prefix-wrap">
            <span className="mach-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="mach-requested-amount"
              className={`mach-field__input mach-input-with-prefix${amountError ? ' mach-field__input--error' : ''}`}
              placeholder="Enter requested loan amount"
              inputMode="numeric"
              value={data.requestedLoanAmount || (data.loanAmount ? String(data.loanAmount) : '')}
              aria-invalid={Boolean(amountError) || undefined}
              aria-describedby={amountError ? 'mach-requested-amount-error' : undefined}
              onChange={handleAmountChange}
            />
          </div>
          {amountError && (
            <p id="mach-requested-amount-error" className="mach-field__error" role="alert">
              {amountError}
            </p>
          )}
        </div>
      </section>

      {/* 2. Machinery Details Card */}
      <section className="mach-card" aria-labelledby="mach-machinery-details-title">
        <div className="mach-card__header">
          <span className="mach-card__icon mach-card__icon--orange">
            <Cog size={20} aria-hidden="true" />
          </span>
          <h2 id="mach-machinery-details-title" className="mach-card__title">
            Machinery Details
          </h2>
        </div>

        {/* Machinery Type */}
        <InlineSelect
          id="mach-type"
          label="Machinery Type"
          placeholder="Select machinery type"
          options={MACHINERY_TYPE_OPTIONS}
          value={data.machineryType}
          onChange={(machineryType) => onChange({ machineryType })}
          error={errors.machineryType}
        />

        {/* Machinery Name / Description */}
        <div className="mach-field">
          <label className="mach-field__label" htmlFor="mach-name-desc">
            Machinery Name / Description <span className="mach-required">*</span>
          </label>
          <input
            id="mach-name-desc"
            className={`mach-field__input${nameDescError ? ' mach-field__input--error' : ''}`}
            placeholder="e.g. CNC Turning Machine"
            value={data.machineryNameDescription || data.machineryName || ''}
            maxLength={100}
            aria-invalid={Boolean(nameDescError) || undefined}
            aria-describedby={nameDescError ? 'mach-name-desc-error' : undefined}
            onChange={handleNameDescChange}
          />
          {nameDescError && (
            <p id="mach-name-desc-error" className="mach-field__error" role="alert">
              {nameDescError}
            </p>
          )}
        </div>

        {/* Machinery Condition */}
        <InlineSelect
          id="mach-condition"
          label="Machinery Condition"
          placeholder="Select condition"
          options={MACHINERY_CONDITION_OPTIONS}
          value={data.machineryCondition}
          onChange={(machineryCondition) => onChange({ machineryCondition: machineryCondition as any })}
          error={errors.machineryCondition}
        />

        {/* Machinery Purchase Type */}
        <InlineSelect
          id="mach-purchase-type"
          label="Machinery Purchase Type"
          placeholder="Select purchase type"
          options={MACHINERY_PURCHASE_TYPE_OPTIONS}
          value={data.machineryPurchaseType || data.purchaseType || ''}
          onChange={(machineryPurchaseType) =>
            onChange({
              machineryPurchaseType: machineryPurchaseType as any,
              purchaseType: machineryPurchaseType,
            })
          }
          error={purchaseTypeError}
        />

        {/* Approximate Machinery Cost */}
        <div className="mach-field">
          <label className="mach-field__label" htmlFor="mach-approx-cost">
            Approximate Machinery Cost <span className="mach-required">*</span>
          </label>
          <div className="mach-input-prefix-wrap">
            <span className="mach-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="mach-approx-cost"
              className={`mach-field__input mach-input-with-prefix${costError ? ' mach-field__input--error' : ''}`}
              placeholder="Enter approximate machinery cost"
              inputMode="numeric"
              value={
                data.approximateMachineryCost ||
                (data.machineryCost ? String(data.machineryCost) : '')
              }
              aria-invalid={Boolean(costError) || undefined}
              aria-describedby={costError ? 'mach-approx-cost-error' : undefined}
              onChange={handleCostChange}
            />
          </div>
          {costError && (
            <p id="mach-approx-cost-error" className="mach-field__error" role="alert">
              {costError}
            </p>
          )}
        </div>

        {/* Dealer / Supplier Name */}
        <div className="mach-field">
          <label className="mach-field__label" htmlFor="mach-dealer-supplier">
            Dealer / Supplier Name
          </label>
          <input
            id="mach-dealer-supplier"
            className={`mach-field__input${dealerError ? ' mach-field__input--error' : ''}`}
            placeholder="Enter dealer or supplier name"
            value={data.dealerSupplierName || data.dealerName || ''}
            maxLength={80}
            aria-invalid={Boolean(dealerError) || undefined}
            aria-describedby={dealerError ? 'mach-dealer-supplier-error' : undefined}
            onChange={handleDealerChange}
          />
          {dealerError && (
            <p id="mach-dealer-supplier-error" className="mach-field__error" role="alert">
              {dealerError}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default MachineryAndLoanDetails
