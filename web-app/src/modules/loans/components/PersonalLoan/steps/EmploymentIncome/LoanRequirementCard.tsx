import React from 'react'
import { Banknote } from 'lucide-react'

export interface LoanRequirementCardProps {
  amount: string
  onChange: (amount: string) => void
  error?: string
}

export const LoanRequirementCard: React.FC<LoanRequirementCardProps> = ({
  amount,
  onChange,
  error,
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 8)
      if (!numeric) {
        onChange('')
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange(formatted)
    } catch (err) {
      console.error('Error formatting loan amount', err)
      onChange(e.target.value)
    }
  }

  return (
    <section className="pl-card" aria-labelledby="pl-loan-need-title">
      <div className="pl-card__header">
        <span className="pl-card__icon pl-card__icon--navy">
          <Banknote size={20} aria-hidden="true" />
        </span>
        <h2 id="pl-loan-need-title" className="pl-card__title">
          How much loan do you need?
        </h2>
      </div>

      <div className="pl-field">
        <label className="pl-field__label" htmlFor="pl-requested-amount">
          Requested Loan Amount <span className="pl-required">*</span>
        </label>
        <div className="pl-input-prefix-wrap">
          <span className="pl-input-prefix" aria-hidden="true">
            ₹
          </span>
          <input
            id="pl-requested-amount"
            className={`pl-field__input pl-input-with-prefix${error ? ' pl-field__input--error' : ''}`}
            placeholder="e.g. 2,50,000"
            inputMode="numeric"
            value={amount}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'pl-requested-amount-error' : undefined}
            onChange={handleAmountChange}
          />
        </div>
        {error && (
          <p id="pl-requested-amount-error" className="pl-field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

export default LoanRequirementCard
