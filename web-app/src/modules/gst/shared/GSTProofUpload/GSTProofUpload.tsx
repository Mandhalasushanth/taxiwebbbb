import type { FC } from 'react'
import { UploadDocument } from '@shared/components'
import { UPLOAD_HINT, formatUploadSize } from '@shared/upload'
import './GSTProofUpload.css'

export interface GSTProofUploadProps {
  selectedFile: File | null
  /** Shown when editing a request whose proof was uploaded earlier */
  existingFileName?: string
  existingFileSize?: string
  error?: string
  /** A file that passed the application-wide upload rule (type, size, content) */
  onFileSelect: (file: File) => void
  onRemoveFile: () => void
}

/** Supporting-proof upload for GST Amendment and Cancellation */
export const GSTProofUpload: FC<GSTProofUploadProps> = ({
  selectedFile,
  existingFileName,
  existingFileSize,
  error,
  onFileSelect,
  onRemoveFile,
}) => {
  const fileName = selectedFile?.name || existingFileName
  const fileSize = selectedFile ? formatUploadSize(selectedFile.size) : existingFileSize

  return (
    <div className="gst-amend-proof-container">
      <UploadDocument
        id="gst-supporting-proof"
        title="Supporting proof"
        subtitle={`Attach the document that evidences this change (${UPLOAD_HINT})`}
        isRequired
        isUploaded={Boolean(fileName)}
        fileName={fileName}
        fileSize={fileSize}
        file={selectedFile || undefined}
        onUpload={(_, file) => onFileSelect(file)}
        onRemove={onRemoveFile}
        className={error ? 'loan-doc-item--error' : ''}
      />
      {error && (
        <span className="gst-amend-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default GSTProofUpload
