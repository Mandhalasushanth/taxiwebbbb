import React, { useState } from 'react'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import { UploadDocument } from '@shared/components'
import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import { PROJECT_FINANCE_DOC_LIST, type UploadDocItem } from '@modules/loans/constants/projectFinanceDocuments.constants'

export interface UploadDocumentsSectionProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isOpen: boolean
  onToggle: () => void
  errors?: Record<string, string>
}

const FileTextSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ChevronSvg: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

const RenderDocIcon: React.FC<{ type: UploadDocItem['iconType'] }> = ({ type }) => {
  switch (type) {
    case 'user':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'building':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="22.01" />
          <line x1="15" y1="22" x2="15" y2="22.01" />
          <line x1="9" y1="6" x2="9" y2="6.01" />
          <line x1="15" y1="6" x2="15" y2="6.01" />
          <line x1="9" y1="10" x2="9" y2="10.01" />
          <line x1="15" y1="10" x2="15" y2="10.01" />
          <line x1="9" y1="14" x2="9" y2="14.01" />
          <line x1="15" y1="14" x2="15" y2="14.01" />
        </svg>
      )
    case 'chart':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'money':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    case 'attachment':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      )
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
  }
}

export const UploadDocumentsSection: React.FC<UploadDocumentsSectionProps> = ({
  data,
  onChange,
  isOpen,
  onToggle,
  errors = {},
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Applicant' | 'Project' | 'Financial'>('All')

  const handleFileUpload = (docId: string, file: File | null) => {
    if (!file || !loanDocumentService.acceptFile(file)) return
    const uploadedDoc: UploadedLoanDocument = loanDocumentService.createDocumentEntry(docId, file)
    const updatedDocs = {
      ...(data.uploadedDocs || {}),
      [docId]: uploadedDoc,
    }
    onChange({ uploadedDocs: updatedDocs })
  }

  const handleRemoveDoc = (docId: string) => {
    const nextDocs = { ...(data.uploadedDocs || {}) }
    delete nextDocs[docId]
    onChange({ uploadedDocs: nextDocs })
  }

  const handleViewDoc = (docId: string, title: string) => {
    const rawDoc = data.uploadedDocs?.[docId]
    const fileObj = rawDoc instanceof File ? rawDoc : rawDoc?.file
    if (fileObj) {
      const url = URL.createObjectURL(fileObj)
      window.open(url, '_blank')
    } else {
      const name = (rawDoc && 'name' in rawDoc) ? rawDoc.name : title
      alert(`Viewing: ${name}`)
    }
  }

  const filteredDocs = PROJECT_FINANCE_DOC_LIST.filter((doc) => {
    if (activeCategory === 'All') return true
    return doc.category === activeCategory
  })

  return (
    <div className="pf-collapsible-card">
      <div className="pf-collapsible-header" onClick={onToggle}>
        <div className="pf-collapsible-header__left">
          <div className="pf-section-icon-tile pf-section-icon-tile--orange">
            <FileTextSvg />
          </div>
          <h2 className="pf-collapsible-title">1. Upload Documents</h2>
        </div>
        <ChevronSvg isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className="pf-collapsible-body">
          <p className="pf-section-intro-desc">
            Upload the required documents for your project finance application.
          </p>

          {/* Category Tabs */}
          <div className="pf-doc-tabs-row">
            <button
              type="button"
              className={`pf-doc-tab-pill ${activeCategory === 'All' ? 'pf-doc-tab-pill--active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All Documents
            </button>
            <button
              type="button"
              className={`pf-doc-tab-pill ${activeCategory === 'Applicant' ? 'pf-doc-tab-pill--active' : ''}`}
              onClick={() => setActiveCategory('Applicant')}
            >
              Applicant
            </button>
            <button
              type="button"
              className={`pf-doc-tab-pill ${activeCategory === 'Project' ? 'pf-doc-tab-pill--active' : ''}`}
              onClick={() => setActiveCategory('Project')}
            >
              Project
            </button>
            <button
              type="button"
              className={`pf-doc-tab-pill ${activeCategory === 'Financial' ? 'pf-doc-tab-pill--active' : ''}`}
              onClick={() => setActiveCategory('Financial')}
            >
              Financial
            </button>
          </div>

          {/* Document Upload Items */}
          <div className="pf-doc-upload-items-list">
            {filteredDocs.map((doc) => {
              const rawDoc = data.uploadedDocs?.[doc.id]
              const isUploaded = Boolean(rawDoc)
              const fileName = rawDoc instanceof File ? rawDoc.name : rawDoc?.name
              const fileSize = (rawDoc && !(rawDoc instanceof File)) ? rawDoc.size : ''

              return (
                <UploadDocument
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  subtitle={doc.subtitle}
                  isRequired={doc.required}
                  icon={<RenderDocIcon type={doc.iconType} />}
                  iconBg="#eff6ff"
                  iconColor="#2563eb"
                  isUploaded={isUploaded}
                  fileName={fileName}
                  fileSize={fileSize}
                  onUpload={(id, file) => handleFileUpload(id, file)}
                  onRemove={(id) => handleRemoveDoc(id)}
                  onView={() => handleViewDoc(doc.id, doc.title)}
                />
              )
            })}
          </div>

          {errors.documents && (
            <span className="pf-field-error-msg">{errors.documents}</span>
          )}
        </div>
      )}
    </div>
  )
}

