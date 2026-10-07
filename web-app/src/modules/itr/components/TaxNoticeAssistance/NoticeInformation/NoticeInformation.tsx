import React, { useState, useRef, useEffect } from 'react'
import { StepActionBar } from '@shared/components'
import {
  type NoticeFormData,
  ASSESSMENT_YEAR_OPTIONS,
  NOTICE_TYPE_DETAILS,
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
  const [noticeTypeOpen, setNoticeTypeOpen] = useState(false)
  const noticeTypeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noticeTypeRef.current && !noticeTypeRef.current.contains(event.target as Node)) {
        setNoticeTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [isOtherAy, setIsOtherAy] = useState<boolean>(() => {
    return Boolean(
      formData.assessmentYear &&
      formData.assessmentYear !== 'Other' &&
      !ASSESSMENT_YEAR_OPTIONS.includes(formData.assessmentYear)
    )
  })

  const panValid = !formData.pan || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.trim().toUpperCase())
  const hasPan = formData.pan.trim().length === 10 && panValid
  const hasAy = formData.assessmentYear.trim().length > 0 && formData.assessmentYear !== 'Other'
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
          {!isOtherAy ? (
            <div className="notice-field__select-wrapper">
              <select
                id="notice-ay"
                className={`notice-field__select ${
                  !formData.assessmentYear ? 'notice-field__select--placeholder' : ''
                } ${touched.assessmentYear && !hasAy ? 'notice-field__select--error' : ''}`}
                value={formData.assessmentYear}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setIsOtherAy(true)
                    onChange({ assessmentYear: '' })
                  } else {
                    onChange({ assessmentYear: e.target.value })
                  }
                }}
                onBlur={() => handleBlur('assessmentYear')}
              >
                <option value="" className="notice-field__option-placeholder">Select Assessment Year</option>
                {ASSESSMENT_YEAR_OPTIONS.map((ay) => (
                  <option key={ay} value={ay}>
                    {ay}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notice-field__select-icon">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          ) : (
            <div className="notice-field__other-input-wrapper">
              <input
                id="notice-ay"
                type="text"
                className={`notice-field__input ${
                  touched.assessmentYear && !hasAy ? 'notice-field__input--error' : ''
                }`}
                placeholder="E.g., AY 2028-29"
                value={formData.assessmentYear}
                onChange={(e) => onChange({ assessmentYear: e.target.value })}
                onBlur={() => handleBlur('assessmentYear')}
                autoFocus
              />
              <button
                type="button"
                className="notice-field__clear-cross-btn"
                onClick={() => {
                  setIsOtherAy(false)
                  onChange({ assessmentYear: '' })
                }}
                aria-label="Clear and choose from list"
                title="Clear and choose from list"
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
          {touched.assessmentYear && !hasAy && (
            <span className="notice-field__error">
              {isOtherAy ? 'Please enter an Assessment Year.' : 'Please select an Assessment Year.'}
            </span>
          )}
        </div>

        {/* Notice Type / Section Field */}
        <div className="notice-field" ref={noticeTypeRef}>
          <label htmlFor="notice-type" className="notice-field__label">
            Notice Type / Section <span className="notice-field__required">*</span>
          </label>
          <div className="notice-field__custom-select-container">
            {/* Hidden native select for accessibility and test runner compatibility */}
            <select
              id="notice-type"
              aria-hidden="true"
              tabIndex={-1}
              className="notice-field__select-hidden-native"
              value={formData.noticeType}
              onChange={(e) => {
                onChange({ noticeType: e.target.value })
                handleBlur('noticeType')
              }}
            >
              <option value="">Select Notice Type</option>
              {NOTICE_TYPE_DETAILS.map((opt) => (
                <option key={opt.title} value={opt.title}>
                  {opt.title}
                </option>
              ))}
            </select>

            {/* Custom Interactive Dropdown Trigger matching Image 2 */}
            <button
              type="button"
              className={`notice-field__select-trigger ${
                !formData.noticeType ? 'notice-field__select-trigger--placeholder' : ''
              } ${noticeTypeOpen ? 'notice-field__select-trigger--open' : ''} ${
                touched.noticeType && !hasNoticeType ? 'notice-field__select-trigger--error' : ''
              }`}
              onClick={() => setNoticeTypeOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={noticeTypeOpen}
            >
              <span className="notice-field__select-trigger-text">
                {formData.noticeType || 'Select Notice Type'}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className={`notice-field__chevron-icon ${noticeTypeOpen ? 'icon-chevron-up' : 'icon-chevron-down'}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Custom Options List Menu matching Image 2 */}
            {noticeTypeOpen && (
              <div className="notice-type-dropdown-menu" role="listbox">
                {NOTICE_TYPE_DETAILS.map((option) => {
                  const isSelected = formData.noticeType === option.title
                  return (
                    <div
                      key={option.title}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      className={`notice-type-option-item ${
                        isSelected ? 'notice-type-option-item--selected' : ''
                      }`}
                      onClick={() => {
                        onChange({ noticeType: option.title })
                        setNoticeTypeOpen(false)
                        handleBlur('noticeType')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onChange({ noticeType: option.title })
                          setNoticeTypeOpen(false)
                          handleBlur('noticeType')
                        }
                      }}
                    >
                      <div className="notice-type-option-title">{option.title}</div>
                      <div className="notice-type-option-desc">{option.description}</div>
                    </div>
                  )
                })}
              </div>
            )}
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
                !formData.noticeDate ? 'notice-field__input--date-empty' : ''
              } ${
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
                !formData.responseDueDate ? 'notice-field__input--date-empty' : ''
              } ${
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
