/**
 * Upload restrictions shared by every document upload:
 * extension + MIME type allow-lists, a size limit, and a file-signature ("magic bytes")
 * check so a renamed executable (e.g. virus.exe → virus.pdf) is still rejected.
 */

export const MAX_UPLOAD_SIZE_MB = 10
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

export type UploadFileKind = 'pdf' | 'jpeg' | 'png'

interface FileKindSpec {
  extensions: readonly string[]
  mimeTypes: readonly string[]
  /** Leading bytes every genuine file of this kind starts with */
  signature: readonly number[]
}

const FILE_KINDS: Record<UploadFileKind, FileKindSpec> = {
  pdf: { extensions: ['.pdf'], mimeTypes: ['application/pdf'], signature: [0x25, 0x50, 0x44, 0x46] },
  jpeg: { extensions: ['.jpg', '.jpeg'], mimeTypes: ['image/jpeg', 'image/pjpeg'], signature: [0xff, 0xd8, 0xff] },
  png: { extensions: ['.png'], mimeTypes: ['image/png'], signature: [0x89, 0x50, 0x4e, 0x47] },
}

export interface UploadRule {
  kinds: readonly UploadFileKind[]
  maxBytes: number
  /** Human label used in error messages, e.g. "PDF, JPG or PNG" */
  label: string
}

/** Documents: PDF or image */
export const DOCUMENT_UPLOAD_RULE: UploadRule = {
  kinds: ['pdf', 'jpeg', 'png'],
  maxBytes: MAX_UPLOAD_SIZE_BYTES,
  label: 'PDF, JPG or PNG',
}

/** Photographs: images only */
export const PHOTO_UPLOAD_RULE: UploadRule = {
  kinds: ['jpeg', 'png'],
  maxBytes: MAX_UPLOAD_SIZE_BYTES,
  label: 'JPG or PNG',
}

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.')
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : ''
}

const kindForExtension = (rule: UploadRule, fileName: string): UploadFileKind | undefined =>
  rule.kinds.find((kind) => FILE_KINDS[kind].extensions.includes(extensionOf(fileName)))

/** Value for an <input type="file" accept="…"> matching the rule */
export const acceptAttributeFor = (rule: UploadRule): string =>
  rule.kinds.flatMap((kind) => [...FILE_KINDS[kind].extensions, ...FILE_KINDS[kind].mimeTypes]).join(',')

const formatMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(1)} MB`

/** Synchronous checks: name / extension, MIME type, empty file and size. Returns an error or null. */
export const getUploadFileError = (file: File, rule: UploadRule): string | null => {
  const kind = kindForExtension(rule, file.name)
  if (!kind) return `Only ${rule.label} files are allowed`
  // Some browsers leave type empty for valid files; a non-empty type must match the extension
  if (file.type && !FILE_KINDS[kind].mimeTypes.includes(file.type.toLowerCase())) {
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
export const validateUploadFile = async (file: File, rule: UploadRule): Promise<string | null> => {
  const basicError = getUploadFileError(file, rule)
  if (basicError) return basicError
  const kind = kindForExtension(rule, file.name) as UploadFileKind
  const { signature } = FILE_KINDS[kind]
  const bytes = await readLeadingBytes(file, signature.length)
  if (!bytes) return 'Could not read the selected file. Please try again'
  const matches = signature.every((byte, index) => bytes[index] === byte)
  return matches ? null : `The file content is not a valid ${rule.label} file`
}
