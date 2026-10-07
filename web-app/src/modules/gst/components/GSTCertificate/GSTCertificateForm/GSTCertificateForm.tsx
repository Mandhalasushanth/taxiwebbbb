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

/**
 * Screen 1: Download GST Registration Certificate (REG-06)
 * Replicates the official mobile screen reference adapted for web responsiveness.
 */
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

  const displayPhone = user?.mobile ? `+91 ${user.mobile}` : '+91 9494949949'
  const displayEmail = user?.email || 'hi@gmail.com'

  return (
    <div className="gst-cert-container">
      {/* ── Top Bar Header ── */}
      <div className="gst-cert-top-bar">
        <h2 className="gst-cert-top-title">GST Certificate (REG-06)</h2>
        <div className="gst-cert-taxedge-pill">TaxEdge</div>
      </div>

      {/* ── Heading Banner with Right Certificate Graphic ── */}
      <div className="gst-cert-header-card">
        <div className="gst-cert-header-left">
          <span className="gst-cert-kicker">OFFICIAL GOVERNMENT COPY</span>
          <h1 className="gst-cert-heading">Download GST Registration Certificate</h1>
          <p className="gst-cert-subheading">
            Form GST REG-06 issued under Goods and Services Tax Act, 2017.
          </p>
        </div>

        <div className="gst-cert-header-graphic" aria-hidden="true">
          <div className="gst-cert-doc-card">
            <span className="gst-cert-doc-text">GST</span>
            <div className="gst-cert-doc-lines">
              <span className="gst-cert-doc-line" />
              <span className="gst-cert-doc-line gst-cert-doc-line--short" />
            </div>
            <div className="gst-cert-doc-badge">
              <svg viewBox="0 0 24 24" className="gst-cert-doc-badge-svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Cards Stack ── */}
      <form className="gst-cert-form" onSubmit={onSubmit} noValidate>
        {/* Card 1: GSTIN Number */}
        <div className="gst-cert-card">
          <div className="gst-cert-card__header">
            <div className="gst-cert-card__icon-box">
              <svg viewBox="0 0 24 24" className="gst-cert-card__icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" />
              </svg>
            </div>
            <label htmlFor="gst-cert-gstin-input" className="gst-cert-card__label">
              GSTIN Number <span className="gst-cert-required">*</span>
            </label>
          </div>

          <div className="gst-cert-field-wrap">
            <input
              id="gst-cert-gstin-input"
              type="text"
              className={`gst-cert-text-input ${errors.gstin ? 'has-error' : ''}`}
              placeholder="Enter your GSTIN number"
              maxLength={15}
              value={gstin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('gstin', gstInput.gstin(e.target.value))}
            />
            <p className="gst-cert-field-hint">Enter 15-character GSTIN for certificate download</p>
            {errors.gstin && <p className="gst-cert-field-error">{errors.gstin}</p>}
          </div>
        </div>

        {/* Card 2: Request Purpose */}
        <div className="gst-cert-card">
          <div className="gst-cert-card__header">
            <div className="gst-cert-card__icon-box">
              <svg viewBox="0 0 24 24" className="gst-cert-card__icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </div>
            <label htmlFor="gst-cert-purpose-select" className="gst-cert-card__label">
              Request Purpose <span className="gst-cert-required">*</span>
            </label>
          </div>

          <div className="gst-cert-field-wrap">
            <div className="gst-cert-select-box">
              <select
                id="gst-cert-purpose-select"
                className={`gst-cert-select ${errors.requestType ? 'has-error' : ''}`}
                value={selectedRequestType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('requestType', e.target.value)}
              >
                {GST_CERTIFICATE_REQUEST_TYPES.map((t) => (
                  <option key={t.key} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="gst-cert-select-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="gst-cert-arrow-svg" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.requestType && <p className="gst-cert-field-error">{errors.requestType}</p>}
          </div>
        </div>

        {/* Card 3: Verified Delivery Channel */}
        <div className="gst-cert-card">
          <div className="gst-cert-card__header">
            <div className="gst-cert-card__icon-box">
              <svg viewBox="0 0 24 24" className="gst-cert-card__icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <span className="gst-cert-card__label">Verified Delivery Channel</span>
          </div>

          <div className="gst-cert-channel-body">
            <p className="gst-cert-channel-phone">{displayPhone}</p>
            <p className="gst-cert-channel-email">{displayEmail}</p>
            <p className="gst-cert-channel-note">
              A notification will also be sent to your registered contact upon download.
            </p>
          </div>
        </div>

        <GSTStepErrorBanner message={stepError} />

        {/* Submit Action */}
        <button type="submit" disabled={isSubmitting} className="gst-cert-btn-orange">
          <svg viewBox="0 0 24 24" className="gst-cert-btn-icon" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{isSubmitting ? 'PROCESSING...' : 'DOWNLOAD CERTIFICATE (REG-06)'}</span>
        </button>

        {/* Secondary Save Draft Button */}
        <div className="gst-cert-draft-row">
          <SaveDraftButton onClick={onSaveDraft} />
        </div>
      </form>
    </div>
  )
}

export default GSTCertificateForm
