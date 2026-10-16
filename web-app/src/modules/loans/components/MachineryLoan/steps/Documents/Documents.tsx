import React from 'react'
import { FileText, Receipt, ShieldCheck } from 'lucide-react'
import { DocumentSection, UploadDocument } from '@shared/components'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import type { MachineryLoanStepProps } from '@modules/loans/types/machineryLoan.types'
import {
  MACHINERY_OPTIONAL_DOCS,
  MACHINERY_REQUIRED_DOCS,
  type MachineryLoanDocConfig,
} from '../../machineryLoan.constants'
import './Documents.css'

/**
 * Step 3: Machinery Loan Documents verification modeled after Business & Working Capital
 * Displays "Machinery Quotation / Proforma Invoice" required document matching Business & Working Capital layout
 */
export const Documents: React.FC<MachineryLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const requiredDocs = MACHINERY_REQUIRED_DOCS
  const optionalDocs = MACHINERY_OPTIONAL_DOCS
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
      console.error('Failed to process machinery document upload:', err)
    }
  }

  const handleRemove = (id: string) => {
    try {
      const next = { ...uploadedDocs }
      delete next[id]
      onChange({ uploadedDocs: next })
    } catch (err) {
      console.error('Failed to remove machinery document:', err)
    }
  }

  const renderDocIcon = (iconType: MachineryLoanDocConfig['iconType']) => {
    switch (iconType) {
      case 'receipt':
        return <Receipt size={22} aria-hidden="true" />
      case 'file':
      default:
        return <FileText size={22} aria-hidden="true" />
    }
  }

  const renderDocCard = (doc: MachineryLoanDocConfig) => {
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
    <div className="mach-step mach-docs" data-testid="mach-step-documents">
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
