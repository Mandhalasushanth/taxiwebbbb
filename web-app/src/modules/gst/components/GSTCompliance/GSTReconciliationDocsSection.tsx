import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { DocumentCard, DocumentSection } from '@shared/components'
import { UPLOAD_HINT } from '@shared/upload'

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
    <div className="recon-docs-container">
      <DocumentSection
        title="Reconciliation Documents"
        className="recon-shared-doc-section"
      >
        <div className="recon-shared-cards-grid">
          <div className="recon-card-col">
            <DocumentCard
              id="purchase-register"
              title="Purchase Register"
              subtitle={`Upload inward purchase register or bills (${UPLOAD_HINT})`}
              isRequired={true}
              isUploaded={Boolean(purchaseFile)}
              fileName={purchaseFile?.name}
              fileSize={
                purchaseFile
                  ? formatGstFileSize(purchaseFile.size)
                  : undefined
              }
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

          <div className="recon-card-col">
            <DocumentCard
              id="sales-register"
              title="Sales Register"
              subtitle={`Upload outward sales register or invoices (${UPLOAD_HINT})`}
              isRequired={true}
              isUploaded={Boolean(salesFile)}
              fileName={salesFile?.name}
              fileSize={
                salesFile
                  ? formatGstFileSize(salesFile.size)
                  : undefined
              }
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
        </div>
      </DocumentSection>

      {/* GSTR-2B ARN input */}
      <div className="form-group">
        <input
          type="text"
          className={`form-input ${errors.gstr2bRef ? 'has-error' : ''}`}
          placeholder="Enter GSTR-2B reference or ARN"
          value={gstr2bRef}
          onChange={(e) => setGstr2bRef(gstInput.reference(e.target.value))}
        />
        {errors.gstr2bRef && <span className="form-error">{errors.gstr2bRef}</span>}
      </div>

      {/* CA Notes textarea */}
      <div className="form-group">
        <textarea
          className="form-textarea"
          rows={4}
          placeholder="Tell us anything our CA should know..."
          value={notes}
          onChange={(e) => setNotes(gstInput.text(e.target.value, 1000))}
        />
      </div>
    </div>
  )
}
