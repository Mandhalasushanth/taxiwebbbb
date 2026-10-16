import React from 'react'
import { Building2 } from 'lucide-react'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { InlineSelect } from '../InlineSelect'
import { BUSINESS_CONSTITUTION_OPTIONS } from '../../msmeLoan.constants'

export const BusinessDetailsCard: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .replace(/[^A-Za-z0-9 .,/&()'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trimStart()
        .slice(0, 100)
      onChange({ businessName: sanitized })
    } catch (err) {
      console.error('Error updating business name', err)
    }
  }

  return (
    <section className="msme-card" aria-labelledby="msme-business-details-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--navy">
          <Building2 size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-business-details-title" className="msme-card__title">
          Business Details
        </h2>
      </div>

      {/* Business / Trade Name */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-business-name">
          Business / Trade Name <span className="msme-required">*</span>
        </label>
        <input
          id="msme-business-name"
          className={`msme-field__input${errors.businessName ? ' msme-field__input--error' : ''}`}
          placeholder="Enter business name"
          value={data.businessName || ''}
          maxLength={100}
          autoComplete="organization"
          aria-invalid={Boolean(errors.businessName) || undefined}
          aria-describedby={errors.businessName ? 'msme-business-name-error' : undefined}
          onChange={handleNameChange}
        />
        {errors.businessName && (
          <p id="msme-business-name-error" className="msme-field__error" role="alert">
            {errors.businessName}
          </p>
        )}
      </div>

      {/* Business Constitution */}
      <InlineSelect
        id="msme-business-constitution"
        label="Business Constitution"
        placeholder="Select business constitution"
        options={BUSINESS_CONSTITUTION_OPTIONS}
        value={data.businessConstitution}
        onChange={(businessConstitution) => onChange({ businessConstitution })}
        error={errors.businessConstitution}
      />
    </section>
  )
}

export default BusinessDetailsCard
