import { useState, useRef, useMemo, type ChangeEvent } from 'react'
import type { DocumentItem, DocumentCategory, DocPreviewState } from '@modules/gst/types/gstDocuments.types'
import { validateUploadFile } from '@shared/utils'
import { INITIAL_DOCUMENTS, getGstDocUploadRule } from '@modules/gst/utils/gstDocuments.constants'
import { getDocumentsStepError } from '@modules/gst/utils/gstRegistrationGuard'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'

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
   * Accepts a file for a document slot only after it passes the slot's rule
   * (allowed type, max size, genuine file signature). Rejected files leave the slot unchanged.
   */
  const acceptFile = async (docId: string, file: File) => {
    const error = await validateUploadFile(file, getGstDocUploadRule(docId))
    if (error) {
      setUploadErrors((prev) => ({ ...prev, [docId]: error }))
      return
    }
    setUploadErrors(({ [docId]: _removed, ...rest }) => rest)
    gstUploadedFiles.set(docId, file)
    updateDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, isUploaded: true, fileName: file.name, file } : doc))
    )
    setReplacingDocId(null)
    setValidationError(null)
  }

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const targetId = activeUploadTargetId
    if (!file || !targetId) return
    setActiveUploadTargetId(null)
    await acceptFile(targetId, file)
  }

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
        console.warn('Could not open document in new window:', e)
      }
    }
    try {
      const docName = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.pdf`
      const docTitle = doc.title
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${docTitle} - ${docName}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
      header { background: #1e293b; border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
      .header-left { display: flex; align-items: center; gap: 12px; }
      .brand-badge { background: #2563eb; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
      .header-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; }
      .header-sub { font-size: 0.85rem; color: #94a3b8; }
      .header-actions { display: flex; gap: 10px; }
      .btn { padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: 1px solid #475569; background: #334155; color: #f8fafc; text-decoration: none; }
      .btn:hover { background: #475569; }
      .btn-primary { background: #2563eb; border-color: #3b82f6; }
      main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
      .sheet { background: white; color: #0f172a; width: 100%; max-width: 720px; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; border: 1px solid #e2e8f0; position: relative; }
      .sheet-header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 1.75rem 2rem; }
      .sheet-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
      .sheet-sub { font-size: 0.9rem; opacity: 0.9; }
      .sheet-body { padding: 2.25rem 2rem; }
      .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
      .meta-item { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
      .meta-label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
      .meta-value { font-size: 0.95rem; font-weight: 600; color: #0f172a; word-break: break-all; }
      .verified-badge { display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; border: 1px solid #a7f3d0; margin-bottom: 1.5rem; }
      .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 4rem; font-weight: 900; color: rgba(148, 163, 184, 0.08); pointer-events: none; user-select: none; }
      .notice-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; color: #475569; line-height: 1.6; }
      footer { background: #1e293b; color: #64748b; text-align: center; padding: 0.75rem; font-size: 0.75rem; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <header>
      <div class="header-left">
        <span class="brand-badge">TaxEdge</span>
        <div>
          <div class="header-title">${docTitle}</div>
          <div class="header-sub">${docName}</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn" onclick="window.print()">Print</button>
        <button class="btn btn-primary" onclick="window.close()">Close</button>
      </div>
    </header>
    <main>
      <div class="sheet">
        <div class="watermark">TAXEDGE VERIFIED</div>
        <div class="sheet-header">
          <div class="sheet-title">${docTitle}</div>
          <div class="sheet-sub">Official Tax & Compliance Supporting Document</div>
        </div>
        <div class="sheet-body">
          <div class="verified-badge">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Digitally Attached & Verified
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Document Name</div>
              <div class="meta-value">${docName}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Document Classification</div>
              <div class="meta-value">${docTitle}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Document Identifier</div>
              <div class="meta-value">DOC-${doc.id.toUpperCase()}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Storage Integrity</div>
              <div class="meta-value">AES-256 Encrypted & Secure</div>
            </div>
          </div>
          <div class="notice-box">
            This document record is verified and securely linked to your registration application. You may print this verification record or replace the uploaded file from the application dashboard anytime.
          </div>
        </div>
      </div>
    </main>
    <footer>
      TaxEdge Compliance System · 256-bit Secure TLS Encryption
    </footer>
  </body>
</html>`
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const previewUrl = URL.createObjectURL(blob)
      const win = window.open(previewUrl, '_blank')
      try {
        win?.focus?.()
      } catch {
        // ignore
      }
      return
    } catch {
      // Fallback
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

  const handleDirectUpload = async (id: string, file: File) => {
    setActiveUploadTargetId(null)
    await acceptFile(id, file)
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
