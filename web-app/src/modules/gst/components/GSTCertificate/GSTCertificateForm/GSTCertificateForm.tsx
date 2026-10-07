import type { ChangeEvent, FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { GST_CERTIFICATE_REQUEST_TYPES } from '@modules/gst/data/gstCertificateData'
import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { SaveDraftButton } from '@shared/saveDraft'
import type { CertificateFields } from '@modules/gst/hooks/useGSTCertificateFlow'
import './GSTCertificateForm.css'

interface GSTCertificateFormProps {
  values: CertificateFields
  onChange: <K extends keyof CertificateFields>(field: K, value: CertificateFields[K]) => void
  errors: Record<string, string>
  stepError: string | null
  contact: { mobile?: string; email?: string } | null
  isSubmitting?: boolean
  onSubmit: (e?: FormEvent) => void
  onSaveDraft: () => void
}

/** Certificate request form; values, validation and drafts are handled by useGSTCertificateFlow */
export const GSTCertificateForm = ({
  values,
  onChange,
  errors,
  stepError,
  contact: user,
  isSubmitting = false,
  onSubmit,
  onSaveDraft,
}: GSTCertificateFormProps) => {
  const { gstin, requestType: selectedRequestType } = values

  return (
    <div className="gcf-root">
      {/* Two-column layout */}
      <div className="gcf-layout">
        {/* ── LEFT: Form ── */}
        <form className="gcf-form" onSubmit={onSubmit} noValidate>
          {/* Field 1: GSTIN */}
          <div className="gcf-field">
            <div className="gcf-field__label-row">
              <div className="gcf-field__icon gcf-field__icon--blue">
                <svg viewBox="0 0 24 24" className="gcf-svg-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <label htmlFor="gcf-gstin" className="gcf-field__label">
                GSTIN (15-Character) <span className="gcf-field__required">*</span>
              </label>
            </div>
            <input
              id="gcf-gstin"
              type="text"
              className={`gcf-input ${errors.gstin ? 'has-error' : ''}`}
              placeholder="Enter your GSTIN"
              maxLength={15}
              value={gstin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('gstin', gstInput.gstin(e.target.value))}
            />
            <span className="gcf-field__hint">Enter your 15-digit GST Identification Number</span>
            {errors.gstin && <span className="gcf-field__error">{errors.gstin}</span>}
          </div>

          {/* Field 2: Registered Contact */}
          <div className="gcf-field">
            <div className="gcf-field__label-row">
              <div className="gcf-field__icon gcf-field__icon--blue">
                <svg viewBox="0 0 24 24" className="gcf-svg-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.37 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="gcf-field__label">Registered Contact Authorization</span>
            </div>
            <div className="gcf-contact-card">
              <div className="gcf-contact-card__left">
                <div className="gcf-contact-card__phone-icon">
                  <svg viewBox="0 0 24 24" className="gcf-svg-16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.37 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="gcf-contact-card__phone">{user?.mobile ? `+91 ${user.mobile}` : 'Signatory Mobile on record'}</p>
                  <p className="gcf-contact-card__email">{user?.email || 'Signatory Email on record'}</p>
                  <p className="gcf-contact-card__note">Official certificate copy will be issued to registered signatory credentials</p>
                </div>
              </div>
              <button type="button" className="gcf-contact-card__edit">
                <svg viewBox="0 0 24 24" className="gcf-svg-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            </div>
          </div>

          {/* Field 3: Request Type Dropdown */}
          <div className="gcf-field">
            <div className="gcf-field__label-row">
              <div className="gcf-field__icon gcf-field__icon--blue">
                <svg viewBox="0 0 24 24" className="gcf-svg-15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <label htmlFor="gcf-request-type" className="gcf-field__label">
                Request Type <span className="gcf-field__required">*</span>
              </label>
            </div>
            <div className="gcf-select-wrapper">
              <select
                id="gcf-request-type"
                className={`gcf-select ${!selectedRequestType ? 'is-placeholder' : ''} ${errors.requestType ? 'has-error' : ''}`}
                value={selectedRequestType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('requestType', e.target.value)}
              >
                <option value="" disabled hidden>
                  Select request type
                </option>
                {GST_CERTIFICATE_REQUEST_TYPES.map((t) => (
                  <option key={t.key} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="gcf-select-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="gcf-svg-18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            <span className="gcf-field__hint">Choose the certificate type you want to download</span>
            {errors.requestType && <span className="gcf-field__error">{errors.requestType}</span>}
          </div>

          {/* Info note */}
          <div className="gcf-info-note">
            <svg className="gcf-info-note__icon gcf-svg-18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>Your certificate will be generated using your GST registration details and saved as a PDF on your device.</span>
          </div>

          <GSTStepErrorBanner message={stepError} />

          <SaveDraftButton onClick={onSaveDraft} />

          {/* Submit button */}
          <button type="submit" disabled={isSubmitting} className="gcf-submit-btn">
            {isSubmitting ? 'Processing...' : 'DOWNLOAD CERTIFICATE (REG-06)'}
            {!isSubmitting && (
              <svg viewBox="0 0 24 24" className="gcf-svg-20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>

          {/* Trust footer */}
          <div className="gcf-trust-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gcf-trust-row__icon gcf-svg-13">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secure • Reliable • TaxEdge Verified</span>
          </div>
        </form>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="gcf-sidebar">
          {/* REG-06 Illustration */}
          <div className="gcf-sidebar__illustration">
            <div className="gcf-reg06-doc">
              <div className="gcf-reg06-doc__header">REG-06</div>
              <div className="gcf-reg06-doc__line" />
              <div className="gcf-reg06-doc__line gcf-reg06-doc__line--short" />
              <div className="gcf-reg06-doc__line" />
              <div className="gcf-reg06-doc__check">
                <svg viewBox="0 0 24 24" className="gcf-svg-18 gcf-stroke-white" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="gcf-sidebar__section">
            <h2 className="gcf-sidebar__heading">Key Information</h2>
            <div className="gcf-key-info-list">
              <div className="gcf-key-info-item">
                <div className="gcf-key-info-item__icon">
                  <svg viewBox="0 0 24 24" className="gcf-svg-18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="gcf-key-info-item__label">Form Type</p>
                  <p className="gcf-key-info-item__value">REG-06</p>
                </div>
              </div>
              <div className="gcf-key-info-item">
                <div className="gcf-key-info-item__icon">
                  <svg viewBox="0 0 24 24" className="gcf-svg-18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="gcf-key-info-item__label">Certificate</p>
                  <p className="gcf-key-info-item__value">GST Registration Certificate</p>
                </div>
              </div>
              <div className="gcf-key-info-item">
                <div className="gcf-key-info-item__icon">
                  <svg viewBox="0 0 24 24" className="gcf-svg-18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="gcf-key-info-item__label">Validity</p>
                  <p className="gcf-key-info-item__value">Permanent (unless cancelled)</p>
                </div>
              </div>
              <div className="gcf-key-info-item">
                <div className="gcf-key-info-item__icon">
                  <svg viewBox="0 0 24 24" className="gcf-svg-18" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <polyline points="9 11 12 14 15 11" />
                    <line x1="12" y1="8" x2="12" y2="14" />
                  </svg>
                </div>
                <div>
                  <p className="gcf-key-info-item__label">Mode</p>
                  <p className="gcf-key-info-item__value">PDF Download</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Updated */}
          <div className="gcf-stay-updated">
            <div className="gcf-stay-updated__icon">
              <svg viewBox="0 0 24 24" className="gcf-svg-18 gcf-stroke-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="gcf-stay-updated__title">Stay Updated</p>
              <p className="gcf-stay-updated__text">We will notify you via email and SMS about any updates on your application.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
