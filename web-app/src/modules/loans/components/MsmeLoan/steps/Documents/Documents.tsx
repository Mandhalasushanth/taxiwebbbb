import React, { useMemo } from 'react'
import { Award, FileText, Receipt, ShieldCheck } from 'lucide-react'
import { DocumentSection, UploadDocument } from '@shared/components'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import type { MsmeLoanStepProps } from '@modules/loans/types/msmeLoan.types'
import {
  getMsmeLoanDocumentSections,
  type MsmeLoanDocConfig,
} from '../../msmeLoan.constants'
import './Documents.css'

/**
 * Step 3: MSME Loan Documents verification matching previous loans
 */
export const Documents: React.FC<MsmeLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { requiredDocs, optionalDocs } = useMemo(
    () => getMsmeLoanDocumentSections(data.gstStatus),
    [data.gstStatus],
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
      console.error('Failed to process MSME document upload:', err)
    }
  }

  const handleRemove = (id: string) => {
    try {
      const next = { ...uploadedDocs }
      delete next[id]
      onChange({ uploadedDocs: next })
    } catch (err) {
      console.error('Failed to remove MSME document:', err)
    }
  }

  const renderDocIcon = (iconType: MsmeLoanDocConfig['iconType']) => {
    switch (iconType) {
      case 'award':
        return <Award size={22} aria-hidden="true" />
      case 'receipt':
        return <Receipt size={22} aria-hidden="true" />
      case 'file':
      default:
        return <FileText size={22} aria-hidden="true" />
    }
  }

  const renderDocCard = (doc: MsmeLoanDocConfig) => {
    const uploaded = uploadedDocs[doc.id]
    const hasError = !uploaded && Boolean(errors[doc.id] || errors.udyam_certificate)

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
    <div className="msme-step msme-docs" data-testid="msme-step-documents">
      {/* Required Documents Section */}
      <DocumentSection
        title="REQUIRED DOCUMENTS"
        icon={<ShieldCheck size={20} aria-hidden="true" />}
      >
        <LoanDocumentGrid>{requiredDocs.map(renderDocCard)}</LoanDocumentGrid>
      </DocumentSection>

      {/* Optional Documents Section */}
      {optionalDocs.length > 0 && (
        <DocumentSection
          title="OPTIONAL DOCUMENTS"
          icon={<ShieldCheck size={20} aria-hidden="true" />}
        >
          <LoanDocumentGrid>{optionalDocs.map(renderDocCard)}</LoanDocumentGrid>
        </DocumentSection>
      )}
    </div>
  )
}

export default Documents
