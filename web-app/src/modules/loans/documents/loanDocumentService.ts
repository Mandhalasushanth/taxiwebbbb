import { useAppStore } from '@store/index'
import { formatUploadSize, getUploadFileError } from '@shared/upload'
import type { UploadedLoanDocument } from './loanDocument.types'

export const loanDocumentService = {
  /** The application-wide upload rule (PDF, Excel, JPG or PNG up to 10 MB); returns an error or undefined */
  validateFile: (file: File): string | undefined => getUploadFileError(file) ?? undefined,

  /** Returns true when the file is acceptable; otherwise shows the reason as an error toast */
  acceptFile: (file: File): boolean => {
    const error = loanDocumentService.validateFile(file)
    if (error) useAppStore.getState().pushToast(error, 'error')
    return !error
  },

  formatFileSize: formatUploadSize,

  createDocumentEntry: (id: string, file: File): UploadedLoanDocument => {
    return {
      id,
      name: file.name,
      size: loanDocumentService.formatFileSize(file.size),
      file,
      uploadedAt: new Date().toISOString(),
    }
  },

  createUploadedDocument: (file: File, id?: string): UploadedLoanDocument => {
    return {
      id: id || file.name,
      name: file.name,
      size: loanDocumentService.formatFileSize(file.size),
      file,
      uploadedAt: new Date().toISOString(),
    }
  },
}
