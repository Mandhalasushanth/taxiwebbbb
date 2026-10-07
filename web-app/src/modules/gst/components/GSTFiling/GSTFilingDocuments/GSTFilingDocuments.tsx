import { viewUploadedDocument } from '@shared/upload'
import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React, { useState } from 'react'
import { MONTHLY_PERIOD_OPTIONS } from '@modules/gst/utils/gstPeriodOptions'
import { GSTFilingStepper } from '@modules/gst/shared/GSTFilingStepper/GSTFilingStepper'
import { DocumentCard, DocumentSection, DocumentTracker, StepActionBar } from '@shared/components'
import {
  DOCUMENT_CATEGORIES,
  DEFAULT_DOCUMENT_ITEMS,
  type UploadedFileInfo,
  type DocumentIconType,
} from '@modules/gst/utils/gstDocumentsData'
import './GSTFilingDocuments.css'

export interface GSTFilingDocumentsProps {
  selectedMonth?: string
  baseFee?: number
  returnType?: string
  frequency?: string
  uploadedFiles?: Record<string, UploadedFileInfo>
  notApplicableDocs?: Record<string, boolean>
  isEditMode?: boolean
  onFileUpload?: (id: string, file: File) => void
  onFileRemove?: (id: string) => void
  onToggleNotApplicable?: (id: string) => void
  onStepClick?: (step: number) => void
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
}

const renderGstDocIcon = (type: DocumentIconType) => {
  switch (type) {
    case 'invoice':
    case 'expense':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    case 'credit-note':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 14 4 9 9 4" />
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
      )
    case 'debit-note':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 10 20 15 15 20" />
          <path d="M4 4v7a4 4 0 0 0 4 4h12" />
        </svg>
      )
    case 'irn':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    case 'eway':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      )
    case 'purchase':
    case 'gstr2b':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    case 'bank':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="21" x2="21" y2="21" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="5 6 12 3 19 6" />
          <line x1="4" y1="10" x2="4" y2="21" />
          <line x1="20" y1="10" x2="20" y2="21" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
  }
}

const getGstIconColors = (type: DocumentIconType): { bg: string; color: string } => {
  switch (type) {
    case 'invoice':
    case 'eway':
    case 'arn':
      return { bg: '#e0f2fe', color: '#0284c7' }
    case 'credit-note':
      return { bg: '#ffedd5', color: '#ea580c' }
    case 'debit-note':
    case 'bank':
      return { bg: '#fef3c7', color: '#d97706' }
    case 'irn':
      return { bg: '#e0e7ff', color: '#4f46e5' }
    case 'purchase':
    case 'gstr2b':
      return { bg: '#dcfce7', color: '#16a34a' }
    case 'expense':
      return { bg: '#f3e8ff', color: '#9333ea' }
    default:
      return { bg: '#f1f5f9', color: '#475569' }
  }
}

