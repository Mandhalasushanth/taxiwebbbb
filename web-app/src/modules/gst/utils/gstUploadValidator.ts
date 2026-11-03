import {
  DOCUMENT_UPLOAD_RULE,
  type UploadRule,
  type UploadFileKind,
} from '@shared/upload'

/**
 * Custom exception hierarchy for GST File Upload validations.
 * Provides granular typing and consistent formatted error messages across all GST submodules.
 * Compatible with erasableSyntaxOnly (no parameter properties).
 */
export class GstUploadException extends Error {
  readonly code: 'TOO_LARGE' | 'INVALID_TYPE' | 'EMPTY_FILE' | 'CONTENT_MISMATCH' | 'CORRUPTED'
  readonly details?: {
    fileName: string
    actualSize?: number
    maxSize?: number
    allowedTypes?: readonly string[]
  }

  constructor(
    message: string,
    code: 'TOO_LARGE' | 'INVALID_TYPE' | 'EMPTY_FILE' | 'CONTENT_MISMATCH' | 'CORRUPTED',
    details?: {
      fileName: string
      actualSize?: number
      maxSize?: number
      allowedTypes?: readonly string[]
    }
  ) {
    super(message)
    this.code = code
    this.details = details
    this.name = 'GstUploadException'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class GstFileSizeExceededException extends GstUploadException {
  constructor(fileName: string, actualBytes: number, maxBytes: number) {
    const formatMb = (b: number) => `${(b / (1024 * 1024)).toFixed(1)} MB`
    super(
      `File is too large (${formatMb(actualBytes)}). Maximum size is ${formatMb(maxBytes)}`,
      'TOO_LARGE',
      { fileName, actualSize: actualBytes, maxSize: maxBytes }
    )
    this.name = 'GstFileSizeExceededException'
  }
}

export class GstInvalidFileTypeException extends GstUploadException {
  constructor(fileName: string, allowedLabel: string) {
    super(`Only ${allowedLabel} files are allowed`, 'INVALID_TYPE', { fileName })
    this.name = 'GstInvalidFileTypeException'
  }
}

export class GstEmptyFileException extends GstUploadException {
  constructor(fileName: string) {
    super('The selected file is empty', 'EMPTY_FILE', { fileName })
    this.name = 'GstEmptyFileException'
  }
}

const FILE_EXTENSIONS: Record<UploadFileKind, readonly string[]> = {
  pdf: ['.pdf'],
  xlsx: ['.xlsx'],
  xls: ['.xls'],
  jpeg: ['.jpg', '.jpeg'],
  png: ['.png'],
}

const MIME_MAP: Record<UploadFileKind, readonly string[]> = {
  pdf: ['application/pdf'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  xls: ['application/vnd.ms-excel'],
  jpeg: ['image/jpeg', 'image/pjpeg'],
  png: ['image/png'],
}

const GENERIC_MIME_TYPE = 'application/octet-stream'

const getExtension = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.')
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : ''
}

const findKindForExtension = (rule: UploadRule, fileName: string): UploadFileKind | undefined => {
  const ext = getExtension(fileName)
  return rule.kinds.find((kind) => FILE_EXTENSIONS[kind]?.includes(ext))
}

/**
 * Asserts that the provided file satisfies all constraints of the given UploadRule.
 * Throws a subclass of GstUploadException if validation fails.
 */
export function assertGstUploadCriteria(
  file: File,
  rule: UploadRule = DOCUMENT_UPLOAD_RULE
): void {
  if (!file) {
    throw new GstEmptyFileException('unknown')
  }

  if (file.size === 0) {
    throw new GstEmptyFileException(file.name)
  }

  if (file.size > rule.maxBytes) {
    throw new GstFileSizeExceededException(file.name, file.size, rule.maxBytes)
  }

  const kind = findKindForExtension(rule, file.name)
  if (!kind) {
    throw new GstInvalidFileTypeException(file.name, rule.label)
  }

  const mime = file.type?.toLowerCase()
  if (mime && mime !== GENERIC_MIME_TYPE && !MIME_MAP[kind]?.includes(mime)) {
    throw new GstInvalidFileTypeException(file.name, rule.label)
  }
}

/**
 * Safe functional wrapper executing assertGstUploadCriteria inside try-catch.
 * Returns null if valid, or the error message string if an exception was thrown.
 */
export function validateGstUploadSafely(
  file: File,
  rule: UploadRule = DOCUMENT_UPLOAD_RULE
): string | null {
  try {
    assertGstUploadCriteria(file, rule)
    return null
  } catch (err) {
    if (err instanceof GstUploadException) {
      return err.message
    }
    return err instanceof Error ? err.message : 'Invalid file'
  }
}
