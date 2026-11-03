import { useState, useEffect } from 'react'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useAppStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useServiceDraft, readServiceDraft, DRAFT_NAMESPACES } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import { getAmendmentConfig } from '@modules/gst/components/GSTAmendment/amendmentConfigs'
import { gstService } from '@modules/gst/services/gstService'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import { useGSTReviewEditNavigation } from '@modules/gst/shared/useGSTSectionFocus'
import type { GstAmendmentPayload, GstAmendmentRecord, GstAmendmentFieldKey } from '@modules/gst/types/gst.types'
import type { AmendmentCardItem, AddressDetailsItem } from '../components/GSTAmendment/index'

export interface GSTAmendmentFormData {
  selectedOptionId?: string
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

  // Always start on the selection page (home page where all core and non-core fields are shown)
  const [selectedOption, setSelectedOption] = useState<AmendmentCardItem | null>(null)
  const [formData, setFormData] = useState<GSTAmendmentFormData | null>(null)
  const [isReviewing, setIsReviewing] = useState<boolean>(false)

  // Re-hydrate any file that was loading asynchronously from IndexedDB
  useEffect(() => {
    let isMounted = true
    const hydrateFile = async () => {
      if (formData && !formData.file) {
        const file = await gstUploadedFiles.getAsync('amendment_file')
        if (file && isMounted) {
          setFormData((prev) => (prev ? { ...prev, file, fileName: prev.fileName || file.name } : prev))
        }
      }
    }
    hydrateFile()
    return () => {
      isMounted = false
    }
  }, [formData])

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
    onDiscard: () => {
      gstUploadedFiles.remove('amendment_file')
      setSelectedOption(null)
      setFormData(null)
      setIsReviewing(false)
    },
  })

  const handleDetailFormSubmit = (data: GSTAmendmentFormData) => {
    if (data.file) {
      gstUploadedFiles.set('amendment_file', data.file)
    }
    setFormData((prev) => ({
      ...prev,
      ...data,
      selectedOptionId: selectedOption?.id,
      fileName: data.fileName || data.file?.name || prev?.fileName,
      fileSizeText:
        data.fileSizeText ||
        (data.file ? formatGstFileSize(data.file.size) : prev?.fileSizeText),
    }))
    setIsReviewing(true)
    reviewEdit.cancelEdit()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { editSection, startSectionEdit } = useGSTReviewEditNavigation()

  const handleEdit = (section: string = 'gst-amend-details') => {
    startSectionEdit(section, () => {
      reviewEdit.startEdit(() => {
        setIsReviewing(false)
      })
    })
  }

  const handleReviewBack = () => {
    reviewEdit.cancelEdit()
    setIsReviewing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormBack = () => {
    reviewEdit.cancelEdit()
    setSelectedOption(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectOption = (option: AmendmentCardItem) => {
    if (formData?.selectedOptionId === option.id) {
      // Re-selecting the option worked on in the active session: preserve data
    } else if (restored?.selectedOptionId === option.id && restored.savedFormData) {
      const file = gstUploadedFiles.get('amendment_file') || null
      setFormData({
        selectedOptionId: option.id,
        newValue: restored.savedFormData.newValue || '',
        file,
        fileName: restored.savedFormData.fileName || file?.name,
        fileSizeText: restored.savedFormData.fileSizeText,
        addressDetails: restored.savedFormData.addressDetails,
        bankDetails: restored.savedFormData.bankDetails,
        signatoryDetails: restored.savedFormData.signatoryDetails,
        contactDetails: restored.savedFormData.contactDetails,
      })
      setIsReviewing(Boolean(restored.isReviewing))
    } else {
      // Any other service: start fresh
      setFormData(null)
      setIsReviewing(false)
    }
    setSelectedOption(option)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormChange = (data: Partial<GSTAmendmentFormData>) => {
    if (data.file) {
      gstUploadedFiles.set('amendment_file', data.file)
      gstUploadedFiles.set('d1', data.file)
      gstUploadedFiles.set('d2', data.file)
      gstUploadedFiles.set('Supporting Proof Document', data.file)
      gstUploadedFiles.set('Identity & Authorization Proof', data.file)
      if (data.file.name) gstUploadedFiles.set(data.file.name, data.file)
    }
    setFormData((prev) => ({
      ...prev,
      ...data,
      selectedOptionId: selectedOption?.id,
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
      if (data.file) {
        gstUploadedFiles.set('amendment_file', data.file)
        gstUploadedFiles.set('d1', data.file)
        gstUploadedFiles.set('d2', data.file)
        gstUploadedFiles.set('Supporting Proof Document', data.file)
        gstUploadedFiles.set('Identity & Authorization Proof', data.file)
        if (data.file.name) gstUploadedFiles.set(data.file.name, data.file)
      }
      setFormData((prev) => ({
        ...prev,
        ...data,
        selectedOptionId: selectedOption?.id,
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

      // Ensure uploaded amendment file is preserved for Track Application
      const amendFile = formData.file || gstUploadedFiles.get('amendment_file')
      if (amendFile) {
        gstUploadedFiles.set('amendment_file', amendFile)
        gstUploadedFiles.set('d1', amendFile)
        gstUploadedFiles.set('d2', amendFile)
        gstUploadedFiles.set('Supporting Proof Document', amendFile)
        gstUploadedFiles.set('Identity & Authorization Proof', amendFile)
        if (amendFile.name) gstUploadedFiles.set(amendFile.name, amendFile)
        gstUploadedFiles.set(`${record.reference}_file`, amendFile)
      }

      draft.clearDraft()

      try {
        const existing = userStorage.getUserApplications()
        const alreadyPresent = existing.some((a) => a.code === record.reference)
        const fileName = amendFile?.name || formData.fileName || 'supporting_document.pdf'
        const docs = [
          {
            id: 'd1',
            name: 'Supporting Proof Document',
            fileName,
            meta: amendFile ? `Statutory & Compliance · ${(amendFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Statutory & Compliance · IMAGE / PDF · 6.55 MB',
            date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
            file: amendFile,
            status: 'uploaded' as const,
          },
          {
            id: 'd2',
            name: 'Identity & Authorization Proof',
            fileName,
            meta: amendFile ? `Statutory & Compliance · ${(amendFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Statutory & Compliance · IMAGE / PDF · 6.55 MB',
            date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
            file: amendFile,
            status: 'uploaded' as const,
          },
        ]
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
            documents: docs,
            formData: {
              amendmentData: formData,
              config,
            },
            paymentStatus: 'Awaiting Verification' as any,
          } as any)
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
    editSection,
    handleSelectOption,
    /** Leaves edit mode and shows the review again (Back on an edit form) */
    returnToReview: reviewEdit.finishEdit,
    cancelEdit: reviewEdit.cancelEdit,
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
    handleFormBack,
    handleFormChange,
    handleFormSaveDraft,
    handleFinalSubmit,
    handleBackToDashboard,
  }
}
