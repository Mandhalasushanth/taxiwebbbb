import { useState } from 'react'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAppStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useServiceDraft, readServiceDraft, DRAFT_NAMESPACES } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import { AMENDMENT_OPTIONS } from '@modules/gst/constants/gstAmendmentOptions'
import { getAmendmentConfig } from '@modules/gst/components/GSTAmendment/amendmentConfigs'
import { gstService } from '@modules/gst/services/gstService'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import type { GstAmendmentPayload, GstAmendmentRecord, GstAmendmentFieldKey } from '@modules/gst/types/gst.types'
import type { AmendmentCardItem, AddressDetailsItem } from '../components/GSTAmendment/index'

export interface GSTAmendmentFormData {
  newValue: string
  file: File | null
  fileName?: string
  fileSizeText?: string
  addressDetails?: AddressDetailsItem
  bankDetails?: Record<string, string>
  signatoryDetails?: Record<string, string>
  contactDetails?: Record<string, string>
}

/** Draft keeps the GSTIN, chosen amendment, form values, and review state */
interface AmendmentDraft {
  gstin: string
  selectedOptionId?: string
  savedFormData?: {
    newValue: string
    fileName?: string
    fileSizeText?: string
    addressDetails?: AddressDetailsItem
    bankDetails?: Record<string, string>
    signatoryDetails?: Record<string, string>
    contactDetails?: Record<string, string>
  } | null
  isReviewing?: boolean
}

const SERVICE_ID = 'gst-amendment'

