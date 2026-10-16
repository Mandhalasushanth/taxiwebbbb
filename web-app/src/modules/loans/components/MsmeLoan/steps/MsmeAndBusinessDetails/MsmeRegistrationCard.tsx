import React from 'react'
import { Award } from 'lucide-react'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import { InlineSelect } from '../InlineSelect'
import {
  GST_REGISTRATION_STATUS_OPTIONS,
  UDYAM_REGISTRATION_STATUS_OPTIONS,
} from '../../msmeLoan.constants'

export const MsmeRegistrationCard: React.FC<MsmeLoanStepProps> = ({ data, onChange, errors = {} }) => {
  const handleUdyamStatusChange = (udyamStatus: string) => {
    onChange({
      udyamStatus,
      udyamNumber: udyamStatus === 'Registered' ? data.udyamNumber : '',
    })
  }

  const handleGstStatusChange = (gstStatus: string) => {
    onChange({
      gstStatus,
      gstin: gstStatus === 'Registered' ? data.gstin : '',
    })
  }

  const handleUdyamNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 19)
      onChange({ udyamNumber: sanitized })
    } catch (err) {
      console.error('Error updating udyam number', err)
    }
  }

  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const sanitized = e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 15)
      onChange({ gstin: sanitized })
    } catch (err) {
      console.error('Error updating GSTIN', err)
    }
  }

  return (
    <section className="msme-card" aria-labelledby="msme-registration-title">
      <div className="msme-card__header">
        <span className="msme-card__icon msme-card__icon--orange">
          <Award size={20} aria-hidden="true" />
        </span>
        <h2 id="msme-registration-title" className="msme-card__title">
          MSME Registration
        </h2>
      </div>

      {/* Udyam / MSME Registration Status */}
      <InlineSelect
        id="msme-udyam-status"
        label="Udyam / MSME Registration Status"
        placeholder="Select registration status"
        options={UDYAM_REGISTRATION_STATUS_OPTIONS}
        value={data.udyamStatus}
        onChange={handleUdyamStatusChange}
        error={errors.udyamStatus}
      />

      {/* Conditional: Udyam Registration Number */}
      {data.udyamStatus === 'Registered' && (
        <div className="msme-field">
          <label className="msme-field__label" htmlFor="msme-udyam-number">
            Udyam Registration Number <span className="msme-required">*</span>
          </label>
          <input
            id="msme-udyam-number"
            className={`msme-field__input${errors.udyamNumber ? ' msme-field__input--error' : ''}`}
            placeholder="UDYAM-XX-00-0000000"
            value={data.udyamNumber || ''}
            maxLength={19}
            aria-invalid={Boolean(errors.udyamNumber) || undefined}
            aria-describedby={errors.udyamNumber ? 'msme-udyam-number-error' : undefined}
            onChange={handleUdyamNumberChange}
          />
          {errors.udyamNumber && (
            <p id="msme-udyam-number-error" className="msme-field__error" role="alert">
              {errors.udyamNumber}
            </p>
          )}
        </div>
      )}

      {/* GST Registration Status */}
      <InlineSelect
        id="msme-gst-status"
        label="GST Registration Status"
        placeholder="Select GST status"
        options={GST_REGISTRATION_STATUS_OPTIONS}
        value={data.gstStatus}
        onChange={handleGstStatusChange}
        error={errors.gstStatus}
      />

      {/* Conditional: GSTIN */}
      {data.gstStatus === 'Registered' && (
        <div className="msme-field">
          <label className="msme-field__label" htmlFor="msme-gstin">
            GSTIN <span className="msme-required">*</span>
          </label>
          <input
            id="msme-gstin"
            className={`msme-field__input${errors.gstin ? ' msme-field__input--error' : ''}`}
            placeholder="e.g. 27ABCDE1234F1Z5"
            value={data.gstin || ''}
            maxLength={15}
            aria-invalid={Boolean(errors.gstin) || undefined}
            aria-describedby={errors.gstin ? 'msme-gstin-error' : undefined}
            onChange={handleGstinChange}
          />
          {errors.gstin && (
            <p id="msme-gstin-error" className="msme-field__error" role="alert">
              {errors.gstin}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default MsmeRegistrationCard
