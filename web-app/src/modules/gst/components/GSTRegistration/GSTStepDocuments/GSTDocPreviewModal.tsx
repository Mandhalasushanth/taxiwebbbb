import { useEffect, useState, type FC } from 'react'
import { Modal } from '@shared/components'
import { formatFileSize } from '@shared/utils'
import type { DocPreviewState } from '@modules/gst/types/gstDocuments.types'
import { DocPlaceholderIcon } from '@modules/gst/shared/GSTDocIcons/GSTDocIcons'

interface GSTDocPreviewModalProps {
  previewDoc: DocPreviewState | null
  onClose: () => void
}

type PreviewKind = 'image' | 'pdf' | 'unsupported'

const previewKindOf = (file: File): PreviewKind => {
  if (file.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(file.name)) return 'image'
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf'
  return 'unsupported'
}

/**
 * Object URL for the file, revoked when the file changes or the modal closes, so the
 * document never leaves the browser and no memory is leaked.
 */
const useObjectUrl = (file?: File): string | null => {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return undefined
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url
}

const PreviewUnavailable = ({ message }: { message: string }) => (
  <div className="gst-doc-modal__preview-placeholder">
    <DocPlaceholderIcon width={48} height={48} />
    <p className="gst-doc-modal__preview-text">Preview not available</p>
    <span className="gst-doc-modal__preview-sub">{message}</span>
  </div>
)

export const GSTDocPreviewModal: FC<GSTDocPreviewModalProps> = ({ previewDoc, onClose }) => {
  const file = previewDoc?.file
  const objectUrl = useObjectUrl(file)

  if (!previewDoc) return null

  const renderPreview = () => {
    if (!file) {
      return <PreviewUnavailable message="This file was added in an earlier session. Replace it to preview the document again." />
    }
    if (!objectUrl) return null
    const kind = previewKindOf(file)
    if (kind === 'image') {
      return (
        <div className="gst-doc-modal__viewer">
          <img className="gst-doc-modal__image" src={objectUrl} alt={`${previewDoc.title} – ${file.name}`} />
        </div>
      )
    }
    if (kind === 'pdf') {
      return (
        <div className="gst-doc-modal__viewer">
          <iframe className="gst-doc-modal__pdf" src={objectUrl} title={`${previewDoc.title} – ${file.name}`} />
        </div>
      )
    }
    return <PreviewUnavailable message="Only PDF, JPG and PNG files can be previewed." />
  }

  return (
    <Modal
      isOpen={Boolean(previewDoc)}
      onClose={onClose}
      size="lg"
      title={
        <div className="gst-doc-modal__title-group">
          <span className="gst-doc-modal__title">{previewDoc.title}</span>
          <span className="gst-doc-modal__filename">
            {previewDoc.fileName}
            {file ? ` · ${formatFileSize(file.size)}` : ''}
          </span>
        </div>
      }
      footer={
        <>
          {objectUrl && file && (
            <a className="gst-doc-modal__btn-secondary" href={objectUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          )}
          <button type="button" className="gst-doc-modal__btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </>
      }
    >
      {renderPreview()}
    </Modal>
  )
}
