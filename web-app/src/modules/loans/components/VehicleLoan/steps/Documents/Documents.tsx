import React, { useMemo } from 'react'
import { Car, FileText, Receipt } from 'lucide-react'
import { UploadDocument } from '@shared/components'
import { LoanDocumentGrid } from '@modules/loans/shared'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import type { VehicleLoanStepProps } from '@modules/loans/types/vehicleLoan.types'
import {
  getVehicleLoanDocumentSections,
  type VehicleLoanDocConfig,
} from '../../vehicleLoan.constants'
import './Documents.css'

/**
 * Step 3: Vehicle Loan Documents verification
 * Dynamically switches documents based on Step 2 vehicleCondition:
 * - If Used Vehicle: Shows "RC Copy" (Required)
 * - If New Vehicle: Shows "Vehicle Quotation / Proforma Invoice" (Required) + "Booking Receipt" (Optional)
 */
export const Documents: React.FC<VehicleLoanStepProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { requiredDocs, optionalDocs } = useMemo(
    () => getVehicleLoanDocumentSections(data.vehicleCondition),
    [data.vehicleCondition],
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
      console.error('Failed to process vehicle document upload:', err)
    }
  }

  const handleRemove = (id: string) => {
    try {
      const next = { ...uploadedDocs }
      delete next[id]
      onChange({ uploadedDocs: next })
    } catch (err) {
      console.error('Failed to remove vehicle document:', err)
    }
  }

  const renderDocIcon = (iconType: VehicleLoanDocConfig['iconType']) => {
    switch (iconType) {
      case 'car':
        return <Car size={22} aria-hidden="true" />
      case 'receipt':
        return <Receipt size={22} aria-hidden="true" />
      case 'file':
      default:
        return <FileText size={22} aria-hidden="true" />
    }
  }

  const renderDocCard = (doc: VehicleLoanDocConfig) => {
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
        uploadLabel="Upload Document →"
        className={hasError ? 'loan-doc-item--error' : ''}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    )
  }

  return (
    <div className="veh-step veh-docs" data-testid="veh-step-documents">

      {/* Required Documents Section */}
      <div className="veh-doc-section" data-testid="veh-required-docs-section">
        <h4 className="veh-doc-section__title">REQUIRED DOCUMENTS</h4>
        <LoanDocumentGrid>{requiredDocs.map(renderDocCard)}</LoanDocumentGrid>
      </div>

      {/* Optional Documents Section */}
      {optionalDocs.length > 0 && (
        <div className="veh-doc-section" data-testid="veh-optional-docs-section">
          <h4 className="veh-doc-section__title">OPTIONAL DOCUMENTS</h4>
          <LoanDocumentGrid>{optionalDocs.map(renderDocCard)}</LoanDocumentGrid>
        </div>
      )}
    </div>
  )
}

export default Documents
