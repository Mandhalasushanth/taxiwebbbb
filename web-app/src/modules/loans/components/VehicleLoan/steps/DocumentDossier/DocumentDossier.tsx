import React from 'react'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { DocumentSection, UploadDocument } from '@shared/components'
import { loanDocumentService, createDocDef } from '@modules/loans/documents'
import type { LoanDocumentDefinition } from '@modules/loans/documents/loanDocument.types'
import type { VehicleLoanData } from '@modules/loans/types/vehicleLoan.types'
import './DocumentDossier.css'
import { UPLOAD_HINT } from '@shared/upload'

export interface DocumentDossierProps {
  data: VehicleLoanData
  onChange: (fields: Partial<VehicleLoanData>) => void
  errors?: Record<string, string>
}

const SECTION_ICON_IDENTITY = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vehicle-docs__section-icon">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SECTION_ICON_INCOME = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vehicle-docs__section-icon">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)

const SECTION_ICON_VEHICLE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="vehicle-docs__section-icon">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
)

const doc = (id: string, title: string, subtitle: string, category: string, icon: React.ReactNode, isRequired = true) =>
  createDocDef(id, title, subtitle, category, icon, isRequired, { iconBg: '#ffedd5', iconColor: '#ea580c' })

const IDENTITY_DOCS: LoanDocumentDefinition[] = [
  doc('pan_card', 'PAN Card', 'Clear photo or PDF copy of applicant PAN', 'identity', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )),
  doc('aadhaar_card', 'Aadhaar Card', 'Front & back copy with readable QR code', 'identity', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )),
  doc('driving_license', 'Driving License', 'Valid driver license (mandatory auto loan KYC)', 'identity', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><circle cx="7" cy="12" r="2" /><path d="M13 10h4M13 14h4" />
    </svg>
  )),
  doc('passport_photo', 'Passport Size Photograph', 'Recent passport photo of applicant', 'identity', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  )),
  doc('address_proof', 'Address Proof', 'Utility bill / Rent Agreement / Voter ID', 'identity', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )),
]

const INCOME_DOCS: LoanDocumentDefinition[] = [
  doc('bank_statement', 'Bank Statements (6-12 Months)', 'Continuous bank statement of salary / primary account in PDF', 'income', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )),
  doc('salary_slip', 'Salary Slips / Income Proof', 'Last 3-6 months payslips or business income statement', 'income', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )),
  doc('form16_itr', 'Form 16 / ITR & Computation (2 Years)', 'Latest 2 assessment years tax returns or Form 16 Part A & B', 'income', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ), false),
]

const VEHICLE_DOCS: LoanDocumentDefinition[] = [
  doc('dealer_quotation', 'Dealer Proforma Invoice / Quotation', 'Official quotation with on-road price breakup from dealer', 'property', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )),
  doc('vehicle_rc', 'Vehicle RC Copy (For Used Vehicle)', 'Registration Certificate (front & back) if pre-owned vehicle', 'property', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ), false),
  doc('down_payment_receipt', 'Down Payment / Margin Money Receipt', 'Booking receipt or token advance paid to dealer', 'property', (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" />
    </svg>
  ), false),
]

const REQUIRED_DOC_IDS = [
  'pan_card',
  'aadhaar_card',
  'driving_license',
  'passport_photo',
  'address_proof',
  'bank_statement',
  'salary_slip',
  'dealer_quotation',
]

export const DocumentDossier: React.FC<DocumentDossierProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const uploadedDocs = data.uploadedDocs || {}
  const requiredUploadedCount = REQUIRED_DOC_IDS.filter((id) => Boolean(uploadedDocs[id])).length
  const totalRequiredDocs = REQUIRED_DOC_IDS.length
  const progressPercent = Math.round((requiredUploadedCount / totalRequiredDocs) * 100)

  const handleUpload = (id: string, file: File) => {
    if (!loanDocumentService.acceptFile(file)) return
    const entry = loanDocumentService.createDocumentEntry(id, file)
    onChange({ uploadedDocs: { ...uploadedDocs, [id]: entry } })
  }

  const handleRemove = (id: string) => {
    const next = { ...uploadedDocs }
    delete next[id]
    onChange({ uploadedDocs: next })
  }

  const renderDocCard = (doc: LoanDocumentDefinition) => {
    const uploaded = uploadedDocs[doc.id]
    const isMissingRequired = !uploaded && Boolean(errors[doc.id])
    const showOptionalBadge = !doc.isRequired && !doc.hideOptionalBadge && doc.badgeLabel !== ''
    const badge = showOptionalBadge ? (
      <span className="loan-doc-item__badge loan-doc-item__badge--optional">
        {doc.badgeLabel || 'Optional'}
      </span>
    ) : isMissingRequired ? (
      <span className="loan-doc-item__badge loan-doc-item__badge--error">
        Required Document Missing
      </span>
    ) : undefined

    return (
      <UploadDocument
        key={doc.id}
        id={doc.id}
        title={doc.title}
        subtitle={doc.subtitle}
        isRequired={doc.isRequired}
        badge={badge}
        isUploaded={Boolean(uploaded)}
        fileName={uploaded?.name}
        fileSize={uploaded?.size}
        file={uploaded?.file}
        icon={doc.icon}
        iconBg={doc.iconBg || '#fff7ed'}
        iconColor={doc.iconColor || '#ea580c'}
        className={isMissingRequired ? 'loan-doc-item--error' : ''}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <div className="vehicle-doc-dossier-step">
      <div className="vehicle-docs__progress-card">
        <div className="vehicle-docs__progress-header">
          <span className="vehicle-docs__progress-title">Document Checklist Progress</span>
          <span className="vehicle-docs__progress-count">
            {requiredUploadedCount} of {totalRequiredDocs} ({progressPercent}%)
          </span>
        </div>
        <div className="vehicle-docs__progress-track">
          <div className="vehicle-docs__progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="vehicle-docs__supported-formats">
          Supported files: {UPLOAD_HINT} per file
        </span>
      </div>

      <DocumentSection
        title="IDENTITY & ADDRESS"
        icon={SECTION_ICON_IDENTITY}
      >
        <LoanDocumentGrid>
          {IDENTITY_DOCS.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>

      <DocumentSection
        title="INCOME & BANKING"
        icon={SECTION_ICON_INCOME}
      >
        <LoanDocumentGrid>
          {INCOME_DOCS.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>

      <DocumentSection
        title="VEHICLE QUOTATION & COLLATERAL"
        icon={SECTION_ICON_VEHICLE}
      >
        <LoanDocumentGrid>
          {VEHICLE_DOCS.map(renderDocCard)}
        </LoanDocumentGrid>
      </DocumentSection>
    </div>
  )
}

export default DocumentDossier
