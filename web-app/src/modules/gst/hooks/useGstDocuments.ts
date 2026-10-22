import { useState, useRef, useMemo } from 'react'
import type { DocumentItem, DocumentCategory, DocPreviewState } from '@modules/gst/types/gstDocuments.types'
import { INITIAL_DOCUMENTS, getGstDocUploadRule } from '@modules/gst/utils/gstDocuments.constants'
import { getDocumentsStepError } from '@modules/gst/utils/gstRegistrationGuard'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import { openGstDocumentPreview } from '@modules/gst/utils/gstDocumentPreview'
import { errorTracker } from '@core/errors'

export const useGstDocuments = (
  initialDocs?: DocumentItem[],
  onDocsChange?: (docs: DocumentItem[]) => void
) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const docs = initialDocs || INITIAL_DOCUMENTS
    return docs.map((d) => (d.isUploaded && !d.file && gstUploadedFiles.get(d.id) ? { ...d, file: gstUploadedFiles.get(d.id) } : d))
  })
  const [activeUploadTargetId, setActiveUploadTargetId] = useState<string | null>(null)
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocPreviewState | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  /** Per-document upload errors (wrong type, too large, fake content) */
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  // Adopt a new initialDocs list from the parent (during render, no extra effect pass)
  const [syncedInitialDocs, setSyncedInitialDocs] = useState(initialDocs)
  if (syncedInitialDocs !== initialDocs) {
    setSyncedInitialDocs(initialDocs)
    if (initialDocs && initialDocs.length > 0) {
      setDocuments(
        initialDocs.map((d) => (d.isUploaded && !d.file && gstUploadedFiles.get(d.id) ? { ...d, file: gstUploadedFiles.get(d.id) } : d))
      )
    }
  }

  const updateDocuments = (updater: (prev: DocumentItem[]) => DocumentItem[]) => {
    setDocuments((prev) => {
      const next = updater(prev)
      onDocsChange?.(next)
      return next
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const completedCount = useMemo(() => documents.filter((d) => d.isUploaded).length, [documents])
  const totalCount = documents.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const groupedDocs = useMemo<Record<DocumentCategory, DocumentItem[]>>(
    () => ({
      identity: documents.filter((d) => d.category === 'identity'),
      business: documents.filter((d) => d.category === 'business'),
      financial: documents.filter((d) => d.category === 'financial'),
    }),
    [documents]
  )

  const handleTriggerUpload = (id: string) => {
    setActiveUploadTargetId(id)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleTriggerCamera = (id: string) => {
    setActiveUploadTargetId(id)
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
      cameraInputRef.current.click()
    }
  }

  /**
   * Stores a file for a document slot. Files reach here only after passing the slot's rule
   * (allowed type, max size, genuine file signature) in the shared FileInput.
   */
  const storeFile = (docId: string, file: File) => {
    setUploadErrors(({ [docId]: _removed, ...rest }) => rest)
    gstUploadedFiles.set(docId, file)
    updateDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, isUploaded: true, fileName: file.name, file } : doc))
    )
    setReplacingDocId(null)
    setValidationError(null)
  }

  /** File picker / camera: a file that passed the active slot's rule */
  const handleFileSelected = (file: File) => {
    const targetId = activeUploadTargetId
    if (!targetId) return
    setActiveUploadTargetId(null)
    storeFile(targetId, file)
  }

  /** A picked file broke the slot's rule: show why next to that document */
  const handleUploadRejected = (docId: string | null, message: string) => {
    const targetId = docId ?? activeUploadTargetId
    if (!targetId) return
    setActiveUploadTargetId(null)
    setUploadErrors((prev) => ({ ...prev, [targetId]: message }))
  }

  /** Rule for the shared picker: the slot being filled (photo slots accept JPG/PNG only) */
  const activeUploadRule = getGstDocUploadRule(activeUploadTargetId ?? '')

  const handleDelete = (id: string) => {
    setUploadErrors(({ [id]: _removed, ...rest }) => rest)
    gstUploadedFiles.remove(id)
    updateDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isUploaded: false, fileName: undefined, file: undefined } : doc))
    )
  }

  const handleStartReplace = (id: string) => setReplacingDocId(id)
  const handleCancelReplace = () => setReplacingDocId(null)

  const handleView = (doc: DocumentItem) => {
    const file = doc.file || gstUploadedFiles.get(doc.id)
    if (file) {
      try {
        let viewableBlob: Blob = file
        let mimeType = file.type
        const name = file.name || doc.fileName || ''
        const ext = name.split('.').pop()?.toLowerCase()
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (ext === 'pdf') mimeType = 'application/pdf'
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
          else if (ext === 'png') mimeType = 'image/png'
          else if (ext === 'webp') mimeType = 'image/webp'
          else if (ext === 'svg') mimeType = 'image/svg+xml'
        }
        if (mimeType && mimeType !== file.type) {
          viewableBlob = new Blob([file], { type: mimeType })
        }
        const objectUrl = URL.createObjectURL(viewableBlob)
        const win = window.open(objectUrl, '_blank')
        try {
          win?.focus?.()
        } catch {
          // ignore focus errors
        }
        return
      } catch (e) {
        errorTracker.captureException(e, { tags: { area: 'gst-documents-preview' } })
      }
    }
    try {
      openGstDocumentPreview({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
      })
      return
    } catch (e) {
      errorTracker.captureException(e, { tags: { area: 'gst-documents-preview-fallback' } })
    }
  }

  const handleClosePreview = () => setPreviewDoc(null)

  const handleAddressProofTypeChange = (value: string) => {
    updateDocuments((prev) =>
      prev.map((doc) => (doc.id === 'address_proof' ? { ...doc, addressProofType: value } : doc))
    )
    setValidationError(null)
  }

  const handleProceed = (onNext: () => void) => {
    const stepError = getDocumentsStepError(documents)
    setValidationError(stepError)
    if (!stepError) onNext()
  }

  const handleDirectUpload = (id: string, file: File) => {
    setActiveUploadTargetId(null)
    storeFile(id, file)
  }

  return {
    groupedDocs,
    completedCount,
    totalCount,
    progressPercent,
    replacingDocId,
    previewDoc,
    validationError,
    uploadErrors,
    fileInputRef,
    cameraInputRef,
    handleTriggerUpload,
    handleTriggerCamera,
    handleFileSelected,
    handleUploadRejected,
    activeUploadRule,
    handleDirectUpload,
    handleDelete,
    handleStartReplace,
    handleCancelReplace,
    handleView,
    handleClosePreview,
    handleAddressProofTypeChange,
    handleProceed,
  }
}
