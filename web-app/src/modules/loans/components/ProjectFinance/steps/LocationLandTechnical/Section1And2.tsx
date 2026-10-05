import React from 'react'
import { Home, ChevronDown, FileText } from 'lucide-react'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import {
  PROJECT_ZONES,
  LAND_OWNERSHIP_OPTIONS,
  LAND_USE_OPTIONS,
  TITLE_STATUS_OPTIONS,
  ENCUMBRANCE_OPTIONS,
  NA_CONVERSION_STATUS_OPTIONS,
} from './locationLandTechnicalConstants'

export interface Section1And2Props {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isLocationOpen: boolean
  onToggleLocation: () => void
  isLandDetailsOpen: boolean
  onToggleLandDetails: () => void
  onOpenPicker?: (picker: 'step2ProjectZone' | 'landOwnership' | 'landUse' | 'titleStatus' | 'encumbrance' | 'naConversionStatus') => void
  errors?: Record<string, string>
}

export const Section1And2: React.FC<Section1And2Props> = ({
  data,
  onChange,
  isLocationOpen,
  onToggleLocation,
  isLandDetailsOpen,
  onToggleLandDetails,
  errors = {},
}) => {
  return (
    <>
      {/* 1. Project Location Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleLocation}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <Home size={20} />
            </div>
            <h3 className="pf-collapsible-title">1. Project Location</h3>
          </div>
          <span className={`pf-chevron ${isLocationOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isLocationOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="step2ProjectAddress" className="pf-field-label">
                Project Address <span className="pf-req">*</span>
              </label>
              <input
                id="step2ProjectAddress"
                type="text"
                className={`pf-custom-input ${errors.step2ProjectAddress ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter project address"
                value={data.step2ProjectAddress || ''}
                onChange={(e) => onChange({ step2ProjectAddress: e.target.value })}
              />
              {errors.step2ProjectAddress && <span className="pf-field-error">{errors.step2ProjectAddress}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2State" className="pf-field-label">
                State <span className="pf-req">*</span>
              </label>
              <input
                id="step2State"
                type="text"
                className={`pf-custom-input ${errors.step2State ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter state"
                value={data.step2State || ''}
                onChange={(e) => onChange({ step2State: e.target.value })}
              />
              {errors.step2State && <span className="pf-field-error">{errors.step2State}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2District" className="pf-field-label">
                District <span className="pf-req">*</span>
              </label>
              <input
                id="step2District"
                type="text"
                className={`pf-custom-input ${errors.step2District ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter district"
                value={data.step2District || ''}
                onChange={(e) => onChange({ step2District: e.target.value })}
              />
              {errors.step2District && <span className="pf-field-error">{errors.step2District}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2PinCode" className="pf-field-label">
                PIN Code <span className="pf-req">*</span>
              </label>
              <input
                id="step2PinCode"
                type="text"
                maxLength={6}
                inputMode="numeric"
                className={`pf-custom-input ${errors.step2PinCode ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter PIN code"
                value={data.step2PinCode || ''}
                onChange={(e) => onChange({ step2PinCode: e.target.value.replace(/\D/g, '') })}
              />
              {errors.step2PinCode && <span className="pf-field-error">{errors.step2PinCode}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2NearestTownCity" className="pf-field-label">
                Nearest Major City / Town <span className="pf-req">*</span>
              </label>
              <input
                id="step2NearestTownCity"
                type="text"
                className={`pf-custom-input ${errors.step2NearestTownCity ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter city"
                value={data.step2NearestTownCity || ''}
                onChange={(e) => onChange({ step2NearestTownCity: e.target.value })}
              />
              {errors.step2NearestTownCity && <span className="pf-field-error">{errors.step2NearestTownCity}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2ProjectZone" className="pf-field-label">
                Project Zone <span className="pf-req">*</span>
              </label>
              <select
                id="step2ProjectZone"
                className={`pf-custom-select ${errors.step2ProjectZone ? 'pf-custom-select--error' : ''}`}
                value={data.step2ProjectZone || ''}
                onChange={(e) => onChange({ step2ProjectZone: e.target.value })}
              >
                <option value="" disabled>Select zone</option>
                {PROJECT_ZONES.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
              {errors.step2ProjectZone && <span className="pf-field-error">{errors.step2ProjectZone}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="step2DistanceNearestTownKm" className="pf-field-label">
                Distance to Nearest Major Town / City (km)
              </label>
              <input
                id="step2DistanceNearestTownKm"
                type="text"
                className="pf-custom-input"
                placeholder="Enter distance"
                value={data.step2DistanceNearestTownKm || ''}
                onChange={(e) => onChange({ step2DistanceNearestTownKm: e.target.value.replace(/[^\d.]/g, '') })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Land Details Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleLandDetails}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">2. Land Details</h3>
          </div>
          <span className={`pf-chevron ${isLandDetailsOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isLandDetailsOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="totalLandRequiredAcres" className="pf-field-label">
                Total Land Required (Acres) <span className="pf-req">*</span>
              </label>
              <input
                id="totalLandRequiredAcres"
                type="text"
                className={`pf-custom-input ${errors.totalLandRequiredAcres ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter area"
                value={data.totalLandRequiredAcres || ''}
                onChange={(e) => onChange({ totalLandRequiredAcres: e.target.value.replace(/[^\d.]/g, '') })}
              />
              {errors.totalLandRequiredAcres && (
                <span className="pf-field-error">{errors.totalLandRequiredAcres}</span>
              )}
            </div>

            <div className="pf-field-group">
              <label htmlFor="landAcquiredAcres" className="pf-field-label">
                Land Acquired / In Possession (Acres) <span className="pf-req">*</span>
              </label>
              <input
                id="landAcquiredAcres"
                type="text"
                className={`pf-custom-input ${errors.landAcquiredAcres ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter area"
                value={data.landAcquiredAcres || ''}
                onChange={(e) => onChange({ landAcquiredAcres: e.target.value.replace(/[^\d.]/g, '') })}
              />
              {errors.landAcquiredAcres && <span className="pf-field-error">{errors.landAcquiredAcres}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="landPendingAcres" className="pf-field-label">
                Land Pending (Acres)
              </label>
              <input
                id="landPendingAcres"
                type="text"
                className="pf-custom-input"
                placeholder="Enter area"
                value={data.landPendingAcres || ''}
                onChange={(e) => onChange({ landPendingAcres: e.target.value.replace(/[^\d.]/g, '') })}
              />
            </div>

            <div className="pf-field-group">
              <label htmlFor="landOwnership" className="pf-field-label">
                Land Ownership <span className="pf-req">*</span>
              </label>
              <select
                id="landOwnership"
                className={`pf-custom-select ${errors.landOwnership ? 'pf-custom-select--error' : ''}`}
                value={data.landOwnership || ''}
                onChange={(e) => onChange({ landOwnership: e.target.value })}
              >
                <option value="" disabled>Select ownership</option>
                {LAND_OWNERSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.landOwnership && <span className="pf-field-error">{errors.landOwnership}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="landUse" className="pf-field-label">
                Land Use <span className="pf-req">*</span>
              </label>
              <select
                id="landUse"
                className={`pf-custom-select ${errors.landUse ? 'pf-custom-select--error' : ''}`}
                value={data.landUse || ''}
                onChange={(e) => onChange({ landUse: e.target.value })}
              >
                <option value="" disabled>Select land use</option>
                {LAND_USE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.landUse && <span className="pf-field-error">{errors.landUse}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="titleStatus" className="pf-field-label">
                Title Status <span className="pf-req">*</span>
              </label>
              <select
                id="titleStatus"
                className={`pf-custom-select ${errors.titleStatus ? 'pf-custom-select--error' : ''}`}
                value={data.titleStatus || ''}
                onChange={(e) => onChange({ titleStatus: e.target.value })}
              >
                <option value="" disabled>Select title status</option>
                {TITLE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.titleStatus && <span className="pf-field-error">{errors.titleStatus}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="encumbrance" className="pf-field-label">
                Encumbrance <span className="pf-req">*</span>
              </label>
              <select
                id="encumbrance"
                className={`pf-custom-select ${errors.encumbrance ? 'pf-custom-select--error' : ''}`}
                value={data.encumbrance || ''}
                onChange={(e) => onChange({ encumbrance: e.target.value })}
              >
                <option value="" disabled>Select encumbrance</option>
                {ENCUMBRANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.encumbrance && <span className="pf-field-error">{errors.encumbrance}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="naConversionStatus" className="pf-field-label">
                NA Conversion Status <span className="pf-req">*</span>
              </label>
              <select
                id="naConversionStatus"
                className={`pf-custom-select ${errors.naConversionStatus ? 'pf-custom-select--error' : ''}`}
                value={data.naConversionStatus || ''}
                onChange={(e) => onChange({ naConversionStatus: e.target.value })}
              >
                <option value="" disabled>Select status</option>
                {NA_CONVERSION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.naConversionStatus && <span className="pf-field-error">{errors.naConversionStatus}</span>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
