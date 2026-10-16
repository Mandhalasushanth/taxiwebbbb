import React from 'react'
import { Briefcase, Calendar } from 'lucide-react'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { InlineSelect } from '../InlineSelect'
import { PRIMARY_BUSINESS_ACTIVITY_OPTIONS } from '../../msmeLoan.constants'

const todayIso = (): string => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const BusinessActivityCard: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  return (
    <section className="msme-card" aria-labelledby="msme-business-activity-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--orange">
          <Briefcase size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-business-activity-title" className="msme-card__title">
          Business Activity
        </h2>
      </div>

      {/* Primary Business Activity */}
      <InlineSelect
        id="msme-business-activity"
        label="Primary Business Activity"
        placeholder="Select business activity"
        options={PRIMARY_BUSINESS_ACTIVITY_OPTIONS}
        value={data.businessActivity}
        onChange={(businessActivity) => onChange({ businessActivity })}
        error={errors.businessActivity}
      />

      {/* Business Establishment Date */}
      <div className="msme-field">
        <label className="msme-field__label" htmlFor="msme-establishment-date">
          Business Establishment Date <span className="msme-required">*</span>
        </label>
        <div className="msme-date-input-wrap">
          <input
            id="msme-establishment-date"
            type="date"
            className={`msme-field__input${errors.establishmentDate ? ' msme-field__input--error' : ''}`}
            placeholder="Select establishment date"
            max={todayIso()}
            value={data.establishmentDate || ''}
            aria-invalid={Boolean(errors.establishmentDate) || undefined}
            aria-describedby={errors.establishmentDate ? 'msme-establishment-date-error' : undefined}
            onChange={(e) => onChange({ establishmentDate: e.target.value })}
          />
          <Calendar size={18} className="msme-date-icon" aria-hidden="true" />
        </div>
        {errors.establishmentDate && (
          <p id="msme-establishment-date-error" className="msme-field__error" role="alert">
            {errors.establishmentDate}
          </p>
        )}
      </div>
    </section>
  )
}

export default BusinessActivityCard
