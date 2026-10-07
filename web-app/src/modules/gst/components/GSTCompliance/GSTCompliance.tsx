import React from 'react'
import { GSTNoticeResponseFields } from '@modules/gst/shared/GSTComplianceCard/GSTNoticeResponseFields'
import { ComplianceDocPreviewModal } from '@modules/gst/shared/GSTComplianceCard/GSTComplianceDocPreviewModal'
import { GSTSubmitConfirmModal } from './GSTSubmitConfirmModal'
import { GSTSuccessView } from './GSTSuccessView'
import { useGSTComplianceState, type ComplianceRequestOption } from '@modules/gst/hooks/useGSTComplianceState'
import { FINANCIAL_YEAR_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { ServiceDraftModal } from '@shared/saveDraft'
import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { SaveDraftButton } from '@shared/saveDraft'
import { GSTReconciliationDocsSection } from './GSTReconciliationDocsSection'
import './GSTCompliance.css'
import './GSTCompliance.sidebar.css'

export type { ComplianceRequestOption }

export const GSTCompliance: React.FC = () => {
  const flow = useGSTComplianceState()
  const {
    fields,
    setField,
    purchaseFile,
    setPurchaseFile,
    salesFile,
    setSalesFile,
    noticeFile,
    setNoticeFile,
    previewDoc,
    setPreviewDoc,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    errors,
    setErrors,
    stepError,
    isSubmitting,
    isSubmitted,
    applicationId,
    handleSubmit,
    handleConfirmSubmit,
    handleReset,
    openDraftModal,
  } = flow
  const { gstin, financialYear, requestType } = fields

  if (isSubmitted) {
    return (
      <div className="gst-compliance-page">
        <div className="gst-compliance-wrapper">
          <GSTSuccessView
            applicationId={applicationId}
            requestType={requestType}
            gstin={gstin}
            onReset={handleReset}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="gst-compliance-page">
      <div className="gst-compliance-wrapper">
        {/* Header */}
        <div className="gst-compliance-header">
          <h1 className="gst-title">GST Compliance</h1>
          <p className="gst-subtitle">
            Submit your request for GST compliance. Our CA team will review and contact you.
          </p>
        </div>

        <div className="gst-compliance-grid">
          {/* Left Column: Form / Success */}
          <div className="gst-left-column">
            {/* Blue Alert Box */}
            <div className="gst-info-banner">
              <div className="info-banner-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                  <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="none" />
                  <path d="M12 16v-4m0-4h.01" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="info-banner-text">
                Need help with GST compliance? Select your request type and upload the required documents. Our CA team will review and contact you.
              </div>
            </div>

            {/* Form Container */}
            <div className="gst-form-container">
              <div className="gst-form-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#2563eb" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="card-title">Business &amp; Filing Details</h2>
                    <p className="card-subtitle">Provide your GST and filing information to proceed.</p>
                  </div>
                </div>

                <form id="gst-compliance-form" onSubmit={handleSubmit} noValidate className="gst-form">
                  {/* GSTIN Field */}
                  <div className="form-group">
                    <label htmlFor="gstin-input" className="form-label">
                      GSTIN <span className="req-asterisk">*</span>
                    </label>
                    <input
                      id="gstin-input"
                      type="text"
                      className={`form-input ${errors.gstin ? 'has-error' : ''}`}
                      placeholder="Enter 15-character GSTIN"
                      value={gstin}
                      onChange={(e) => setField('gstin', gstInput.gstin(e.target.value))}
                      maxLength={15}
                    />
                    {errors.gstin && <span className="form-error">{errors.gstin}</span>}
                  </div>

                  {/* Financial Year Field */}
                  <div className="form-group">
                    <label htmlFor="fy-select" className="form-label">
                      Financial Year <span className="req-asterisk">*</span>
                    </label>
                    <select
                      id="fy-select"
                      className={`form-select ${errors.financialYear ? 'has-error' : ''}`}
                      value={financialYear}
                      onChange={(e) => setField('financialYear', e.target.value)}
                    >
                      <option value="">Select Financial Year</option>
                      {FINANCIAL_YEAR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.financialYear && <span className="form-error">{errors.financialYear}</span>}
                  </div>

                  {/* Request Type Field */}
                  <div className="form-group">
                    <label htmlFor="req-type-select" className="form-label">
                      Request Type <span className="req-asterisk">*</span>
                    </label>
                    <select
                      id="req-type-select"
                      className={`form-select ${errors.requestType ? 'has-error' : ''}`}
                      value={requestType}
                      onChange={(e) => setField('requestType', e.target.value as ComplianceRequestOption)}
                    >
                      <option value="">Select Request Type</option>
                      <option value="Reconciliation Support">Reconciliation Support</option>
                      <option value="Notice Response">Notice Response</option>
                    </select>
                    {errors.requestType && <span className="form-error">{errors.requestType}</span>}
                  </div>
                </form>
              </div>

              {/* Dynamic Reconciliation Documents Section */}
              {requestType === 'Reconciliation Support' && (
                <GSTReconciliationDocsSection
                  purchaseFile={purchaseFile}
                  setPurchaseFile={setPurchaseFile}
                  salesFile={salesFile}
                  setSalesFile={setSalesFile}
                  gstr2bRef={fields.gstr2bRef}
                  setGstr2bRef={(value) => setField('gstr2bRef', value)}
                  notes={fields.notes}
                  setNotes={(value) => setField('notes', value)}
                  errors={errors}
                  setErrors={setErrors}
                  setPreviewDoc={setPreviewDoc}
                />
              )}

              {/* Dynamic Notice Response Section */}
              {requestType === 'Notice Response' && (
                <GSTNoticeResponseFields
                  values={fields}
                  onChange={setField}
                  noticeFile={noticeFile}
                  onNoticeFileChange={setNoticeFile}
                  errors={errors}
                  onPreviewDoc={(file, title) => setPreviewDoc({ file, title })}
                />
              )}

              <GSTStepErrorBanner message={stepError} />

              {/* Submit Request Button */}
              <div className="submit-btn-wrapper form-actions-group">
                <SaveDraftButton onClick={openDraftModal} />
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="gst-btn-submit-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <ComplianceDocPreviewModal
          file={previewDoc.file}
          title={previewDoc.title}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Confirmation Modal */}
      <GSTSubmitConfirmModal
        isOpen={isConfirmModalOpen}
        requestType={requestType}
        gstin={gstin}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />

      <ServiceDraftModal draft={flow} serviceTitle="GST Compliance" />
    </div>
  )
}

export default GSTCompliance
