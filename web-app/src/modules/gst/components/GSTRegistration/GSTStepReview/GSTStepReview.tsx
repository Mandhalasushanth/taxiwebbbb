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
        console.warn('Could not open document in new window:', e)
      }
    }
    try {
      const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title} - ${fileName || title}</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
      .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; max-width: 480px; width: 90%; border: 1px solid #e2e8f0; }
      .icon-circle { width: 64px; height: 64px; margin: 0 auto 1.25rem; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; }
      .icon { width: 32px; height: 32px; }
      h2 { margin: 0 0 0.5rem; font-size: 1.35rem; font-weight: 600; color: #0f172a; }
      p { margin: 0; color: #64748b; font-size: 0.95rem; word-break: break-all; }
      .badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 1.25rem; padding: 0.4rem 1rem; background: #ecfdf5; color: #059669; border-radius: 9999px; font-weight: 500; font-size: 0.85rem; border: 1px solid #a7f3d0; }
      .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
      .note { margin-top: 1.5rem; font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon-circle">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </div>
      <h2>${title}</h2>
      <p>${fileName || 'Uploaded Document'}</p>
      <div class="badge"><span class="badge-dot"></span>Uploaded & Verified</div>
      <p class="note">This document is securely attached to your application.</p>
    </div>
  </body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const previewUrl = URL.createObjectURL(blob)
      window.open(previewUrl, '_blank')
      return
    } catch {
      // Fallback
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
        businessData.compositionScheme === 'Yes'
          ? 'Yes — composition scheme'
          : businessData.compositionScheme === 'No'
          ? 'No — regular scheme'
          : '—',
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
        nextLabel="Continue"
      />

      {/* Document Preview Modal */}
      <GSTDocPreviewModal previewDoc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}

export default GSTStepReview
