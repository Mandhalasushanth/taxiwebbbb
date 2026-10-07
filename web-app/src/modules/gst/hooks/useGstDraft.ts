import {
  useServiceDraft,
  readServiceDraft,
  hasFormChanged,
  type UseServiceDraftOptions,
  type ServiceDraftSnapshot,
} from '@shared/hooks'

/**
 * GST flows use the shared service draft (same behaviour as loans, ITR and Incorporation).
 * The 'gst' namespace keeps the existing auto-save key, so drafts saved before this change still resume.
 */
const GST_NAMESPACE = 'gst'

export type GstDraftSnapshot<T> = ServiceDraftSnapshot<T>
export type UseGstDraftOptions<T> = Omit<UseServiceDraftOptions<T>, 'storageNamespace'>

export const readGstDraft = <T>(serviceId: string): GstDraftSnapshot<T> | null =>
  readServiceDraft<T>(serviceId, GST_NAMESPACE)

export const hasGstFormChanged = hasFormChanged

export const useGstDraft = <T>(options: UseGstDraftOptions<T>) =>
  useServiceDraft<T>({ ...options, storageNamespace: GST_NAMESPACE })
