import React from 'react'
import {
  ItrUnifiedApplicationStatusView,
} from '../../ItrFiling/FilingSubmitted/ItrFilingSubmittedView'
import type { OriginalReturnDetails, UploadedDocument, DocumentTypeId } from '@modules/itr/types/revisedItr.types'
import { useAuthStore } from '@store/index'
import './RevisionApplicationReceived.css'

export interface RevisionApplicationReceivedProps {
  applicationId: string
  selectedAy?: string
  returnDetails?: OriginalReturnDetails | null
  uploadedDocuments?: Partial<Record<DocumentTypeId, UploadedDocument>>
  onBack?: () => void
  onDownloadReceipt?: () => void
}

export const RevisionApplicationReceived: React.FC<RevisionApplicationReceivedProps> = ({
  applicationId,
  selectedAy,
  returnDetails,
  onBack,
}) => {
  const authUser = useAuthStore((s) => s.user)
  const customerName =
    returnDetails?.personalInfo?.fullName ||
    authUser?.fullName ||
    ''

  const serviceName = selectedAy
    ? `Revised ITR Filing (${selectedAy.startsWith('AY') ? selectedAy : `AY ${selectedAy}`})`
    : 'Revised ITR Filing'

  return (
    <ItrUnifiedApplicationStatusView
      title="Revised ITR Filing"
      serviceName={serviceName}
      applicationId={applicationId || 'REV-2026-873414'}
      customerName={customerName}
      appliedDate={new Date()}
      estCompletion="1-2 Business Days"
      statusBadge="Under Verification"
      onBack={onBack}
    />
  )
}

export default RevisionApplicationReceived
