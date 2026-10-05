import React, { useState } from 'react'
import { StepActionBar } from '@shared/components'
import {
  type NoticeFormData,
  ASSESSMENT_YEAR_OPTIONS,
  NOTICE_TYPE_OPTIONS,
} from '../../../types/taxNoticeAssistance.types'
import './NoticeInformation.css'

export interface NoticeInformationProps {
  formData: NoticeFormData
  onChange: (patch: Partial<NoticeFormData>) => void
  onNext: () => void
  onBack: () => void
  onSaveDraftAndExit: () => void
}

export const NoticeInformation: React.FC<NoticeInformationProps> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveDraftAndExit,
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const panValid = !formData.pan || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.trim().toUpperCase())
  const hasPan = formData.pan.trim().length === 10 && panValid
  const hasAy = formData.assessmentYear.trim().length > 0
  const hasNoticeType = formData.noticeType.trim().length > 0
  const hasNoticeDate = formData.noticeDate.trim().length > 0
  const hasNoticeRef = formData.noticeReference.trim().length > 0
  const hasDueDate = formData.responseDueDate.trim().length > 0
  const hasExplanation = formData.explanation.trim().length > 0

  const canProceed =
    hasPan &&
    hasAy &&
    hasNoticeType &&
    hasNoticeDate &&
    hasNoticeRef &&
    hasDueDate &&
    hasExplanation

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      pan: true,
      assessmentYear: true,
      noticeType: true,
      noticeDate: true,
      noticeReference: true,
      responseDueDate: true,
      explanation: true,
    })

    if (canProceed) {
      onNext()
    }
  }

  return (
    <form className="notice-form" onSubmit={handleSubmit} noValidate>
      {/* Heading Section */}
      <div className="notice-form__intro">
        <h2 className="notice-form__heading">Enter Notice Information</h2>
        <p className="notice-form__subheading">
          Provide details from your notice. This helps our Tax Executive analyze the legal sections and prepare your defense.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="notice-form__grid">
        {/* PAN Field */}
        <div className="notice-field">
          <label htmlFor="notice-pan" className="notice-field__label">
            Permanent Account Number (PAN) <span className="notice-field__required">*</span>
          </label>
          <input
            id="notice-pan"
            type="text"
            maxLength={10}
            className={`notice-field__input ${touched.pan && !hasPan ? 'notice-field__input--error' : ''}`}
            placeholder="Enter your PAN"
            value={formData.pan}
            onChange={(e) => onChange({ pan: e.target.value.toUpperCase() })}
            onBlur={() => handleBlur('pan')}
            autoCapitalize="characters"
          />
          {touched.pan && !hasPan && (
            <span className="notice-field__error">Enter a valid PAN</span>
          )}
        </div>

        {/* Assessment Year Field */}
        <div className="notice-field">
          <label htmlFor="notice-ay" className="notice-field__label">
            Assessment Year (AY) <span className="notice-field__required">*</span>
          </label>
          <div className="notice-field__select-wrapper">
            <select
              id="notice-ay"
              className={`notice-field__select ${touched.assessmentYear && !hasAy ? 'notice-field__select--error' : ''}`}
              value={formData.assessmentYear}
              onChange={(e) => onChange({ assessmentYear: e.target.value })}
              onBlur={() => handleBlur('assessmentYear')}
            >
              <option value="">Select Assessment Year</option>
              {ASSESSMENT_YEAR_OPTIONS.map((ay) => (
                <option key={ay} value={ay}>
                  {ay}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notice-field__select-icon">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {touched.assessmentYear && !hasAy && (
            <span className="notice-field__error">Please select an Assessment Year.</span>
          )}
        </div>

        {/* Notice Type / Section Field */}
        <div className="notice-field">
          <label htmlFor="notice-type" className="notice-field__label">
            Notice Type / Section <span className="notice-field__required">*</span>
          </label>
          <div className="notice-field__select-wrapper">
            <select
              id="notice-type"
              className={`notice-field__select ${touched.noticeType && !hasNoticeType ? 'notice-field__select--error' : ''}`}
              value={formData.noticeType}
              onChange={(e) => onChange({ noticeType: e.target.value })}
              onBlur={() => handleBlur('noticeType')}
            >
              <option value="">Select Notice Type / Section</option>
              {NOTICE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notice-field__select-icon">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {touched.noticeType && !hasNoticeType && (
            <span className="notice-field__error">Please select a Notice Type / Section.</span>
          )}
        </div>

        {/* Notice Date Field */}
        <div className="notice-field">
          <label htmlFor="notice-date" className="notice-field__label">
            Notice Date <span className="notice-field__required">*</span>
          </label>
          <div className="notice-field__date-wrapper">
            <input
              id="notice-date"
              type="date"
              className={`notice-field__input notice-field__input--date ${
                touched.noticeDate && !hasNoticeDate ? 'notice-field__input--error' : ''
              }`}
              value={formData.noticeDate}
              onChange={(e) => onChange({ noticeDate: e.target.value })}
              onBlur={() => handleBlur('noticeDate')}
            />
          </div>
          {touched.noticeDate && !hasNoticeDate && (
            <span className="notice-field__error">Please select the notice date.</span>
          )}
        </div>

        {/* Notice Reference Number */}
        <div className="notice-field">
          <label htmlFor="notice-ref" className="notice-field__label">
            Notice Reference Number / DIN <span className="notice-field__required">*</span>
          </label>
          <input
            id="notice-ref"
            type="text"
            className={`notice-field__input ${
              touched.noticeReference && !hasNoticeRef ? 'notice-field__input--error' : ''
            }`}
            placeholder="Enter notice reference number or DIN"
            value={formData.noticeReference}
            onChange={(e) => onChange({ noticeReference: e.target.value })}
            onBlur={() => handleBlur('noticeReference')}
          />
          {touched.noticeReference && !hasNoticeRef ? (
            <span className="notice-field__error">Please enter the notice reference / DIN number.</span>
          ) : (
            <span className="notice-field__help-text">
              Found at top-right corner of the IT Department notice.
            </span>
          )}
        </div>

        {/* Response Due Date */}
        <div className="notice-field">
          <label htmlFor="notice-due-date" className="notice-field__label">
            Response Due Date <span className="notice-field__required">*</span>
          </label>
          <div className="notice-field__date-wrapper">
            <input
              id="notice-due-date"
              type="date"
              className={`notice-field__input notice-field__input--date ${
                touched.responseDueDate && !hasDueDate ? 'notice-field__input--error' : ''
              }`}
              value={formData.responseDueDate}
              onChange={(e) => onChange({ responseDueDate: e.target.value })}
              onBlur={() => handleBlur('responseDueDate')}
            />
          </div>
          {touched.responseDueDate && !hasDueDate && (
            <span className="notice-field__error">Please specify the deadline date.</span>
          )}
        </div>

        {/* Info Banner */}
        <div className="notice-info-card notice-info-card--full">
          <svg className="notice-info-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="notice-info-card__text">
            <strong>Timely responses prevent penalty:</strong> If the due date has already lapsed or is within 7 days, our assigned Tax Professional will flag your case as high priority for expedited filing.
          </p>
        </div>

        {/* Issue Description / Explanation */}
        <div className="notice-field notice-field--full">
          <label htmlFor="notice-explanation" className="notice-field__label">
            Your Explanation / Discrepancy Summary <span className="notice-field__required">*</span>
          </label>
          <textarea
            id="notice-explanation"
            className={`notice-field__textarea ${
              touched.explanation && !hasExplanation ? 'notice-field__textarea--error' : ''
            }`}
            rows={3}
            placeholder="Describe what discrepancy or issue the notice mentions..."
            value={formData.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            onBlur={() => handleBlur('explanation')}
          />
          {touched.explanation && !hasExplanation && (
            <span className="notice-field__error">Please provide a brief explanation.</span>
          )}
        </div>
      </div>

      {/* Bottom Step Action Bar */}
      <StepActionBar
        onBack={onBack}
        onSaveDraft={onSaveDraftAndExit}
        nextLabel="Continue"
        nextType="submit"
        nextDisabled={!canProceed}
      />
    </form>
  )
}

// Backward compatibility export
export const NoticeStep1Details = NoticeInformation
export default NoticeInformation
