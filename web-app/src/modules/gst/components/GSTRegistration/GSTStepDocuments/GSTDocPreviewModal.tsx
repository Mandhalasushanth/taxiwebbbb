import { useMemo, type FC } from 'react'
import type { DocPreviewState } from '@modules/gst/types/gstDocuments.types'

export interface GSTDocPreviewModalProps {
  previewDoc: DocPreviewState | null
  onClose: () => void
}

export const GSTDocPreviewModal: FC<GSTDocPreviewModalProps> = ({ previewDoc, onClose }) => {
  const file = previewDoc?.file
  const fileUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return null
  }, [file])

  if (!previewDoc) return null

  const isPdf =
    file?.type === 'application/pdf' ||
    Boolean(previewDoc.fileName?.toLowerCase().endsWith('.pdf'))

  return (
    <div className="gst-preview-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gst-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gst-preview-modal-header">
          <h3>{previewDoc.title || previewDoc.fileName}</h3>
          <button type="button" onClick={onClose} aria-label="Close Preview">✕</button>
        </div>
        <div className="gst-preview-modal-body">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title={`${previewDoc.title || ''}${previewDoc.fileName ? ` – ${previewDoc.fileName}` : ''}`}
                style={{ width: '100%', height: '500px', border: 'none' }}
              />
            ) : (
              <img
                src={fileUrl}
                alt={previewDoc.title || previewDoc.fileName || 'Preview'}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            )
          ) : (
            <p>Preview not available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GSTDocPreviewModal
