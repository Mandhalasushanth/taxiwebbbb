import { useState, type FC, type ReactNode } from 'react'
import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import { acceptAttributeFor } from '@shared/utils'
import {
  ADDRESS_PROOF_OPTIONS,
  getGstDocUploadHint,
  getGstDocUploadRule,
} from '@modules/gst/utils/gstDocuments.constants'
import {
  PanCardIcon,
  AadhaarCardIcon,
  BusinessRegIcon,
  AddressProofIcon,
  BankProofIcon,
  PhotoIcon,
} from '@modules/gst/shared/GSTDocIcons/GSTDocIcons'
import { UploadDocument } from '@shared/components'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import './GSTDocCard.css'

interface GSTDocCardProps {
  doc: DocumentItem
  isReplacing: boolean
  onTriggerCamera?: (id: string) => void
  onTriggerUpload: (id: string) => void
  onDirectUpload?: (id: string, file: File) => void
  onStartReplace: (id: string) => void
  onCancelReplace: () => void
  onDelete: (id: string) => void
  onView: (doc: DocumentItem) => void
  onAddressProofChange?: (value: string) => void
  /** Why the last selected file was rejected (type / size / content) */
  uploadError?: string
}

const getDocIcon = (id: string): ReactNode => {
  switch (id) {
    case 'pan':
      return <PanCardIcon />
    case 'aadhaar':
      return <AadhaarCardIcon />
    case 'business_reg':
      return <BusinessRegIcon />
    case 'address_proof':
      return <AddressProofIcon />
    case 'bank_proof':
      return <BankProofIcon />
    case 'photo':
      return <PhotoIcon />
    default:
      return <BusinessRegIcon />
  }
}

export const GSTDocCard: FC<GSTDocCardProps> = ({
  doc,
  isReplacing: _isReplacing,
  onTriggerUpload,
  onDirectUpload,
  onStartReplace,
  onDelete,
  onView,
  onAddressProofChange,
  uploadError,
}) => {
  const uploadErrorId = `${doc.id}-upload-error`
  const [addressWarning, setAddressWarning] = useState(false)

  const handleUploadClick = () => {
    if (doc.id === 'address_proof' && !doc.addressProofType) {
      setAddressWarning(true)
      return false
    }
    setAddressWarning(false)
    return true
  }

  const handleUploadFile = (id: string, file: File) => {
    if (doc.id === 'address_proof' && !doc.addressProofType) {
      setAddressWarning(true)
      return
    }
    setAddressWarning(false)
    if (onDirectUpload) {
      onDirectUpload(id, file)
    } else {
      onTriggerUpload(id)
    }
  }

  const handleReplace = () => {
    onStartReplace(doc.id)
  }

  return (
    <UploadDocument
      id={doc.id}
      title={doc.title}
      subtitle={`${doc.subtitle} · ${getGstDocUploadHint(doc.id)}`}
      isRequired={true}
      icon={getDocIcon(doc.id)}
      iconBg="#eff6ff"
      iconColor="#2563eb"
      isUploaded={doc.isUploaded}
      fileName={doc.fileName}
      file={doc.file || gstUploadedFiles.get(doc.id)}
      accept={acceptAttributeFor(getGstDocUploadRule(doc.id))}
      onUploadClick={handleUploadClick}
      onUpload={handleUploadFile}
      onReplace={handleReplace}
      onRemove={() => onDelete(doc.id)}
      onView={() => onView(doc)}
    >
      {uploadError && (
        <p id={uploadErrorId} className="gst-doc-upload-error" role="alert">
          {uploadError}
        </p>
      )}
      {doc.id === 'address_proof' && (
        <div className="gst-doc-address-wrapper">
          <div
            className={`gst-doc-dropdown-wrapper ${
              addressWarning && !doc.addressProofType
                ? 'gst-doc-dropdown-wrapper--warning'
                : ''
            }`}
          >
            <select
              className={`gst-doc-select ${
                addressWarning && !doc.addressProofType ? 'gst-doc-select--warning' : ''
              }`}
              value={doc.addressProofType || ''}
              onChange={(e) => {
                if (e.target.value) setAddressWarning(false)
                onAddressProofChange?.(e.target.value)
              }}
              aria-label="Select Address Proof Type"
            >
              <option value="">Select Address Proof</option>
              {ADDRESS_PROOF_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {addressWarning && !doc.addressProofType && (
            <p className="gst-doc-address-warning-text" role="alert">
              * Choose address type
            </p>
          )}
        </div>
      )}
    </UploadDocument>
  )
}
