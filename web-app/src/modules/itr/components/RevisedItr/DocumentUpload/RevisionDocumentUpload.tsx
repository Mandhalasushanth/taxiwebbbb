import React from 'react'
import { DocumentCard } from '@shared/components'
import { viewUploadedDocument } from '@shared/upload'
import type { DocumentTypeId, RevisionReasonKey, UploadedDocument } from '@modules/itr/types/revisedItr.types'
import { CreditCard as PanCardIcon, Fingerprint as FingerprintIcon, FileText as IconFileText, Landmark as BankIcon, Briefcase as IconBriefcase } from 'lucide-react'
import './RevisionDocumentUpload.css'

export interface DocumentSlotItem {
  id: DocumentTypeId
  title: string
  subtitle: string
  isRequired: boolean
  iconBg: string
  iconColor: string
}

export interface RevisionDocumentUploadProps {
  selectedReason?: RevisionReasonKey | null
  selectedAy: string
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  documentsError?: string | null
  onUpload: (id: DocumentTypeId, file: File) => void
  onRemove: (id: DocumentTypeId) => void
}

const SLOT_ICON_MAP: Record<DocumentTypeId, React.FC<{ size?: number }>> = {
  pan: PanCardIcon,
  aadhaar: FingerprintIcon,
  form16: IconFileText,
  ais_tis: IconFileText,
  bank_statement: BankIcon,
  investment_proof: IconBriefcase,
}

const REQUIRED_DOC_IDS_BY_REASON: Record<RevisionReasonKey, DocumentTypeId[]> = {
  missed_income: ['pan', 'aadhaar', 'form16', 'ais_tis'],
  wrong_deduction: ['pan', 'aadhaar', 'investment_proof'],
  incorrect_bank: ['pan', 'aadhaar', 'bank_statement'],
  other: ['pan', 'aadhaar'],
}

const renderSlotIcon = (id: DocumentTypeId) => {
  try {
    const IconComp = SLOT_ICON_MAP[id] || IconFileText
    return <IconComp size={22} />
  } catch {
    return <IconFileText size={22} />
  }
}

const buildDocumentSlots = (selectedReason: RevisionReasonKey | null | undefined, selectedAy: string) => {
  const ayLabel = selectedAy ? `(${selectedAy})` : '(AY 2025-26)'
  const reasonKey: RevisionReasonKey = selectedReason || 'missed_income'
  const requiredIds = REQUIRED_DOC_IDS_BY_REASON[reasonKey] || REQUIRED_DOC_IDS_BY_REASON.missed_income

  const allSlots: Record<DocumentTypeId, Omit<DocumentSlotItem, 'isRequired'>> = {
    pan: { id: 'pan', title: 'PAN Card', subtitle: 'Front copy with clear name & photo', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    aadhaar: { id: 'aadhaar', title: 'Aadhaar Card', subtitle: 'Both sides with clear Aadhaar number', iconBg: '#f3e8ff', iconColor: '#9333ea' },
    form16: { id: 'form16', title: `Form 16 / Form 16A ${ayLabel}`, subtitle: 'Issued by employer / deductor', iconBg: '#e0e7ff', iconColor: '#2563eb' },
    ais_tis: { id: 'ais_tis', title: 'AIS and TIS Statement', subtitle: 'Downloaded from Income Tax portal', iconBg: '#fef3c7', iconColor: '#d97706' },
    bank_statement: {
      id: 'bank_statement',
      title: 'Bank Statements',
      subtitle: reasonKey === 'incorrect_bank' ? 'Cancelled cheque or passbook statement' : 'Last 6-12 months statement',
      iconBg: '#d1fae5',
      iconColor: '#059669',
    },
    investment_proof: { id: 'investment_proof', title: 'Investment Proofs', subtitle: 'Receipts, 80C / 80D documents', iconBg: '#ffedd5', iconColor: '#ea580c' },
  }

  const orderedIds: DocumentTypeId[] = ['pan', 'aadhaar', 'form16', 'ais_tis', 'bank_statement', 'investment_proof']
  const requiredSlots: DocumentSlotItem[] = requiredIds.map((id) => ({ ...allSlots[id], isRequired: true }))
  const additionalSlots: DocumentSlotItem[] = orderedIds
    .filter((id) => !requiredIds.includes(id))
    .map((id) => ({ ...allSlots[id], isRequired: false }))

  return { requiredSlots, additionalSlots }
}

export const RevisionDocumentUpload: React.FC<RevisionDocumentUploadProps> = ({
  selectedReason,
  selectedAy,
  uploadedDocuments,
  documentsError,
  onUpload,
  onRemove,
}) => {
  const { requiredSlots, additionalSlots } = buildDocumentSlots(selectedReason, selectedAy)
  const totalCount = requiredSlots.length + additionalSlots.length
  const uploadedCount = Math.min(totalCount, Object.keys(uploadedDocuments).length)
  const progressPercent = Math.round((uploadedCount / totalCount) * 100)
  const isRequiredComplete = requiredSlots.every((slot) => Boolean(uploadedDocuments[slot.id]))

  const renderSlotSection = (heading: string, slots: DocumentSlotItem[]) => (
    <section className="step4-section">
      <h3 className="section-category-title">{heading}</h3>
      <div className="docs-cards-list">
        {slots.map((slot) => {
          const doc = uploadedDocuments[slot.id]
          return (
            <DocumentCard
              key={slot.id}
              id={slot.id}
              title={slot.title}
              subtitle={slot.subtitle}
              isRequired={slot.isRequired}
              iconBg={slot.iconBg}
              iconColor={slot.iconColor}
              icon={renderSlotIcon(slot.id)}
              isUploaded={Boolean(doc)}
              fileName={doc?.fileName || doc?.file?.name}
              file={doc?.file}
              onView={(d) => {
                viewUploadedDocument({
                  id: d.id,
                  title: d.title,
                  fileName: d.fileName || doc?.fileName || doc?.file?.name,
                  file: d.file || doc?.file,
                })
              }}
              onUpload={(_, file) => onUpload(slot.id, file)}
              onRemove={() => onRemove(slot.id)}
            />
          )
        })}
      </div>
    </section>
  )

  return (
    <div className="step4-upload-documents">
      <div className="step4-title-wrap">
        <h2 className="step4-main-heading">Upload Documents</h2>
        <p className="step4-sub-heading">Upload proofs for the corrections made in your revised return.</p>
      </div>

      <div className="step4-progress-card">
        <div className="progress-meta-row">
          <span className="progress-count-text">
            {uploadedCount} of {totalCount} documents uploaded
          </span>
          <span className={`progress-status-badge ${isRequiredComplete ? 'complete' : 'in-progress'}`}>
            {isRequiredComplete ? 'Complete' : 'In Progress'}
          </span>
        </div>

        <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className={`progress-fill progress-fill--${uploadedCount}`} />
        </div>
      </div>

      {documentsError && (
        <div className="step4-error-banner" role="alert">
          {documentsError}
        </div>
      )}

      {renderSlotSection('Required Documents', requiredSlots)}
      {renderSlotSection('Additional Documents', additionalSlots)}
    </div>
  )
}
