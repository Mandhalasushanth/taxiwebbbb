import { useState, useCallback } from 'react'

export interface UseAmendmentFileStateOptions {
  initialFile?: File | null
  initialFileName?: string
  initialFileSize?: string
  onFileCleared?: () => void
}

export const useAmendmentFileState = ({
  initialFile,
  initialFileName,
  initialFileSize,
  onFileCleared,
}: UseAmendmentFileStateOptions) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [prevInitialFile, setPrevInitialFile] = useState(initialFile)

  if (prevInitialFile !== initialFile) {
    setPrevInitialFile(initialFile)
    if (initialFile !== undefined) {
      setSelectedFile(initialFile)
      if (initialFile) setRemovedInitialFile(false)
    }
  }

  const effectiveFileName = !removedInitialFile ? (selectedFile?.name || initialFileName) : selectedFile?.name

  const handleFileChange = useCallback((file: File) => {
    setSelectedFile(file)
    setRemovedInitialFile(false)
  }, [])

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null)
    setRemovedInitialFile(true)
    onFileCleared?.()
  }, [onFileCleared])

  return {
    selectedFile,
    setSelectedFile,
    removedInitialFile,
    effectiveFileName,
    initialFileSize,
    handleFileChange,
    handleFileRemove,
  }
}

