import React, { useMemo } from 'react'
import { BarChart3, CreditCard, FileText, ShieldCheck } from 'lucide-react'
import { DocumentSection, UploadDocument } from '@shared/components'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import type { PersonalLoanStepProps } from '@modules/loans/types/personalLoan.types'
import {
  getPersonalLoanDocumentSections,
  type PersonalLoanDocConfig,
} from '../../personalLoan.constants'
import './Documents.css'

/**
 * Step 3: Documents verification modeled after Business & Working Capital
 * Uses shared UploadDocument with View, Replace, and Delete actions
 */
export const Documents: React.FC<PersonalLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { requiredDocs, optionalDocs } = useMemo(
    () => getPersonalLoanDocumentSections(data.employmentType),
    [data.employmentType],
  )
  const uploadedDocs = data.uploadedDocs || {}

  const handleUpload = (id: string, file: File) => {
    try {
      if (!loanDocumentService.acceptFile(file)) return
      const entry = loanDocumentService.createDocumentEntry(id, file)
      onChange({
        uploadedDocs: {
          ...uploadedDocs,
          [id]: entry,
        },
      })
    } catch (err) {
      console.error('Failed to process document upload:', err)
    }
  }

  const handleRemove = (id: string) => {
    try {
      const next = { ...uploadedDocs }
      delete next[id]
      onChange({ uploadedDocs: next })
    } catch (err) {
      console.error('Failed to remove document:', err)
    }
  }

  const renderDocIcon = (iconType: 'pan' | 'bank' | 'itr') => {
    if (iconType === 'pan') return <CreditCard size={20} aria-hidden="true" />
    if (iconType === 'itr') return <BarChart3 size={20} aria-hidden="true" />
    return <FileText size={20} aria-hidden="true" />
  }

  const renderDocCard = (doc: PersonalLoanDocConfig) => {
    const uploaded = uploadedDocs[doc.id]
    const hasError = !uploaded && Boolean(errors[doc.id])

    const badge = hasError ? (
      <span className="loan-doc-item__badge loan-doc-item__badge--error">
        Required Document Missing
      </span>
    ) : doc.isRequired ? (
      <span className="loan-doc-item__badge loan-doc-item__badge--required">
        Required
      </span>
    ) : (
      <span className="loan-doc-item__badge loan-doc-item__badge--optional">
        Optional
      </span>
    )

    const formattedSize =
      typeof uploaded?.size === 'number'
        ? `${(uploaded.size / 1024).toFixed(1)} KB`
        : uploaded?.size

    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title}
        subtitle={doc.description}
        badge={badge}
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.name}
        fileSize={formattedSize}
        file={uploaded?.file}
        icon={renderDocIcon(doc.iconType)}
        iconBg="#eff6ff"
        iconColor="#2563eb"
        className={hasError ? 'loan-doc-item--error' : ''}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <div className="pl-step pl-docs" data-testid="pl-step-documents">
      <DocumentSection
        title="REQUIRED DOCUMENTS"
        icon={<ShieldCheck size={20} aria-hidden="true" />}
      >
        <LoanDocumentGrid>
          {requiredDocs.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>

      {optionalDocs.length > 0 && (
        <DocumentSection
          title="OPTIONAL DOCUMENTS"
          icon={<ShieldCheck size={20} aria-hidden="true" />}
        >
          <LoanDocumentGrid>
            {optionalDocs.map(renderDocCard)}
          </LoanDocumentGrid>
        </DocumentSection>
      )}
    </div>
  )
}

export default Documents
