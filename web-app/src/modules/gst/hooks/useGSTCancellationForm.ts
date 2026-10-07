import { useState, type FormEvent } from 'react'
import { gstFieldRules } from '@modules/gst/validation/gstFieldRules'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { generateGstReference } from '@modules/gst/utils/gstFormat'
import { routePaths } from '@core/config'
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES } from '@shared/saveDraft'

export interface CancellationFormData {
  gstin: string
  reason: string
  cancellationDate: string
  pendingLiabilities?: string
  lastGstr3bFiled?: string
  closingStockDetails: string
  file?: File | null
  finalReturnDeclaration: boolean
}

export interface UseGSTCancellationFormProps {
  onSubmit?: (data: CancellationFormData) => void
}

/** Fields kept in a draft (the proof file cannot be stored and is uploaded again) */
type CancellationDraft = Omit<CancellationFormData, 'file'>

const SERVICE_ID = 'gst-cancellation'

const buildInitialCancellation = (): CancellationDraft => ({
  gstin: gstProfileService.get().gstin,
  reason: '',
  cancellationDate: '',
  pendingLiabilities: '',
  lastGstr3bFiled: '',
  closingStockDetails: '',
  finalReturnDeclaration: false,
})

export const useGSTCancellationForm = ({ onSubmit }: UseGSTCancellationFormProps) => {
  const [initialValues] = useState(buildInitialCancellation)
  const [restored] = useState<CancellationDraft>(() => ({
    ...initialValues,
    ...readServiceDraft<CancellationDraft>(SERVICE_ID, DRAFT_NAMESPACES.gst)?.formData,
  }))
  const [gstin, setGstin] = useState(restored.gstin)
  const [reason, setReason] = useState(restored.reason)
  const [cancellationDate, setCancellationDate] = useState(restored.cancellationDate)
  const [pendingLiabilities, setPendingLiabilities] = useState(restored.pendingLiabilities || '')
  const [lastGstr3bFiled, setLastGstr3bFiled] = useState(restored.lastGstr3bFiled || '')
  const [closingStockDetails, setClosingStockDetails] = useState(restored.closingStockDetails)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [finalReturnDeclaration, setFinalReturnDeclaration] = useState(restored.finalReturnDeclaration)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')

  const draftData: CancellationDraft = {
    gstin,
    reason,
    cancellationDate,
    pendingLiabilities,
    lastGstr3bFiled,
    closingStockDetails,
    finalReturnDeclaration,
  }

  const draft = useServiceDraft<CancellationDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: 'GST Cancellation',
    totalSteps: 2,
    currentStep: isReviewing ? 2 : 1,
    stepLabel: isReviewing ? 'Review Application' : 'Cancellation Details',
    resumeRoute: routePaths.gst.cancellation,
    exitRoute: routePaths.gst.root,
    formData: draftData,
    hasEnteredData: isReviewing || Boolean(selectedFile) || hasFormChanged(draftData, initialValues),
    isComplete: isSubmitted,
  })

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    clearError('file')
  }

  const handleReviewProceed = (e: FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    const gstinError = gstFieldRules.gstin(gstin)
    if (gstinError) newErrors.gstin = gstinError

    if (!reason) newErrors.reason = 'Please select reason for cancellation.'
    if (!cancellationDate) newErrors.cancellationDate = 'Please select cancellation date.'
    const lastFiledError = gstFieldRules.text('Last GSTR-3B filed ARN / period', 6, 60)(lastGstr3bFiled)
    if (lastFiledError) newErrors.lastGstr3bFiled = lastFiledError
    const closingStockError = gstFieldRules.text('Closing stock details', 5, 500)(closingStockDetails)
    if (closingStockError) newErrors.closingStockDetails = closingStockError
    if (!finalReturnDeclaration) {
      newErrors.finalReturnDeclaration = 'You must confirm the final return declaration before proceeding.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsReviewing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinalSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setReferenceNumber(generateGstReference('GST-CAN'))
      setIsSubmitted(true)
      draft.clearDraft()
      onSubmit?.({
        gstin: gstin.trim().toUpperCase(),
        reason,
        cancellationDate,
        pendingLiabilities: pendingLiabilities.trim(),
        lastGstr3bFiled: lastGstr3bFiled.trim(),
        closingStockDetails: closingStockDetails.trim(),
        file: selectedFile,
        finalReturnDeclaration,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 600)
  }

  return {
    gstin,
    setGstin,
    reason,
    setReason,
    cancellationDate,
    setCancellationDate,
    pendingLiabilities,
    setPendingLiabilities,
    lastGstr3bFiled,
    setLastGstr3bFiled,
    closingStockDetails,
    setClosingStockDetails,
    selectedFile,
    setSelectedFile,
    finalReturnDeclaration,
    setFinalReturnDeclaration,
    errors,
    clearError,
    handleFileChange,
    handleReviewProceed,
    handleFinalSubmit,
    isReviewing,
    setIsReviewing,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    referenceNumber,
    isModalOpen: draft.isDraftModalOpen,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
  }
}
