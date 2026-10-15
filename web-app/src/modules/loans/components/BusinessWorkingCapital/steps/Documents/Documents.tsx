import React, { useMemo } from 'react'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { DocumentSection, UploadDocument } from '@shared/components'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import type { LoanDocumentDefinition, UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import type { BusinessWorkingCapitalStepProps } from '@modules/loans/types/businessWorkingCapital.types'
import { getBwcDocumentList } from './documents.constants'
import './Documents.css'

export interface LoanDocumentChecklistProps {
  docs: LoanDocumentDefinition[]
  uploadedDocs: Record<string, UploadedLoanDocument>
  onChange: (uploadedDocs: Record<string, UploadedLoanDocument>) => void
  errors?: Record<string, string>
  testId?: string
}

/** Required / optional upload cards; shared by the Business & Working Capital and Personal Loan flows */
export const LoanDocumentChecklist: React.FC<LoanDocumentChecklistProps> = ({
  docs: allDocs,
  uploadedDocs,
  onChange,
  errors = {},
  testId = 'bwc-step-documents',
}) => {

  const requiredMissingCount = useMemo(
    () =>
      allDocs
        .filter((d) => d.isRequired)
        .filter((d) => !uploadedDocs[d.id]).length,
    [allDocs, uploadedDocs],
  )

  const requiredDocs = useMemo(() => allDocs.filter((d) => d.isRequired), [allDocs])
  const optionalDocs = useMemo(() => allDocs.filter((d) => !d.isRequired), [allDocs])

  const handleUpload = (id: string, file: File) => {
    try {
      if (!loanDocumentService.acceptFile(file)) return
      const entry = loanDocumentService.createDocumentEntry(id, file)
      onChange({ ...uploadedDocs, [id]: entry })
    } catch (err) {
      console.error('Failed to process document upload:', err)
    }
  }

  const handleRemove = (id: string) => {
    try {
      const next = { ...uploadedDocs }
      delete next[id]
      onChange(next)
    } catch (err) {
      console.error('Failed to remove document:', err)
    }
  }

  const renderDocCard = (doc: LoanDocumentDefinition) => {
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

    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title}
        subtitle={doc.subtitle}
        badge={badge}
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.name}
        fileSize={uploaded?.size}
        file={uploaded?.file}
        icon={doc.icon}
        iconBg={doc.iconBg}
        iconColor={doc.iconColor}
        className={hasError ? 'loan-doc-item--error' : ''}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <div className="bwc-docs" data-testid={testId}>
      {requiredMissingCount > 0 && Boolean(errors._step) && (
        <div className="bwc-docs__error-banner" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <strong>Mandatory Documents Missing:</strong>
            <p>
              Please upload all required documents before proceeding to review.
            </p>
          </div>
        </div>
      )}

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

export const Documents: React.FC<BusinessWorkingCapitalStepProps> = ({ data, onChange, errors = {} }) => {
  const isGstRegistered = data.gstRegistered === 'yes'
  const docs = useMemo(
    () => getBwcDocumentList(data.financingFacility, isGstRegistered),
    [data.financingFacility, isGstRegistered],
  )
  return (
    <LoanDocumentChecklist
      docs={docs}
      uploadedDocs={data.uploadedDocs || {}}
      onChange={(uploadedDocs) => onChange({ uploadedDocs })}
      errors={errors}
    />
  )
}

export default Documents
