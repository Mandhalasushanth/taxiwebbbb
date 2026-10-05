import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService, resolvePostLoginPath } from '@core/auth'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import { formatMobile } from '@shared/utils'
import { authFlowService } from '../../services/authFlowService'
import { registrationDraftStore } from '../../services/registrationDraftStore'
import {
  DuplicateIdentityError,
  findIdentityConflicts,
  type UniqueIdentityField,
} from '../../services/identityRegistry'
import { RegistrationPersonalFields } from '../RegistrationPersonalFields/RegistrationPersonalFields'
import { RegistrationIdentityFields } from '../RegistrationIdentityFields/RegistrationIdentityFields'
import { RegistrationEntityFields } from '../RegistrationEntityFields/RegistrationEntityFields'
import { RegistrationResidentialFields } from '../RegistrationResidentialFields/RegistrationResidentialFields'
import { RegistrationSecurityFields } from '../RegistrationSecurityFields/RegistrationSecurityFields'
import type { CustomerTypeId } from '@modules/customerType/types/customerType.types'
import { getEntityFormConfig } from '../../constants/profileFormConfig'
import { buildRegisteredUser, formatRegistrationField } from '../../utils/registrationFormatters'
import {
  checkIsFormValid,
  validateField,
  INITIAL_REGISTRATION_VALUES,
  type RegistrationFormErrors,
  type RegistrationFormState,
} from '../../validation/registrationValidation'
import './RegistrationForm.css'

export interface RegistrationFormProps {
  onStep1Success?: () => void
  customerType?: CustomerTypeId
  onSuccess?: () => void
}

type FieldKey = keyof RegistrationFormState
type TouchedMap = Partial<Record<FieldKey, boolean>>

/** Fields whose error depends on another field, re-validated together */
const DEPENDENT_FIELDS: Partial<Record<FieldKey, FieldKey>> = {
  mobile: 'password',
  password: 'confirmPassword',
}

const UNIQUE_FIELDS: FieldKey[] = ['pan', 'email']

/** Every registration input uses id="reg-<fieldName>" */
const FIELD_ID_PREFIX = 'reg-'

