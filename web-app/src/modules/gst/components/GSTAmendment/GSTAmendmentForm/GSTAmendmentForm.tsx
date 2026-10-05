import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import type { GstAmendmentPayload } from '@modules/gst/types/gst.types'
import { useGSTAmendmentForm } from '@modules/gst/hooks/useGSTAmendmentForm'
import { UploadDocument } from '@shared/components'
import './GSTAmendmentForm.css'

interface GSTAmendmentFormProps {
  isSubmitting?: boolean
  initialGstin?: string
  initialFieldKey?: string
  onSubmit: (payload: GstAmendmentPayload) => void
  onAllFormsClick?: () => void
  onBackToSelection?: () => void
}

export const GSTAmendmentForm = ({
  isSubmitting = false,
  initialGstin,
  initialFieldKey,
  onSubmit,
  onAllFormsClick,
  onBackToSelection,
}: GSTAmendmentFormProps) => {
  const {
    selectedFieldKey,
    newValue,
    setNewValue,
    selectedFile,
    errors,
    setErrors,
    displayGstin,
    activeOption,
    fieldOptions,
    filterNewValue,
    handleFieldSelectChange,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
  } = useGSTAmendmentForm({
    initialGstin,
    initialFieldKey,
    onSubmit,
  })

  return (
    <div className="gst-amend-live-card">
      <div className="gst-amend-live-card__header">
        <div className="gst-amend-live-card__titles">
          <h2 className="gst-amend-live-card__title">What the customer sees</h2>
          <p className="gst-amend-live-card__subtitle">Live screen — numbered to match the field spec.</p>
        </div>
        <span className="gst-amend-live-card__badge">5 of 5 shown</span>
      </div>

      <form onSubmit={handleSubmit} className="gst-amend-form" noValidate>
        {/* Field 1: GSTIN */}
        <div className="gst-amend-form__group">
          <div className="gst-amend-form__label-row">
            <span className="gst-amend-form__number-badge">1</span>
            <label className="gst-amend-form__label">GSTIN</label>
            <span className="gst-amend-form__autofill-badge">✓ Auto-filled</span>
          </div>
          <div className="gst-amend-form__autofill-box">{displayGstin}</div>
          <span className="gst-amend-form__hint">Auto-filled from the customer&apos;s GST Registration</span>
        </div>

        {/* Field 2: Field Being Changed */}
        <div className="gst-amend-form__group">
          <div className="gst-amend-form__label-row">
            <span className="gst-amend-form__number-badge">2</span>
            <label htmlFor="field-being-changed" className="gst-amend-form__label">
              Field Being Changed <span className="gst-amend-form__required-star">*</span>
            </label>
          </div>
          <div className="gst-amend-form__select-wrapper">
            <select
              id="field-being-changed"
              className="gst-amend-form__select"
              value={selectedFieldKey}
              onChange={handleFieldSelectChange}
            >
              {fieldOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="gst-amend-form__select-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          <span className="gst-amend-form__hint">Select from the dropdown which core or non-core field to amend</span>
        </div>

        {/* Field 3: Existing Registered Value */}
        <div className="gst-amend-form__group">
          <div className="gst-amend-form__label-row">
            <span className="gst-amend-form__number-badge">3</span>
            <label className="gst-amend-form__label">Existing Registered Value</label>
            <span className="gst-amend-form__readonly-badge">Read-only</span>
          </div>
          <div className="gst-amend-form__readonly-box">{activeOption.oldValue}</div>
          <span className="gst-amend-form__hint">Pulled from GST portal records for this GSTIN</span>
        </div>

        {/* Field 4: Updated New Value */}
        <div className="gst-amend-form__group">
          <div className="gst-amend-form__label-row">
            <span className="gst-amend-form__number-badge">4</span>
            <label htmlFor="updated-new-value" className="gst-amend-form__label">
              Updated New Value <span className="gst-amend-form__required-star">*</span>
            </label>
          </div>
          <input
            id="updated-new-value"
            type="text"
            className={`gst-amend-form__input ${errors.newValue ? 'gst-amend-form__input--error' : ''}`}
            placeholder={`Enter new ${activeOption.label.toLowerCase()}`}
            value={newValue}
            onChange={(e) => {
              setNewValue(filterNewValue(e.target.value))
              if (errors.newValue) setErrors((prev) => ({ ...prev, newValue: undefined }))
            }}
          />
          {errors.newValue ? (
            <span className="gst-amend-form__error-text">{errors.newValue}</span>
          ) : (
            <span className="gst-amend-form__hint">
              Enter the exact new value as it appears on your supporting documents
            </span>
          )}
        </div>

        {/* Field 5: Supporting Document */}
        <div className="gst-amend-form__group">
          <div className="gst-amend-form__label-row">
            <span className="gst-amend-form__number-badge">5</span>
            <label className="gst-amend-form__label">
              Supporting Document <span className="gst-amend-form__required-star">*</span>
            </label>
          </div>

          <UploadDocument
            id="amendment-supporting-doc"
            title="Supporting Document"
            subtitle="Proof of the change — e.g. new rental agreement, name-change certificate (PDF, JPG, PNG up to 10 MB)"
            isRequired={true}
            isUploaded={Boolean(selectedFile)}
            fileName={selectedFile?.name}
            fileSize={selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : undefined}
            file={selectedFile || undefined}
            accept=".pdf,.jpg,.jpeg,.png"
            onUpload={(_, file) => {
              handleFileChange({
                target: { files: [file] },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }}
            onRemove={handleRemoveFile}
            className={errors.document ? 'loan-doc-item--error' : ''}
          />

          {errors.document ? (
            <span className="gst-amend-form__error-text">{errors.document}</span>
          ) : (
            <span className="gst-amend-form__hint">
              Proof of the change — e.g. new rental agreement, name-change certificate
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="gst-amend-form__actions">
          {onBackToSelection ? (
            <button
              type="button"
              onClick={onBackToSelection}
              className="gst-amend-form__btn-all-forms"
            >
              ← Back to Selection
            </button>
          ) : (
            <Link
              to={routePaths.gst.root}
              onClick={onAllFormsClick}
              className="gst-amend-form__btn-all-forms"
            >
              ← All forms
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="gst-amend-form__btn-submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit GST Amendment →'}
          </button>
        </div>
      </form>
    </div>
  )
}
