import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { StepActionBar } from '@shared/components'
import { GSTBusinessDetails } from '../GSTBusinessDetails/GSTBusinessDetails'
import { GSTBankDetails } from '../GSTBankDetails/GSTBankDetails'
import { GSTAuthorisedSignatory } from '../GSTAuthorisedSignatory/GSTAuthorisedSignatory'
import { validateGstBusinessForm } from '@modules/gst/validation/gstStepBusiness.validator'
import './GSTStepBusiness.css'

import { type GstBusinessFormData, type BusinessFormData } from '@modules/gst/types/gstBusiness.types'
export type { GstBusinessFormData, BusinessFormData }

interface GSTStepBusinessProps {
  data: GstBusinessFormData
  isEditMode?: boolean
  /** Review section chosen with "Edit" — the matching card is scrolled into view */
  focusSection?: string | null
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  onNext: () => void
  onCancel?: () => void
  onSaveDraft?: () => void
}

const AADHAAR_CONSENT_TEXT = 'I consent to Aadhaar authentication (e-KYC) for this GST registration.'

/** Review "Edit" section → the card that holds those fields */
const SECTION_ANCHORS: Record<string, string> = {
  business: 'gst-business-identity',
  bank: 'gst-bank-details',
  signatory: 'gst-authorised-signatory',
}

export const GSTStepBusiness = ({
  data,
  isEditMode = false,
  focusSection = null,
  onChange,
  onNext,
  onCancel,
  onSaveDraft,
}: GSTStepBusinessProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepError, setStepError] = useState<string | null>(null)

  // Opened from a Review "Edit": bring the chosen card into view (after the step's scroll-to-top)
  useEffect(() => {
    const anchorId = focusSection ? SECTION_ANCHORS[focusSection] : undefined
    if (!anchorId) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusSection])

  const clearErr = (k: string) => {
    setStepError(null)
    setErrors((prev) => {
      if (!prev[k]) return prev
      const { [k]: _, ...rest } = prev
      return rest
    })
  }

  const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('aadhaarConsent', e.target.checked)
    clearErr('aadhaarConsent')
  }

  const scrollToField = (field: string) => {
    // Wait a frame so a collapsed section holding the error has opened
    requestAnimationFrame(() => {
      const el = document.querySelector(`[name="${field}"], #${field}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const errs = validateGstBusinessForm(data)
    const firstErrorField = Object.keys(errs)[0]
    if (firstErrorField) {
      setErrors(errs)
      setStepError(GST_STEP_ERROR)
      scrollToField(firstErrorField)
      return
    }
    onNext()
  }

  const consentClass = [
    'gst-consent-card',
    data.aadhaarConsent ? 'gst-consent-card--checked' : '',
    errors.aadhaarConsent ? 'gst-consent-card--error' : '',
  ].filter(Boolean).join(' ')

  return (
    <form className="gst-step-business" onSubmit={handleSubmit} noValidate>
      <GSTBusinessDetails data={data} onChange={onChange} errors={errors} onClearError={clearErr} />
      <GSTBankDetails data={data} onChange={onChange} errors={errors} onClearError={clearErr} />
      <GSTAuthorisedSignatory data={data} onChange={onChange} errors={errors} onClearError={clearErr} />

      <div className={consentClass}>
        <label htmlFor="aadhaarConsent" className="gst-consent-card__label">
          <input
            id="aadhaarConsent"
            name="aadhaarConsent"
            type="checkbox"
            checked={data.aadhaarConsent}
            onChange={handleConsentChange}
            className="gst-consent-card__checkbox"
            aria-invalid={Boolean(errors.aadhaarConsent)}
            aria-describedby={errors.aadhaarConsent ? 'aadhaarConsent-error' : undefined}
          />
          <span className="gst-consent-card__text">{AADHAAR_CONSENT_TEXT}</span>
        </label>
        {errors.aadhaarConsent && (
          <span id="aadhaarConsent-error" className="gst-consent-card__error" role="alert">
            {errors.aadhaarConsent}
          </span>
        )}
      </div>

      <GSTStepErrorBanner message={stepError} />

      <StepActionBar
        onBack={onCancel}
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        isEditMode={isEditMode}
      />
    </form>
  )
}

export default GSTStepBusiness
