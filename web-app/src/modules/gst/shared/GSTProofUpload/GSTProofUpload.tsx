import { useState, type FC } from 'react'
import { UploadDocument } from '@shared/components'
import { formatUploadSize, DOCUMENT_UPLOAD_RULE } from '@shared/upload'
import { assertGstUploadCriteria, GstUploadException } from '@modules/gst/utils/gstUploadValidator'
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
  const [internalError, setInternalError] = useState<string | undefined>(undefined)
  const activeError = error || internalError

  const fileName = selectedFile?.name || existingFileName
  const fileSize = selectedFile ? formatUploadSize(selectedFile.size) : existingFileSize

  const handleFileSelect = (_id: string, file: File) => {
    try {
      assertGstUploadCriteria(file, DOCUMENT_UPLOAD_RULE)
      setInternalError(undefined)
      onFileSelect(file)
    } catch (err) {
      const msg =
        err instanceof GstUploadException
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Invalid file'
      onRemoveFile()
      setInternalError(msg)
    }
  }

  const handleRemove = () => {
    setInternalError(undefined)
    onRemoveFile()
  }

  return (
    <div className="gst-amend-proof-container">
      <UploadDocument
        id="gst-supporting-proof"
        title="Supporting Proof Document"
        subtitle="Attach proof evidencing this change"
        isRequired
        uploadLabel="Upload File"
        iconBg="#fff7ed"
        iconColor="#ea580c"
        isUploaded={Boolean(fileName)}
        fileName={fileName}
        fileSize={fileSize}
        file={selectedFile || undefined}
        error={activeError}
        onUpload={handleFileSelect}
        onUploadError={(_id, msg) => {
          onRemoveFile()
          setInternalError(msg)
        }}
        onRemove={handleRemove}
        className={activeError ? 'loan-doc-item--error' : ''}
      />
    </div>
  )
}

export default GSTProofUpload
