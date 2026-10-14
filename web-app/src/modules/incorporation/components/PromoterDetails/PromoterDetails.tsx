import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { DirectorCard } from '../../components'
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
import { getEntityStructureLabel, type DirectorDetails } from '../../types/incorporation.types'
import './PromoterDetails.css'

export const PromoterDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  const companyType = formData.companyType || 'pvt_ltd'
  const minDirectors = 2

  const directors: DirectorDetails[] = formData.promoters || []
  const pushToast = useAppStore((state) => state.pushToast)
  const [minDirectorsWarning, setMinDirectorsWarning] = useState<string>('')
  const [directorErrors, setDirectorErrors] = useState<Record<number, Record<string, string>>>({})

  const handleDirectorChange = (id: number, field: keyof DirectorDetails, value: DirectorDetails[keyof DirectorDetails]) => {
    setDirectorErrors((prev) => {
      const cur = prev[id]
      if (!cur || !cur[field]) return prev
      const copy = { ...cur }
      delete copy[field]
      return { ...prev, [id]: copy }
    })
    const updated = directors.map((d: DirectorDetails) => (d.id === id ? { ...d, [field]: value } : d))
    updateFormData({ promoters: updated })
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

    if (minWarning || hasAnyError) {
      return
    }

    setMinDirectorsWarning('')
    setDirectorErrors({})
    goToStep(routePaths.incorporation.capitalDetails)
  }

  return (
    <div className="promoter-details-page">
      {minDirectorsWarning && (
        <p className="promoter-details-min-warning">
          {minDirectorsWarning}
        </p>
      )}

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
