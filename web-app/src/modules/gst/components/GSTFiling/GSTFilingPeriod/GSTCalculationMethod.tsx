import React from 'react'
import { TAX_CALCULATION_METHOD_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import './GSTCalculationMethod.css'

interface GSTCalculationMethodProps {
  value: 'ca_calculate' | 'estimated_figures' | ''
  onChange: (value: 'ca_calculate' | 'estimated_figures') => void
  error?: string
  errors?: Record<string, string>
  estimatedSales?: string
  onSalesChange?: (value: string) => void
  estimatedPurchases?: string
  onPurchasesChange?: (value: string) => void
  estimatedItc?: string
  onItcChange?: (value: string) => void
}

export const GSTCalculationMethod: React.FC<GSTCalculationMethodProps> = ({
  value,
  onChange,
  error,
  errors,
  estimatedSales = '',
  onSalesChange,
  estimatedPurchases = '',
  onPurchasesChange,
  estimatedItc = '',
  onItcChange,
}) => {
  return (
    <div className="gst-calc-method">
      <span className="gst-calc-method__label">Tax Calculation Method *</span>
      <div
        className="gst-calc-method__grid"
        role="radiogroup"
        aria-label="Tax Calculation Method"
      >
        {TAX_CALCULATION_METHOD_OPTIONS.map((option) => {
          const isSelected = value === option.id
          return (
            <div
              key={option.id}
              className={`gst-calc-method__card ${
                isSelected ? 'gst-calc-method__card--active' : ''
              }`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onChange(option.id)
                }
              }}
            >
              <div className="gst-calc-method__radio-circle">
                {isSelected && <div className="gst-calc-method__radio-dot" />}
              </div>
              <div className="gst-calc-method__content">
                <span className="gst-calc-method__title">{option.title}</span>
                <span className="gst-calc-method__desc">{option.description}</span>
              </div>
            </div>
          )
        })}
      </div>

      {value === 'estimated_figures' && (
        <div className="gst-calc-method__estimated-card">
          <div className="gst-calc-method__field">
            <label htmlFor="gst-est-sales" className="gst-calc-method__field-label">
              Estimated Taxable Sales (₹) <span className="gst-calc-method__required">*</span>
            </label>
            <input
              id="gst-est-sales"
              type="text"
              inputMode="numeric"
              className={`gst-calc-method__input ${errors?.estimatedSales ? 'gst-calc-method__input--error' : ''}`}
              placeholder="Enter sales amount"
              value={estimatedSales}
              onChange={(e) => onSalesChange?.(gstInput.amount(e.target.value))}
            />
            {errors?.estimatedSales && (
              <span className="gst-calc-method__field-error">{errors.estimatedSales}</span>
            )}
          </div>

          <div className="gst-calc-method__field">
            <label htmlFor="gst-est-purchases" className="gst-calc-method__field-label">
              Estimated Taxable Purchases (₹) <span className="gst-calc-method__required">*</span>
            </label>
            <input
              id="gst-est-purchases"
              type="text"
              inputMode="numeric"
              className={`gst-calc-method__input ${errors?.estimatedPurchases ? 'gst-calc-method__input--error' : ''}`}
              placeholder="Enter purchases amount"
              value={estimatedPurchases}
              onChange={(e) => onPurchasesChange?.(gstInput.amount(e.target.value))}
            />
            {errors?.estimatedPurchases && (
              <span className="gst-calc-method__field-error">{errors.estimatedPurchases}</span>
            )}
          </div>

          <div className="gst-calc-method__field">
            <label htmlFor="gst-est-itc" className="gst-calc-method__field-label">
              Estimated Eligible ITC (₹) <span className="gst-calc-method__required">*</span>
            </label>
            <input
              id="gst-est-itc"
              type="text"
              inputMode="numeric"
              className={`gst-calc-method__input ${errors?.estimatedItc ? 'gst-calc-method__input--error' : ''}`}
              placeholder="Enter eligible ITC amount"
              value={estimatedItc}
              onChange={(e) => onItcChange?.(gstInput.amount(e.target.value))}
            />
            {errors?.estimatedItc && (
              <span className="gst-calc-method__field-error">{errors.estimatedItc}</span>
            )}
          </div>
        </div>
      )}

      {error && <span className="gst-calc-method__error">{error}</span>}
    </div>
  )
}
