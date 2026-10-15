import React from 'react'
import { TrendingUp, ArrowLeftRight } from 'lucide-react'
import type { BusinessWorkingCapitalStepProps } from '@modules/loans/types/businessWorkingCapital.types'
import { FormTextField } from '../FormTextField'
import { InlineSelect } from '../InlineSelect'
import {
  BUSINESS_PROFILE_LIMITS as L,
  LOAN_PURPOSE_OPTIONS,
  REQUIREMENTS_COPY,
} from './businessProfile.constants'
import { BUSINESS_PROFILE_INPUT } from './businessProfileInput'

/** Amount, purpose, description, and monthly financial metrics matching the screenshot */
export const LoanRequirementsCard: React.FC<Required<BusinessWorkingCapitalStepProps>> = ({ data, onChange, errors }) => {
  const copy = REQUIREMENTS_COPY[data.financingFacility]
  const isWorkingCapital = data.financingFacility === 'working-capital'

  return (
    <section className="bwc-card" aria-labelledby="bwc-requirements-title">
      <div className="bwc-card__header">
        <span className="bwc-card__icon bwc-card__icon--navy">
          {isWorkingCapital ? <ArrowLeftRight size={20} aria-hidden="true" /> : <TrendingUp size={20} aria-hidden="true" />}
        </span>
        <h2 id="bwc-requirements-title" className="bwc-card__title">
          {copy.title}
        </h2>
      </div>
      <p className="bwc-card__subtitle">{copy.subtitle}</p>

      <FormTextField
        id="bwc-loan-amount"
        label={copy.amountLabel}
        placeholder={copy.amountPlaceholder}
        inputMode="numeric"
        prefix="₹"
        value={data.loanAmount}
        onChange={(value) => onChange({ loanAmount: BUSINESS_PROFILE_INPUT.loanAmount(value) })}
        hint={copy.amountHint}
        error={errors.loanAmount}
      />
      <InlineSelect
        id="bwc-loan-purpose"
        label={copy.purposeLabel}
        placeholder={copy.purposePlaceholder}
        options={LOAN_PURPOSE_OPTIONS[data.financingFacility]}
        value={data.loanPurpose}
        onChange={(loanPurpose) => onChange({ loanPurpose })}
        error={errors.loanPurpose}
      />
      <FormTextField
        id="bwc-purpose-description"
        label={copy.descriptionLabel}
        placeholder={copy.descriptionPlaceholder}
        multiline
        maxLength={L.purposeDescriptionMax}
        value={data.purposeDescription}
        onChange={(value) => onChange({ purposeDescription: BUSINESS_PROFILE_INPUT.purposeDescription(value) })}
        error={errors.purposeDescription}
      />

      <div className="bwc-row">
        <FormTextField
          id="bwc-avg-monthly-sales"
          label="Avg Monthly Sales"
          placeholder="e.g. 8,00,000"
          inputMode="numeric"
          prefix="₹"
          value={data.avgMonthlySales}
          onChange={(value) => onChange({ avgMonthlySales: BUSINESS_PROFILE_INPUT.avgMonthlySales(value) })}
          hint="Gross revenue"
          error={errors.avgMonthlySales}
        />
        <FormTextField
          id="bwc-avg-monthly-expenses"
          label="Avg Monthly Expenses"
          placeholder="e.g. 5,50,000"
          inputMode="numeric"
          prefix="₹"
          value={data.avgMonthlyExpenses}
          onChange={(value) => onChange({ avgMonthlyExpenses: BUSINESS_PROFILE_INPUT.avgMonthlyExpenses(value) })}
          hint="Rent, stock, payroll"
          error={errors.avgMonthlyExpenses}
        />
      </div>
    </section>
  )
}

export default LoanRequirementsCard

