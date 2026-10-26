import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import { useState, type FC } from 'react'
import type { GSTStepReviewProps, ReviewField } from '@modules/gst/types/gstReview.types'
import { INITIAL_DOCUMENTS } from '@modules/gst/utils/gstDocuments.constants'
import {
  BusinessRegIcon,
  BankProofIcon,
  UserSignatoryIcon,
} from '@modules/gst/shared/GSTDocIcons/GSTDocIcons'
import { GSTReviewSection } from './GSTReviewSection'
import { GSTReviewDocsList } from './GSTReviewDocsList'
import { GSTReviewDeclaration } from './GSTReviewDeclaration'
import { GSTDocPreviewModal } from '../GSTStepDocuments/GSTDocPreviewModal'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import type { DocPreviewState } from '@modules/gst/types/gstDocuments.types'
import { StepActionBar } from '@shared/components'
import './GSTStepReview.css'
import { errorTracker } from '@core/errors'
import { openGstDocumentPreview } from '@modules/gst/utils/gstDocumentPreview'

export const GSTStepReview: FC<GSTStepReviewProps> = ({
  businessData,
  documents = INITIAL_DOCUMENTS,
  onEdit,
  onBack,
  onProceed,
  onSaveDraft,
}) => {
  const [isDeclared, setIsDeclared] = useState<boolean>(false)
  const [declarationError, setDeclarationError] = useState<boolean>(false)
  const [previewDoc, setPreviewDoc] = useState<DocPreviewState | null>(null)

  const handleDeclarationChange = (checked: boolean) => {
    setIsDeclared(checked)
    if (checked) setDeclarationError(false)
  }

  const handleProceedClick = () => {
    if (!isDeclared) {
      setDeclarationError(true)
      return
    }
    onProceed()
  }

  const handleViewDoc = (title: string, fileName: string) => {
    const matchedDoc = documents.find((d) => d.title === title || d.fileName === fileName)
    const file = matchedDoc ? (matchedDoc.file || gstUploadedFiles.get(matchedDoc.id)) : undefined
    if (file) {
      try {
        let viewableBlob: Blob = file
        let mimeType = file.type
        const name = file.name || fileName || ''
        const ext = name.split('.').pop()?.toLowerCase()
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (ext === 'pdf') mimeType = 'application/pdf'
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
          else if (ext === 'png') mimeType = 'image/png'
        }
        if (mimeType && mimeType !== file.type) {
          viewableBlob = new Blob([file], { type: mimeType })
        }
        const objectUrl = URL.createObjectURL(viewableBlob)
        const win = window.open(objectUrl, '_blank')
        try {
          win?.focus?.()
        } catch {
          // ignore
        }
        return
      } catch (e) {
        errorTracker.captureException(e, { tags: { area: 'gst-review-preview' } })
      }
    }
    try {
      openGstDocumentPreview({
        title,
        fileName,
      })
      return
    } catch (e) {
      errorTracker.captureException(e, { tags: { area: 'gst-review-preview-fallback' } })
    }
  }

  const locationString = [businessData.city, businessData.district, businessData.state, businessData.pinCode ? `- ${businessData.pinCode}` : '']
    .filter(Boolean)
    .join(', ')

  const businessFields: ReviewField[] = [
    { label: 'Legal Name', value: businessData.legalName || '—' },
    { label: 'Trade Name', value: businessData.tradeName || businessData.legalName || '—' },
    { label: 'Constitution', value: businessData.constitution || '—' },
    { label: 'Business PAN', value: businessData.businessPan || '—' },
    { label: 'Nature of Business', value: businessData.natureOfBusiness || '—' },
    { label: 'Date of Commencement', value: businessData.commencementDate || '—' },
    { label: 'Reason for Reg.', value: businessData.registrationReason || '—' },
    {
      label: 'Composition Scheme',
      value:
        businessData.compositionScheme?.startsWith('Yes')
          ? 'Yes — composition scheme'
          : businessData.compositionScheme?.startsWith('No')
          ? 'No — regular scheme'
          : businessData.compositionScheme || '—',
    },
    { label: 'Place of Business', value: businessData.placeOfBusiness || '—' },
    { label: 'Address', value: businessData.businessAddress || '—' },
    {
      label: 'Location',
      value: locationString || '—',
    },
    { label: 'HSN / SAC Code', value: businessData.hsnSacCode || '—' },
  ]

  const bankFields: ReviewField[] = [
    { label: 'Account Holder', value: businessData.accountHolderName || businessData.legalName || '—' },
    { label: 'Account Number', value: businessData.accountNumber ? `••••${businessData.accountNumber.slice(-4)}` : '—' },
    { label: 'IFSC Code', value: businessData.ifscCode || '—' },
    {
      label: 'Bank & Branch',
      value: businessData.bankName
        ? `${businessData.bankName}${businessData.branch ? ` (${businessData.branch})` : ''}`
        : '—',
    },
    { label: 'Account Type', value: businessData.accountType || '—' },
  ]

  const signatoryFields: ReviewField[] = [
    { label: 'Name', value: businessData.signatoryName || '—' },
    { label: 'PAN', value: businessData.signatoryPan || '—' },
    { label: 'DOB', value: businessData.dob || '—' },
    { label: 'Designation', value: businessData.designation || '—' },
    {
      label: 'Contact',
      value: (
        <div className="gst-review-contact-val">
          <span>{businessData.signatoryMobile ? `+91 ${businessData.signatoryMobile}` : '—'}</span>
          {businessData.signatoryEmail && (
            <span className="gst-review-contact-email">{businessData.signatoryEmail}</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="gst-step-review-container">
      {/* 1. Business Details Section */}
      <GSTReviewSection
        title="Business Details"
        icon={<BusinessRegIcon width={20} height={20} />}
        tone="orange"
        fields={businessFields}
        onEdit={() => onEdit('business')}
      />

      {/* 2. Bank Details Section */}
      <GSTReviewSection
        title="Bank Details"
        icon={<BankProofIcon width={20} height={20} />}
        tone="mint"
        fields={bankFields}
        onEdit={() => onEdit('bank')}
      />

      {/* 3. Authorised Signatory Section */}
      <GSTReviewSection
        title="Authorised Signatory"
        icon={<UserSignatoryIcon width={20} height={20} />}
        tone="purple"
        fields={signatoryFields}
        onEdit={() => onEdit('signatory')}
      />

      {/* 4. Uploaded Documents Section */}
      <GSTReviewDocsList documents={documents} onViewDoc={handleViewDoc} onEdit={() => onEdit('documents')} />

      {/* 5. Declaration Checkbox Card */}
      <GSTReviewDeclaration
        checked={isDeclared}
        onChange={handleDeclarationChange}
        hasError={declarationError}
      />

      <GSTStepErrorBanner message={declarationError ? 'Please accept the declaration to continue.' : null} />

      {/* 6. Navigation Footer Actions */}
      <StepActionBar
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onNext={handleProceedClick}
        nextLabel="Submit Application"
      />

      {/* Document Preview Modal */}
      <GSTDocPreviewModal previewDoc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}

export default GSTStepReview