const generateToken =(prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onStep1Success,
  customerType,
  onSuccess,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const locationMobile = (location.state as { mobile?: string } | null)?.mobile

  // The number verified by OTP in this session. It is locked and is the only number that can be saved.
  const verifiedMobile = formatMobile(user?.mobile || '')
  const isMobileVerified = Boolean(verifiedMobile)

  const [values, setValues] = useState<RegistrationFormState>(() => {
    const draft = registrationDraftStore.load(verifiedMobile) ?? {}
    return {
      ...INITIAL_REGISTRATION_VALUES,
      fullName: user?.fullName || '',
      email: user?.email || '',
      ...draft,
      customerType: customerType || draft.customerType || INITIAL_REGISTRATION_VALUES.customerType,
      mobile: verifiedMobile || formatMobile(locationMobile || ''),
    }
  })

  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<RegistrationFormErrors>({})
  const [touched, setTouched] = useState<TouchedMap>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const isFormValid = checkIsFormValid(values)
  const entityConfig = getEntityFormConfig(values.customerType)

  // Persist every change so going back to "Customer Type" and continuing keeps the data
  useEffect(() => {
    registrationDraftStore.save(verifiedMobile, values)
  }, [values, verifiedMobile])

  /** Format rules first, then the "already registered" uniqueness check for PAN / email */
  const validateWithUniqueness = (key: FieldKey, nextValues: RegistrationFormState): string | undefined => {
    const formatError = validateField(key, nextValues)
    if (formatError || !UNIQUE_FIELDS.includes(key)) return formatError
    return findIdentityConflicts({ mobile: verifiedMobile, pan: nextValues.pan, email: nextValues.email })[
      key as UniqueIdentityField
    ]
  }

  const fieldErrorsFor = (key: FieldKey, nextValues: RegistrationFormState, touchedMap: TouchedMap) => {
    const dependent = DEPENDENT_FIELDS[key]
    const updates: RegistrationFormErrors = { [key]: validateWithUniqueness(key, nextValues) }
    if (dependent && touchedMap[dependent]) updates[dependent] = validateField(dependent, nextValues)
    return updates
  }

  const handleApplyDate = (formattedDate: string) => {
    const next = { ...values, dob: formattedDate }
    setValues(next)
    if (touched.dob) setErrors((prev) => ({ ...prev, dob: validateField('dob', next) }))
    setIsCalendarOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const key = e.target.name as FieldKey
    if (key === 'mobile' && isMobileVerified) return

    const formatted = key === 'mobile' ? formatMobile(e.target.value) : formatRegistrationField(key, e.target.value, values)
    const nextValues = { ...values, [key]: formatted }
    setValues(nextValues)

    if (key === 'aadhaar') {
      // Let the user type the full Aadhaar number before showing an error
      setErrors((prev) => ({ ...prev, aadhaar: undefined }))
      setTouched((prev) => ({ ...prev, aadhaar: false }))
      return
    }
    if (touched[key]) setErrors((prev) => ({ ...prev, ...fieldErrorsFor(key, nextValues, touched) }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const key = e.target.name as FieldKey
    setTouched((prev) => ({ ...prev, [key]: true }))
    setErrors((prev) => ({ ...prev, ...fieldErrorsFor(key, values, touched) }))
  }

  const handleToggleTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, agreeTerms: e.target.checked }
    setValues(next)
    setErrors((prev) => ({ ...prev, agreeTerms: validateField('agreeTerms', next) }))
    setTouched((prev) => ({ ...prev, agreeTerms: true }))
  }

  const validateAll = (): RegistrationFormErrors =>
    (Object.keys(values) as FieldKey[]).reduce<RegistrationFormErrors>((acc, key) => {
      const err = validateWithUniqueness(key, values)
      return err ? { ...acc, [key]: err } : acc
    }, {})

  /** Moves focus to the first field (in page order) that has an error, e.g. the Terms checkbox. */
  const focusFirstInvalidField = (fieldErrors: RegistrationFormErrors) => {
    const fieldElements = Array.from(formRef.current?.querySelectorAll<HTMLElement>(`[id^="${FIELD_ID_PREFIX}"]`) ?? [])
    const firstInvalid = fieldElements.find((el) => fieldErrors[el.id.slice(FIELD_ID_PREFIX.length) as FieldKey])
    firstInvalid?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = validateAll()
    if (Object.keys(newErrors).length > 0 || !isFormValid) {
      setErrors(newErrors)
      setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])) as TouchedMap)
      focusFirstInvalidField(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, form: undefined }))

    try {
      const registeredUser = buildRegisteredUser(values, verifiedMobile, user)

      await authFlowService.saveRegistrationStep1({
        mobile: verifiedMobile,
        passcode: values.password,
        user: registeredUser,
      })
      await authFlowService.completeRegistration(verifiedMobile, values.customerType)

      const session = {
        user: registeredUser,
        tokens: {
          accessToken: authService.getAccessToken() || generateToken('tok'),
          refreshToken: authService.getRefreshToken() || generateToken('ref'),
        },
      }
      useAuthStore.getState().signIn(session)
      registrationDraftStore.clear(verifiedMobile)

      if (onSuccess) {
        onSuccess()
      } else if (onStep1Success) {
        onStep1Success()
      } else {
        navigate(resolvePostLoginPath(location.search, location.state, routePaths.dashboard), { replace: true })
      }
    } catch (err) {
      if (err instanceof DuplicateIdentityError) {
        // Server rejected PAN / email as already registered: show it on the field itself
        setErrors((prev) => ({ ...prev, ...err.conflicts }))
        setTouched((prev) => ({ ...prev, pan: true, email: true }))
        focusFirstInvalidField(err.conflicts)
        return
      }
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : 'Registration failed. Please try again.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleError = (key: FieldKey) => (touched[key] ? errors[key] : undefined)

  const renderIndividualFields = () => (
    <>
      <RegistrationPersonalFields
        values={{ fullName: values.fullName, email: values.email, gender: values.gender, dob: values.dob }}
        errors={{
          fullName: visibleError('fullName'),
          email: visibleError('email'),
          gender: visibleError('gender'),
          dob: visibleError('dob'),
        }}
        onChange={handleChange}
        onBlur={handleBlur}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        isCalendarOpen={isCalendarOpen}
        onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
        onCloseCalendar={() => setIsCalendarOpen(false)}
        onApplyDate={handleApplyDate}
      />
      <RegistrationIdentityFields
        values={{
          fatherSpouseName: values.fatherSpouseName,
          pan: values.pan,
          aadhaar: values.aadhaar,
          mobile: values.mobile,
        }}
        errors={{
          fatherSpouseName: visibleError('fatherSpouseName'),
          pan: visibleError('pan'),
          aadhaar: visibleError('aadhaar'),
          mobile: visibleError('mobile'),
        }}
        isMobileVerified={isMobileVerified}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </>
  )

  const renderEntityFields = () =>
    entityConfig && (
      <RegistrationEntityFields
        config={entityConfig}
        values={{
          entityName: values.entityName,
          registrationNumber: values.registrationNumber,
          incorporationDate: values.incorporationDate,
          pan: values.pan,
          fullName: values.fullName,
          email: values.email,
          mobile: values.mobile,
        }}
        errors={{
          entityName: visibleError('entityName'),
          registrationNumber: visibleError('registrationNumber'),
          incorporationDate: visibleError('incorporationDate'),
          pan: visibleError('pan'),
          fullName: visibleError('fullName'),
          email: visibleError('email'),
          mobile: visibleError('mobile'),
        }}
        isMobileVerified={isMobileVerified}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    )

  return (
    <form className="reg-form" ref={formRef} onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <div className="reg-form__alert-error" role="alert">
          <span>{errors.form}</span>
        </div>
      )}

      {entityConfig ? renderEntityFields() : renderIndividualFields()}

      <RegistrationResidentialFields
        values={{
          addressLine1: values.addressLine1,
          pincode: values.pincode,
          areaLocality: values.areaLocality,
          city: values.city,
          district: values.district,
          state: values.state,
        }}
        errors={{
          addressLine1: visibleError('addressLine1'),
          pincode: visibleError('pincode'),
          areaLocality: visibleError('areaLocality'),
          city: visibleError('city'),
          district: visibleError('district'),
          state: visibleError('state'),
        }}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <RegistrationSecurityFields
        values={{
          password: values.password,
          confirmPassword: values.confirmPassword,
          agreeTerms: values.agreeTerms,
        }}
        errors={{
          password: visibleError('password'),
          confirmPassword: visibleError('confirmPassword'),
          agreeTerms: visibleError('agreeTerms'),
        }}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        submitLabel="Complete Registration"
        onChange={handleChange}
        onBlur={handleBlur}
        onToggleTerms={handleToggleTerms}
      />
    </form>
  )
}
