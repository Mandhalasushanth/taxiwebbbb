import React from 'react'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { DocumentSection, UploadDocument } from '@shared/components'
import type { PersonalLoanStepProps } from '@modules/loans/types/personalLoan.types'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import { PERSONAL_DOCS_LIST } from './Documents.constants'
import type { DocDef } from './Documents.constants'
import './Documents.css'

export const Documents: React.FC<PersonalLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const uploadedDocs = data.uploadedDocs || {}
  const uploadedCount = Object.keys(uploadedDocs).length
  const totalCount = PERSONAL_DOCS_LIST.length
  const progressPercent = Math.round((uploadedCount / totalCount) * 100)

  const handleUpload = (docId: string, file: File) => {
    if (!loanDocumentService.acceptFile(file)) return
    const entry = loanDocumentService.createDocumentEntry(docId, file)
    onChange({
      uploadedDocs: {
        ...uploadedDocs,
        [docId]: entry,
      },
    })
  }

  const handleRemove = (docId: string) => {
    const next = { ...uploadedDocs }
    delete next[docId]
    onChange({ uploadedDocs: next })
  }

  const identityDocs = PERSONAL_DOCS_LIST.filter((d) => d.category === 'IDENTITY & ADDRESS')
  const incomeDocs = PERSONAL_DOCS_LIST.filter((d) => d.category === 'INCOME & BANKING')

  const renderDocCard = (doc: DocDef) => {
    const uploaded = uploadedDocs[doc.id]
    const hasError = !uploaded && Boolean(errors[doc.id])
    const IconComponent = doc.icon

    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title}
        subtitle={doc.subtitle}
        isRequired={true}
        badge={
          hasError ? (
            <span className="loan-doc-item__badge loan-doc-item__badge--error">
              Required Document Missing
            </span>
          ) : undefined
        }
        icon={<IconComponent size={20} color={doc.iconColor} aria-hidden="true" />}
        iconBg={doc.iconBg}
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.name}
        fileSize={uploaded?.size}
        file={uploaded?.file}
        className={hasError ? 'loan-doc-item--error' : ''}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <div className="personal-documents-step" data-testid="step-personal-documents">
      <div className="personal-documents-header">
        <h2 className="personal-documents-header__title">Document Verification Dossier</h2>
        <p className="personal-documents-header__subtitle">
          Checklist for Personal Loan. Upload clear digital copies to expedite sanction.
        </p>
      </div>

      {/* Mandatory Document Progress Card */}
      <div className="personal-doc-progress-card">
        <div className="personal-doc-progress-card__top">
          <span className="personal-doc-progress-card__label">Mandatory Document Progress</span>
          <span className="personal-doc-progress-card__val">
            {uploadedCount} of {totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className="personal-doc-progress-card__track">
          <div
            className="personal-doc-progress-card__bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Group 1: IDENTITY & ADDRESS */}
      <DocumentSection title="IDENTITY & ADDRESS">
        <LoanDocumentGrid>
          {identityDocs.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>

      {/* Group 2: INCOME & BANKING */}
      <DocumentSection title="INCOME & BANKING">
        <LoanDocumentGrid>
          {incomeDocs.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>
    </div>
  )
}

export default Documents
