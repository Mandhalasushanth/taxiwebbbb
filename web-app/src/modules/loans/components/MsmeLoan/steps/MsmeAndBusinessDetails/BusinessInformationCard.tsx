import React from 'react'
import { Banknote } from 'lucide-react'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { InlineSelect } from '../InlineSelect'
import { LOAN_PURPOSE_OPTIONS } from '../../msmeLoan.constants'

export const BusinessInformationCard: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  const handleAmountFormat = (field: 'annualTurnover' | 'avgMonthlySales' | 'requestedLoanAmount') => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 12)
      if (!numeric) {
        if (field === 'requestedLoanAmount') {
          onChange({ requestedLoanAmount: '', loanAmount: '' })
        } else {
          onChange({ [field]: '' })
        }
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      if (field === 'requestedLoanAmount') {
        onChange({ requestedLoanAmount: formatted, loanAmount: formatted })
      } else {
        onChange({ [field]: formatted })
      }
    } catch (err) {
      console.error(`Error formatting ${field}`, err)
    }
  }

  const amountError = errors.requestedLoanAmount || errors.loanAmount

  return (
    <section className="msme-card" aria-labelledby="msme-business-info-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--navy">
          <Banknote size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-business-info-title" className="msme-card__title">
          Business Information
        </h2>
      </div>

      {/* Annual Turnover */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-annual-turnover">
          Annual Turnover <span className="msme-required">*</span>
        </label>
        <div className="msme-input-prefix-wrap">
          <span className="msme-input-prefix" aria-hidden="true">
            ₹
          </span>
          <input
            id="msme-annual-turnover"
            className={`msme-field__input msme-input-with-prefix${errors.annualTurnover ? ' msme-field__input--error' : ''}`}
            placeholder="Enter annual turnover"
            inputMode="numeric"
            value={data.annualTurnover || ''}
            aria-invalid={Boolean(errors.annualTurnover) || undefined}
            aria-describedby={errors.annualTurnover ? 'msme-annual-turnover-error' : undefined}
            onChange={handleAmountFormat('annualTurnover')}
          />
        </div>
        {errors.annualTurnover && (
          <p id="msme-annual-turnover-error" className="msme-field__error" role="alert">
            {errors.annualTurnover}
          </p>
        )}
      </div>

      {/* Avg Monthly Sales */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-avg-monthly-sales">
          Avg Monthly Sales
        </label>
        <div className="msme-input-prefix-wrap">
          <span className="msme-input-prefix" aria-hidden="true">
            ₹
          </span>
          <input
            id="msme-avg-monthly-sales"
            className={`msme-field__input msme-input-with-prefix${errors.avgMonthlySales ? ' msme-field__input--error' : ''}`}
            placeholder="Enter average monthly sales"
            inputMode="numeric"
            value={data.avgMonthlySales || ''}
            aria-invalid={Boolean(errors.avgMonthlySales) || undefined}
            aria-describedby={errors.avgMonthlySales ? 'msme-avg-monthly-sales-error' : undefined}
            onChange={handleAmountFormat('avgMonthlySales')}
          />
        </div>
        {errors.avgMonthlySales && (
          <p id="msme-avg-monthly-sales-error" className="msme-field__error" role="alert">
            {errors.avgMonthlySales}
          </p>
        )}
      </div>

      {/* Requested Loan Amount */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-requested-amount">
          Requested Loan Amount <span className="msme-required">*</span>
        </label>
        <div className="msme-input-prefix-wrap">
          <span className="msme-input-prefix" aria-hidden="true">
            ₹
          </span>
          <input
            id="msme-requested-amount"
            className={`msme-field__input msme-input-with-prefix${amountError ? ' msme-field__input--error' : ''}`}
            placeholder="Enter requested loan amount"
            inputMode="numeric"
            value={data.requestedLoanAmount || data.loanAmount || ''}
            aria-invalid={Boolean(amountError) || undefined}
            aria-describedby={amountError ? 'msme-requested-amount-error' : undefined}
            onChange={handleAmountFormat('requestedLoanAmount')}
          />
        </div>
        {amountError && (
          <p id="msme-requested-amount-error" className="msme-field__error" role="alert">
            {amountError}
          </p>
        )}
      </div>

      {/* Loan Purpose */}
      <InlineSelect
        id="msme-loan-purpose"
        label="Loan Purpose"
        placeholder="Select loan purpose"
        options={LOAN_PURPOSE_OPTIONS}
        value={data.loanPurpose}
        onChange={(loanPurpose) => onChange({ loanPurpose })}
        error={errors.loanPurpose}
      />
    </section>
  )
}

export default BusinessInformationCard
