import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import { validateGstBusinessForm } from '@modules/gst/validation/gstStepBusiness.validator'

/** Wizard steps: 1 Business · 2 Documents · 3 Review · 4 Payment · 5 Status (after verified payment) */
export const GST_REGISTRATION_STEPS = { business: 1, documents: 2, review: 3, payment: 4, status: 5 } as const

/** Why the Documents step is incomplete, or null when every document is ready */
export const getDocumentsStepError = (documents: DocumentItem[]): string | null => {
  const addressDoc = documents.find((d) => d.id === 'address_proof')
  if (addressDoc && !addressDoc.addressProofType) {
    return 'Please choose address type for Principal Place Address Proof.'
  }
  const pendingDocs = documents.filter((d) => !d.isUploaded)
  return pendingDocs.length > 0
    ? `Please upload all required documents (${pendingDocs.map((d) => d.title).join(', ')}) before proceeding.`
    : null
}

export interface RegistrationProgress {
  businessData: GstBusinessFormData
  documents: DocumentItem[]
  /** A payment verified by the payments service exists for this application */
  isPaid: boolean
}

/**
 * Highest step the user may open right now (the first step whose prerequisites are not met).
 * Direct URLs such as ?step=payment or ?step=status are clamped to this.
 */
export const getMaxAllowedStep = ({ businessData, documents, isPaid }: RegistrationProgress): number => {
  if (Object.keys(validateGstBusinessForm(businessData)).length > 0) return GST_REGISTRATION_STEPS.business
  if (getDocumentsStepError(documents)) return GST_REGISTRATION_STEPS.documents
  return isPaid ? GST_REGISTRATION_STEPS.status : GST_REGISTRATION_STEPS.payment
}

/** Requested step, or the first pending step when its prerequisites are missing */
export const clampRegistrationStep = (requested: number, progress: RegistrationProgress): number =>
  Math.max(GST_REGISTRATION_STEPS.business, Math.min(requested, getMaxAllowedStep(progress)))
