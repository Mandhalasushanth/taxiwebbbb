import { useAppStore } from '@store/index'

/**
 * Files picked in this browser session, so "View" can open the real file again
 * (keyed by document id and by file name). Kept in memory only — never in browser storage.
 */
const uploadedFiles = new Map<string, File>()

export const uploadedFileStore = {
  remember(key: string, file: File): void {
    uploadedFiles.set(key, file)
    if (file.name) uploadedFiles.set(file.name, file)
  },
  get(...keys: (string | undefined)[]): File | undefined {
    return keys.reduce<File | undefined>((found, key) => found ?? (key ? uploadedFiles.get(key) : undefined), undefined)
  },
  forget(...keys: (string | undefined)[]): void {
    keys.forEach((key) => key && uploadedFiles.delete(key))
  },
}

/** MIME type to open a file with when the browser did not set one */
const PREVIEW_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const GENERIC_MIME_TYPE = 'application/octet-stream'
const PREVIEW_UNAVAILABLE =
  'This document is not available to preview any more. Please upload it again to view it.'

export interface ViewDocumentParams {
  id?: string
  title?: string
  fileName?: string
  file?: File
  /** A stored document's URL (e.g. from the server) */
  fileUrl?: string
}

const openInNewTab = (url: string): void => {
  // Never pass 'noopener' for blob: URLs: Chrome then opens about:blank
  window.open(url, '_blank')?.focus?.()
}

const viewableBlob = (file: Blob, fileName: string): Blob => {
  if (file.type && file.type !== GENERIC_MIME_TYPE) return file
  const type = PREVIEW_TYPES[fileName.split('.').pop()?.toLowerCase() ?? '']
  return type ? new Blob([file], { type }) : file
}

/**
 * Opens an uploaded document in a new tab: the file itself, a remembered copy, or its URL.
 * When none is available (e.g. a resumed draft only has the file name) the user is asked to
 * upload it again — no placeholder page is ever shown in place of the real document.
 */
export const viewUploadedDocument = ({ id, fileName, file, fileUrl }: ViewDocumentParams): boolean => {
  try {
    const source = file ?? uploadedFileStore.get(id, fileName)
    if (source) {
      openInNewTab(URL.createObjectURL(viewableBlob(source, source.name || fileName || '')))
      return true
    }
    if (fileUrl) {
      openInNewTab(fileUrl)
      return true
    }
  } catch {
    // Fall through to the message below
  }
  useAppStore.getState().pushToast(PREVIEW_UNAVAILABLE, 'info')
  return false
}
