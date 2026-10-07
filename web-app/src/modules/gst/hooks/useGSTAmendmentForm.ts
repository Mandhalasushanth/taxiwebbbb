import { useState, useRef, useMemo, type ChangeEvent, type FormEvent } from 'react'
import { detectGstFieldKind, gstRuleForField } from '@modules/gst/validation/gstFieldRules'
import { gstInputForKind } from '@modules/gst/utils/gstInputFormatters'
import { getAmendmentFieldOptions, type AmendmentFieldOption } from '@modules/gst/data/gstAmendmentData'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import type { GstAmendmentPayload } from '@modules/gst/types/gst.types'

interface UseGSTAmendmentFormParams {
  initialGstin?: string
  initialFieldKey?: string
  onSubmit: (payload: GstAmendmentPayload) => void
}

export const useGSTAmendmentForm = ({
  initialGstin,
  initialFieldKey,
  onSubmit,
}: UseGSTAmendmentFormParams) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profile = useMemo(() => gstProfileService.get(), [])
  const fieldOptions = useMemo(() => getAmendmentFieldOptions(profile), [profile])
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>(initialFieldKey || fieldOptions[0].key)
  const [newValue, setNewValue] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ newValue?: string; document?: string }>({})

  const displayGstin = initialGstin || profile.gstin

  const activeOption: AmendmentFieldOption =
    fieldOptions.find((opt) => opt.key === selectedFieldKey) || fieldOptions[0]

  const handleFieldSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFieldKey(e.target.value)
    setNewValue('')
    setErrors({})
  }

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setErrors((prev) => ({ ...prev, document: undefined }))
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const newErrors: { newValue?: string; document?: string } = {}
    const valueError = gstRuleForField(activeOption.label, activeOption.placeholder)(newValue)
    if (valueError) newErrors.newValue = valueError
    if (!selectedFile) newErrors.document = 'Please upload a supporting document.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit({
      gstin: displayGstin,
      fieldBeingChanged: activeOption.label,
      fieldKey: activeOption.key,
      oldValue: activeOption.oldValue,
      newValue: newValue.trim(),
      supportingDocumentName: selectedFile?.name,
      supportingDocumentFile: selectedFile,
    })
  }

  return {
    fileInputRef,
    selectedFieldKey,
    newValue,
    setNewValue,
    selectedFile,
    errors,
    setErrors,
    displayGstin,
    activeOption,
    fieldOptions,
    filterNewValue: gstInputForKind(detectGstFieldKind(activeOption.label, activeOption.placeholder)),
    handleFieldSelectChange,
    handleFileChange,
    handleBrowseClick,
    handleRemoveFile,
    handleSubmit,
  }
}
