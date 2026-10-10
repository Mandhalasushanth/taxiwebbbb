import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { DirectorCard } from '../../components'
import { defaultDirectors } from '../../data/companyRegistrationData'
import { StepActionBar } from '@shared/components'
import { useAppStore } from '@store/index'
import { useIncorporationFlow } from '../../hooks'
import {
  isValidPan,
  isValidDin,
  isValidEmail,
  isValidMobile,
  isValidName,
} from '../../utils/validation'
import { validateDobSignatory } from '@shared/utils/validationUtils'
import type { DirectorDetails } from '../../types/incorporation.types'
import './PromoterDetails.css'

export const PromoterDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const companyType = formData.companyType || 'pvt_ltd'
  const isOpc = companyType === 'opc'
  const minDirectors = isOpc ? 1 : 2

  const directors: DirectorDetails[] = (formData.promoters && formData.promoters.length > 0) ? formData.promoters : defaultDirectors
  const pushToast = useAppStore((state) => state.pushToast)
  const [error, setError] = useState<string>('')
  const [directorErrors, setDirectorErrors] = useState<Record<number, Record<string, string>>>({})

  const handleDirectorChange = (id: number, field: keyof DirectorDetails, value: DirectorDetails[keyof DirectorDetails]) => {
    setError('')
    setDirectorErrors((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: '' },
    }))
    const updated = directors.map((d: DirectorDetails) => (d.id === id ? { ...d, [field]: value } : d))
    updateFormData({ promoters: updated })
  }

  const handleAddDirector = () => {
    setError('')
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
    updateFormData({ promoters: [...directors, newDirector] })
  }

  const handleSaveDirector = (id: number) => {
    const director = directors.find((d) => d.id === id)
    pushToast(`Changes saved for ${director?.fullName || `Director #${id}`}`, 'success')
  }

  const handleCancelDirector = (id: number) => {
    if (directors.length > 1) {
      setError('')
      setDirectorErrors((prev) => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      const updated = directors.filter((d: DirectorDetails) => d.id !== id)
      updateFormData({ promoters: updated })
    }
  }

  const handleContinue = () => {
    let minDirectorsError = ''
    if (directors.length < minDirectors) {
      minDirectorsError =
        companyType === 'public_ltd'
          ? 'Public Limited Company requires at least 2 directors.'
          : companyType === 'llp'
          ? 'An LLP requires at least 2 designated partners.'
          : isOpc
          ? 'One Person Company requires at least 1 director.'
          : 'A minimum of 2 directors/partners are required.'
    }
    setError(minDirectorsError)

    const allErrors = directors.reduce<Record<number, Record<string, string>>>((acc, d) => {
      const dErrors: Record<string, string> = {}
      if (!(d.fullName || '').trim()) {
        dErrors.fullName = 'Name is required'
      } else if (!isValidName(d.fullName)) {
        dErrors.fullName = 'Enter a valid name (letters only)'
      }
      if (!(d.pan || '').trim()) {
        dErrors.pan = 'PAN is required'
      } else if (!isValidPan(d.pan)) {
        dErrors.pan = 'Enter a valid PAN'
      }
      if (d.din && !isValidDin(d.din)) dErrors.din = 'Enter a valid 8-digit DIN'
      if (!d.dob) {
        dErrors.dob = 'Date of birth is required'
      } else {
        const dobError = validateDobSignatory(d.dob)
        if (dobError) dErrors.dob = dobError
      }
      if (!(d.designation || '').trim()) {
        dErrors.designation = 'Designation is required'
      } else if (!isValidName(d.designation)) {
        dErrors.designation = 'Enter a valid designation (letters only)'
      }
      if (!(d.email || '').trim()) {
        dErrors.email = 'Email address is required'
      } else if (!isValidEmail(d.email)) {
        dErrors.email = 'Enter a valid email address'
      }
      if (!(d.mobile || '').trim()) {
        dErrors.mobile = 'Mobile number is required'
      } else if (!isValidMobile(d.mobile)) {
        dErrors.mobile = 'Enter a valid 10-digit Indian mobile number'
      }

      if (Object.keys(dErrors).length > 0) {
        acc[d.id] = dErrors
      }
      return acc
    }, {})

    const hasAnyError = Object.keys(allErrors).length > 0
    setDirectorErrors(allErrors)

    if (minDirectorsError || hasAnyError) {
      return
    }

    setError('')
    setDirectorErrors({})
    goToStep(routePaths.incorporation.capitalDetails)
  }

  return (
    <div className="promoter-details-page">
      {/* Step Progress Tracker */}
      <div className="promoter-details-stepbar">
        <span className="promoter-details-stepbar__badge">Step 3 of 10</span>
        <span className="promoter-details-stepbar__text">Promoter / Director Details</span>
        <div className="promoter-details-stepbar__line">
          <div className="promoter-details-stepbar__line-fill" />
        </div>
      </div>

      {/* Page Header */}
      <header className="promoter-details-header">
        <h1 className="promoter-details-header__title">Promoter / Director Details</h1>
        <p className="promoter-details-header__subtitle">
          Enter essential details of all promoters/directors for CA processing.
        </p>
      </header>

      {/* Directors List */}
      <main className="promoter-details-list">
        {directors.map((director, index) => (
          <DirectorCard
            key={director.id}
            director={director}
            index={index}
            onChange={handleDirectorChange}
            onSave={handleSaveDirector}
            onCancel={handleCancelDirector}
            errors={directorErrors[director.id]}
          />
        ))}

        {/* Add Director Button: Hidden for One Person Company */}
        {!isOpc && (
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
        )}
      </main>

      {/* Error Alert */}
      {error && (
        <div className="promoter-details-error-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => goToStep(routePaths.incorporation.registeredOffice)}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default PromoterDetails
