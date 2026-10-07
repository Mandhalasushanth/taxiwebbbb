import React, { useState, useEffect } from 'react'
import { routePaths } from '@core/config'
import { defaultCompanyDetails } from '../../data/companyRegistrationData'
import type { CompanyDetailsFormData, CompanyEntityType } from '../../types/incorporation.types'
import { filterDigits, isValidNicCode } from '../../utils/validation'
import { StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import './CompanyDetails.css'

export const CompanyDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  
  const selectedCompanyType = formData.companyType || 'pvt_ltd'
  const companyDetails = formData.companyDetails || {}

  const [errors, setErrors] = useState<Record<string, string>>({})

  const getSuffix = (type: CompanyEntityType) => {
    if (type === 'public_ltd') return 'Legal Suffix: Limited'
    if (type === 'opc') return 'Legal Suffix: (OPC) Private Limited'
    if (type === 'section_8') return 'Legal Suffix: Foundation / Section 8'
    return 'Legal Suffix: Private Limited'
  }

  // Fallback defaults merged with draft
  const currentData: CompanyDetailsFormData = {
    ...defaultCompanyDetails,
    ...companyDetails,
    companyType: selectedCompanyType,
    mandatorySuffix: getSuffix(selectedCompanyType)
  }

  useEffect(() => {
    if (currentData.mandatorySuffix !== companyDetails.mandatorySuffix || currentData.companyType !== companyDetails.companyType) {
      updateFormData({
        companyDetails: { ...companyDetails, ...currentData }
      })
    }
  }, [selectedCompanyType])

  const classOptions = selectedCompanyType === 'public_ltd' ? ['Public'] : selectedCompanyType === 'section_8' ? ['Private', 'Public'] : ['Private']
  const categoryOptions = selectedCompanyType === 'opc' ? ['Company limited by Shares'] : selectedCompanyType === 'section_8' ? ['Company limited by Guarantee', 'Company limited by Shares'] : ['Company limited by Shares', 'Company limited by Guarantee', 'Unlimited Company']
  const subCategoryOptions = selectedCompanyType === 'opc' ? ['Indian Non-Government Company'] : ['Indian Non-Government Company', 'State Government Company', 'Central Government Company']
  const showNicCode = selectedCompanyType === 'opc' || selectedCompanyType === 'section_8'

  const handleInputChange = (field: keyof CompanyDetailsFormData, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    let finalValue = value
    if (field === 'nicCode') {
      finalValue = filterDigits(value, 5)
    }
    updateFormData({
      companyDetails: { ...companyDetails, [field]: finalValue }
    })
  }

  const renderChipGroup = (
    label: string,
    field: 'classOfCompany' | 'categoryOfCompany' | 'subCategoryOfCompany',
    options: string[]
  ) => (
    <div className="company-details-group">
      <label className="company-details-label">
        {label}<span className="company-details-required"> *</span>
      </label>
      <div className={`company-details-chips ${errors[field] ? 'company-chips--error' : ''}`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`company-details-chip ${currentData[field] === opt ? 'company-details-chip--active' : ''}`}
            onClick={() => handleInputChange(field, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {errors[field] && <span className="company-field-error">{errors[field]}</span>}
    </div>
  )

  const handleContinue = () => {
    const newErrors: Record<string, string> = {}
    if (!currentData.classOfCompany) newErrors.classOfCompany = 'Class of company is required'
    if (!currentData.categoryOfCompany) newErrors.categoryOfCompany = 'Category of company is required'
    if (!currentData.subCategoryOfCompany) newErrors.subCategoryOfCompany = 'Sub-category of company is required'
    if (!(currentData.primaryBusinessActivity || '').trim()) newErrors.primaryBusinessActivity = 'Primary business activity is required'
    if (showNicCode) {
      if (!(currentData.nicCode || '').trim()) {
        newErrors.nicCode = 'NIC 5-digit code is required'
      } else if (!isValidNicCode(currentData.nicCode)) {
        newErrors.nicCode = 'Enter a valid 5-digit numeric NIC code'
      }
    }
    if (!(currentData.firstPreferredName || '').trim()) newErrors.firstPreferredName = 'First preferred name is required'
    if (!(currentData.secondPreferredName || '').trim()) newErrors.secondPreferredName = 'Second preferred name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    goToStep(routePaths.incorporation.registeredOffice)
  }

  return (
    <div className="company-details-page">
      {/* Step Progress Bar */}
      <div className="company-details-stepbar">
        <span className="company-details-stepbar__badge">Step 2 of 11</span>
        <div className="company-details-stepbar__line">
          <div className="company-details-stepbar__line-fill" />
        </div>
      </div>

      {/* Section 1: Company Classification */}
      <section className="company-details-section">
        <div className="company-details-section__header">
          <h1 className="company-details-section__title">Company Classification</h1>
          <p className="company-details-section__subtitle">
            Specify MCA statutory classification details for incorporation filing.
          </p>
        </div>

        {renderChipGroup('Class of Company', 'classOfCompany', classOptions)}
        {renderChipGroup('Category of Company', 'categoryOfCompany', categoryOptions)}
        {renderChipGroup('Sub-Category of Company', 'subCategoryOfCompany', subCategoryOptions)}

        {/* Info Callout */}
        <div className="company-details-info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Standard commercial startups default to Indian Non-Government Company limited by shares.</span>
        </div>
      </section>

      {/* Section 2: Business Activity / NIC */}
      <section className="company-details-section">
        <div className="company-details-section__header">
          <h2 className="company-details-section__title">Business Activity / NIC</h2>
          <p className="company-details-section__subtitle">
            Define the main objective and National Industrial Classification code of your company.
          </p>
        </div>

        <div className="company-details-group">
          <label className="company-details-label">
            Primary Business Activity<span className="company-details-required"> *</span>
          </label>
          <input
            type="text"
            className={`company-details-input ${errors.primaryBusinessActivity ? 'company-input--error' : ''}`}
            placeholder="Enter primary business activity"
            value={currentData.primaryBusinessActivity}
            onChange={(e) => handleInputChange('primaryBusinessActivity', e.target.value)}
          />
          {errors.primaryBusinessActivity && <span className="company-field-error">{errors.primaryBusinessActivity}</span>}
          <p className="company-details-helper">Used for Main Objects in MoA Memorandum of Association.</p>
        </div>

        {showNicCode && (
          <div className="company-details-group">
            <label className="company-details-label">
              NIC 5-Digit Code<span className="company-details-required"> *</span>
            </label>
            <input
              type="text"
              className={`company-details-input ${errors.nicCode ? 'company-input--error' : ''}`}
              placeholder="Enter 5-digit NIC code"
              value={currentData.nicCode}
              onChange={(e) => handleInputChange('nicCode', e.target.value)}
            />
            {errors.nicCode && <span className="company-field-error">{errors.nicCode}</span>}
            <p className="company-details-helper">National Industrial Classification code (e.g. 62011 for software development).</p>
          </div>
        )}

        <div className="company-details-group">
          <label className="company-details-label">Secondary Business Activity (Optional)</label>
          <input
            type="text"
            className="company-details-input"
            placeholder="Enter secondary business activity (Optional)"
            value={currentData.secondaryBusinessActivity}
            onChange={(e) => handleInputChange('secondaryBusinessActivity', e.target.value)}
          />
        </div>
      </section>

      {/* Section 3: Proposed Company Names */}
      <section className="company-details-section">
        <div className="company-details-section__header">
          <h2 className="company-details-section__title">Proposed Company Names</h2>
          <p className="company-details-section__subtitle">
            Provide up to 2 preferred names for SPICe+ Part A name reservation / incorporation.
          </p>
        </div>

        <div className="company-details-group">
          <label className="company-details-label">
            First Preferred Name<span className="company-details-required"> *</span>
          </label>
          <input
            type="text"
            className={`company-details-input ${errors.firstPreferredName ? 'company-input--error' : ''}`}
            placeholder="Enter first preferred company name"
            value={currentData.firstPreferredName}
            onChange={(e) => handleInputChange('firstPreferredName', e.target.value)}
          />
          {errors.firstPreferredName && <span className="company-field-error">{errors.firstPreferredName}</span>}
        </div>

        <div className="company-details-group">
          <label className="company-details-label">
            Second Preferred Name<span className="company-details-required"> *</span>
          </label>
          <input
            type="text"
            className={`company-details-input ${errors.secondPreferredName ? 'company-input--error' : ''}`}
            placeholder="Enter second preferred company name"
            value={currentData.secondPreferredName}
            onChange={(e) => handleInputChange('secondPreferredName', e.target.value)}
          />
          {errors.secondPreferredName && <span className="company-field-error">{errors.secondPreferredName}</span>}
        </div>

        {/* Mandatory Suffix */}
        <div className="company-details-group">
          <label className="company-details-label">Mandatory Suffix</label>
          <span className="company-details-suffix-badge">{currentData.mandatorySuffix}</span>
        </div>

        {/* Preliminary Name Check */}
        <div className="company-details-success-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="20" height="20" className="company-details-success-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <h3 className="company-details-success-box__title">Preliminary Name Check</h3>
            <p className="company-details-success-box__desc">
              Preliminary name check passed — final approval is subject to MCA name availability and applicable naming/trademark rules.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => goToStep(routePaths.incorporation.selectType)}
        onNext={handleContinue}
        isEditMode={reviewEdit.isEditMode}
        onSaveDraft={draft.openDraftModal}
        nextLabel="Continue"
      />
    </div>
  )
}

export default CompanyDetails
