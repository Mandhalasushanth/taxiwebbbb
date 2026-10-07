/**
 * Save draft — everything in one place, used by GST, ITR, Incorporation and Loans:
 * - useServiceDraft: auto-save, Save / Discard / Keep Editing dialog, browser Back prompt, dashboard resume
 * - ServiceDraftModal: the dialog wired to a draft in one line
 * - SaveDraftButton: "Save Draft & Exit" for forms without the StepActionBar
 */
export { useServiceDraft, readServiceDraft, hasFormChanged, deleteServiceDraft } from './useServiceDraft'
export type { UseServiceDraftOptions, ServiceDraftSnapshot, ServiceDraft } from './useServiceDraft'
export { useDraftBlocker } from './useDraftBlocker'
export type { UseDraftBlockerOptions } from './useDraftBlocker'
export { DRAFT_NAMESPACES } from './draftNamespaces'
export type { DraftNamespace } from './draftNamespaces'
export { SAVE_DRAFT_LABEL } from './draftLabels'
export { DraftConfirmModal } from './DraftConfirmModal'
export type { DraftConfirmModalProps } from './DraftConfirmModal'
export { ServiceDraftModal } from './ServiceDraftModal/ServiceDraftModal'
export type { ServiceDraftModalProps, DraftDialogControls } from './ServiceDraftModal/ServiceDraftModal'
export { SaveDraftButton } from './SaveDraftButton/SaveDraftButton'
export type { SaveDraftButtonProps } from './SaveDraftButton/SaveDraftButton'
