import React, { useState, useMemo } from 'react'
import type {
  ProjectFinanceData,
  ProjectPromoterSponsor,
  ProjectSectorType,
  ProjectType,
  ProjectDevelopmentOption,
} from '@modules/loans/types/projectFinance.types'
import {
  PROJECT_SECTORS,
  SECTOR_SUBSECTORS,
  PROJECT_TYPES,
  DEVELOPMENT_OPTIONS,
} from './applicantAndProjectConstants'
import { AddPromoterModal } from './AddPromoterModal'
import { ApplicantDetailsSection } from './ApplicantDetailsSection'
import { OfficeAddressAndPromoters } from './OfficeAddressAndPromoters'
import { FileText, ChevronDown } from 'lucide-react'
import './ApplicantAndProject.css'

export interface ApplicantAndProjectProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  errors?: Record<string, string>
}

export const ApplicantAndProject: React.FC<ApplicantAndProjectProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isAddPromoterOpen, setIsAddPromoterOpen] = useState(false)

  // Collapsible section toggles
  const [isApplicantSectionOpen, setIsApplicantSectionOpen] = useState(true)
  const [isOfficeAddressOpen, setIsOfficeAddressOpen] = useState(true)
  const [isPromoterSectionOpen, setIsPromoterSectionOpen] = useState(true)
  const [isClassificationOpen, setIsClassificationOpen] = useState(true)

  const promoters = data.promoters || []

  const subSectorOptions = useMemo(() => {
    return data.projectSector && SECTOR_SUBSECTORS[data.projectSector]
      ? SECTOR_SUBSECTORS[data.projectSector]
      : [{ label: 'Select Sector First', value: '' }]
  }, [data.projectSector])

  const handleAddPromoter = (newPromoter: ProjectPromoterSponsor) => {
    onChange({ promoters: [...promoters, newPromoter] })
  }

  const handleRemovePromoter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange({ promoters: promoters.filter((p) => p.id !== id) })
  }

  const renderProjectClassification = () => (
    <div className="pf-collapsible-card">
      <div
        className="pf-collapsible-header"
        onClick={() => setIsClassificationOpen((prev) => !prev)}
      >
        <div className="pf-collapsible-header__left">
          <div className="pf-section-icon-tile pf-section-icon-tile--orange">
            <FileText size={20} />
          </div>
          <h3 className="pf-collapsible-title">Project Classification</h3>
        </div>
        <span className={`pf-chevron ${isClassificationOpen ? 'pf-chevron--open' : ''}`}>
          <ChevronDown size={18} />
        </span>
      </div>

      {isClassificationOpen && (
        <div className="pf-collapsible-body">
          <div className="pf-field-group">
            <label htmlFor="projectName" className="pf-field-label">
              Project Name <span className="pf-req">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              className={`pf-custom-input ${errors.projectName ? 'pf-custom-input--error' : ''}`}
              placeholder="Enter project name"
              value={data.projectName || ''}
              onChange={(e) => onChange({ projectName: e.target.value })}
            />
            {errors.projectName && <span className="pf-field-error">{errors.projectName}</span>}
          </div>

          <div className="pf-field-group">
            <label htmlFor="projectSector" className="pf-field-label">
              Project Sector <span className="pf-req">*</span>
            </label>
            <select
              id="projectSector"
              className={`pf-custom-select ${errors.projectSector ? 'pf-custom-select--error' : ''}`}
              value={data.projectSector || ''}
              onChange={(e) => {
                const sector = e.target.value as ProjectSectorType
                onChange({ projectSector: sector, projectSubSector: '' })
              }}
            >
              <option value="" disabled>Select sector</option>
              {PROJECT_SECTORS.map((sec) => (
                <option key={sec.value} value={sec.value}>
                  {sec.label}
                </option>
              ))}
            </select>
            {errors.projectSector && <span className="pf-field-error">{errors.projectSector}</span>}
          </div>

          <div className="pf-field-group">
            <label htmlFor="projectSubSector" className="pf-field-label">
              Project Sub-Sector <span className="pf-req">*</span>
            </label>
            <select
              id="projectSubSector"
              className={`pf-custom-select ${errors.projectSubSector ? 'pf-custom-select--error' : ''}`}
              value={data.projectSubSector || ''}
              onChange={(e) => onChange({ projectSubSector: e.target.value })}
              disabled={!data.projectSector}
            >
              <option value="" disabled>{data.projectSector ? 'Select sub-sector' : 'Select sector first'}</option>
              {subSectorOptions.filter((opt) => Boolean(opt.value)).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.projectSubSector && <span className="pf-field-error">{errors.projectSubSector}</span>}
          </div>

          <div className="pf-field-group">
            <label htmlFor="projectType" className="pf-field-label">
              Project Type <span className="pf-req">*</span>
            </label>
            <select
              id="projectType"
              className={`pf-custom-select ${errors.projectType ? 'pf-custom-select--error' : ''}`}
              value={data.projectType || ''}
              onChange={(e) => onChange({ projectType: e.target.value as ProjectType })}
            >
              <option value="" disabled>Select project type</option>
              {PROJECT_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
            {errors.projectType && <span className="pf-field-error">{errors.projectType}</span>}
          </div>

          <div className="pf-field-group">
            <label htmlFor="developmentOption" className="pf-field-label">
              Greenfield / Expansion / Modernization <span className="pf-req">*</span>
            </label>
            <select
              id="developmentOption"
              className={`pf-custom-select ${errors.developmentOption ? 'pf-custom-select--error' : ''}`}
              value={data.developmentOption || ''}
              onChange={(e) => onChange({ developmentOption: e.target.value as ProjectDevelopmentOption })}
            >
              <option value="" disabled>Select option</option>
              {DEVELOPMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.developmentOption && <span className="pf-field-error">{errors.developmentOption}</span>}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="pf-screen-container">
      {/* 1. Applicant / Borrower Details Section */}
      <ApplicantDetailsSection
        data={data}
        onChange={onChange}
        isOpen={isApplicantSectionOpen}
        onToggle={() => setIsApplicantSectionOpen((prev) => !prev)}
        errors={errors}
      />

      {/* 2. Registered Office & 3. Promoters */}
      <OfficeAddressAndPromoters
        data={data}
        onChange={onChange}
        isOfficeOpen={isOfficeAddressOpen}
        onToggleOffice={() => setIsOfficeAddressOpen((prev) => !prev)}
        isPromotersOpen={isPromoterSectionOpen}
        onTogglePromoters={() => setIsPromoterSectionOpen((prev) => !prev)}
        onOpenAddPromoter={() => setIsAddPromoterOpen(true)}
        onRemovePromoter={handleRemovePromoter}
        errors={errors}
      />

      {/* 4. Project Classification Card Section */}
      {renderProjectClassification()}

      {/* Add Promoter Modal */}
      <AddPromoterModal
        isOpen={isAddPromoterOpen}
        onClose={() => setIsAddPromoterOpen(false)}
        onAdd={handleAddPromoter}
      />
    </div>
  )
}

export default ApplicantAndProject
