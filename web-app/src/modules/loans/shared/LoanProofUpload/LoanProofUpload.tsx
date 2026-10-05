import React, { type ChangeEvent } from 'react'
import { UploadDocument } from '@shared/components'
import './LoanProofUpload.css'

interface LoanProofUploadProps {
  title?: string
  subtitle?: string
  selectedFile: File | null
  error?: string
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (e: React.MouseEvent) => void
}

export const LoanProofUpload: React.FC<LoanProofUploadProps> = ({
  title = 'Upload Document',
  subtitle = 'Attach the required document (PDF, JPG, PNG - max 10 MB).',
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
    <div className="loan-upload-container">
      <UploadDocument
        id="loan-supporting-proof"
        title={title}
        subtitle={subtitle}
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
      {error && <span className="loan-error-msg" role="alert">{error}</span>}
    </div>
  )
}

export default LoanProofUpload
