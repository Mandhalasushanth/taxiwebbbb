import { useState, type FormEvent } from 'react'
import { routePaths } from '@core/config'
import { useAppStore } from '@store/index'
import { gstFieldRules, collectGstErrors, GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { generateGstReference } from '@modules/gst/utils/gstFormat'
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES } from '@shared/saveDraft'

export type ComplianceRequestOption = 'Reconciliation Support' | 'Notice Response'

/** Typed fields of the compliance request (uploaded files are kept separately and cannot be drafted) */
export interface ComplianceFields {
  gstin: string
  financialYear: string
  requestType: ComplianceRequestOption | ''
  gstr2bRef: string
  notes: string
  noticeNumber: string
  issueDate: string
  dueDate: string
  additionalInfo: string
}

export type ComplianceErrors = Record<string, string | undefined>

const SERVICE_ID = 'gst-compliance'
const SERVICE_TITLE = 'GST Compliance'

const buildInitialFields = (): ComplianceFields => ({
  gstin: gstProfileService.get().gstin,
  financialYear: '',
  requestType: '',
  gstr2bRef: '',
  notes: '',
  noticeNumber: '',
  issueDate: '',
  dueDate: '',
  additionalInfo: '',
})

const validateCompliance = (
  fields: ComplianceFields,
  files: { purchaseFile: File | null; salesFile: File | null; noticeFile: File | null }
): Record<string, string> => {
  const isRecon = fields.requestType === 'Reconciliation Support'
  const isNotice = fields.requestType === 'Notice Response'
  return collectGstErrors({
    gstin: gstFieldRules.gstin(fields.gstin),
    financialYear: fields.financialYear ? undefined : 'Financial Year is required',
    requestType: fields.requestType ? undefined : 'Request Type is required',
    purchaseFile: isRecon && !files.purchaseFile ? 'Purchase Register file is required' : undefined,
    salesFile: isRecon && !files.salesFile ? 'Sales Register file is required' : undefined,
    gstr2bRef: isRecon ? gstFieldRules.optional(gstFieldRules.reference('GSTR-2B reference'))(fields.gstr2bRef) : undefined,
    noticeNumber: isNotice ? gstFieldRules.reference('Notice number')(fields.noticeNumber) : undefined,
    issueDate: isNotice ? gstFieldRules.pastDate('Notice issue date')(fields.issueDate) : undefined,
    dueDate: isNotice ? gstFieldRules.futureDate('Reply due date')(fields.dueDate) : undefined,
    noticeFile: isNotice && !files.noticeFile ? 'Notice copy upload is required' : undefined,
  })
}

export const useGSTComplianceState = () => {
  const pushToast = useAppStore((state) => state.pushToast)

  const [initialFields] = useState(buildInitialFields)
  const [fields, setFields] = useState<ComplianceFields>(() => ({
    ...initialFields,
    ...readServiceDraft<ComplianceFields>(SERVICE_ID, DRAFT_NAMESPACES.gst)?.formData,
  }))
  const [purchaseFile, setPurchaseFile] = useState<File | null>(null)
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [noticeFile, setNoticeFile] = useState<File | null>(null)

  const [previewDoc, setPreviewDoc] = useState<{ file: File; title: string } | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [errors, setErrors] = useState<ComplianceErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState('')

  const hasEnteredData =
    hasFormChanged(fields, initialFields) || Boolean(purchaseFile || salesFile || noticeFile)

  const draft = useServiceDraft<ComplianceFields>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: SERVICE_TITLE,
    totalSteps: 1,
    currentStep: 1,
    stepLabel: fields.requestType || 'Business & Filing Details',
    resumeRoute: routePaths.gst.compliance,
    exitRoute: routePaths.gst.root,
    formData: fields,
    hasEnteredData,
    isComplete: isSubmitted,
  })

  /** Updates one field and clears its error */
  const setField = <K extends keyof ComplianceFields>(field: K, value: ComplianceFields[K]) => {
    setFields((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const setFileWithClear = (setter: (file: File | null) => void, field: string) => (file: File | null) => {
    setter(file)
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const hasErrors = Object.values(errors).some(Boolean)

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const newErrors = validateCompliance(fields, { purchaseFile, salesFile, noticeFile })
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false)
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setApplicationId(generateGstReference('GSTC'))
      setIsSubmitted(true)
      draft.clearDraft()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      pushToast(`GST Compliance request (${fields.requestType}) submitted successfully!`, 'success')
    }, 600)
  }

  const handleReset = () => {
    setFields(initialFields)
    setPurchaseFile(null)
    setSalesFile(null)
    setNoticeFile(null)
    setErrors({})
    setIsSubmitted(false)
  }

  return {
    fields,
    setField,
    purchaseFile,
    setPurchaseFile: setFileWithClear(setPurchaseFile, 'purchaseFile'),
    salesFile,
    setSalesFile: setFileWithClear(setSalesFile, 'salesFile'),
    noticeFile,
    setNoticeFile: setFileWithClear(setNoticeFile, 'noticeFile'),
    previewDoc,
    setPreviewDoc,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    errors,
    setErrors,
    stepError: hasErrors ? GST_STEP_ERROR : null,
    isSubmitting,
    isSubmitted,
    applicationId,
    handleSubmit,
    handleConfirmSubmit,
    handleReset,
    isDraftModalOpen: draft.isDraftModalOpen,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
  }
}
