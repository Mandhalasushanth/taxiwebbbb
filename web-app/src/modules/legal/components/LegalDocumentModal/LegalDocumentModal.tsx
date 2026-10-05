import { Modal } from '@shared/components'
import { LEGAL_DOCUMENTS, type LegalDocumentId } from '../../content/legalContent'
import { LegalDocumentView } from '../LegalDocumentView/LegalDocumentView'

export interface LegalDocumentModalProps {
  documentId: LegalDocumentId | null
  onClose: () => void
}

/** Shows Terms / Privacy in a dialog so the user does not leave (and lose) the form they are filling. */
export const LegalDocumentModal = ({ documentId, onClose }: LegalDocumentModalProps) => {
  const document = documentId ? LEGAL_DOCUMENTS[documentId] : null
  return (
    <Modal isOpen={Boolean(document)} onClose={onClose} title={document?.title} size="lg">
      {document && <LegalDocumentView document={document} showTitle={false} />}
    </Modal>
  )
}

export default LegalDocumentModal
