import React from 'react'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { DocumentCard } from '@shared/components'
import { UPLOAD_HINT } from '@shared/upload'
import '@modules/gst/shared/GSTComplianceCard/GSTComplianceUploadFields.css'

interface GSTReconciliationDocsSectionProps {
  purchaseFile: File | null
  setPurchaseFile: (file: File | null) => void
  salesFile: File | null
  setSalesFile: (file: File | null) => void
  gstr2bRef: string
  setGstr2bRef: (val: string) => void
  notes: string
  setNotes: (val: string) => void
  errors: { purchaseFile?: string; salesFile?: string; gstr2bRef?: string }
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>
  setPreviewDoc: (doc: { file: File; title: string }) => void
}

export const GSTReconciliationDocsSection: React.FC<GSTReconciliationDocsSectionProps> = ({
  purchaseFile,
  setPurchaseFile,
  salesFile,
  setSalesFile,
  gstr2bRef,
  setGstr2bRef,
  notes,
  setNotes,
  errors,
  setErrors,
  setPreviewDoc,
}) => {
  return (
    <div className="gst-recon-card">
      {/* Card Header */}
      <div className="gst-notice-header">
        <div className="gst-notice-header-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="22"
            height="22"
          >
            <path d="m17 2 4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="m7 22-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        <div>
          <h3 className="gst-notice-header-title">Reconciliation Documents &amp; Details</h3>
          <p className="gst-notice-header-sub">Purchase &amp; Sales registers against GSTR-2B</p>
        </div>
      </div>

      <div className="gst-notice-body">
        {/* Document 1: Purchase Register */}
        <div className="gst-notice-field-group">
          <DocumentCard
            id="purchase-register"
            title="Purchase Register"
            subtitle={`Upload inward purchase register or bills (${UPLOAD_HINT})`}
            isRequired={true}
            isUploaded={Boolean(purchaseFile)}
            fileName={purchaseFile?.name}
            fileSize={purchaseFile ? formatGstFileSize(purchaseFile.size) : undefined}
            file={purchaseFile || undefined}
            className={errors.purchaseFile ? 'doc-card--has-error' : ''}
            onUpload={(_, file) => {
              setPurchaseFile(file)
              setErrors((prev) => ({ ...prev, purchaseFile: undefined }))
            }}
            onRemove={() => setPurchaseFile(null)}
            onView={() => {
              if (purchaseFile) {
                setPreviewDoc({ file: purchaseFile, title: 'Purchase Register' })
              }
            }}
          />
          {errors.purchaseFile && <span className="form-error">{errors.purchaseFile}</span>}
        </div>

        {/* Document 2: Sales Register */}
        <div className="gst-notice-field-group">
          <DocumentCard
            id="sales-register"
            title="Sales Register"
            subtitle={`Upload outward sales register or invoices (${UPLOAD_HINT})`}
            isRequired={true}
            isUploaded={Boolean(salesFile)}
            fileName={salesFile?.name}
            fileSize={salesFile ? formatGstFileSize(salesFile.size) : undefined}
            file={salesFile || undefined}
            className={errors.salesFile ? 'doc-card--has-error' : ''}
            onUpload={(_, file) => {
              setSalesFile(file)
              setErrors((prev) => ({ ...prev, salesFile: undefined }))
            }}
            onRemove={() => setSalesFile(null)}
            onView={() => {
              if (salesFile) {
                setPreviewDoc({ file: salesFile, title: 'Sales Register' })
              }
            }}
          />
          {errors.salesFile && <span className="form-error">{errors.salesFile}</span>}
        </div>

        {/* Field 3: GSTR-2B Reference */}
        <div className="gst-notice-field-group">
          <label className="gst-notice-label" htmlFor="gstr2b-ref-input">
            GSTR-2B Reference
          </label>
          <input
            id="gstr2b-ref-input"
            type="text"
            maxLength={15}
            className={`gst-notice-input ${errors.gstr2bRef ? 'has-error' : ''}`}
            placeholder="GSTR-2B Reference"
            value={gstr2bRef}
            onChange={(e) => {
              setGstr2bRef(gstInput.arn(e.target.value))
              setErrors((prev) => ({ ...prev, gstr2bRef: undefined }))
            }}
          />
          {errors.gstr2bRef && <span className="form-error">{errors.gstr2bRef}</span>}
        </div>

        {/* Field 4: Remarks (Optional) */}
        <div className="gst-notice-field-group">
          <label className="gst-notice-label" htmlFor="recon-notes-input">
            Remarks (Optional)
          </label>
          <div className="gst-notice-textarea-wrapper">
            <textarea
              id="recon-notes-input"
              rows={4}
              maxLength={500}
              placeholder="Remarks (Optional)"
              value={notes}
              onChange={(e) => setNotes(gstInput.text(e.target.value, 500))}
              className="gst-notice-textarea"
            />
            <span className="gst-notice-char-counter">{(notes || '').length}/500</span>
          </div>
        </div>
      </div>
    </div>
  )
}
