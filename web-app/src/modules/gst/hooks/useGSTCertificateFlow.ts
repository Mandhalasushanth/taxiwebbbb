import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { authStorage } from '@core/auth'
import { useAppStore } from '@store/index'
import { gstService } from '@modules/gst/services/gstService'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { gstFieldRules, collectGstErrors, GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES } from '@shared/saveDraft'
import type { GstCertificateRecord } from '@modules/gst/types/gst.types'

export interface CertificateFields {
  gstin: string
  requestType: string
}

const SERVICE_ID = 'gst-certificate'

/** Certificate request: form values, validation, draft and submission */
export const useGSTCertificateFlow = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const user = useMemo(() => authStorage.getUser(), [])

  const [initialFields] = useState<CertificateFields>(() => ({ gstin: gstProfileService.get().gstin, requestType: '' }))
  const [fields, setFields] = useState<CertificateFields>(() => ({
    ...initialFields,
    ...readServiceDraft<CertificateFields>(SERVICE_ID, DRAFT_NAMESPACES.gst)?.formData,
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRecord, setSubmittedRecord] = useState<GstCertificateRecord | null>(null)

  const draft = useServiceDraft<CertificateFields>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: 'GST Certificate',
    totalSteps: 1,
    currentStep: 1,
    stepLabel: fields.requestType || 'Certificate Request',
    resumeRoute: routePaths.gst.certificate,
    exitRoute: routePaths.gst.root,
    formData: fields,
    hasEnteredData: hasFormChanged(fields, initialFields),
    isComplete: Boolean(submittedRecord),
  })

  const setField = <K extends keyof CertificateFields>(field: K, value: CertificateFields[K]) => {
    setFields((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev
      return rest
    })
  }

  const contactText = user?.mobile
    ? `+91 ${user.mobile}${user.email ? ` · ${user.email}` : ''}`
    : 'Registered Signatory Authorization'

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    const newErrors = collectGstErrors({
      gstin: gstFieldRules.gstin(fields.gstin),
      requestType: fields.requestType ? undefined : 'Please select a request type',
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const record = await gstService.submitCertificateRequest({
        gstin: fields.gstin.trim(),
        registeredContact: contactText,
        requestType: fields.requestType,
      })
      setSubmittedRecord(record)
      draft.clearDraft()
      pushToast(`GST Certificate request submitted successfully (${record.reference})`, 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      pushToast('Could not submit the certificate request. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setSubmittedRecord(null)
    setFields(initialFields)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    user,
    fields,
    setField,
    errors,
    stepError: Object.keys(errors).length > 0 ? GST_STEP_ERROR : null,
    isSubmitting,
    submittedRecord,
    handleSubmit,
    handleBackToForm,
    handleAllForms: () => navigate(routePaths.gst.root),
    isDraftModalOpen: draft.isDraftModalOpen,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
  }
}
