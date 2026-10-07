import { formatUploadSize } from '@shared/upload'

/** Messages shared by GST uploads (type and size limits come from the application-wide rule in @shared/upload) */
export const GST_FILE_MESSAGES = {
  proofRequired: 'Please upload a supporting proof document.',
} as const

/** "1.4 MB" from 1 MB upward, otherwise "320 KB" — the shared upload size format */
export const formatGstFileSize = formatUploadSize
