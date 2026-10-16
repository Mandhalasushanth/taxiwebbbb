import React from 'react'
import { Briefcase, Building, Store } from 'lucide-react'
import type { PersonalLoanFormData } from '@modules/loans/types/personalLoan.types'
import {
  JOB_TYPE_OPTIONS,
  SALARY_RECEIVE_OPTIONS,
  SELF_EMPLOYED_BUSINESS_TYPES,
  WORK_EXPERIENCE_OPTIONS,
} from '../../personalLoan.constants'
import { InlineSelect } from '../InlineSelect'

export interface EmploymentDetailsCardProps {
  data: PersonalLoanFormData
  onChange: (fields: Partial<PersonalLoanFormData>) => void
  errors?: Record<string, string>
}

export const EmploymentDetailsCard: React.FC<EmploymentDetailsCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const isSalaried = data.employmentType === 'salaried'
  const cardTitle = isSalaried ? 'Employment Details' : 'Business / Profession Details'
  const employerLabel = isSalaried ? 'Company / Employer Name' : 'Business / Profession Name'
  const employerPlaceholder = isSalaried ? 'e.g. Tata Consultancy Services' : 'e.g. Rohit Enterprises'
  const jobLabel = isSalaried ? 'Job Type' : 'Nature of Business / Profession'
  const jobPlaceholder = isSalaried ? 'Select Job Type' : 'Select nature of business'
  const salaryLabel = isSalaried ? 'Monthly Net Salary' : 'Average Monthly Income'
  const salaryPlaceholder = isSalaried ? 'e.g. 75,000' : 'e.g. 60,000'
  const experienceLabel = isSalaried ? 'Work Experience' : 'Years in Business'
  const experiencePlaceholder = isSalaried ? 'Select Work Experience' : 'Select years in business'

  const jobOptions = isSalaried ? JOB_TYPE_OPTIONS : SELF_EMPLOYED_BUSINESS_TYPES

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const numeric = e.target.value.replace(/\D/g, '').slice(0, 8)
      if (!numeric) {
        onChange({ monthlySalary: '' })
        return
      }
      const formatted = Number(numeric).toLocaleString('en-IN')
      onChange({ monthlySalary: formatted })
    } catch (err) {
      console.error('Error formatting monthly salary', err)
      onChange({ monthlySalary: e.target.value })
    }
  }

  const jobSelectOptions = jobOptions.map((opt) => ({
    value: opt,
    label: opt,
  }))

  const experienceSelectOptions = WORK_EXPERIENCE_OPTIONS.map((exp) => ({
    value: exp,
    label: exp,
  }))

  const salaryModeSelectOptions = SALARY_RECEIVE_OPTIONS.map((mode) => ({
    value: mode,
    label: mode,
  }))

  return (
    <section className="pl-card" aria-labelledby="pl-emp-details-title">
      <div className="pl-card__header">
        <span className="pl-card__icon pl-card__icon--navy">
          {isSalaried ? (
            <Briefcase size={20} aria-hidden="true" />
          ) : (
            <Store size={20} aria-hidden="true" />
          )}
        </span>
        <h2 id="pl-emp-details-title" className="pl-card__title">
          {cardTitle}
        </h2>
      </div>

      {/* Company / Employer / Business Name */}
      <div className="pl-field">
        <label className="pl-field__label" htmlFor="pl-employer-name">
          {employerLabel} <span className="pl-required">*</span>
        </label>
        <div className="pl-input-prefix-wrap">
          <Building size={18} className="pl-input-prefix-icon" aria-hidden="true" />
          <input
            id="pl-employer-name"
            className={`pl-field__input pl-input-with-prefix${errors.employerName ? ' pl-field__input--error' : ''}`}
            placeholder={employerPlaceholder}
            value={data.employerName}
            maxLength={100}
            aria-invalid={Boolean(errors.employerName) || undefined}
            aria-describedby={errors.employerName ? 'pl-employer-name-error' : undefined}
            onChange={(e) => onChange({ employerName: e.target.value })}
          />
        </div>
        {errors.employerName && (
          <p id="pl-employer-name-error" className="pl-field__error" role="alert">
            {errors.employerName}
          </p>
        )}
      </div>

      {/* Job Type / Nature of Business – Inline dropdown */}
      <InlineSelect
        id="pl-job-type"
        label={jobLabel}
        placeholder={jobPlaceholder}
        options={jobSelectOptions}
        value={data.jobType}
        onChange={(jobType) => onChange({ jobType })}
        error={errors.jobType}
      />

      {/* Monthly Net Salary / Average Monthly Income */}
      <div className="pl-field">
        <label className="pl-field__label" htmlFor="pl-monthly-salary">
          {salaryLabel} <span className="pl-required">*</span>
        </label>
        <div className="pl-input-prefix-wrap">
          <span className="pl-input-prefix" aria-hidden="true">
            ₹
          </span>
          <input
            id="pl-monthly-salary"
            className={`pl-field__input pl-input-with-prefix${errors.monthlySalary ? ' pl-field__input--error' : ''}`}
            placeholder={salaryPlaceholder}
            inputMode="numeric"
            value={data.monthlySalary}
            aria-invalid={Boolean(errors.monthlySalary) || undefined}
            aria-describedby={errors.monthlySalary ? 'pl-monthly-salary-error' : undefined}
            onChange={handleSalaryChange}
          />
        </div>
        {errors.monthlySalary && (
          <p id="pl-monthly-salary-error" className="pl-field__error" role="alert">
            {errors.monthlySalary}
          </p>
        )}
      </div>

      {/* Work Experience / Years in Business – Inline dropdown */}
      <InlineSelect
        id="pl-work-exp"
        label={experienceLabel}
        placeholder={experiencePlaceholder}
        options={experienceSelectOptions}
        value={data.workExperience}
        onChange={(workExperience) => onChange({ workExperience })}
        error={errors.workExperience}
      />

      {/* How do you receive your salary? – Only for Salaried applicants */}
      {isSalaried && (
        <InlineSelect
          id="pl-salary-mode"
          label="How do you receive your salary?"
          placeholder="Select salary receipt mode"
          options={salaryModeSelectOptions}
          value={data.salaryReceivedMode}
          onChange={(salaryReceivedMode) => onChange({ salaryReceivedMode })}
          error={errors.salaryReceivedMode}
        />
      )}
    </section>
  )
}

export default EmploymentDetailsCard
