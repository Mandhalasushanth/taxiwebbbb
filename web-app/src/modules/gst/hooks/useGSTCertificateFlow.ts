import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { authStorage } from '@core/auth'
import { useAppStore } from '@store/index'
import { gstService } from '@modules/gst/services/gstService'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { gstFieldRules, collectGstErrors, GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import type { GstCertificateRecord } from '@modules/gst/types/gst.types'

export interface CertificateFields {
  gstin: string
  requestType: string
}

/** Certificate request: form values, validation, and submission */
export const useGSTCertificateFlow = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const user = useMemo(() => authStorage.getUser(), [])

  const [initialFields] = useState<CertificateFields>(() => ({
    gstin: gstProfileService.get().gstin || '',
    requestType: 'Download Existing Certificate (Form REG-06)',
  }))
  const [fields, setFields] = useState<CertificateFields>(initialFields)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRecord, setSubmittedRecord] = useState<GstCertificateRecord | null>(null)

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
  }
}
