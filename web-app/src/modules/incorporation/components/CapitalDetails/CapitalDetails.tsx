import React, { useState, useMemo } from 'react'
import { routePaths } from '@core/config'
import { filterDigits, isPositiveNumber } from '../../utils/validation'
import { computeCapitalSummary } from '../../utils/capitalCalculations'
import { StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import type { DirectorDetails } from '../../types/incorporation.types'
import './CapitalDetails.css'

export const CapitalDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()

  // Authoritative form data from IncorporationContext - single source of truth
  const rawDirectors: DirectorDetails[] = formData.promoters || []
  const authorisedCapital = formData.capitalDetails?.authorisedCapital || ''
  const faceValue = formData.capitalDetails?.faceValue || ''

  // Build reactive shares map directly from promoters in formData
  const directorShares = useMemo(() => {
    const map: Record<number, string> = {}
    rawDirectors.forEach((d) => {
      map[d.id] = d.equityShares ? String(d.equityShares) : ''
    })
    return map
  }, [rawDirectors])

  const directorIds = useMemo(() => rawDirectors.map((d) => d.id), [rawDirectors])

  // Derive all calculations dynamically in real time
  const summary = useMemo(() => {
    return computeCapitalSummary(authorisedCapital, faceValue, directorShares, directorIds)
  }, [authorisedCapital, faceValue, directorShares, directorIds])

  const shareholderMap = useMemo(() => {
    const map = new Map<number, (typeof summary.shareholders)[number]>()
    summary.shareholders.forEach((sh) => map.set(sh.id, sh))
    return map
  }, [summary.shareholders])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAuthorisedCapitalChange = (val: string) => {
    const filtered = filterDigits(val)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.authorisedCapital
      delete copy.subscribedCapital
      return copy
    })

    const nextSummary = computeCapitalSummary(filtered, faceValue, directorShares, directorIds)
    const updatedPromoters = rawDirectors.map((d) => {
      const calc = nextSummary.shareholders.find((sh) => sh.id === d.id)
      return {
        ...d,
        equityAmount: String(calc?.amount || 0),
        shareholdingPercent: calc?.percentageFormatted || '--',
      }
    })

    updateFormData({
      capitalDetails: {
        ...formData.capitalDetails,
        authorisedCapital: filtered,
        totalShares:
          nextSummary.isAuthorisedDivisible && nextSummary.authorisedShares !== null
            ? String(nextSummary.authorisedShares)
            : '',
        subscribedCapital: String(nextSummary.subscribedCapital),
      },
      promoters: updatedPromoters,
    })
  }

  const handleFaceValueChange = (val: string) => {
    const filtered = filterDigits(val)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.faceValue
      delete copy.authorisedCapital
      delete copy.subscribedCapital
      return copy
    })

    const nextSummary = computeCapitalSummary(authorisedCapital, filtered, directorShares, directorIds)
    const updatedPromoters = rawDirectors.map((d) => {
      const calc = nextSummary.shareholders.find((sh) => sh.id === d.id)
      return {
        ...d,
        equityAmount: String(calc?.amount || 0),
        shareholdingPercent: calc?.percentageFormatted || '--',
      }
    })

    updateFormData({
      capitalDetails: {
        ...formData.capitalDetails,
        faceValue: filtered,
        totalShares:
          nextSummary.isAuthorisedDivisible && nextSummary.authorisedShares !== null
            ? String(nextSummary.authorisedShares)
            : '',
        subscribedCapital: String(nextSummary.subscribedCapital),
      },
      promoters: updatedPromoters,
    })
  }

  const handleDirectorShareChange = (id: number, val: string) => {
    const filtered = filterDigits(val)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy[`director_${id}`]
      delete copy.sharesAllocation
      delete copy.subscribedCapital
      return copy
    })

    const nextSharesMap = { ...directorShares, [id]: filtered }
    const nextSummary = computeCapitalSummary(authorisedCapital, faceValue, nextSharesMap, directorIds)
    const updatedPromoters = rawDirectors.map((d) => {
      const calc = nextSummary.shareholders.find((sh) => sh.id === d.id)
      return {
        ...d,
        equityShares: d.id === id ? filtered : d.equityShares || '',
        equityAmount: String(calc?.amount || 0),
        shareholdingPercent: calc?.percentageFormatted || '--',
      }
    })

    updateFormData({
      capitalDetails: {
        ...formData.capitalDetails,
        subscribedCapital: String(nextSummary.subscribedCapital),
      },
      promoters: updatedPromoters,
    })
  }

  const handleContinue = () => {
    const newErrors: Record<string, string> = {}

    if (!authorisedCapital.trim()) {
      newErrors.authorisedCapital = 'Authorised capital is required'
    } else if (!isPositiveNumber(authorisedCapital)) {
      newErrors.authorisedCapital = 'Authorised capital must be greater than 0'
    } else if (!summary.isAuthorisedDivisible) {
      newErrors.authorisedCapital = 'Authorised capital must be a multiple of face value per share'
    }

    if (!faceValue.trim()) {
      newErrors.faceValue = 'Face value per share is required'
    } else if (!isPositiveNumber(faceValue)) {
      newErrors.faceValue = 'Face value must be greater than 0'
    }

    if (rawDirectors.length > 0) {
      if (summary.totalSubscribedShares === 0) {
        newErrors.sharesAllocation = 'Please allocate shares to promoters'
      }
      rawDirectors.forEach((d) => {
        const dShares = directorShares[d.id] || ''
        if (!dShares.trim() || Number(dShares) <= 0) {
          newErrors[`director_${d.id}`] = 'Allocated shares are required'
        }
      })
    }

    if (summary.authorisedCapital > 0 && summary.subscribedCapital > summary.authorisedCapital) {
      newErrors.subscribedCapital = 'Subscribed capital cannot exceed authorised capital'
    }

    if (summary.authorisedShares !== null && summary.totalSubscribedShares > summary.authorisedShares) {
      newErrors.sharesAllocation = 'Total allocated shares cannot exceed authorised shares'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    goToStep(routePaths.incorporation.documentsKyc)
  }

  // Active validation errors for real-time responsiveness
  const activeAuthCapError =
    errors.authorisedCapital ||
    (authorisedCapital && faceValue && !summary.isAuthorisedDivisible
      ? summary.authorisedSharesError
      : '')

  const activeFaceValueError =
    errors.faceValue ||
    (faceValue !== '' && summary.faceValue === 0
      ? 'Face value must be greater than 0'
      : '')

  return (
    <div className="capital-details-page">
      {/* Card 1: Capital Details */}
      <section className="capital-details-card">
        <div className="capital-details-card__header">
          <h2 className="capital-details-card__title">Capital Details</h2>
          <p className="capital-details-card__subtitle">
            Define authorized capital, face value, and view derived subscribed capital.
          </p>
        </div>

        <div className="capital-details-grid">
          {/* Authorised Capital */}
          <div className="capital-details-group">
            <label className="capital-details-label">
              Authorised Capital (₹) <span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${activeAuthCapError ? 'capital-details-input--error' : ''}`}
              placeholder="e.g. 100000"
              value={authorisedCapital}
              onChange={(e) => handleAuthorisedCapitalChange(e.target.value)}
            />
            {activeAuthCapError && <span className="capital-field-error">{activeAuthCapError}</span>}
          </div>

          {/* Face Value per Share */}
          <div className="capital-details-group">
            <label className="capital-details-label">
              Face Value per Share (₹) <span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${activeFaceValueError ? 'capital-details-input--error' : ''}`}
              placeholder="e.g. 10"
              value={faceValue}
              onChange={(e) => handleFaceValueChange(e.target.value)}
            />
            {activeFaceValueError && <span className="capital-field-error">{activeFaceValueError}</span>}
          </div>

          {/* Authorised Shares (Calculated) */}
          <div className="capital-details-group">
            <label className="capital-details-label">Authorised Shares (Calculated)</label>
            <div
              className={`capital-details-calc-box ${
                summary.authorisedShares === null
                  ? 'capital-details-calc-box--empty'
                  : !summary.isAuthorisedDivisible
                    ? 'capital-details-calc-box--error'
                    : ''
              }`}
            >
              {summary.displayAuthorisedShares}
            </div>
          </div>

          {/* Subscribed Capital (Calculated) */}
          <div className="capital-details-group">
            <label className="capital-details-label">Subscribed Capital (Calculated)</label>
            <div className="capital-details-calc-box">
              {summary.displaySubscribedCapital}
            </div>
          </div>
        </div>
      </section>

      {/* Card 2: Shareholding Pattern */}
      <section className="capital-details-card">
        <div className="capital-details-card__header">
          <h2 className="capital-details-card__title">Shareholding Pattern</h2>
        </div>

        {/* Directors Allocation Cards */}
        <div className="capital-details-pattern-list">
          {rawDirectors.map((director, idx) => {
            const calc = shareholderMap.get(director.id)
            const dirError = errors[`director_${director.id}`]

            return (
              <div key={director.id || idx} className="capital-details-alloc-card">
                <div className="capital-details-alloc-header">
                  <div className="capital-details-alloc-meta">
                    <h3 className="capital-details-alloc-name">{director.fullName || `Director #${idx + 1}`}</h3>
                    <p className="capital-details-alloc-sub">
                      PAN: {director.pan || '—'} · Subscribed Amount: {calc?.displayAmount || '₹0'}
                    </p>
                  </div>
                  <div className="capital-details-alloc-badge">
                    {calc?.percentageFormatted || '--'}
                  </div>
                </div>

                <div className="capital-details-alloc-grid">
                  <div className="capital-details-group">
                    <label className="capital-details-label">
                      Allocated Shares <span className="capital-details-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`capital-details-input ${dirError ? 'capital-details-input--error' : ''}`}
                      placeholder="Enter shares"
                      value={directorShares[director.id] || ''}
                      onChange={(e) => handleDirectorShareChange(director.id, e.target.value)}
                    />
                    {dirError && <span className="capital-field-error">{dirError}</span>}
                  </div>

                  <div className="capital-details-group">
                    <label className="capital-details-label">Amount (Calculated)</label>
                    <div className="capital-details-calc-box">
                      {calc?.displayAmount || '₹0'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {rawDirectors.length === 0 && (
            <div className="capital-details-empty-notice">
              No directors added yet. Please add directors in Step 3.
            </div>
          )}
        </div>

        {/* Global shares allocation error if any */}
        {errors.sharesAllocation && (
          <div className="capital-field-error" style={{ fontSize: '0.85rem' }}>
            {errors.sharesAllocation}
          </div>
        )}

        {/* Orange Summary Banner */}
        <div className="capital-details-orange-summary">
          <div className="capital-details-summary-row">
            <span>Total Subscribed Shares</span>
            <span className="capital-details-summary-val">{summary.totalSubscribedShares.toLocaleString('en-IN')}</span>
          </div>
          <div className="capital-details-summary-row">
            <span>Total Share Allocation</span>
            <span className="capital-details-summary-val">
              {summary.totalSubscribedShares > 0 ? '100%' : '--'}
            </span>
          </div>
        </div>

        {/* Validation Status Box */}
        <div
          className={`capital-details-validation-box ${
            summary.isAllPassed
              ? 'capital-details-validation-box--passed'
              : 'capital-details-validation-box--failed'
          }`}
        >
          <div className="capital-details-validation-icon">
            {summary.isAllPassed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div className="capital-details-validation-content">
            <span>
              Subscribed Capital ≤ Authorised Capital:{' '}
              {summary.capitalCheckPassed ? 'PASSED' : 'FAILED (Subscribed exceeds Authorised)'}
            </span>
            <span>
              Total Share Allocation:{' '}
              {summary.allocationCheckPassed ? 'PASSED (100% Allocated)' : 'FAILED (No shares allocated yet)'}
            </span>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => goToStep(routePaths.incorporation.promoterDetails)}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default CapitalDetails
