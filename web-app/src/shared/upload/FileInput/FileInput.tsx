import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { useAppStore } from '@store/index'
import { DOCUMENT_UPLOAD_RULE, acceptAttributeFor, validateUploadFile, type UploadRule } from '../uploadRules'

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'accept' | 'onChange'> {
  /** Which files are allowed (default: PDF, Excel, JPG, PNG up to 15 MB) */
  rule?: UploadRule
  /** Called once per picked file that passed validation */
  onFileSelected: (file: File) => void
  /** Called with a readable message for a rejected file (default: an error toast) */
  onFileError?: (message: string, file: File) => void
}

/**
 * The file picker every upload in the application uses:
 * - `accept` limits the folder dialog to the allowed file types
 * - every picked file is validated (type, size, real content), since the dialog can be set to "All files"
 * - the input is reset so picking the same file again still triggers a change
 */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ rule = DOCUMENT_UPLOAD_RULE, onFileSelected, onFileError, ...inputProps }, ref) => {
    const pushToast = useAppStore((state) => state.pushToast)

    const reportError = (message: string, file: File) =>
      onFileError ? onFileError(message, file) : pushToast(`${file.name}: ${message}`, 'error')

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget
      const files = Array.from(input.files ?? [])
      input.value = ''
      const checked = await Promise.all(
        files.map(async (file) => ({ file, error: await validateUploadFile(file, rule) })),
      )
      checked.forEach(({ file, error }) => (error ? reportError(error, file) : onFileSelected(file)))
    }

    return (
      <input
        {...inputProps}
        ref={ref}
        type="file"
        accept={acceptAttributeFor(rule)}
        onChange={handleChange}
      />
    )
  },
)

FileInput.displayName = 'FileInput'

export default FileInput
