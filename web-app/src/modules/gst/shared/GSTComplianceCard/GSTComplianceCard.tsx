import React from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { routePaths } from '@core/config'
import { GSTComplianceSubmitted } from './GSTComplianceSubmitted'
import { ComplianceDocPreviewModal } from './GSTComplianceDocPreviewModal'
import { ChevronIcon, FieldRow } from './GSTComplianceFileDropzone'
import { GSTComplianceReconFields } from './GSTComplianceReconFields'
import { GSTComplianceNoticeFields } from './GSTComplianceNoticeFields'
import { useGSTComplianceForm } from '@modules/gst/hooks/useGSTComplianceForm'
import './GSTComplianceCard.css'

export interface ComplianceFormData {
  gstin: string
  financialYear: string
  requestType: 'Reconciliation Support' | 'Notice Response'
  purchaseDoc: File | null
  salesDoc: File | null
  gstr2bRef: string
  gstr2bDoc?: File | null
  noticeNumber?: string
  noticeDoc?: File | null
  dueDate?: string
  replyDraft: string
}

export interface GSTComplianceCardProps {
  title?: string
  subtitle?: string
  initialGstin?: string
  initialFinancialYear?: string
  initialRequestType?: 'Reconciliation Support' | 'Notice Response'
  onAllForms?: () => void
  onSubmit?: (d: ComplianceFormData) => void
}

export const GSTComplianceCard: React.FC<GSTComplianceCardProps> = ({
  title = 'GST Compliance Form',
  subtitle = 'Live screen — numbered to match the field spec.',
  initialGstin,
  initialFinancialYear,
  initialRequestType = 'Reconciliation Support',
  onAllForms,
  onSubmit,
}) => {
  const {
    navigate,
    gstin,
    financialYear,
    setFinancialYear,
    requestType,
    setRequestType,
    purchaseFile,
    setPurchaseFile,
    salesFile,
    setSalesFile,
    gstr2bRef,
    setGstr2bRef,
    gstr2bFile,
    setGstr2bFile,
    noticeNumber,
    setNoticeNumber,
    noticeFile,
    setNoticeFile,
    dueDate,
    setDueDate,
    replyDraft,
    setReplyDraft,
    previewDoc,
    setPreviewDoc,
    errors,
    isSubmitting,
    isSubmitted,
    applicationId,
    clearErr,
    handleGstinChange,
    handleSubmit,
  } = useGSTComplianceForm({
    initialGstin,
    initialFinancialYear,
    initialRequestType,
    onSubmit,
  })

  if (isSubmitted) {
    return (
      <GSTComplianceSubmitted
        applicationId={applicationId}
        gstin={gstin}
        requestType={requestType}
        fieldsCount={requestType === 'Reconciliation Support' ? 7 : 10}
        onBackToForm={() => navigate(routePaths.gst.compliance, { replace: true })}
        onAllForms={onAllForms ?? (() => navigate(routePaths.gst.root))}
      />
    )
  }

  return (
    <div className="gst-compliance-spec-card">
      <div className="compliance-spec-header">
        <div className="compliance-spec-header__left">
          <h2 className="compliance-spec-title">{title}</h2>
          <p className="compliance-spec-subtitle">{subtitle}</p>
        </div>
        <div className="compliance-spec-badge">
          {requestType === 'Reconciliation Support' ? '7' : '10'} of 10 shown
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="compliance-spec-form">
        <FieldRow
          num={1}
          label="GSTIN / PAN"
          hint="15-character GSTIN or 10-character PAN. Letters auto-capitalize to uppercase."
          error={errors.gstin}
          badge={
            <span className="compliance-autofill-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="compliance-check-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Auto-filled
            </span>
          }
        >
          <div className="compliance-gstin-box">
            <input
              id="compliance-gstin"
              name="gstin"
              type="text"
              maxLength={15}
              placeholder="Enter your GSTIN or PAN"
              value={gstin}
              onChange={(e) => handleGstinChange(e.target.value)}
              className={`compliance-gstin-input ${errors.gstin ? 'has-error' : ''}`}
            />
          </div>
        </FieldRow>

        <FieldRow
          num={2}
          label="Period / Financial Year"
          required
          hint="Which month or year the check covers"
        >
          <div className="compliance-select-wrapper">
            <select
              id="compliance-fy"
              name="financialYear"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="compliance-select"
            >
              {['FY 2026-27', 'FY 2025-26', 'FY 2024-25', 'FY 2023-24'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldRow>

        <FieldRow
          num={3}
          label="Type of Request"
          required
          hint="Reconciliation Support or Notice Response"
        >
          <div className="compliance-select-wrapper">
            <select
              id="compliance-request-type"
              name="requestType"
              value={requestType}
              onChange={(e) =>
                setRequestType(
                  e.target.value as 'Reconciliation Support' | 'Notice Response'
                )
              }
              className="compliance-select"
            >
              {['Reconciliation Support', 'Notice Response'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldRow>

        {requestType === 'Reconciliation Support' ? (
          <GSTComplianceReconFields
            purchaseFile={purchaseFile}
            setPurchaseFile={setPurchaseFile}
            salesFile={salesFile}
            setSalesFile={setSalesFile}
            gstr2bRef={gstr2bRef}
            setGstr2bRef={setGstr2bRef}
            gstr2bFile={gstr2bFile}
            setGstr2bFile={setGstr2bFile}
            errors={errors}
            clearErr={clearErr}
            setPreviewDoc={setPreviewDoc}
          />
        ) : (
          <>
            <GSTComplianceNoticeFields
              noticeNumber={noticeNumber}
              setNoticeNumber={setNoticeNumber}
              noticeFile={noticeFile}
              setNoticeFile={setNoticeFile}
              dueDate={dueDate}
              setDueDate={setDueDate}
              errors={errors}
              clearErr={clearErr}
              setPreviewDoc={setPreviewDoc}
            />
          </>
        )}

        <FieldRow
          num={requestType === 'Reconciliation Support' ? 7 : 10}
          label="Reply / Response Draft"
          hint="Optional — can be filled in by staff instead"
        >
          <textarea
            id="compliance-reply-draft"
            name="replyDraft"
            rows={4}
            placeholder="Optional. Leave blank and your GST executive will draft the reply for you."
            value={replyDraft}
            onChange={(e) => setReplyDraft(gstInput.text(e.target.value, 2000))}
            className="compliance-textarea"
          />
        </FieldRow>

        <div className="compliance-actions-row">
          <button
            type="button"
            className="compliance-btn-secondary"
            onClick={onAllForms ?? (() => navigate(routePaths.gst.root))}
          >
            <span aria-hidden="true">←</span> All forms
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="compliance-btn-primary"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                Submit GST Compliance <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {previewDoc && (
        <ComplianceDocPreviewModal
          file={previewDoc.file}
          title={previewDoc.title}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}

export default GSTComplianceCard
