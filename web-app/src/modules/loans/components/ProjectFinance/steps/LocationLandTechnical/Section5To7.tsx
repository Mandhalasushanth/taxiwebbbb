import React, { useState } from 'react'
import { FileText, ChevronDown } from 'lucide-react'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import {
  POWER_SOURCE_OPTIONS,
  WATER_SOURCE_OPTIONS,
  APPROACH_ROAD_OPTIONS,
  DRAINAGE_ARRANGEMENT_OPTIONS,
  WASTE_EFFLUENT_OPTIONS,
  OTHER_INFRASTRUCTURE_OPTIONS,
  TECHNOLOGY_TYPE_OPTIONS,
  TECHNOLOGY_SOURCE_OPTIONS,
  CAPACITY_UNIT_OPTIONS,
  NUMBER_OF_SHIFTS_OPTIONS,
} from './locationLandTechnicalConstants'

export interface Section5To7Props {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  errors?: Record<string, string>
}

export const Section5To7: React.FC<Section5To7Props> = ({
  data,
  onChange,
  errors = {},
}) => {
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(true)
  const [isTechnicalOpen, setIsTechnicalOpen] = useState(true)
  const [isCapacityOpen, setIsCapacityOpen] = useState(true)

  return (
    <>
      {/* 5. Utilities & Site Infrastructure */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={() => setIsUtilitiesOpen((prev) => !prev)}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">5. Utilities & Site Infrastructure</h3>
          </div>
          <span className={`pf-chevron ${isUtilitiesOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isUtilitiesOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="powerSource" className="pf-field-label">Power Source <span className="pf-req">*</span></label>
              <select
                id="powerSource"
                className={`pf-custom-select ${errors.powerSource ? 'pf-custom-select--error' : ''}`}
                value={data.powerSource || ''}
                onChange={(e) => onChange({ powerSource: e.target.value })}
              >
                <option value="" disabled>Select power source</option>
                {POWER_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.powerSource && <span className="pf-field-error">{errors.powerSource}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="waterSource" className="pf-field-label">Water Source <span className="pf-req">*</span></label>
              <select
                id="waterSource"
                className={`pf-custom-select ${errors.waterSource ? 'pf-custom-select--error' : ''}`}
                value={data.waterSource || ''}
                onChange={(e) => onChange({ waterSource: e.target.value })}
              >
                <option value="" disabled>Select water source</option>
                {WATER_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.waterSource && <span className="pf-field-error">{errors.waterSource}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="approachRoad" className="pf-field-label">Approach Road <span className="pf-req">*</span></label>
              <select
                id="approachRoad"
                className={`pf-custom-select ${errors.approachRoad ? 'pf-custom-select--error' : ''}`}
                value={data.approachRoad || ''}
                onChange={(e) => onChange({ approachRoad: e.target.value })}
              >
                <option value="" disabled>Select approach road</option>
                {APPROACH_ROAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.approachRoad && <span className="pf-field-error">{errors.approachRoad}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="drainageArrangement" className="pf-field-label">Drainage Arrangement <span className="pf-req">*</span></label>
              <select
                id="drainageArrangement"
                className={`pf-custom-select ${errors.drainageArrangement ? 'pf-custom-select--error' : ''}`}
                value={data.drainageArrangement || ''}
                onChange={(e) => onChange({ drainageArrangement: e.target.value })}
              >
                <option value="" disabled>Select drainage</option>
                {DRAINAGE_ARRANGEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.drainageArrangement && <span className="pf-field-error">{errors.drainageArrangement}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="wasteEffluentArrangement" className="pf-field-label">Waste / Effluent Arrangement <span className="pf-req">*</span></label>
              <select
                id="wasteEffluentArrangement"
                className={`pf-custom-select ${errors.wasteEffluentArrangement ? 'pf-custom-select--error' : ''}`}
                value={data.wasteEffluentArrangement || ''}
                onChange={(e) => onChange({ wasteEffluentArrangement: e.target.value })}
              >
                <option value="" disabled>Select arrangement</option>
                {WASTE_EFFLUENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.wasteEffluentArrangement && <span className="pf-field-error">{errors.wasteEffluentArrangement}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="otherInfrastructure" className="pf-field-label">Other Infrastructure</label>
              <select
                id="otherInfrastructure"
                className="pf-custom-select"
                value={data.otherInfrastructure || ''}
                onChange={(e) => onChange({ otherInfrastructure: e.target.value })}
              >
                <option value="" disabled>Select option</option>
                {OTHER_INFRASTRUCTURE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. Technical Details */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={() => setIsTechnicalOpen((prev) => !prev)}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">6. Technical Details</h3>
          </div>
          <span className={`pf-chevron ${isTechnicalOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isTechnicalOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="technologyType" className="pf-field-label">Technology Type <span className="pf-req">*</span></label>
              <select
                id="technologyType"
                className={`pf-custom-select ${errors.technologyType ? 'pf-custom-select--error' : ''}`}
                value={data.technologyType || ''}
                onChange={(e) => onChange({ technologyType: e.target.value })}
              >
                <option value="" disabled>Select type</option>
                {TECHNOLOGY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.technologyType && <span className="pf-field-error">{errors.technologyType}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="technologyDescription" className="pf-field-label">Technology Description <span className="pf-req">*</span></label>
              <input
                id="technologyDescription"
                type="text"
                className={`pf-custom-input ${errors.technologyDescription ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter description"
                value={data.technologyDescription || ''}
                onChange={(e) => onChange({ technologyDescription: e.target.value })}
              />
              {errors.technologyDescription && <span className="pf-field-error">{errors.technologyDescription}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="technologySource" className="pf-field-label">Technology Source <span className="pf-req">*</span></label>
              <select
                id="technologySource"
                className={`pf-custom-select ${errors.technologySource ? 'pf-custom-select--error' : ''}`}
                value={data.technologySource || ''}
                onChange={(e) => onChange({ technologySource: e.target.value })}
              >
                <option value="" disabled>Select source</option>
                {TECHNOLOGY_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.technologySource && <span className="pf-field-error">{errors.technologySource}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="technologyProvider" className="pf-field-label">Technology Provider <span className="pf-req">*</span></label>
              <input
                id="technologyProvider"
                type="text"
                className={`pf-custom-input ${errors.technologyProvider ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter provider name"
                value={data.technologyProvider || ''}
                onChange={(e) => onChange({ technologyProvider: e.target.value })}
              />
              {errors.technologyProvider && <span className="pf-field-error">{errors.technologyProvider}</span>}
            </div>

            <div className="pf-field-group">
              <label className="pf-field-label">Technology Proven? <span className="pf-req">*</span></label>
              <div className="pf-radio-group">
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="isTechnologyProven"
                    className="pf-radio-input"
                    checked={data.isTechnologyProven === true}
                    onChange={() => onChange({ isTechnologyProven: true })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>Yes</span>
                </label>
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="isTechnologyProven"
                    className="pf-radio-input"
                    checked={data.isTechnologyProven === false}
                    onChange={() => onChange({ isTechnologyProven: false })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="pf-field-group">
              <label className="pf-field-label">Technology License Required? <span className="pf-req">*</span></label>
              <div className="pf-radio-group">
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="isTechnologyLicenseRequired"
                    className="pf-radio-input"
                    checked={data.isTechnologyLicenseRequired === true}
                    onChange={() => onChange({ isTechnologyLicenseRequired: true })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>Yes</span>
                </label>
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="isTechnologyLicenseRequired"
                    className="pf-radio-input"
                    checked={data.isTechnologyLicenseRequired === false}
                    onChange={() => onChange({ isTechnologyLicenseRequired: false })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="pf-field-group">
              <label htmlFor="technicalConsultant" className="pf-field-label">Technical Consultant</label>
              <input
                id="technicalConsultant"
                type="text"
                className="pf-custom-input"
                placeholder="Enter consultant name"
                value={data.technicalConsultant || ''}
                onChange={(e) => onChange({ technicalConsultant: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Capacity & Production */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={() => setIsCapacityOpen((prev) => !prev)}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">7. Capacity & Production</h3>
          </div>
          <span className={`pf-chevron ${isCapacityOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isCapacityOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="proposedCapacity" className="pf-field-label">Proposed Capacity <span className="pf-req">*</span></label>
                <input
                  id="proposedCapacity"
                  type="text"
                  className={`pf-custom-input ${errors.proposedCapacity ? 'pf-custom-input--error' : ''}`}
                  placeholder="Enter capacity"
                  value={data.proposedCapacity || ''}
                  onChange={(e) => onChange({ proposedCapacity: e.target.value })}
                />
                {errors.proposedCapacity && <span className="pf-field-error">{errors.proposedCapacity}</span>}
              </div>

              <div className="pf-field-group">
                <label htmlFor="capacityUnit" className="pf-field-label">Capacity Unit <span className="pf-req">*</span></label>
                <select
                  id="capacityUnit"
                  className={`pf-custom-select ${errors.capacityUnit ? 'pf-custom-select--error' : ''}`}
                  value={data.capacityUnit || ''}
                  onChange={(e) => onChange({ capacityUnit: e.target.value })}
                >
                  <option value="" disabled>Select unit</option>
                  {CAPACITY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.capacityUnit && <span className="pf-field-error">{errors.capacityUnit}</span>}
              </div>
            </div>

            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="expectedInitialUtilisationPercent" className="pf-field-label">Expected Initial Utilisation (%)</label>
                <input
                  id="expectedInitialUtilisationPercent"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter percentage"
                  value={data.expectedInitialUtilisationPercent || ''}
                  onChange={(e) => onChange({ expectedInitialUtilisationPercent: e.target.value.replace(/[^\d.]/g, '') })}
                />
              </div>

              <div className="pf-field-group">
                <label htmlFor="stabilisedUtilisationPercent" className="pf-field-label">Stabilised Utilisation (%)</label>
                <input
                  id="stabilisedUtilisationPercent"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter percentage"
                  value={data.stabilisedUtilisationPercent || ''}
                  onChange={(e) => onChange({ stabilisedUtilisationPercent: e.target.value.replace(/[^\d.]/g, '') })}
                />
              </div>
            </div>

            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="productionPerYear" className="pf-field-label">Production per Year <span className="pf-req">*</span></label>
                <input
                  id="productionPerYear"
                  type="text"
                  className={`pf-custom-input ${errors.productionPerYear ? 'pf-custom-input--error' : ''}`}
                  placeholder="Enter production"
                  value={data.productionPerYear || ''}
                  onChange={(e) => onChange({ productionPerYear: e.target.value })}
                />
                {errors.productionPerYear && <span className="pf-field-error">{errors.productionPerYear}</span>}
              </div>

              <div className="pf-field-group">
                <label htmlFor="operatingDaysPerYear" className="pf-field-label">Operating Days / Year <span className="pf-req">*</span></label>
                <input
                  id="operatingDaysPerYear"
                  type="text"
                  className={`pf-custom-input ${errors.operatingDaysPerYear ? 'pf-custom-input--error' : ''}`}
                  placeholder="Enter days"
                  value={data.operatingDaysPerYear || ''}
                  onChange={(e) => onChange({ operatingDaysPerYear: e.target.value.replace(/\D/g, '') })}
                />
                {errors.operatingDaysPerYear && <span className="pf-field-error">{errors.operatingDaysPerYear}</span>}
              </div>
            </div>

            <div className="pf-field-group">
              <label htmlFor="numberOfShifts" className="pf-field-label">Number of Shifts <span className="pf-req">*</span></label>
              <select
                id="numberOfShifts"
                className={`pf-custom-select ${errors.numberOfShifts ? 'pf-custom-select--error' : ''}`}
                value={data.numberOfShifts || ''}
                onChange={(e) => onChange({ numberOfShifts: e.target.value })}
              >
                <option value="" disabled>Select number of shifts</option>
                {NUMBER_OF_SHIFTS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.numberOfShifts && <span className="pf-field-error">{errors.numberOfShifts}</span>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
