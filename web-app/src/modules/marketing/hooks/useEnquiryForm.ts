import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { messageFor } from '@core/errors'
import { marketingService } from '../services/marketingService'
import { ENQUIRY_INPUT_FILTERS, validateEnquiry, validateEnquiryField } from '../validation/enquiryValidation'
import type { EnquiryErrors, EnquiryField, EnquiryFormData } from '../types/marketing.types'

export type EnquiryStatus = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY_ENQUIRY: EnquiryFormData = { fullName: '', email: '', mobile: '', service: '', message: '' }
const ENQUIRY_FIELDS = Object.keys(EMPTY_ENQUIRY) as EnquiryField[]

type FieldElement = HTMLInputElement | HTMLTextAreaElement

const isEnquiryField = (name: string): name is EnquiryField => name in EMPTY_ENQUIRY

/** Moves focus to the first field flagged invalid once React has rendered the errors */
const focusFirstInvalid = (form: HTMLFormElement): void => {
  window.requestAnimationFrame(() => {
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  })
}

/** State, validation and submission for the Contact page enquiry form. */
export const useEnquiryForm = () => {
  const [values, setValues] = useState<EnquiryFormData>(EMPTY_ENQUIRY)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [status, setStatus] = useState<EnquiryStatus>('idle')
  const [reference, setReference] = useState('')
  const [submitError, setSubmitError] = useState('')

  /** A field is "valid" (green tick) once it has a value that passes its rule */
  const validity = useMemo(
    () =>
      Object.fromEntries(
        ENQUIRY_FIELDS.map((field) => [field, validateEnquiryField(field, values[field]) === undefined]),
      ) as Record<EnquiryField, boolean>,
    [values],
  )

  const handleChange = useCallback((event: ChangeEvent<FieldElement>) => {
    const { name, value } = event.target
    if (!isEnquiryField(name)) return
    const nextValue = ENQUIRY_INPUT_FILTERS[name](value)
    setValues((previous) => ({ ...previous, [name]: nextValue }))
    // Once a field shows an error, re-check it as the user types so the message clears as soon as it is fixed
    setErrors((previous) =>
      previous[name] ? { ...previous, [name]: validateEnquiryField(name, nextValue) } : previous,
    )
  }, [])

  const handleBlur = useCallback((event: FocusEvent<FieldElement>) => {
    const { name, value } = event.target
    // Radio pills blur while moving between options; the service is checked on change and on submit
    if (!isEnquiryField(name) || event.target.type === 'radio') return
    setErrors((previous) => ({ ...previous, [name]: validateEnquiryField(name, value) }))
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      // Ignore repeat presses while the enquiry is being sent
      if (status === 'submitting') return
      const form = event.currentTarget
      const nextErrors = validateEnquiry(values)
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        focusFirstInvalid(form)
        return
      }

      setStatus('submitting')
      setSubmitError('')
      try {
        const response = await marketingService.submitEnquiry(values)
        setReference(response.reference)
        setValues(EMPTY_ENQUIRY)
        setStatus('success')
      } catch (error) {
        setSubmitError(messageFor(error))
        setStatus('error')
      }
    },
    [values, status],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setReference('')
    setSubmitError('')
  }, [])

  return {
    values,
    errors,
    validity,
    status,
    reference,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  }
}
