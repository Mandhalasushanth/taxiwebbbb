import React from 'react'
import type { PersonalLoanStepProps } from '@modules/loans/types/personalLoan.types'
import { LoanRequirementCard } from './LoanRequirementCard'
import { EmploymentTypeSelector } from './EmploymentTypeSelector'
import { EmploymentDetailsCard } from './EmploymentDetailsCard'
import './EmploymentIncome.css'

/** Step 2: Loan Requirements and Employment / Income details */
export const EmploymentIncome: React.FC<PersonalLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="pl-step" data-testid="pl-step-employment">
      <LoanRequirementCard
        amount={data.requestedLoanAmount}
        onChange={(requestedLoanAmount) => onChange({ requestedLoanAmount })}
        error={errors.requestedLoanAmount}
      />

      <EmploymentTypeSelector
        value={data.employmentType}
        onChange={(employmentType) => onChange({ employmentType })}
        error={errors.employmentType}
      />

      <EmploymentDetailsCard
        data={data}
        onChange={onChange}
        errors={errors}
      />
    </div>
  )
}

export default EmploymentIncome
