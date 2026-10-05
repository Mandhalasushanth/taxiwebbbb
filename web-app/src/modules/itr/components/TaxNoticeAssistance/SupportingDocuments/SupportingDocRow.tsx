import React from 'react'
import type { SupportingDocumentItem } from '../../../types/taxNoticeAssistance.types'
import { UploadDocument } from '@shared/components'

export const getDocColor = (id: string) => {
  switch (id) {
    case 'tax-notice':
    case 'previous-itr':
      return 'blue'
    case 'itr-ack':
    case 'form-16':
      return 'purple'
    case 'ais':
    case 'tis':
      return 'indigo'
    case 'bank-statements':
      return 'blue'
    case 'supporting-income':
    case 'supporting-expense':
      return 'orange'
    default:
      return 'blue'
  }
}

export const getDocIcon = (id: string) => {
  switch (id) {
    case 'tax-notice':
    case 'form-16':
    case 'itr-ack':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    case 'ais':
    case 'supporting-income':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    case 'bank-statements':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      )
    case 'tis':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
        </svg>
      )
    case 'supporting-expense':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    case 'previous-responses':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
  }
}

export interface SupportingDocRowProps {
  doc: SupportingDocumentItem
  isUploaded: boolean
  uploadInfo?: { fileName: string; fileSize: string }
  fileInputRef?: (el: HTMLInputElement | null) => void
  onFileUpload: (file: File) => void
  onView: () => void
  onReplace: () => void
  onRemove: () => void
}

export const SupportingDocRow: React.FC<SupportingDocRowProps> = ({
  doc,
  isUploaded,
  uploadInfo,
  onFileUpload,
  onView,
  onReplace,
  onRemove,
}) => {
  return (
    <UploadDocument
      id={doc.id}
      title={doc.title}
      subtitle={doc.subtitle}
      isRequired={doc.required}
      icon={getDocIcon(doc.id)}
      iconBg="#eff6ff"
      iconColor="#2563eb"
      isUploaded={isUploaded}
      fileName={uploadInfo?.fileName}
      fileSize={uploadInfo?.fileSize}
      accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
      ariaLabel="Upload File"
      onUpload={(_, file) => onFileUpload(file)}
      onView={onView}
      onReplace={onReplace}
      onRemove={onRemove}
    />
  )
}
