import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { DocumentCard, DocumentTracker, StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import './DocumentsKyc.css'

interface KycDocumentItem {
  id: string
  title: string
  subtitle: string
  isRequired: boolean
  isUploaded: boolean
  fileName?: string
}

export const DocumentsKyc: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const promoterDocs: KycDocumentItem[] = formData.documentsKyc?.promoterDocs || [
    {
      id: 'pan-card',
      title: 'PAN Card',
      subtitle: 'Promoter KYC',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'identity-address',
      title: 'Identity / Address Proof',
      subtitle: 'Aadhaar / Passport / other applicable proof',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'passport-photo',
      title: 'Passport Photo',
      subtitle: 'Required if applicable',
      isRequired: false,
      isUploaded: false,
    },
  ]

  const officeDocs: KycDocumentItem[] = formData.documentsKyc?.officeDocs || [
    {
      id: 'office-address',
      title: 'Office Address Proof',
      subtitle: 'Lease / Rent Agreement / Ownership Proof',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'office-utility',
      title: 'Office Utility Bill',
      subtitle: 'Electricity / Water / applicable utility bill',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'owner-noc',
      title: 'Owner NOC',
      subtitle: 'Required only if applicable',
      isRequired: false,
      isUploaded: false,
    },
  ]

  const statutoryDocs: KycDocumentItem[] = formData.documentsKyc?.statutoryDocs || [
    {
      id: 'statutory-moa',
      title: 'MOA / e-MOA',
      subtitle: 'Handled/generated as applicable',
      isRequired: false,
      isUploaded: false,
    },
    {
      id: 'statutory-aoa',
      title: 'AOA / e-AOA',
      subtitle: 'Handled/generated as applicable',
      isRequired: false,
      isUploaded: false,
    },
  ]

  const handleUpload = (
    section: 'promoter' | 'office' | 'statutory',
    id: string,
    file: File
  ) => {
    setErrors((prev) => ({ ...prev, [id]: '' }))
    const updateFn = (prev: KycDocumentItem[]) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isUploaded: true, fileName: file.name } : doc
      )

    updateFormData({
      documentsKyc: {
        ...formData.documentsKyc,
        promoterDocs: section === 'promoter' ? updateFn(promoterDocs) : promoterDocs,
        officeDocs: section === 'office' ? updateFn(officeDocs) : officeDocs,
        statutoryDocs: section === 'statutory' ? updateFn(statutoryDocs) : statutoryDocs,
      }
    })
  }

  const handleRemove = (
    section: 'promoter' | 'office' | 'statutory',
    id: string
  ) => {
    const updateFn = (prev: KycDocumentItem[]) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isUploaded: false, fileName: undefined } : doc
      )

    updateFormData({
      documentsKyc: {
        ...formData.documentsKyc,
        promoterDocs: section === 'promoter' ? updateFn(promoterDocs) : promoterDocs,
        officeDocs: section === 'office' ? updateFn(officeDocs) : officeDocs,
        statutoryDocs: section === 'statutory' ? updateFn(statutoryDocs) : statutoryDocs,
      }
    })
  }

  const handleContinue = () => {
    const allDocs = [...promoterDocs, ...officeDocs, ...statutoryDocs]
    const newErrors = allDocs.reduce<Record<string, string>>((acc, d) => {
      if (d.isRequired && !d.isUploaded) {
        acc[d.id] = `${d.title} is required`
      }
      return acc
    }, {})

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    updateFormData({
      documentsKyc: {
        promoterDocs: promoterDocs.map((d) => ({ ...d })),
        officeDocs: officeDocs.map((d) => ({ ...d })),
        statutoryDocs: statutoryDocs.map((d) => ({ ...d })),
      }
    })

    goToStep(routePaths.incorporation.linkedRegistrations)
  }

  const renderDocSection = (
    title: string,
    subtitle: string,
    section: 'promoter' | 'office' | 'statutory',
    docs: KycDocumentItem[]
  ) => (
    <section className="docs-kyc-card">
      <div className="docs-kyc-card__header">
        <h2 className="docs-kyc-card__title">{title}</h2>
        <p className="docs-kyc-card__subtitle">{subtitle}</p>
      </div>
      <div className="docs-kyc-section__list">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-item-wrapper">
            <DocumentCard
              id={doc.id}
              title={doc.title}
              subtitle={doc.subtitle}
              isRequired={doc.isRequired}
              isUploaded={doc.isUploaded}
              fileName={doc.fileName}
              className={errors[doc.id] && !doc.isUploaded ? 'doc-card--error' : ''}
              onUpload={(_, file) => handleUpload(section, doc.id, file)}
              onRemove={() => handleRemove(section, doc.id)}
            />
            {errors[doc.id] && !doc.isUploaded && <span className="docs-field-error">{errors[doc.id]}</span>}
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <div className="docs-kyc-page">
      {/* Progress Header */}
      <div className="docs-kyc-stepbar">
        <span className="docs-kyc-stepbar__badge">Step 5 of 10</span>
        <span className="docs-kyc-stepbar__text">Documents & KYC Checklist</span>
        <div className="docs-kyc-stepbar__line">
          <div className="docs-kyc-stepbar__line-fill" />
        </div>
      </div>

      <div className="docs-kyc-header">
        <h1 className="docs-kyc-header__title">Documents & KYC Checklist</h1>
        <p className="docs-kyc-header__subtitle">
          Upload digital copies of promoter identity, office proofs, and statutory e-MoA/e-AoA drafts.
        </p>
      </div>

      <DocumentTracker
        uploadedCount={[...promoterDocs, ...officeDocs, ...statutoryDocs].filter((d) => d.isUploaded).length}
        totalCount={[...promoterDocs, ...officeDocs, ...statutoryDocs].length}
      />

      {renderDocSection('Promoter & Director KYC', 'Identity and address proof documents for each director / subscriber.', 'promoter', promoterDocs)}
      {renderDocSection('Registered Office Proofs', 'Premises ownership proof, utility bills, and NOC certificates.', 'office', officeDocs)}
      {renderDocSection('Statutory Documents', 'e-MoA, e-AoA and SPICe+ declaration drafts.', 'statutory', statutoryDocs)}

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => goToStep(routePaths.incorporation.capitalDetails)}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default DocumentsKyc
