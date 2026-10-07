import React, { useState } from 'react'
import { routePaths } from '@core/config'
import { filterDigits, isPositiveNumber } from '../../utils/validation'
import { StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import './CapitalDetails.css'

export const CapitalDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()

  const companyType = formData.companyType || 'pvt_ltd'
  const isOpc = companyType === 'opc'

  const capital: {
    authorisedCapital: string
    subscribedCapital: string
    totalShares: string
    faceValue: string
  } = {
    authorisedCapital: formData.capitalDetails?.authorisedCapital || '',
    subscribedCapital: formData.capitalDetails?.subscribedCapital || '',
    totalShares: formData.capitalDetails?.totalShares || '',
    faceValue: formData.capitalDetails?.faceValue || '',
  }


  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, val: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    updateFormData({ capitalDetails: { ...capital, [field]: filterDigits(val) } })
  }

  const handleContinue = () => {
    const newErrors: Record<string, string> = {}
    if (!(capital.authorisedCapital || '').trim()) {
      newErrors.authorisedCapital = 'Authorised capital is required'
    } else if (!isPositiveNumber(capital.authorisedCapital)) {
      newErrors.authorisedCapital = 'Authorised capital must be greater than 0'
    }

    if (!(capital.subscribedCapital || '').trim()) {
      newErrors.subscribedCapital = 'Subscribed capital is required'
    } else if (!isPositiveNumber(capital.subscribedCapital)) {
      newErrors.subscribedCapital = 'Subscribed capital must be greater than 0'
    } else if (Number(capital.subscribedCapital) > Number(capital.authorisedCapital)) {
      newErrors.subscribedCapital = 'Subscribed capital cannot exceed authorised capital'
    }

    if (!(capital.totalShares || '').trim()) {
      newErrors.totalShares = 'Total number of shares is required'
    } else if (!isPositiveNumber(capital.totalShares)) {
      newErrors.totalShares = 'Total shares must be greater than 0'
    }

    if (!(capital.faceValue || '').trim()) {
      newErrors.faceValue = 'Face value per share is required'
    } else if (!isPositiveNumber(capital.faceValue)) {
      newErrors.faceValue = 'Face value must be greater than 0'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    goToStep(routePaths.incorporation.documentsKyc)
  }

  return (
    <div className="capital-details-page">
      {/* Step Progress Bar */}
      <div className="capital-details-stepbar">
        <span className="capital-details-stepbar__badge">Step 5 of 11</span>
        <span className="capital-details-stepbar__text">Shareholding & Capital</span>
        <div className="capital-details-stepbar__line">
          <div className="capital-details-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <header className="capital-details-header">
        <h1 className="capital-details-header__title">Shareholding & Capital</h1>
        <p className="capital-details-header__subtitle">
          Define authorized capital, subscribed capital, and equity share allocation.
        </p>
      </header>

      {/* Card 1: Capital Details */}
      <section className="capital-details-card">
        <div className="capital-details-card__header">
          <h2 className="capital-details-card__title">Capital Details</h2>
          <p className="capital-details-card__subtitle">
            Define authorized capital, subscribed capital, and equity share allocation.
          </p>
        </div>

        <div className="capital-details-grid">
          <div className="capital-details-group">
            <label className="capital-details-label">
              Authorised Capital (₹)<span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${errors.authorisedCapital ? 'capital-details-input--error' : ''}`}
              placeholder="Enter authorised capital (₹)"
              value={capital.authorisedCapital}
              onChange={(e) => handleChange('authorisedCapital', e.target.value)}
            />
            {errors.authorisedCapital && <span className="capital-field-error">{errors.authorisedCapital}</span>}
          </div>

          <div className="capital-details-group">
            <label className="capital-details-label">
              Subscribed Capital (₹)<span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${errors.subscribedCapital ? 'capital-details-input--error' : ''}`}
              placeholder="Enter subscribed capital (₹)"
              value={capital.subscribedCapital}
              onChange={(e) => handleChange('subscribedCapital', e.target.value)}
            />
            {errors.subscribedCapital && <span className="capital-field-error">{errors.subscribedCapital}</span>}
          </div>

          <div className="capital-details-group">
            <label className="capital-details-label">
              Total Number of Shares<span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${errors.totalShares ? 'capital-details-input--error' : ''}`}
              placeholder="Enter total number of shares"
              value={capital.totalShares}
              onChange={(e) => handleChange('totalShares', e.target.value)}
            />
            {errors.totalShares && <span className="capital-field-error">{errors.totalShares}</span>}
          </div>

          <div className="capital-details-group">
            <label className="capital-details-label">
              Face Value per Share (₹)<span className="capital-details-required">*</span>
            </label>
            <input
              type="text"
              className={`capital-details-input ${errors.faceValue ? 'capital-details-input--error' : ''}`}
              placeholder="Enter face value per share (₹)"
              value={capital.faceValue}
              onChange={(e) => handleChange('faceValue', e.target.value)}
            />
            {errors.faceValue && <span className="capital-field-error">{errors.faceValue}</span>}
          </div>
        </div>
      </section>

      {/* Card 2: Shareholding Pattern */}
      <section className="capital-details-card">
        <div className="capital-details-card__header">
          <h2 className="capital-details-card__title">Shareholding Pattern</h2>
        </div>

        {/* OPC Shareholding Allocation Notice */}
        {isOpc && (
          <div className="capital-details-opc-info">
            In a One Person Company (OPC), 100% equity shareholding is automatically allocated to the single member.
          </div>
        )}

        <div className="capital-details-pattern-list">
          {((formData.promoters as any[]) || [])
            .filter((d: any) => d.fullName && Number(d.equityShares || 0) > 0)
            .map((sh: any, idx: number) => (
              <div key={sh.id || idx} className="capital-details-shareholder-row">
                <div className="capital-details-shareholder-info">
                  <span className="capital-details-shareholder-name">{sh.fullName}</span>
                  <span className="capital-details-shareholder-sub">
                    PAN: {sh.pan || 'N/A'} · Shares: {Number(sh.equityShares || 0).toLocaleString()}
                  </span>
                </div>
                <span className="capital-details-shareholder-badge">{sh.shareholdingPercent || '100%'}</span>
              </div>
            ))}
          {((formData.promoters as any[]) || []).filter((d: any) => d.fullName && Number(d.equityShares || 0) > 0).length === 0 && (
            <div className="capital-details-empty-notice">
              No director equity shares allocated yet. Shares will be allocated based on subscribed capital.
            </div>
          )}
        </div>

        {/* Navy Summary Card */}
        <div className="capital-details-summary-card">
          <div className="capital-details-summary-row">
            <span>Total Subscribed Shares</span>
            <span className="capital-details-summary-val">{capital.totalShares ? Number(capital.totalShares).toLocaleString() : '0'}</span>
          </div>
          <div className="capital-details-summary-row">
            <span>Total Share Allocation</span>
            <span className="capital-details-summary-val">
              {Number(capital.subscribedCapital || 0) > 0 && Number(capital.authorisedCapital || 0) >= Number(capital.subscribedCapital || 0) ? '100%' : '0%'}
            </span>
          </div>
        </div>

        {/* Validation Box */}
        <div className="capital-details-passed-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <div className="capital-details-passed-content">
            <span>
              Subscribed Capital ⩽ Authorised Capital:{' '}
              {Number(capital.subscribedCapital || 0) > 0 && Number(capital.authorisedCapital || 0) >= Number(capital.subscribedCapital || 0)
                ? 'PASSED'
                : 'PENDING'}
            </span>
            <span>
              Total Share Allocation:{' '}
              {Number(capital.totalShares || 0) > 0 ? '100% (CONFIGURED)' : 'PENDING'}
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
