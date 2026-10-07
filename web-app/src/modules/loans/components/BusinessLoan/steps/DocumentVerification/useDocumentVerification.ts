import { useState, useCallback } from 'react'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import { validateDocumentFile } from '@modules/loans/validation/businessLoanValidation'
import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import { viewUploadedDocument } from '@shared/upload'

export interface UseDocumentVerificationProps {
  uploadedDocs?: Record<string, UploadedLoanDocument>
  onChange: (fields: { uploadedDocs: Record<string, UploadedLoanDocument> }) => void
}

/**
 * Custom hook for Step 4 Document Verification operations
 * Encapsulates file validation, upload, removal, preview, and error states with robust exception handling.
 */
export function useDocumentVerification({
  uploadedDocs = {},
  onChange,
}: UseDocumentVerificationProps) {
  const [fileError, setFileError] = useState<string | null>(null)

  const handleUpload = useCallback(
    (id: string, file: File) => {
      try {
        setFileError(null)
        const validation = validateDocumentFile(file)
        if (!validation.isValid) {
          setFileError(validation.error || 'Invalid file uploaded.')
          return
        }
        onChange({
          uploadedDocs: {
            ...uploadedDocs,
            [id]: loanDocumentService.createDocumentEntry(id, file),
          },
        })
      } catch {
        setFileError('Failed to process uploaded file. Please try again.')
      }
    },
    [uploadedDocs, onChange]
  )

  const handleRemove = useCallback(
    (id: string) => {
      try {
        setFileError(null)
        const nextUploaded = { ...uploadedDocs }
        delete nextUploaded[id]
        onChange({ uploadedDocs: nextUploaded })
      } catch {
        setFileError('Failed to remove document. Please try again.')
      }
    },
    [uploadedDocs, onChange]
  )

  const handleView = useCallback(
    (doc: { id: string; title: string; fileName?: string; file?: File }) => {
      viewUploadedDocument({ id: doc.id, title: doc.title, fileName: doc.fileName, file: doc.file })
    },
    []
  )

  return {
    fileError,
    setFileError,
    handleUpload,
    handleRemove,
    handleView,
  }
}