export const useGSTAmendmentFlow = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)

  const [restored] = useState(() => readServiceDraft<AmendmentDraft>(SERVICE_ID, DRAFT_NAMESPACES.gst)?.formData)
  const [gstin, setGstin] = useState(restored?.gstin || '')
  const [selectedOption, setSelectedOption] = useState<AmendmentCardItem | null>(
    () => AMENDMENT_OPTIONS.find((option) => option.id === restored?.selectedOptionId) || null
  )
  const [formData, setFormData] = useState<GSTAmendmentFormData | null>(() => {
    if (restored?.savedFormData) {
      return {
        newValue: restored.savedFormData.newValue || '',
        file: null,
        fileName: restored.savedFormData.fileName,
        fileSizeText: restored.savedFormData.fileSizeText,
        addressDetails: restored.savedFormData.addressDetails,
        bankDetails: restored.savedFormData.bankDetails,
        signatoryDetails: restored.savedFormData.signatoryDetails,
        contactDetails: restored.savedFormData.contactDetails,
      }
    }
    return null
  })
  const [isReviewing, setIsReviewing] = useState<boolean>(() => Boolean(restored?.isReviewing && restored?.savedFormData))
  // "Edit" from the review: shared behaviour (Update & Review / Back return to the review)
  const reviewEdit = useReviewEdit(() => {
    setIsReviewing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  const { isEditMode } = reviewEdit
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRecord, setSubmittedRecord] = useState<GstAmendmentRecord | null>(null)

  const serializableFormData = formData
    ? {
        newValue: formData.newValue || '',
        fileName: formData.fileName || formData.file?.name,
        fileSizeText:
          formData.fileSizeText ||
          (formData.file ? formatGstFileSize(formData.file.size) : undefined),
        addressDetails: formData.addressDetails,
        bankDetails: formData.bankDetails,
        signatoryDetails: formData.signatoryDetails,
        contactDetails: formData.contactDetails,
      }
    : null

  const draft = useServiceDraft<AmendmentDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: 'GST Amendment',
    totalSteps: 3,
    currentStep: isReviewing ? 3 : selectedOption ? 2 : 1,
    stepLabel: selectedOption ? selectedOption.title : 'Amendment Details',
    resumeRoute: routePaths.gst.amendment,
    exitRoute: routePaths.gst.root,
    formData: {
      gstin,
      selectedOptionId: selectedOption?.id,
      savedFormData: serializableFormData,
      isReviewing,
    },
    hasEnteredData: Boolean(
      gstin.trim() ||
      selectedOption ||
      (formData && (formData.newValue || formData.fileName || formData.addressDetails || formData.bankDetails || formData.signatoryDetails || formData.contactDetails))
    ),
    isComplete: Boolean(submittedRecord),
  })

  const handleDetailFormSubmit = (data: GSTAmendmentFormData) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      fileName: data.fileName || data.file?.name || prev?.fileName,
      fileSizeText:
        data.fileSizeText ||
        (data.file ? formatGstFileSize(data.file.size) : prev?.fileSizeText),
    }))
    setIsReviewing(true)
    reviewEdit.cancelEdit()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = () => {
    reviewEdit.startEdit(() => {
      setIsReviewing(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const handleReviewBack = handleEdit

  const handleFormChange = (data: Partial<GSTAmendmentFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      newValue: data.newValue ?? prev?.newValue ?? '',
      file: data.file !== undefined ? data.file : (prev?.file ?? null),
      fileName: data.fileName || data.file?.name || prev?.fileName,
      fileSizeText:
        data.fileSizeText ||
        (data.file ? formatGstFileSize(data.file.size) : prev?.fileSizeText),
    }))
  }

  const handleFormSaveDraft = (data?: Partial<GSTAmendmentFormData>) => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        newValue: data.newValue ?? prev?.newValue ?? '',
        file: data.file !== undefined ? data.file : (prev?.file ?? null),
        fileName: data.fileName || data.file?.name || prev?.fileName,
        fileSizeText:
          data.fileSizeText ||
          (data.file ? formatGstFileSize(data.file.size) : prev?.fileSizeText),
      }))
    }
    draft.openDraftModal()
  }

  const handleFinalSubmit = async () => {
    if (!selectedOption || !formData) return

    const config = getAmendmentConfig(selectedOption.id, selectedOption.title)

    const payload: GstAmendmentPayload = {
      gstin: gstin || gstProfileService.get().gstin,
      fieldBeingChanged: config.title,
      fieldKey: (selectedOption.id as GstAmendmentFieldKey) || 'business_name',
      oldValue: config.currentValue,
      newValue: formData.newValue,
      supportingDocumentName: formData.file?.name || formData.fileName,
      supportingDocumentFile: formData.file || undefined,
    }

    try {
      setIsSubmitting(true)
      const record = await gstService.submitAmendment(payload)
      setSubmittedRecord(record)
      draft.clearDraft()

      try {
        const existing = userStorage.getUserApplications()
        const alreadyPresent = existing.some((a) => a.code === record.reference)
        if (!alreadyPresent) {
          userStorage.saveUserApplication({
            id: `app-amend-${Date.now()}`,
            code: record.reference,
            title: 'GST Amendment',
            meta: `${config.title} · India`,
            statusLabel: 'Submitted',
            statusTone: 'info',
            progress: 25,
            icon: '📝',
            to: routePaths.applicationTrack(record.reference),
          })
        }
      } catch {
        // storage fallback
      }

      pushToast(
        `Amendment request for ${config.title} submitted successfully (${record.reference})`,
        'success'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      pushToast('Failed to submit amendment application. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate(routePaths.dashboard)
  }

  return {
    navigate,
    gstin,
    setGstin,
    selectedOption,
    setSelectedOption,
    formData,
    setFormData,
    isReviewing,
    setIsReviewing,
    isEditMode,
    /** Leaves edit mode and shows the review again (Back on an edit form) */
    returnToReview: reviewEdit.finishEdit,
    isSubmitting,
    submittedRecord,
    isModalOpen: draft.isDraftModalOpen,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
    handleDetailFormSubmit,
    handleEdit,
    handleReviewBack,
    handleFormChange,
    handleFormSaveDraft,
    handleFinalSubmit,
    handleBackToDashboard,
  }
}
