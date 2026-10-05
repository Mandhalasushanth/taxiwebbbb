import React, { type ChangeEvent } from 'react'
import { UploadDocument } from '@shared/components'
import './GSTProofUpload.css'

interface GSTAmendmentProofUploadProps {
  selectedFile: File | null
  error?: string
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (e: React.MouseEvent) => void
}

export const GSTProofUpload: React.FC<GSTAmendmentProofUploadProps> = ({
  selectedFile,
  error,
  onFileChange,
  onRemoveFile,
}) => {
  const handleUpload = (_: string, file: File) => {
    try {
      const dt = new DataTransfer()
      dt.items.add(file)
      const syntheticEvent = {
        target: { files: dt.files, value: '' },
        currentTarget: { files: dt.files, value: '' },
      } as unknown as ChangeEvent<HTMLInputElement>
      onFileChange(syntheticEvent)
    } catch {
      const syntheticEvent = {
        target: { files: [file], value: '' },
        currentTarget: { files: [file], value: '' },
      } as unknown as ChangeEvent<HTMLInputElement>
      onFileChange(syntheticEvent)
    }
  }

  const handleRemove = () => {
    onRemoveFile({} as React.MouseEvent)
  }

  return (
    <div className="gst-amend-proof-container">
      <UploadDocument
        id="gst-supporting-proof"
        title="Supporting proof"
        subtitle="Attach the document that evidences this change (PDF, JPG, PNG - max 10 MB)"
        isRequired={true}
        isUploaded={Boolean(selectedFile)}
        fileName={selectedFile?.name}
        fileSize={selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : undefined}
        file={selectedFile || undefined}
        accept=".pdf,.jpg,.jpeg,.png"
        onUpload={handleUpload}
        onRemove={handleRemove}
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

export const GSTAmendmentProofUpload = GSTProofUpload
export default GSTProofUpload
