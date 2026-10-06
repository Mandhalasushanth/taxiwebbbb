export type DocumentCategory = 'identity' | 'business' | 'financial'

export interface DocumentItem {
  id: string
  title: string
  subtitle: string
  category: DocumentCategory
  tone: GstIconTone
  fileName?: string
  isUploaded: boolean
  addressProofType?: string
  file?: File
}

export type UploadedDoc = DocumentItem

export interface GSTStepDocumentsProps {
  initialDocuments?: DocumentItem[]
  isEditMode?: boolean
  onDocumentsChange?: (docs: DocumentItem[]) => void
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
}

export interface DocPreviewState {
  title: string
  fileName: string
  /** The uploaded file (in memory for this session); absent for drafts restored after a reload */
  file?: File
}

/** Colour tone of a document/section icon tile (see styles/gstTones.css) */
export type GstIconTone = 'sky' | 'purple' | 'indigo' | 'amber' | 'green' | 'orange' | 'mint'
