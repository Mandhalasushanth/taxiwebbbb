import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React from 'react'
import { UploadDocument } from '@shared/components'
import '@modules/gst/styles/gstTones.css'

export const ChevronIcon = () => (
  <span className="compliance-select-chevron" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </span>
)

export const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
)

export const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

export const FieldRow: React.FC<{
  num: number | string
  label: string
  required?: boolean
  badge?: React.ReactNode
  hint?: string
  error?: string
  children: React.ReactNode
}> = ({ num, label, required, badge, hint, error, children }) => (
  <div className="compliance-field-row">
    <div className="compliance-field-num" aria-hidden="true">
      {num}
    </div>
    <div className="compliance-field-content">
      <div className="compliance-field-label-group">
        <label className="compliance-field-label">
          {label} {required && <span className="compliance-required-mark">*</span>}
        </label>
        {badge}
      </div>
      {children}
      {hint && <p className="compliance-field-hint">{hint}</p>}
      {error && <span className="compliance-field-error">{error}</span>}
    </div>
  </div>
)

export const FileDropzone: React.FC<{
  file: File | null
  onFileSelect: (f: File) => void
  onFileRemove?: () => void
  onFileView?: (f: File) => void
  hasError?: boolean
  accept?: string
  label: string
}> = ({
  file,
  onFileSelect,
  onFileRemove,
  onFileView,
  hasError,
  accept = '.pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv',
  label,
}) => (
  <UploadDocument
    id="compliance-file"
    title={label || 'Supporting Document'}
    subtitle="PDF, JPG, PNG or Excel up to 10 MB"
    isRequired={true}
    isUploaded={Boolean(file)}
    fileName={file?.name}
    fileSize={file ? formatGstFileSize(file.size) : undefined}
    file={file || undefined}
    accept={accept}
    onUpload={(_, f) => onFileSelect(f)}
    onRemove={() => onFileRemove?.()}
    onView={() => file && onFileView?.(file)}
    className={hasError ? 'loan-doc-item--error' : ''}
  />
)
