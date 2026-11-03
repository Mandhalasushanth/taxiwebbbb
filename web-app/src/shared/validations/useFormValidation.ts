import { useState, useCallback, useRef } from 'react'

export type FieldValidator<T = any> = (
  value: any,
  allValues: T
) => string | null | undefined

export type FormValidationSchema<T extends Record<string, any>> = Partial<{
  [K in keyof T]: FieldValidator<T>
}>

export interface UseFormValidationOptions<T extends Record<string, any>> {
  initialValues: T
  validators: FormValidationSchema<T>
  onSubmit?: (values: T) => Promise<void> | void
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validators,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)

  /** Validates a single field against its registered validator */
  const validateField = useCallback(
    <K extends keyof T>(field: K, val: T[K], allVals?: T): string | undefined => {
      const validator = validators[field]
      if (!validator) return undefined
      const err = validator(val, allVals || values)
      return err || undefined
    },
    [validators, values]
  )

  /** Field-level validation on blur: validates immediately when user leaves field */
  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const err = validateField(field, values[field])
      setErrors((prev) => ({
        ...prev,
        [field]: err,
      }))
    },
    [validateField, values]
  )

  /** Handles change with automatic error clearing as soon as input becomes valid */
  const handleChange = useCallback(
    <K extends keyof T>(field: K, val: T[K]) => {
      const nextValues = { ...values, [field]: val }
      setValues(nextValues)

      // Re-validate and clear error automatically if field was touched or previously had an error
      if (touched[field] || errors[field]) {
        const err = validateField(field, val, nextValues)
        setErrors((prev) => ({
          ...prev,
          [field]: err,
        }))
      }
    },
    [errors, touched, validateField, values]
  )

  /** Validates all fields: required before Continue / Submit */
  const validateAll = useCallback(
    (customVals?: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
      const currentValues = customVals || values
      const newErrors: Partial<Record<keyof T, string>> = {}
      const allTouched: Partial<Record<keyof T, boolean>> = {}

      for (const key of Object.keys(validators) as Array<keyof T>) {
        allTouched[key] = true
        const err = validateField(key, currentValues[key], currentValues)
        if (err) {
          newErrors[key] = err
        }
      }

      setTouched((prev) => ({ ...prev, ...allTouched }))
      setErrors(newErrors)

      const isValid = Object.keys(newErrors).length === 0
      return { isValid, errors: newErrors }
    },
    [validateField, validators, values]
  )

  /** Submit handler that prevents invalid or duplicate submissions */
  const handleSubmit = useCallback(
    async (
      e?: React.FormEvent,
      onValid?: (validVals: T) => Promise<void> | void
    ): Promise<boolean> => {
      if (e) {
        e.preventDefault()
      }

      // Prevent concurrent/duplicate submissions
      if (isSubmittingRef.current) {
        return false
      }

      const { isValid, errors: validationErrors } = validateAll()
      if (!isValid) {
        // Find and focus the first invalid field
        const firstErrorKey = Object.keys(validationErrors)[0]
        if (firstErrorKey) {
          const el = document.querySelector(`[name="${firstErrorKey}"], #${firstErrorKey}`) as HTMLElement | null
          el?.focus?.()
        }
        return false
      }

      isSubmittingRef.current = true
      setIsSubmitting(true)

      try {
        if (onValid) {
          await onValid(values)
        } else if (onSubmit) {
          await onSubmit(values)
        }
        return true
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [onSubmit, validateAll, values]
  )

  const resetForm = useCallback(
    (newVals?: T) => {
      setValues(newVals || initialValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
      isSubmittingRef.current = false
    },
    [initialValues]
  )

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    validateField,
    handleBlur,
    handleChange,
    validateAll,
    handleSubmit,
    resetForm,
  }
}

