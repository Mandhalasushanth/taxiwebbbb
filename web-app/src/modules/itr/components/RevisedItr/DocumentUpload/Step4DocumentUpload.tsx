import React from 'react'
import type { DocumentTypeId, UploadedDocument } from '../../../types/revisedItr.types'
import { DocumentCard } from '@shared/components'
import { viewUploadedDocument } from '@shared/upload'
import './Step4DocumentUpload.css'

export interface DocumentSlotItem {
  id: DocumentTypeId
  title: string
  subtitle: string
  isRequired: boolean
  iconBg: string
  iconColor: string
}

export interface Step4DocumentUploadProps {
  requiredSlots: DocumentSlotItem[]
  additionalSlots: DocumentSlotItem[]
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  documentsError?: string | null
  onUpload: (id: DocumentTypeId, file: File) => void
  onRemove: (id: DocumentTypeId) => void
}

const renderSlotIcon = (id: DocumentTypeId) => {
  switch (id) {
    case 'pan':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="10" r="2.5" />
          <line x1="14" y1="9" x2="18" y2="9" />
          <line x1="14" y1="13" x2="17" y2="13" />
          <line x1="6" y1="16" x2="18" y2="16" />
        </svg>
      )
    case 'aadhaar':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 3.5a3.5 3.5 0 0 1 5 0" />
          <path d="M7 6.5a7 7 0 0 1 10 0" />
          <path d="M4.5 10.5a10.5 10.5 0 0 1 15 0" />
          <path d="M4 14.5c0 1.5.3 3 .8 4" />
          <path d="M6.5 12a7.5 7.5 0 0 1 11 0v3" />
          <path d="M9 13.5a4 4 0 0 1 6 0v4" />
          <path d="M11.5 15a1.5 1.5 0 0 1 1 0v4.5" />
          <path d="M6.5 18c.5 1.8 1.5 3 2.5 3.5" />
          <path d="M17.5 17.5c-.5 1.8-1.5 3-2.5 3.5" />
        </svg>
      )
    case 'form16':
    case 'ais_tis':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    case 'bank_statement':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="21" x2="21" y2="21" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="5 6 12 3 19 6" />
          <line x1="8" y1="14" x2="8" y2="17" />
          <line x1="12" y1="14" x2="12" y2="17" />
          <line x1="16" y1="14" x2="16" y2="17" />
        </svg>
      )
    case 'investment_proof':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
  }
}

export const Step4DocumentUpload: React.FC<Step4DocumentUploadProps> = ({
  requiredSlots,
  additionalSlots,
  uploadedDocuments,
  documentsError,
  onUpload,
  onRemove,
}) => {
  const uploadedCount = Object.keys(uploadedDocuments).length
  const totalCount = requiredSlots.length + additionalSlots.length
  const progressPercent = Math.round((uploadedCount / totalCount) * 100)
  const isRequiredComplete = requiredSlots.every((slot) => !!uploadedDocuments[slot.id])

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
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {documentsError && (
        <div className="step4-error-banner" role="alert">
          {documentsError}
        </div>
      )}

      <section className="step4-section">
        <h3 className="section-category-title">Required Documents</h3>
        <div className="docs-cards-list">
          {requiredSlots.map((slot) => {
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

      <section className="step4-section">
        <h3 className="section-category-title">Additional Documents</h3>
        <div className="docs-cards-list">
          {additionalSlots.map((slot) => {
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
    </div>
  )
}
