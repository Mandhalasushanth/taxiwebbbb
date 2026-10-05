import React from 'react'
import { Home, Users, FileText, ChevronDown } from 'lucide-react'
import type { ProjectFinanceData, ImplementationMilestoneItem } from '@modules/loans/types/projectFinance.types'
import {
  CONTRACT_TYPE_OPTIONS,
  MILESTONE_STATUS_OPTIONS,
} from './locationLandTechnicalConstants'

export interface Section10To12Props {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isEpcOpen: boolean
  onToggleEpc: () => void
  isMilestonesOpen: boolean
  onToggleMilestones: () => void
  isManpowerOpen: boolean
  onToggleManpower: () => void
  onOpenPicker?: (picker: string) => void
  errors?: Record<string, string>
}

export const Section10To12: React.FC<Section10To12Props> = ({
  data,
  onChange,
  isEpcOpen,
  onToggleEpc,
  isMilestonesOpen,
  onToggleMilestones,
  isManpowerOpen,
  onToggleManpower,
  errors = {},
}) => {
  const milestones: ImplementationMilestoneItem[] = data.implementationMilestones && data.implementationMilestones.length > 0
    ? data.implementationMilestones
    : [
        {
          id: '1',
          milestone: '',
          plannedDate: '',
          actualDate: '',
          status: 'Planned',
        },
      ]

  const handleAddMilestone = () => {
    const newItem: ImplementationMilestoneItem = {
      id: `milestone_${Date.now()}`,
      milestone: '',
      plannedDate: '',
      actualDate: '',
      status: 'Planned',
    }
    onChange({ implementationMilestones: [...milestones, newItem] })
  }

  const handleUpdateMilestone = (index: number, fields: Partial<ImplementationMilestoneItem>) => {
    const updated = milestones.map((item, idx) => (idx === index ? { ...item, ...fields } : item))
    onChange({ implementationMilestones: updated })
  }

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return
    onChange({ implementationMilestones: milestones.filter((_, idx) => idx !== index) })
  }

  return (
    <>
      {/* 10. EPC / Project Execution */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleEpc}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <Home size={20} />
            </div>
            <h3 className="pf-collapsible-title">10. EPC / Project Execution</h3>
          </div>
          <span className={`pf-chevron ${isEpcOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isEpcOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="epcContractor" className="pf-field-label">EPC Contractor <span className="pf-req">*</span></label>
              <input
                id="epcContractor"
                type="text"
                className={`pf-custom-input ${errors.epcContractor ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter contractor name"
                value={data.epcContractor || ''}
                onChange={(e) => onChange({ epcContractor: e.target.value })}
              />
              {errors.epcContractor && <span className="pf-field-error">{errors.epcContractor}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="contractType" className="pf-field-label">Contract Type <span className="pf-req">*</span></label>
              <select
                id="contractType"
                className={`pf-custom-select ${errors.contractType ? 'pf-custom-select--error' : ''}`}
                value={data.contractType || ''}
                onChange={(e) => onChange({ contractType: e.target.value })}
              >
                <option value="" disabled>Select contract type</option>
                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.contractType && <span className="pf-field-error">{errors.contractType}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="epcContractValue" className="pf-field-label">EPC Contract Value (₹) <span className="pf-req">*</span></label>
              <input
                id="epcContractValue"
                type="text"
                className={`pf-custom-input ${errors.epcContractValue ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter amount"
                value={data.epcContractValue || ''}
                onChange={(e) => onChange({ epcContractValue: e.target.value.replace(/[^\d.]/g, '') })}
              />
              {errors.epcContractValue && <span className="pf-field-error">{errors.epcContractValue}</span>}
            </div>

            <div className="pf-field-group">
              <label htmlFor="epcAwardDate" className="pf-field-label">EPC Award Date</label>
              <input
                id="epcAwardDate"
                type="date"
                className="pf-custom-input"
                value={data.epcAwardDate || ''}
                onChange={(e) => onChange({ epcAwardDate: e.target.value })}
              />
            </div>

            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="constructionStartDate" className="pf-field-label">Construction Start Date <span className="pf-req">*</span></label>
                <input
                  id="constructionStartDate"
                  type="date"
                  className={`pf-custom-input ${errors.constructionStartDate ? 'pf-custom-input--error' : ''}`}
                  value={data.constructionStartDate || ''}
                  onChange={(e) => onChange({ constructionStartDate: e.target.value })}
                />
                {errors.constructionStartDate && <span className="pf-field-error">{errors.constructionStartDate}</span>}
              </div>

              <div className="pf-field-group">
                <label htmlFor="expectedCompletionDate" className="pf-field-label">Expected Completion Date <span className="pf-req">*</span></label>
                <input
                  id="expectedCompletionDate"
                  type="date"
                  className={`pf-custom-input ${errors.expectedCompletionDate ? 'pf-custom-input--error' : ''}`}
                  value={data.expectedCompletionDate || ''}
                  onChange={(e) => onChange({ expectedCompletionDate: e.target.value })}
                />
                {errors.expectedCompletionDate && <span className="pf-field-error">{errors.expectedCompletionDate}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 11. Implementation Milestones */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleMilestones}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">11. Implementation Milestones</h3>
          </div>
          <button
            type="button"
            className="pf-btn-add-parcel"
            onClick={(e) => {
              e.stopPropagation()
              handleAddMilestone()
            }}
          >
            + Add Milestone
          </button>
        </div>

        {isMilestonesOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-parcels-list">
              {milestones.map((item, idx) => (
                <div key={item.id} className="pf-parcel-card">
                  <div className="pf-parcel-card__header">
                    <h4 className="pf-parcel-card__title">Milestone {idx + 1}</h4>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        className="pf-parcel-btn-remove"
                        onClick={() => handleRemoveMilestone(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`milestone_${idx}`} className="pf-field-label">Milestone <span className="pf-req">*</span></label>
                    <input
                      id={`milestone_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter milestone"
                      value={item.milestone || ''}
                      onChange={(e) => handleUpdateMilestone(idx, { milestone: e.target.value })}
                    />
                  </div>

                  <div className="pf-grid-2">
                    <div className="pf-field-group">
                      <label htmlFor={`plannedDate_${idx}`} className="pf-field-label">Planned Date <span className="pf-req">*</span></label>
                      <input
                        id={`plannedDate_${idx}`}
                        type="date"
                        className="pf-custom-input"
                        value={item.plannedDate || ''}
                        onChange={(e) => handleUpdateMilestone(idx, { plannedDate: e.target.value })}
                      />
                    </div>

                    <div className="pf-field-group">
                      <label htmlFor={`actualDate_${idx}`} className="pf-field-label">Actual Date</label>
                      <input
                        id={`actualDate_${idx}`}
                        type="date"
                        className="pf-custom-input"
                        value={item.actualDate || ''}
                        onChange={(e) => handleUpdateMilestone(idx, { actualDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`milestoneStatus_${idx}`} className="pf-field-label">Status <span className="pf-req">*</span></label>
                    <select
                      id={`milestoneStatus_${idx}`}
                      className="pf-custom-select"
                      value={item.status || ''}
                      onChange={(e) => handleUpdateMilestone(idx, { status: e.target.value })}
                    >
                      <option value="" disabled>Select status</option>
                      {MILESTONE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 12. Manpower */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleManpower}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <Users size={20} />
            </div>
            <h3 className="pf-collapsible-title">12. Manpower</h3>
          </div>
          <span className={`pf-chevron ${isManpowerOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isManpowerOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-field-group">
              <label htmlFor="totalEmployees" className="pf-field-label">Total Employees <span className="pf-req">*</span></label>
              <input
                id="totalEmployees"
                type="text"
                className={`pf-custom-input ${errors.totalEmployees ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter number"
                value={data.totalEmployees || ''}
                onChange={(e) => onChange({ totalEmployees: e.target.value.replace(/\D/g, '') })}
              />
              {errors.totalEmployees && <span className="pf-field-error">{errors.totalEmployees}</span>}
            </div>

            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="skilledEmployees" className="pf-field-label">Skilled</label>
                <input
                  id="skilledEmployees"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter number"
                  value={data.skilledEmployees || ''}
                  onChange={(e) => onChange({ skilledEmployees: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="pf-field-group">
                <label htmlFor="semiSkilledEmployees" className="pf-field-label">Semi-skilled</label>
                <input
                  id="semiSkilledEmployees"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter number"
                  value={data.semiSkilledEmployees || ''}
                  onChange={(e) => onChange({ semiSkilledEmployees: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="pf-grid-2">
              <div className="pf-field-group">
                <label htmlFor="unskilledEmployees" className="pf-field-label">Unskilled</label>
                <input
                  id="unskilledEmployees"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter number"
                  value={data.unskilledEmployees || ''}
                  onChange={(e) => onChange({ unskilledEmployees: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="pf-field-group">
                <label htmlFor="technicalStaffEmployees" className="pf-field-label">Technical Staff</label>
                <input
                  id="technicalStaffEmployees"
                  type="text"
                  className="pf-custom-input"
                  placeholder="Enter number"
                  value={data.technicalStaffEmployees || ''}
                  onChange={(e) => onChange({ technicalStaffEmployees: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="pf-field-group">
              <label htmlFor="administrativeStaffEmployees" className="pf-field-label">Administrative Staff</label>
              <input
                id="administrativeStaffEmployees"
                type="text"
                className="pf-custom-input"
                placeholder="Enter number"
                value={data.administrativeStaffEmployees || ''}
                onChange={(e) => onChange({ administrativeStaffEmployees: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
