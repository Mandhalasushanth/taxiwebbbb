import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { DirectorCard } from '../../components'
import { StepActionBar } from '@shared/components'
import { useAppStore } from '@store/index'
import { useIncorporationFlow } from '../../hooks'
import {
  isValidDin,
} from '../../utils/validation'
import {
  validateName,
  isValidName,
  validatePan,
  validateEmail,
  validateMobileNumber,
  validateDobSignatory,
} from '@shared/utils/validationUtils'
import { getEntityStructureLabel, type DirectorDetails } from '../../types/incorporation.types'
import './PromoterDetails.css'

const validateSingleDirectorField = (field: keyof DirectorDetails, value: unknown): string | undefined => {
  const str = String(value || '').trim()
  switch (field) {
    case 'fullName':
      if (!str) return 'Name is required'
      return validateName(str, 'Name') || undefined
    case 'pan':
      if (!str) return 'PAN is required'
      return validatePan(str, 'PAN') || undefined
    case 'din':
      return str && !isValidDin(str) ? 'Enter a valid 8-digit DIN' : undefined
    case 'dob':
      if (!str) return 'Date of birth is required'
      return validateDobSignatory(str) || undefined
    case 'designation':
      if (!str) return 'Designation is required'
      return !isValidName(str) ? 'Enter a valid designation (letters only)' : undefined
    case 'email':
      if (!str) return 'Email address is required'
      return validateEmail(str, 'Email address') || undefined
    case 'mobile':
      if (!str) return 'Mobile number is required'
      return validateMobileNumber(str, 'Mobile number') || undefined
    default:
      return undefined
  }
}

export const PromoterDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const companyType = formData.companyType || 'pvt_ltd'
  const minDirectors = 2

  const directors: DirectorDetails[] = formData.promoters || []
  const pushToast = useAppStore((state) => state.pushToast)
  const [minDirectorsWarning, setMinDirectorsWarning] = useState<string>('')
  const [directorErrors, setDirectorErrors] = useState<Record<number, Record<string, string>>>({})

  const handleDirectorChange = (id: number, field: keyof DirectorDetails, value: DirectorDetails[keyof DirectorDetails]) => {
    const updated = directors.map((d: DirectorDetails) => (d.id === id ? { ...d, [field]: value } : d))
    updateFormData({ promoters: updated })

    // Auto-validate dob live or update existing error
    setDirectorErrors((prev) => {
      const cur = prev[id] || {}
      if (field === 'dob' || cur[field]) {
        const err = validateSingleDirectorField(field, value)
        const copy = { ...cur }
        if (err) {
          copy[field] = err
        } else {
          delete copy[field]
        }
        return { ...prev, [id]: copy }
      }
      return prev
    })
  }

  const handleDirectorBlur = (id: number, field: keyof DirectorDetails) => {
    const director = directors.find((d) => d.id === id)
    if (!director) return
    const err = validateSingleDirectorField(field, director[field])
    setDirectorErrors((prev) => {
      const cur = prev[id] || {}
      if (err) {
        return { ...prev, [id]: { ...cur, [field]: err } }
      }
      if (cur[field]) {
        const copy = { ...cur }
        delete copy[field]
        return { ...prev, [id]: copy }
      }
      return prev
    })
  }

  const handleAddDirector = () => {
    const nextId = directors.length > 0 ? Math.max(...directors.map((d) => d.id)) + 1 : 1
    const newDirector: DirectorDetails = {
      id: nextId,
      fullName: '',
      pan: '',
      din: '',
      dob: '',
      fatherName: '',
      gender: '',
      nationality: 'Indian',
      designation: '',
      category: 'Director',
      email: '',
      mobile: '',
      isResident: true,
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      isSameAddress: true,
      equityShares: '',
      equityAmount: '',
      shareholdingPercent: '',
    }
    const updated = [...directors, newDirector]
    updateFormData({ promoters: updated })
    if (updated.length >= minDirectors) {
      setMinDirectorsWarning('')
    }
  }

  const handleSaveDirector = (id: number) => {
    setDirectorErrors((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    const director = directors.find((d) => d.id === id)
    pushToast(`Changes saved for ${director?.fullName || `Director #${id}`}`, 'success')
  }

  const handleCancelDirector = (id: number) => {
    setDirectorErrors((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    const updated = directors.filter((d: DirectorDetails) => d.id !== id)
    updateFormData({ promoters: updated })
  }

  const handleContinue = () => {
    let minWarning = ''
    if (directors.length < minDirectors) {
      minWarning = `At least ${minDirectors} promoter/director(s) required for ${getEntityStructureLabel(companyType)}.`
    }
    setMinDirectorsWarning(minWarning)

    const allErrors = directors.reduce<Record<number, Record<string, string>>>((acc, d) => {
      const dErrors: Record<string, string> = {}
      const nameErr = validateSingleDirectorField('fullName', d.fullName)
      if (nameErr) dErrors.fullName = nameErr

      const panErr = validateSingleDirectorField('pan', d.pan)
      if (panErr) dErrors.pan = panErr

      const dinErr = validateSingleDirectorField('din', d.din)
      if (dinErr) dErrors.din = dinErr

      const dobErr = validateSingleDirectorField('dob', d.dob)
      if (dobErr) dErrors.dob = dobErr

      const desErr = validateSingleDirectorField('designation', d.designation)
      if (desErr) dErrors.designation = desErr

      const emailErr = validateSingleDirectorField('email', d.email)
      if (emailErr) dErrors.email = emailErr

      const mobErr = validateSingleDirectorField('mobile', d.mobile)
      if (mobErr) dErrors.mobile = mobErr

      if (Object.keys(dErrors).length > 0) {
        acc[d.id] = dErrors
      }
      return acc
    }, {})

    const hasAnyError = Object.keys(allErrors).length > 0
    setDirectorErrors(allErrors)

    if (minWarning || hasAnyError) {
      return
    }

    goToStep(routePaths.incorporation.capitalDetails)
  }

  const handleBack = () => {
    goToStep(routePaths.incorporation.registeredOffice)
  }

  return (
    <div className="promoter-details-page">
      <div className="promoter-details-header">
        <h1 className="promoter-details-header__title">Promoter / Director Details</h1>
        <p className="promoter-details-header__subtitle">
          Add directors and promoters as required for {getEntityStructureLabel(companyType)} (Minimum {minDirectors} required).
        </p>
      </div>

      {minDirectorsWarning && (
        <p className="promoter-details-min-warning" role="alert">
          {minDirectorsWarning}
        </p>
      )}

      {/* Director Cards List */}
      <main className="promoter-details-list">
        {directors.map((director: DirectorDetails, idx: number) => (
          <DirectorCard
            key={director.id}
            director={director}
            index={idx}
            onChange={handleDirectorChange}
            onBlur={handleDirectorBlur}
            onSave={handleSaveDirector}
            onCancel={handleCancelDirector}
            errors={directorErrors[director.id]}
          />
        ))}

        {/* Add Director Button */}
        <button
          type="button"
          className="promoter-details-btn-add"
          onClick={handleAddDirector}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          + Add Promoter / Director
        </button>
      </main>

      {/* Step Action Bar */}
      <StepActionBar
        onBack={handleBack}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default PromoterDetails
