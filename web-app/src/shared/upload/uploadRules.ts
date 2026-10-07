/**
 * The one upload rule for the whole application: PDF, Excel, JPG and PNG, at most 10 MB.
 * Every file is checked on its extension, MIME type, size and file signature ("magic bytes"),
 * so a renamed executable (e.g. virus.exe → virus.pdf) is still rejected.
 */

export const MAX_UPLOAD_SIZE_MB = 10
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

export type UploadFileKind = 'pdf' | 'xlsx' | 'xls' | 'jpeg' | 'png'

interface FileKindSpec {
  extensions: readonly string[]
  mimeTypes: readonly string[]
  /** Leading bytes every genuine file of this kind starts with */
  signature: readonly number[]
}

const FILE_KINDS: Record<UploadFileKind, FileKindSpec> = {
  pdf: { extensions: ['.pdf'], mimeTypes: ['application/pdf'], signature: [0x25, 0x50, 0x44, 0x46] },
  // .xlsx is a ZIP container (PK..)
  xlsx: {
    extensions: ['.xlsx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    signature: [0x50, 0x4b, 0x03, 0x04],
  },
  // .xls is an OLE2 compound file
  xls: { extensions: ['.xls'], mimeTypes: ['application/vnd.ms-excel'], signature: [0xd0, 0xcf, 0x11, 0xe0] },
  jpeg: { extensions: ['.jpg', '.jpeg'], mimeTypes: ['image/jpeg', 'image/pjpeg'], signature: [0xff, 0xd8, 0xff] },
  png: { extensions: ['.png'], mimeTypes: ['image/png'], signature: [0x89, 0x50, 0x4e, 0x47] },
}

/** Browsers report this for files they cannot classify; the signature check still applies */
const GENERIC_MIME_TYPE = 'application/octet-stream'

export interface UploadRule {
  kinds: readonly UploadFileKind[]
  maxBytes: number
  /** Human label used in hints and error messages, e.g. "PDF, Excel, JPG or PNG" */
  label: string
}

/** Every document upload in the application: PDF, Excel, JPG or PNG */
export const DOCUMENT_UPLOAD_RULE: UploadRule = {
  kinds: ['pdf', 'xlsx', 'xls', 'jpeg', 'png'],
  maxBytes: MAX_UPLOAD_SIZE_BYTES,
  label: 'PDF, Excel, JPG or PNG',
}

/** Photographs (profile picture, passport photo, camera capture): JPG or PNG */
export const PHOTO_UPLOAD_RULE: UploadRule = {
  kinds: ['jpeg', 'png'],
  maxBytes: MAX_UPLOAD_SIZE_BYTES,
  label: 'JPG or PNG',
}

/** Hint shown under upload areas, e.g. "PDF, Excel, JPG or PNG · max 10 MB" */
export const uploadHintFor = (rule: UploadRule = DOCUMENT_UPLOAD_RULE): string =>
  `${rule.label} · max ${Math.round(rule.maxBytes / (1024 * 1024))} MB`

export const UPLOAD_HINT = uploadHintFor(DOCUMENT_UPLOAD_RULE)

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.')
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : ''
}

const kindForExtension = (rule: UploadRule, fileName: string): UploadFileKind | undefined =>
  rule.kinds.find((kind) => FILE_KINDS[kind].extensions.includes(extensionOf(fileName)))

/**
 * Value for <input type="file" accept="…">: the file dialog then lists only these file types.
 * Users can still switch the dialog to "All files", so every pick is validated as well.
 */
export const acceptAttributeFor = (rule: UploadRule = DOCUMENT_UPLOAD_RULE): string =>
  rule.kinds.flatMap((kind) => [...FILE_KINDS[kind].extensions, ...FILE_KINDS[kind].mimeTypes]).join(',')

const formatMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(1)} MB`

/** Synchronous checks: extension, MIME type, empty file and size. Returns an error or null. */
export const getUploadFileError = (file: File, rule: UploadRule = DOCUMENT_UPLOAD_RULE): string | null => {
  const kind = kindForExtension(rule, file.name)
  if (!kind) return `Only ${rule.label} files are allowed`
  // Some browsers leave the type empty or generic for valid files; a specific type must match the extension
  const type = file.type.toLowerCase()
  if (type && type !== GENERIC_MIME_TYPE && !FILE_KINDS[kind].mimeTypes.includes(type)) {
    return `Only ${rule.label} files are allowed`
  }
  if (file.size === 0) return 'The selected file is empty'
  if (file.size > rule.maxBytes) {
    return `File is too large (${formatMb(file.size)}). Maximum size is ${formatMb(rule.maxBytes)}`
  }
  return null
}

const readLeadingBytes = async (file: File, count: number): Promise<number[] | null> => {
  try {
    const blob = file.slice(0, count)
    const buffer = typeof blob.arrayBuffer === 'function'
      ? await blob.arrayBuffer()
      : await new Response(blob).arrayBuffer()
    return Array.from(new Uint8Array(buffer))
  } catch {
    return null
  }
}

/**
 * Full validation: synchronous checks, then the file signature so the content really is
 * the declared type. Returns an error message or null.
 */
export const validateUploadFile = async (
  file: File,
  rule: UploadRule = DOCUMENT_UPLOAD_RULE,
): Promise<string | null> => {
  const basicError = getUploadFileError(file, rule)
  if (basicError) return basicError
  const kind = kindForExtension(rule, file.name) as UploadFileKind
  const { signature } = FILE_KINDS[kind]
  const bytes = await readLeadingBytes(file, signature.length)
  if (!bytes) return 'Could not read the selected file. Please try again'
  const matches = signature.every((byte, index) => bytes[index] === byte)
  return matches ? null : `The file content is not a valid ${rule.label} file`
}

/** Readable size for upload lists, e.g. "820 KB" or "2.4 MB" */
export const formatUploadSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? formatMb(bytes) : `${Math.max(1, Math.round(bytes / 1024))} KB`