export const GSTFilingDocuments: React.FC<GSTFilingDocumentsProps> = ({
  selectedMonth,
  uploadedFiles: externalUploadedFiles,
  notApplicableDocs: externalNotApplicableDocs,
  isEditMode = false,
  onFileUpload: externalOnFileUpload,
  onFileRemove: externalOnFileRemove,
  onStepClick,
  onBack,
  onNext,
  onSaveDraft,
}) => {
  const [internalUploadedFiles, setInternalUploadedFiles] = useState<Record<string, UploadedFileInfo>>({})
  const [internalNotApplicableDocs] = useState<Record<string, boolean>>({})

  const uploadedFiles = externalUploadedFiles ?? internalUploadedFiles
  const notApplicableDocs = externalNotApplicableDocs ?? internalNotApplicableDocs

  const periodShort = selectedMonth?.trim() || MONTHLY_PERIOD_OPTIONS[0]?.value || ''
  const completedCount = Object.keys(uploadedFiles).length
  const totalCount = DEFAULT_DOCUMENT_ITEMS.length

  const handleFileUpload = (id: string, file: File) => {
    if (externalOnFileUpload) {
      externalOnFileUpload(id, file)
      return
    }
    const sizeText = formatGstFileSize(file.size)
    const fileUrl = URL.createObjectURL(file)
    const fileInfo: UploadedFileInfo = {
      name: file.name,
      sizeText,
      uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileUrl,
      status: 'verified',
    }
    setInternalUploadedFiles((prev) => ({
      ...prev,
      [id]: fileInfo,
    }))
  }

  const handleFileRemove = (id: string) => {
    if (externalOnFileRemove) {
      externalOnFileRemove(id)
      return
    }
    setInternalUploadedFiles((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  // Required docs verification: Sales, Purchases, and GSTR-2B
  const reqDocIds = ['sales-invoices', 'purchase-invoices', 'gstr2b-statement']
  const [showMissing, setShowMissing] = useState(false)
  const missingDocs = DEFAULT_DOCUMENT_ITEMS.filter(
    (doc) => reqDocIds.includes(doc.id) && !uploadedFiles[doc.id] && !notApplicableDocs[doc.id]
  )
  // Updates as documents are added, and disappears once nothing is missing
  const stepError =
    showMissing && missingDocs.length > 0
      ? `Please upload ${missingDocs.map((doc) => doc.title).join(', ')} or mark them not applicable.`
      : null

  // Continue stays enabled (as in loans); pressing it names the documents still missing
  const handleNext = () => {
    if (missingDocs.length > 0) {
      setShowMissing(true)
      return
    }
    onNext()
  }

  return (
    <div className="gst-docs-page">
      {/* Main Page Header */}
      <header className="gst-docs-header">
        <h1 className="gst-docs-title">Filing Documents</h1>
        <p className="gst-docs-subtitle">
          Upload the required documents for your GST return for {periodShort}. Clear invoices ensure 100% accurate Input Tax Credit (ITC) claim.
        </p>
      </header>

      {/* Stepper */}
      <div className="gst-docs-top-bar">
        <div className="gst-docs-stepper-wrap">
          <GSTFilingStepper currentStep={2} onStepClick={onStepClick} />
        </div>
      </div>

      {/* Modern Progress Tracker matching Image 2 */}
      <DocumentTracker
        uploadedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Categorized Document Sections without clutter tags */}
      {DOCUMENT_CATEGORIES.map((category) => {
        const items = DEFAULT_DOCUMENT_ITEMS.filter((item) => item.categoryId === category.id)
        if (items.length === 0) return null

        return (
          <DocumentSection
            key={category.id}
            title={category.title}
          >
            {items.map((item) => {
              const fileInfo = uploadedFiles[item.id]
              const colors = getGstIconColors(item.iconType)

              return (
                <DocumentCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  isRequired={item.isRequired}
                  icon={renderGstDocIcon(item.iconType)}
                  iconBg={colors.bg}
                  iconColor={colors.color}
                  isUploaded={Boolean(fileInfo)}
                  fileName={fileInfo?.name}
                  fileSize={fileInfo?.sizeText}
                  onUpload={handleFileUpload}
                  onRemove={handleFileRemove}
                  onView={(doc) =>
                    viewUploadedDocument({ id: doc.id, title: item.title, fileName: fileInfo?.name, file: doc.file, fileUrl: fileInfo?.fileUrl })
                  }
                />
              )
            })}
          </DocumentSection>
        )
      })}

      {/* Security Footer Note */}
      <div className="gst-docs-security-note" role="note">
        <div className="gst-docs-security-note__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <p className="gst-docs-security-note__text">
          TaxEdge uses end-to-end 256-bit encryption for filing proofs. Only certified Chartered Accountants review your books.
        </p>
      </div>

      <GSTStepErrorBanner message={stepError} />

      {/* Standard Step Action Bar (Back, Save Draft & Exit, Continue) */}
      <StepActionBar
        onBack={onBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        isEditMode={isEditMode}
      />
    </div>
  )
}
