/**
 * Unified draft handling:
 * - useServiceDraft: auto-save, Save / Discard / Keep Editing dialog, browser Back prompt, dashboard resume
 * - on Review: custom "Do you want to save your draft?" confirmation, Stay on Page, module dashboard redirection
 * - ServiceDraftModal: Drop-in Save/Discard/Keep Editing modal
 * - DraftConfirmModal: The underlying dialog component
 * - SaveDraftButton: Header / action bar button
 */
export { useServiceDraft, readServiceDraft, hasFormChanged, deleteServiceDraft } from './useServiceDraft'
export type { UseServiceDraftOptions, ServiceDraftSnapshot, ServiceDraft } from './useServiceDraft'
export { DraftConfirmModal } from './DraftConfirmModal'
export type { DraftConfirmModalProps } from './DraftConfirmModal'
export { ServiceDraftModal } from './ServiceDraftModal/ServiceDraftModal'
export type { ServiceDraftModalProps, DraftDialogControls } from './ServiceDraftModal/ServiceDraftModal'
export { SaveDraftButton } from './SaveDraftButton/SaveDraftButton'
export { SAVE_DRAFT_LABEL } from './draftLabels'
export { DRAFT_NAMESPACES } from './draftNamespaces'
export { useDraftBlocker } from './useDraftBlocker'
export type { UseDraftBlockerOptions } from './useDraftBlocker'
export { getModuleDashboardRoute } from '@shared/edit'
