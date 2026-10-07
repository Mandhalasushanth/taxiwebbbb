import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React from 'react'
import { FileInput } from '@shared/upload'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import {
  FieldRow,
  FileDropzone,
  UploadIcon,
  EyeIcon,
  TrashIcon,
} from './GSTComplianceFileDropzone'
import '@modules/gst/styles/gstTones.css'

export interface GSTComplianceReconFieldsProps {
  purchaseFile: File | null
  setPurchaseFile: (f: File | null) => void
  salesFile: File | null
  setSalesFile: (f: File | null) => void
  gstr2bRef: string
  setGstr2bRef: (ref: string) => void
  gstr2bFile: File | null
  setGstr2bFile: (f: File | null) => void
  errors: Record<string, string>
  clearErr: (k: string) => void
  setPreviewDoc: (doc: { file: File; title: string }) => void
}

export const GSTComplianceReconFields: React.FC<GSTComplianceReconFieldsProps> = ({
  purchaseFile,
  setPurchaseFile,
  salesFile,
  setSalesFile,
  gstr2bRef,
  setGstr2bRef,
  gstr2bFile,
  setGstr2bFile,
  errors,
  clearErr,
  setPreviewDoc,
}) => {
  return (
    <>
      <FieldRow
        num={4}
        label="Purchase Register"
        required
        hint="Required"
        error={errors.purchaseFile}
      >
        <FileDropzone
          label="Upload Purchase Register"
          file={purchaseFile}
          hasError={!!errors.purchaseFile}
          onFileSelect={(f) => {
            setPurchaseFile(f)
            clearErr('purchaseFile')
          }}
          onFileRemove={() => setPurchaseFile(null)}
          onFileView={(f) => setPreviewDoc({ file: f, title: 'Purchase Register' })}
        />
      </FieldRow>

      <FieldRow
        num={5}
        label="Sales Register"
        required
        hint="Required"
        error={errors.salesFile}
      >
        <FileDropzone
          label="Upload Sales Register"
          file={salesFile}
          hasError={!!errors.salesFile}
          onFileSelect={(f) => {
            setSalesFile(f)
            clearErr('salesFile')
          }}
          onFileRemove={() => setSalesFile(null)}
          onFileView={(f) => setPreviewDoc({ file: f, title: 'Sales Register' })}
        />
      </FieldRow>

      <FieldRow
        num={6}
        label="GSTR-2B Reference"
        required
        hint="The government's auto-generated purchase statement"
        error={errors.gstr2bRef}
      >
        <div className="compliance-hybrid-input-wrapper">
          {gstr2bFile ? (
            <div className="compliance-attached-file-box">
              <div
                className="compliance-attached-file-info compliance-attached-file-info--clickable"
                onClick={() =>
                  setPreviewDoc({
                    file: gstr2bFile,
                    title: 'GSTR-2B Statement',
                  })
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setPreviewDoc({
                      file: gstr2bFile,
                      title: 'GSTR-2B Statement',
                    })
                  }
                }}
                title="Click to preview statement"
              >
                <span className="compliance-file-icon">📄</span>
                <div>
                  <span className="compliance-attached-filename">
                    {gstr2bFile.name}
                  </span>
                  <span className="compliance-attached-filesize">
                    {formatGstFileSize(gstr2bFile.size)} · Statement attached
                  </span>
                </div>
              </div>
              <div className="compliance-upload-actions">
                <button
                  type="button"
                  className="compliance-view-btn"
                  onClick={() =>
                    setPreviewDoc({
                      file: gstr2bFile,
                      title: 'GSTR-2B Statement',
                    })
                  }
                  title="View uploaded statement"
                >
                  <EyeIcon /> View
                </button>
                <button
                  type="button"
                  className="compliance-delete-btn"
                  onClick={() => setGstr2bFile(null)}
                  title="Delete uploaded statement"
                  aria-label="Delete uploaded statement"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ) : (
            <div className="compliance-input-with-action">
              <input
                id="compliance-gstr2b"
                name="gstr2bRef"
                type="text"
                placeholder="Paste the GSTR-2B reference number, or upload the statement"
                value={gstr2bRef}
                onChange={(e) => {
                  setGstr2bRef(gstInput.reference(e.target.value))
                  clearErr('gstr2bRef')
                }}
                className={`compliance-text-input ${errors.gstr2bRef ? 'has-error' : ''}`}
              />
              <label
                className="compliance-inline-upload-btn"
                title="Upload statement file"
              >
                <FileInput
                  onFileSelected={(file) => {
                    setGstr2bFile(file)
                    clearErr('gstr2bRef')
                  }}
                  className="gst-hidden-input"
                />
                <UploadIcon /> Upload
              </label>
            </div>
          )}
        </div>
      </FieldRow>
    </>
  )
}
