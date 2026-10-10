import React, { useState, useEffect } from 'react'
import { routePaths } from '@core/config'
import { defaultCompanyDetails } from '../../data/companyRegistrationData'
import type { CompanyDetailsFormData, CompanyEntityType } from '../../types/incorporation.types'
import { StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import { CompanyNameActivityCards, getNameActivityErrors, normalizeNameActivityValue } from './CompanyNameActivityCards'
import './CompanyDetails.css'

const getSuffix = (type: CompanyEntityType) => {
  if (type === 'public_ltd') return 'Legal Suffix: Limited'
  if (type === 'opc') return 'Legal Suffix: (OPC) Private Limited'
  if (type === 'llp') return 'Legal Suffix: LLP'
  if (type === 'section_8') return 'Legal Suffix: Foundation / Section 8'
  return 'Legal Suffix: Private Limited'
}

export const CompanyDetails: React.FC = () => {
  const { formData, updateFormData, draft, reviewEdit, goToStep } = useIncorporationFlow()
  
  const selectedCompanyType = formData.companyType || 'pvt_ltd'
  const companyDetails = formData.companyDetails || {}

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fallback defaults merged with draft
  const currentData: CompanyDetailsFormData = {
    ...defaultCompanyDetails,
    ...companyDetails,
    companyType: selectedCompanyType,
    mandatorySuffix: getSuffix(selectedCompanyType)
  }

  // Keep the draft's company type and legal suffix in sync with the type picked in step 1
  const savedCompanyDetails = formData.companyDetails
  useEffect(() => {
    const saved = savedCompanyDetails || {}
    const mandatorySuffix = getSuffix(selectedCompanyType)
    if (mandatorySuffix !== saved.mandatorySuffix || selectedCompanyType !== saved.companyType) {
      updateFormData({
        companyDetails: { ...defaultCompanyDetails, ...saved, companyType: selectedCompanyType, mandatorySuffix },
      })
    }
  }, [selectedCompanyType, savedCompanyDetails, updateFormData])

  const categoryOptions = selectedCompanyType === 'llp' ? ['Limited Liability Partnership'] : selectedCompanyType === 'opc' ? ['Company limited by Shares'] : selectedCompanyType === 'section_8' ? ['Company limited by Guarantee', 'Company limited by Shares'] : ['Company limited by Shares', 'Company limited by Guarantee', 'Unlimited Company']
  const subCategoryOptions = selectedCompanyType === 'opc' ? ['Indian Non-Government Company'] : ['Indian Non-Government Company', 'State Government Company', 'Central Government Company']

  const handleInputChange = (field: keyof CompanyDetailsFormData, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    updateFormData({
      companyDetails: { ...companyDetails, [field]: normalizeNameActivityValue(field, value) }
    })
  }

  const renderChipGroup = (
    label: string,
    field: 'categoryOfCompany' | 'subCategoryOfCompany',
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
    if (!currentData.categoryOfCompany) newErrors.categoryOfCompany = 'Category of company is required'
    if (!currentData.subCategoryOfCompany) newErrors.subCategoryOfCompany = 'Sub-category of company is required'
    Object.assign(newErrors, getNameActivityErrors(currentData))

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
        <span className="company-details-stepbar__badge">Step 1 of 10</span>
        <span className="company-details-stepbar__text">Company Details</span>
        <div className="company-details-stepbar__line">
          <div className="company-details-stepbar__line-fill" />
        </div>
      </div>

      {/* Page Header */}
      <header className="company-details-header">
        <h1 className="company-details-header__title">Company Details</h1>
        <p className="company-details-header__subtitle">
          Define MCA statutory classification, your proposed company name and business activity.
        </p>
      </header>

      {/* Card 1: Company Classification */}
      <section className="company-details-card">
        <div className="company-details-card__header">
          <h2 className="company-details-card__title">Company Classification</h2>
          <p className="company-details-card__subtitle">
            Specify MCA statutory classification details for incorporation filing.
          </p>
        </div>

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

      <CompanyNameActivityCards data={currentData} errors={errors} onChange={handleInputChange} />

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
