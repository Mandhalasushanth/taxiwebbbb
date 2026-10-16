import React from 'react'
import { Banknote, Car, ShoppingBag } from 'lucide-react'
import type {
  VehicleLoanData,
  VehicleLoanStepProps,
} from '@modules/loans/types/vehicleLoan.types'
import { InlineSelect } from '../InlineSelect'
import {
  DEALER_SELECTED_OPTIONS,
  PURCHASE_TIMELINE_OPTIONS,
  STATE_OPTIONS,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
} from '../../vehicleLoan.constants'

/**
 * Step 2: Vehicle & Loan Details
 * Card 1: Loan Requirement (Requested Loan Amount)
 * Card 2: Vehicle Details (Condition, Category, Make / Brand, Model, Approximate Vehicle Price)
 * Card 3: Purchase Details (Dealer Selected?, Purchase Timeline, Registration State)
 */
export const VehicleAndLoanDetails: React.FC<VehicleLoanStepProps> = ({
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
      if (!numeric) {
        onChange({ approximateVehiclePrice: '', onRoadPrice: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ approximateVehiclePrice: formatted, onRoadPrice: formatted })
    } catch (err) {
      console.error('Error formatting vehicle price', err)
    }
  }

  const handleMakeBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 60)
      onChange({ vehicleMakeBrand: sanitized, vehicleBrand: sanitized })
    } catch (err) {
      console.error('Error updating vehicle make/brand', err)
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 60)
      onChange({ vehicleModel: sanitized, vehicleMakeModel: sanitized })
    } catch (err) {
      console.error('Error updating vehicle model', err)
    }
  }

  const handleDealerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 80)
      onChange({ dealerName: sanitized })
    } catch (err) {
      console.error('Error updating dealer name', err)
    }
  }

  const amountError = errors.requestedLoanAmount || errors.loanAmount
  const priceError = errors.approximateVehiclePrice || errors.onRoadPrice
  const makeBrandError = errors.vehicleMakeBrand || errors.vehicleBrand
  const modelError = errors.vehicleModel || errors.vehicleMakeModel

  return (
    <div className="veh-step" data-testid="veh-step-details">
      {/* 1. Loan Requirement Card */}
      <section className="veh-card" aria-labelledby="veh-loan-requirement-title">
        <div className="veh-card__header">
          <span className="veh-card__icon veh-card__icon--navy">
            <Banknote size={20} aria-hidden="true" />
          </span>
          <h2 id="veh-loan-requirement-title" className="veh-card__title">
            Loan Requirement
          </h2>
        </div>

        {/* Requested Loan Amount */}
        <div className="veh-field">
          <label className="veh-field__label" htmlFor="veh-requested-amount">
            Requested Loan Amount <span className="veh-required">*</span>
          </label>
          <div className="veh-input-prefix-wrap">
            <span className="veh-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="veh-requested-amount"
              className={`veh-field__input veh-input-with-prefix${amountError ? ' veh-field__input--error' : ''}`}
              placeholder="e.g. 5,00,000"
              inputMode="numeric"
              value={data.requestedLoanAmount || (data.loanAmount ? String(data.loanAmount) : '')}
              aria-invalid={Boolean(amountError) || undefined}
              aria-describedby={amountError ? 'veh-requested-amount-error' : undefined}
              onChange={handleAmountChange}
            />
          </div>
          {amountError && (
            <p id="veh-requested-amount-error" className="veh-field__error" role="alert">
              {amountError}
            </p>
          )}
        </div>
      </section>

      {/* 2. Vehicle Details Card */}
      <section className="veh-card" aria-labelledby="veh-vehicle-details-title">
        <div className="veh-card__header">
          <span className="veh-card__icon veh-card__icon--orange">
            <Car size={20} aria-hidden="true" />
          </span>
          <h2 id="veh-vehicle-details-title" className="veh-card__title">
            Vehicle Details
          </h2>
        </div>

        {/* Vehicle Condition */}
        <InlineSelect
          id="veh-condition"
          label="Vehicle Condition"
          placeholder="Select condition"
          options={VEHICLE_CONDITION_OPTIONS}
          value={data.vehicleCondition}
          onChange={(vehicleCondition) => onChange({ vehicleCondition: vehicleCondition as any })}
          error={errors.vehicleCondition}
        />

        {/* Vehicle Category */}
        <InlineSelect
          id="veh-category"
          label="Vehicle Category"
          placeholder="Select category"
          options={VEHICLE_CATEGORY_OPTIONS}
          value={data.vehicleCategory}
          onChange={(vehicleCategory) => onChange({ vehicleCategory: vehicleCategory as any })}
          error={errors.vehicleCategory}
        />

        {/* Vehicle Make / Brand */}
        <div className="veh-field">
          <label className="veh-field__label" htmlFor="veh-make-brand">
            Vehicle Make / Brand <span className="veh-required">*</span>
          </label>
          <input
            id="veh-make-brand"
            className={`veh-field__input${makeBrandError ? ' veh-field__input--error' : ''}`}
            placeholder="e.g. Maruti Suzuki"
            value={data.vehicleMakeBrand || data.vehicleBrand || ''}
            maxLength={60}
            aria-invalid={Boolean(makeBrandError) || undefined}
            aria-describedby={makeBrandError ? 'veh-make-brand-error' : undefined}
            onChange={handleMakeBrandChange}
          />
          {makeBrandError && (
            <p id="veh-make-brand-error" className="veh-field__error" role="alert">
              {makeBrandError}
            </p>
          )}
        </div>

        {/* Vehicle Model */}
        <div className="veh-field">
          <label className="veh-field__label" htmlFor="veh-model">
            Vehicle Model <span className="veh-required">*</span>
          </label>
          <input
            id="veh-model"
            className={`veh-field__input${modelError ? ' veh-field__input--error' : ''}`}
            placeholder="e.g. Swift"
            value={data.vehicleModel || data.vehicleMakeModel || ''}
            maxLength={60}
            aria-invalid={Boolean(modelError) || undefined}
            aria-describedby={modelError ? 'veh-model-error' : undefined}
            onChange={handleModelChange}
          />
          {modelError && (
            <p id="veh-model-error" className="veh-field__error" role="alert">
              {modelError}
            </p>
          )}
        </div>

        {/* Approximate Vehicle Price */}
        <div className="veh-field">
          <label className="veh-field__label" htmlFor="veh-approx-price">
            Approximate Vehicle Price <span className="veh-required">*</span>
          </label>
          <div className="veh-input-prefix-wrap">
            <span className="veh-input-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="veh-approx-price"
              className={`veh-field__input veh-input-with-prefix${priceError ? ' veh-field__input--error' : ''}`}
              placeholder="e.g. 8,00,000"
              inputMode="numeric"
              value={data.approximateVehiclePrice || (data.onRoadPrice ? String(data.onRoadPrice) : '')}
              aria-invalid={Boolean(priceError) || undefined}
              aria-describedby={priceError ? 'veh-approx-price-error' : undefined}
              onChange={handlePriceChange}
            />
          </div>
          {priceError && (
            <p id="veh-approx-price-error" className="veh-field__error" role="alert">
              {priceError}
            </p>
          )}
        </div>
      </section>

      {/* 3. Purchase Details Card */}
      <section className="veh-card" aria-labelledby="veh-purchase-details-title">
        <div className="veh-card__header">
          <span className="veh-card__icon veh-card__icon--navy">
            <ShoppingBag size={20} aria-hidden="true" />
          </span>
          <h2 id="veh-purchase-details-title" className="veh-card__title">
            Purchase Details
          </h2>
        </div>

        {/* Dealer Selected? */}
        <InlineSelect
          id="veh-dealer-selected"
          label="Dealer Selected?"
          placeholder="Select an option"
          options={DEALER_SELECTED_OPTIONS}
          value={data.dealerSelected}
          onChange={(dealerSelected) => {
            const patch: Partial<VehicleLoanData> = { dealerSelected: dealerSelected as any }
            if (dealerSelected !== 'Yes') {
              patch.dealerName = ''
            }
            onChange(patch)
          }}
          error={errors.dealerSelected}
        />

        {/* Dealer Name (shown when Dealer Selected === 'Yes') */}
        {data.dealerSelected === 'Yes' && (
          <div className="veh-field" data-testid="veh-dealer-name-field">
            <label className="veh-field__label" htmlFor="veh-dealer-name">
              Dealer Name <span className="veh-required">*</span>
            </label>
            <input
              id="veh-dealer-name"
              className={`veh-field__input${errors.dealerName ? ' veh-field__input--error' : ''}`}
              placeholder="e.g. Popular Vehicles / Sai Motors"
              value={data.dealerName || ''}
              maxLength={80}
              aria-invalid={Boolean(errors.dealerName) || undefined}
              aria-describedby={errors.dealerName ? 'veh-dealer-name-error' : undefined}
              onChange={handleDealerNameChange}
            />
            {errors.dealerName && (
              <p id="veh-dealer-name-error" className="veh-field__error" role="alert">
                {errors.dealerName}
              </p>
            )}
          </div>
        )}

        {/* Purchase Timeline */}
        <InlineSelect
          id="veh-purchase-timeline"
          label="Purchase Timeline"
          placeholder="Select timeline"
          options={PURCHASE_TIMELINE_OPTIONS}
          value={data.purchaseTimeline}
          onChange={(purchaseTimeline) => onChange({ purchaseTimeline: purchaseTimeline as any })}
          error={errors.purchaseTimeline}
        />

        {/* Registration State */}
        <InlineSelect
          id="veh-registration-state"
          label="Registration State"
          placeholder="Select State / UT"
          options={STATE_OPTIONS}
          value={data.registrationState}
          onChange={(registrationState) => onChange({ registrationState })}
          error={errors.registrationState}
        />
      </section>
    </div>
  )
}

export default VehicleAndLoanDetails
