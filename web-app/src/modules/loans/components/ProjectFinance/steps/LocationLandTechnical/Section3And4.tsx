import React from 'react'
import { Users, FileText, ChevronDown } from 'lucide-react'
import type { ProjectFinanceData, LandParcelItem } from '@modules/loans/types/projectFinance.types'
import {
  LAND_OWNERSHIP_OPTIONS,
  TITLE_STATUS_OPTIONS,
  ENCUMBRANCE_OPTIONS,
  ACQUISITION_STATUS_OPTIONS,
  ROW_TYPES,
  ROW_OBTAINED_PENDING_OPTIONS,
  ROW_APPROVAL_STATUS_OPTIONS,
} from './locationLandTechnicalConstants'

export interface Section3And4Props {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isLandParcelsOpen: boolean
  onToggleLandParcels: () => void
  isRowOpen: boolean
  onToggleRow: () => void
  onOpenPicker?: (picker: string) => void
  errors?: Record<string, string>
}

export const Section3And4: React.FC<Section3And4Props> = ({
  data,
  onChange,
  isLandParcelsOpen,
  onToggleLandParcels,
  isRowOpen,
  onToggleRow,
  errors = {},
}) => {
  const parcels: LandParcelItem[] = data.landParcels && data.landParcels.length > 0
    ? data.landParcels
    : [
        {
          id: '1',
          surveyPlotNumber: '',
          areaAcres: '',
          ownership: '',
          acquisitionStatus: '',
          titleStatus: '',
          encumbrance: '',
        },
      ]

  const handleAddParcel = () => {
    const newParcel: LandParcelItem = {
      id: `parcel_${Date.now()}`,
      surveyPlotNumber: '',
      areaAcres: '',
      ownership: '',
      acquisitionStatus: '',
      titleStatus: '',
      encumbrance: '',
    }
    onChange({ landParcels: [...parcels, newParcel] })
  }

  const handleUpdateParcel = (index: number, fields: Partial<LandParcelItem>) => {
    const updated = parcels.map((item, idx) => (idx === index ? { ...item, ...fields } : item))
    onChange({ landParcels: updated })
  }

  const handleRemoveParcel = (index: number) => {
    if (parcels.length <= 1) return
    const updated = parcels.filter((_, idx) => idx !== index)
    onChange({ landParcels: updated })
  }

  return (
    <>
      {/* 3. Land Parcels Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleLandParcels}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <Users size={20} />
            </div>
            <h3 className="pf-collapsible-title">3. Land Parcels</h3>
          </div>
          <button
            type="button"
            className="pf-btn-add-parcel"
            onClick={(e) => {
              e.stopPropagation()
              handleAddParcel()
            }}
          >
            + Add Land Parcel
          </button>
        </div>

        {isLandParcelsOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-parcels-list">
              {parcels.map((parcel, idx) => (
                <div key={parcel.id} className="pf-parcel-card">
                  <div className="pf-parcel-card__header">
                    <h4 className="pf-parcel-card__title">Parcel {idx + 1}</h4>
                    {parcels.length > 1 && (
                      <button
                        type="button"
                        className="pf-parcel-btn-remove"
                        onClick={() => handleRemoveParcel(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`surveyPlotNumber_${idx}`} className="pf-field-label">
                      Survey / Plot Number <span className="pf-req">*</span>
                    </label>
                    <input
                      id={`surveyPlotNumber_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter survey number"
                      value={parcel.surveyPlotNumber || ''}
                      onChange={(e) => handleUpdateParcel(idx, { surveyPlotNumber: e.target.value })}
                    />
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`areaAcres_${idx}`} className="pf-field-label">
                      Area (Acres) <span className="pf-req">*</span>
                    </label>
                    <input
                      id={`areaAcres_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter area"
                      value={parcel.areaAcres || ''}
                      onChange={(e) => handleUpdateParcel(idx, { areaAcres: e.target.value.replace(/[^\d.]/g, '') })}
                    />
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`parcel_ownership_${idx}`} className="pf-field-label">Ownership <span className="pf-req">*</span></label>
                    <select
                      id={`parcel_ownership_${idx}`}
                      className="pf-custom-select"
                      value={parcel.ownership || ''}
                      onChange={(e) => handleUpdateParcel(idx, { ownership: e.target.value })}
                    >
                      <option value="" disabled>Select ownership</option>
                      {LAND_OWNERSHIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`parcel_acquisition_${idx}`} className="pf-field-label">Acquisition Status <span className="pf-req">*</span></label>
                    <select
                      id={`parcel_acquisition_${idx}`}
                      className="pf-custom-select"
                      value={parcel.acquisitionStatus || ''}
                      onChange={(e) => handleUpdateParcel(idx, { acquisitionStatus: e.target.value })}
                    >
                      <option value="" disabled>Select status</option>
                      {ACQUISITION_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`parcel_title_${idx}`} className="pf-field-label">Title Status <span className="pf-req">*</span></label>
                    <select
                      id={`parcel_title_${idx}`}
                      className="pf-custom-select"
                      value={parcel.titleStatus || ''}
                      onChange={(e) => handleUpdateParcel(idx, { titleStatus: e.target.value })}
                    >
                      <option value="" disabled>Select title status</option>
                      {TITLE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`parcel_encumbrance_${idx}`} className="pf-field-label">Encumbrance <span className="pf-req">*</span></label>
                    <select
                      id={`parcel_encumbrance_${idx}`}
                      className="pf-custom-select"
                      value={parcel.encumbrance || ''}
                      onChange={(e) => handleUpdateParcel(idx, { encumbrance: e.target.value })}
                    >
                      <option value="" disabled>Select encumbrance</option>
                      {ENCUMBRANCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Right of Way (ROW) Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleRow}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">4. Right of Way (ROW)</h3>
          </div>
          <span className={`pf-chevron ${isRowOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isRowOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label className="pf-field-label">
                ROW Required? <span className="pf-req">*</span>
              </label>
              <div className="pf-radio-group">
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="rowRequired"
                    className="pf-radio-input"
                    checked={data.rowRequired === true}
                    onChange={() => onChange({ rowRequired: true })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>Yes</span>
                </label>
                <label className="pf-radio-label">
                  <input
                    type="radio"
                    name="rowRequired"
                    className="pf-radio-input"
                    checked={data.rowRequired === false}
                    onChange={() => onChange({ rowRequired: false })}
                  />
                  <div className="pf-radio-custom">
                    <div className="pf-radio-custom-dot" />
                  </div>
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="pf-field-group">
              <label htmlFor="rowType" className="pf-field-label">
                ROW Type <span className="pf-req">*</span>
              </label>
              <select
                id="rowType"
                className={`pf-custom-select ${errors.rowType ? 'pf-custom-select--error' : ''}`}
                value={data.rowType || ''}
                onChange={(e) => onChange({ rowType: e.target.value })}
              >
                <option value="" disabled>Select type</option>
                {ROW_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.rowType && <span className="pf-field-error">{errors.rowType}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="rowTotalLengthKm" className="pf-field-label">
                Total Length (km) <span className="pf-req">*</span>
              </label>
              <input
                id="rowTotalLengthKm"
                type="text"
                className={`pf-custom-input ${errors.rowTotalLengthKm ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter length"
                value={data.rowTotalLengthKm || ''}
                onChange={(e) => onChange({ rowTotalLengthKm: e.target.value.replace(/[^\d.]/g, '') })}
              />
              {errors.rowTotalLengthKm && <span className="pf-field-error">{errors.rowTotalLengthKm}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="rowObtainedPending" className="pf-field-label">
                Obtained / Pending <span className="pf-req">*</span>
              </label>
              <select
                id="rowObtainedPending"
                className={`pf-custom-select ${errors.rowObtainedPending ? 'pf-custom-select--error' : ''}`}
                value={data.rowObtainedPending || ''}
                onChange={(e) => onChange({ rowObtainedPending: e.target.value })}
              >
                <option value="" disabled>Select status</option>
                {ROW_OBTAINED_PENDING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.rowObtainedPending && <span className="pf-field-error">{errors.rowObtainedPending}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="rowApprovalStatus" className="pf-field-label">
                Approval Status <span className="pf-req">*</span>
              </label>
              <select
                id="rowApprovalStatus"
                className={`pf-custom-select ${errors.rowApprovalStatus ? 'pf-custom-select--error' : ''}`}
                value={data.rowApprovalStatus || ''}
                onChange={(e) => onChange({ rowApprovalStatus: e.target.value })}
              >
                <option value="" disabled>Select approval status</option>
                {ROW_APPROVAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.rowApprovalStatus && <span className="pf-field-error">{errors.rowApprovalStatus}</span>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
