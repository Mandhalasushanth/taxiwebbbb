/**
 * Uploads — one rule for the whole application (PDF, Excel, JPG, PNG · max 15 MB):
 * - FileInput: the file picker every upload uses (filtered dialog + validation of each pick)
 * - validateUploadFile / getUploadFileError: checks for files that arrive another way (drag & drop)
 * - DOCUMENT_UPLOAD_RULE / PHOTO_UPLOAD_RULE, UPLOAD_HINT: the rules and their on-screen hint
 */
export {
  MAX_UPLOAD_SIZE_MB,
  MAX_UPLOAD_SIZE_BYTES,
  DOCUMENT_UPLOAD_RULE,
  PHOTO_UPLOAD_RULE,
  UPLOAD_HINT,
  uploadHintFor,
  acceptAttributeFor,
  getUploadFileError,
  validateUploadFile,
  formatUploadSize,
} from './uploadRules'
export type { UploadRule, UploadFileKind } from './uploadRules'
export { FileInput } from './FileInput/FileInput'
export type { FileInputProps } from './FileInput/FileInput'
export { uploadedFileStore, viewUploadedDocument } from './documentPreview'
export type { ViewDocumentParams } from './documentPreview'
