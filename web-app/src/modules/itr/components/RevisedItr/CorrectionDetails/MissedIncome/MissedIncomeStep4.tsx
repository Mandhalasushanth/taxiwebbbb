import React from 'react'
import type { DocumentTypeId, UploadedDocument } from '../../../../types/revisedItr.types'
import { Step4DocumentUpload, type DocumentSlotItem } from '../../DocumentUpload'

interface MissedIncomeStep4Props {
  selectedAy: string
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  documentsError?: string | null
  onUpload: (id: DocumentTypeId, file: File) => void
  onRemove: (id: DocumentTypeId) => void
}

export const MissedIncomeStep4: React.FC<MissedIncomeStep4Props> = ({
  selectedAy,
  uploadedDocuments,
  documentsError,
  onUpload,
  onRemove,
}) => {
  const ayLabel = selectedAy ? `(${selectedAy})` : '(AY 2025-26)'

  const requiredSlots: DocumentSlotItem[] = [
    { id: 'pan', title: 'PAN Card', subtitle: 'Front copy with clear name & photo', isRequired: true, iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { id: 'aadhaar', title: 'Aadhaar Card', subtitle: 'Both sides with clear Aadhaar number', isRequired: true, iconBg: '#f3e8ff', iconColor: '#9333ea' },
    { id: 'form16', title: `Form 16 / Form 16A ${ayLabel}`, subtitle: 'Issued by employer / deductor', isRequired: true, iconBg: '#e0e7ff', iconColor: '#2563eb' },
    { id: 'ais_tis', title: 'AIS and TIS Statement', subtitle: 'Downloaded from Income Tax portal', isRequired: true, iconBg: '#fef3c7', iconColor: '#d97706' },
  ]

  const additionalSlots: DocumentSlotItem[] = [
    { id: 'bank_statement', title: 'Bank Statements', subtitle: 'Last 6-12 months statement', isRequired: false, iconBg: '#d1fae5', iconColor: '#059669' },
    { id: 'investment_proof', title: 'Investment Proofs', subtitle: 'Receipts, 80C / 80D documents', isRequired: false, iconBg: '#ffedd5', iconColor: '#ea580c' },
  ]

  return (
    <Step4DocumentUpload
      requiredSlots={requiredSlots}
      additionalSlots={additionalSlots}
      uploadedDocuments={uploadedDocuments}
      documentsError={documentsError}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  )
}
