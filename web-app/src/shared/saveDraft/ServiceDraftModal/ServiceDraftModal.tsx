import type { FC } from 'react'
import { DraftConfirmModal } from '../DraftConfirmModal'

interface DraftDialogHandlers {
  handleSaveAndExit: () => void
  handleDiscardAndExit: () => void
  handleKeepEditing: () => void
}

/**
 * The dialog controls returned by useServiceDraft, or by a flow hook that passes them on
 * (flows name the open flag either `isDraftModalOpen` or `isModalOpen`).
 */
export type DraftDialogControls = DraftDialogHandlers &
  ({ isDraftModalOpen: boolean } | { isModalOpen: boolean })

export interface ServiceDraftModalProps {
  draft: DraftDialogControls
  /** Service name shown in the dialog, e.g. "GST Registration" */
  serviceTitle: string
}

const isOpen = (draft: DraftDialogControls): boolean =>
  'isDraftModalOpen' in draft ? draft.isDraftModalOpen : draft.isModalOpen

/** Save as Draft & Exit / Discard & Exit / Keep Editing dialog wired to a service draft in one line */
export const ServiceDraftModal: FC<ServiceDraftModalProps> = ({ draft, serviceTitle }) => (
  <DraftConfirmModal
    isOpen={isOpen(draft)}
    serviceTitle={serviceTitle}
    onSaveAndExit={draft.handleSaveAndExit}
    onDiscardAndExit={draft.handleDiscardAndExit}
    onKeepEditing={draft.handleKeepEditing}
  />
)

export default ServiceDraftModal
